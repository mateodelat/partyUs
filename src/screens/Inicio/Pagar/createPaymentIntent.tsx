import { API } from "aws-amplify";
import Stripe from "stripe";
import { fetchFromStripe, log } from "../../../../constants";
import { TipoPago } from "../../../models";

// /**
//  * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
//  */

// /* Amplify Params - DO NOT EDIT
//   API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT
//   API_PARTYUSAPI_GRAPHQLAPIIDOUTPUT
//   API_PARTYUSAPI_GRAPHQLAPIKEYOUTPUT
//   ENV
//   REGION
// Amplify Params - DO NOT EDIT */

// const production = process.env.ENV === "production";

// const SECRET_KEY = production
//   ? process.env.SECRET_KEY_PROD
//   : process.env.SECRET_KEY_STAG;

// const { graphqlOperation } = require("/opt/graphqlOperation");
const {
  updateBoletoReturns,
  createReservasBoletosReturns,
  updateEventoReturns,
  updateCuponReturns,
  reservaReturns,
} = require("./opt/graphqlReturns");

const comisionApp = 0.15;
const msInDay = 86400000;

function precioConComision(inicial) {
  if (!inicial) return 0;
  return redondear(inicial * (1 + comisionApp), 10);
}

const redondear = (numero, entero) => {
  if (!entero) {
    entero = 1;
  }

  if (!numero) return 0;
  numero = Math.ceil(numero / entero) * entero;

  return numero;
};

async function graphqlRequest({ query, variables }) {
  const endpoint = process.env.API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT;

  let body = {};

  try {
    body = await API.graphql(
      !!variables
        ? { query, variables }
        : {
            query,
          }
    );
  } catch (error) {
    console.log(error);
    body = {
      error: [
        {
          message: error.message,
        },
      ],
    };
  }

  return body;
}

function formatResponse({
  error,
  body,
  statusCode,
}: {
  error?: string;
  body?: Object;
  statusCode: number;
}) {
  let r = {
    statusCode,
    body,
    error,
  };
  if (error) {
    body = {
      ...body,
      error,
    };
  }

  if (body) {
    r = {
      ...r,
      body: JSON.stringify(body, null, 2),
    };
  }
  console.log(r);
  return r;
}

export default async (event: {
  body: {
    receipt_email?: string;
    boletos: { quantity: number; id: string }[];
    cuponID: string | null;
    eventoID: string;
    usuarioID: string;
    reservaID: string;
    total: number;
    comisionTotal: number;
  };
}) => {
  //   event.body = JSON.parse(event.body);
  if (!event?.body) {
    return formatResponse({
      statusCode: 400,

      error: "No se recibio cuerpo de la respuesta",
    });
  }

  // Variables por si falla la creacion del boleto devolver cargos
  let chargeID = "";
  let transactionID = "";
  let feeID = "";

  let clientPaymentID = "";
  let ownerPaymentID = "";
  let enviarACreador = 0;

  const {
    total,
    cuponID,
    eventoID,
    reservaID,
    usuarioID,
    boletos,
    receipt_email,
  } = event.body;
  try {
    log(event.body);

    // Ojo pagos en oxxo solo se permiten 1 dia antes y calcular fecha de expiracion dependiendo
    // Si faltan 2 dias

    ////////////////////////////////////////////////////////////////////////
    /////////////////////////Verificaciones previas/////////////////////////
    ////////////////////////////////////////////////////////////////////////
    if (!boletos || boletos.length === 0) {
      return formatResponse({
        statusCode: 400,
        error: "Error no se recibio una lista de boletos",
      });
    }

    if (!eventoID) {
      return formatResponse({
        statusCode: 400,
        error: "Error no se recibio ID de evento",
      });
    }

    if (!usuarioID) {
      return formatResponse({
        statusCode: 400,
        error: "Error no se recibio ID de usuario",
      });
    }

    if (total !== 0 && !total) {
      return formatResponse({
        statusCode: 400,
        error: "Error no se recibio un precio total",
      });
    }

    if (!reservaID) {
      return formatResponse({
        statusCode: 400,
        error: "Error no se recibio id de reserva",
      });
    }

    // Funcion para sacar el query a mandar con filtro de boletosID
    const query = (boletosID: string[]) => {
      let string = "";
      boletosID.map((id, idx) => {
        string += `{id:{eq:"${id}"}},`;
      });

      return /* GraphQL */ `
            query fetchData($eventoID: ID!, $usuarioID:ID!, $organizadorID:ID! ${
              cuponID ? `,$cuponID:ID!` : ""
            }) {
              getEvento(id: $eventoID) {
                CreatorID
                _version
                id
                personasMax
                personasReservadas
                titulo
                fechaFinal
                Reservas(filter: {cancelado: {ne: true}}) {
                    items {
                      _deleted
                      cantidad
                      fechaExpiracionUTC
                      pagado
                      Boletos {
                        items {
                          _deleted
                          quantity
                          boletoID
                        }
                      }
                    }
                }

              }
              cliente:getUsuario(id:$usuarioID){
                paymentClientID,
                nickname
              }
              owner:getUsuario(id:$organizadorID){
                paymentAccountID
              }
              listBoletos(filter:{or:[${string}]}) {
                items{
                  id
                  cantidad
                  personasReservadas
                  precio
                  eventoID
                  titulo
                  _version
                }
              }
              listReservas(filter: {usuarioID: {eq: "${usuarioID}"}, eventoID:{eq:"${eventoID}"},pagado:{eq: false}, cancelado:{ne:true}}) {
                    items {
                        pagado
                        cancelado
                        fechaExpiracionUTC
                        id
                        _deleted
                    }
                }

              ${
                cuponID
                  ? /* GraphQL */ `getCupon(id: $cuponID) {
                _version
                id
                cantidadDescuento
                porcentajeDescuento
                restantes
                vencimiento
              }`
                  : ""
              }
            }
          `;
    };

    //////////////////////////////////////////
    //Pedir todos los datos con id recibidos//
    //////////////////////////////////////////

    // Primero hay que verificar que haya lugares disponibles en los boletos
    //  y ver que el precio total corresponda al dado por el cliente

    const response = await graphqlRequest({
      query: query(boletos.map((e) => e.id)),
      variables: cuponID
        ? {
            eventoID,
            usuarioID,
            organizadorID,
            cuponID,
          }
        : {
            eventoID,
            usuarioID,
            organizadorID,
          },
    }).then((r: any) => {
      if (r.errors) {
        throw new Error("Error obteniendo datos: " + r.errors);
      }
      r = r.data;

      // Asignar a 0 el numero de personas reservadas en todos los boletos
      let boletosFiltrados = r.listBoletos.items.map((bol) => ({
        ...bol,
        personasReservadas: 0,
      }));

      let personasEnEvento = 0;

      // Calcular personas reservadas en el evento y personas reservadas en boletos a partir de las reservas validas
      r.getEvento.Reservas.items.map((res) => {
        if (res._deleted) return false;
        else if (
          // Si esta pagada o aun no ha expirado, ES VALIDA
          res.pagado ||
          res.fechaExpiracionUTC > new Date().toISOString()
        ) {
          // Sumar personas en reserva a personas en evento
          personasEnEvento += res.cantidad;

          // Mapear boletos asociados a la reserva, encontrar el asociado y ajustar su cantiad
          res.Boletos.items.map((bol) => {
            // Si fue borrada la relacion de reserva boleto lanzar error
            if (bol._deleted)
              throw new Error("La relacion reserva boleto ha sido borrada");

            const idx = boletosFiltrados.findIndex(
              (b) => b.id === bol.boletoID
            );

            if (idx < 0) {
              return;
            } else {
              // Sumarle la cantidad del boleto asociado a los boletos filtrados (por evento)
              boletosFiltrados[idx].personasReservadas =
                boletosFiltrados[idx].personasReservadas + bol.quantity;
            }
          });

          return true;
        } else {
          return false;
        }
      });

      return {
        cupon: r.getCupon,
        evento: {
          ...r.getEvento,
          personasReservadas: personasEnEvento,
        },
        boletos: boletosFiltrados,
        client: r.cliente,
        owner: r.owner,
      };
    });

    const {
      boletos: boletosFetched,
      evento,
      cupon,

      // Obtener id de pago del organizador Y cliente
      client: {
        // Parametro de stripe customer
        paymentClientID: clientPaymentIDFetched,
        nickname: nicknameCliente,
      },
      // Parametro de stripe account
      owner: { paymentAccountID: ownerPaymentIDFetched },
    } = response;
    // Obtener organizador desde evento
    const { creatorID: organizadorID } = evento;

    clientPaymentID = clientPaymentIDFetched;
    ownerPaymentID = ownerPaymentIDFetched;

    const porcentajeDescuento = cupon?.porcentajeDescuento;
    const cantidadDescuento = cupon?.cantidadDescuento;
    const totalPersonasReservadas = boletos
      .map((e) => e.quantity)
      .reduce((prev, a) => prev + a);

    // Verificacion de validez del cupon si se ingresa
    if (cupon?.vencimiento < new Date().getTime()) {
      return formatResponse({
        statusCode: 400,
        error: "El cupon ha expirado",
      });
    }

    if (cupon?.restantes - totalPersonasReservadas <= 0) {
      // Si los restantes por cupon mas los que quiere pagar el cliente exeden a las personas maximas
      return formatResponse({
        statusCode: 400,
        error:
          "Ya no hay cupo de personas para ese codigo de cupon. Intenta poner otro o eliminarlo",
      });
    }

    const description =
      "Pago " +
      totalPersonasReservadas +
      " personas " +
      nicknameCliente +
      " en " +
      evento.titulo;

    if (!clientPaymentID) {
      return formatResponse({
        statusCode: 400,
        error: "no se encontro id de customer para tu cuenta de pagos",
      });
    }

    if (!ownerPaymentID) {
      return formatResponse({
        statusCode: 400,
        error:
          "no se encontro id de account para la cuenta de pagos del creador del evento ",
      });
    }

    // Verificar que el owner id no sea igual a client id para evitar problemas de transferencias
    if (ownerPaymentID === clientPaymentID && total !== 0) {
      return formatResponse({
        statusCode: 409,
        error: "no puedes registrarte en tu mismo evento",
      });
    }

    let reservadosEvento = evento.personasReservadas
      ? evento.personasReservadas
      : 0;

    let comision = 0;

    //////////////////////////////////////////////////////////////////////////
    // Verificar que el precio total coincida con el recibido en la funcion //
    //////////////////////////////////////////////////////////////////////////
    let totalFetched = boletosFetched
      .map((e) => {
        let {
          precio,
          id,
          personasReservadas,
          cantidad,
          titulo: tituloBoleto,
        } = e;
        precio = precio ? precio : 0;
        personasReservadas = personasReservadas ? personasReservadas : 0;
        cantidad = cantidad ? cantidad : 0;

        let quantity = boletos.find((r) => r.id === id)?.quantity;
        if (!quantity) {
          console.log(
            "No se encontro un boleto con el id obtenido de los fetched: " + id
          );
          throw new Error(
            "Ocurrio un error con los boletos pasados, no se encontro la cantidad"
          );
        }

        reservadosEvento += quantity;

        // Verificar que las personas reservadas mas los nuevos no exceda el maximo por boleto
        if (personasReservadas + quantity > cantidad) {
          throw new Error(
            'El boleto tipo "' +
              tituloBoleto +
              '" tiene ' +
              personasReservadas +
              " personas reservadas de " +
              cantidad +
              ". No se pudieron registrar tus " +
              quantity +
              " entradas"
          );
        }

        comision += (precioConComision(precio) - precio) * quantity;

        return precioConComision(precio) * quantity;
      })
      .reduce((partialSum, a) => partialSum + a, 0);

    // Quitar del precio total el descuento aplicable
    totalFetched -= porcentajeDescuento
      ? totalFetched * porcentajeDescuento
      : cantidadDescuento
      ? totalFetched - cantidadDescuento
      : 0;

    enviarACreador = total - comision;

    // Verificar que el precio recibido coincida con los boletos fetcheados
    if (total !== totalFetched) {
      return formatResponse({
        statusCode: 400,
        error:
          "El precio total: " +
          total +
          " recibido no coincide con el calculado de la base de datos: " +
          totalFetched,
      });
    }

    // Dar error si el total de personas en el evento calculado exede a las personas maximas del mismo
    if (reservadosEvento > evento.personasMax) {
      return formatResponse({
        statusCode: 400,
        error:
          "El evento esta lleno con " +
          evento.personasReservadas +
          " de un total de " +
          evento.personasMax,
      });
    }

    //////////////////////////////////////////////////////////////////////////////////////////
    // Crear el payment intent para este evento seleccionado y confirmarlo en otra funcion  //
    //////////////////////////////////////////////////////////////////////////////////////////

    // Calcular fecha de expiracion
    let limitDate = new Date(evento.fechaFinal);
    // Si la fecha final es menor a un dia se pone la fecha final como limite de pago
    limitDate =
      limitDate.getTime() - new Date().getTime() < msInDay
        ? limitDate
        : new Date(new Date().getTime() + msInDay);

    let statement_descriptor_suffix = "";
    let statement_descriptor = "";

    // Funcion para calcular el extrato bancario
    (() => {
      //////////////////////////////////////////////////////////////////////////////
      ///////////////////////////////Extracto bancario//////////////////////////////
      //////////////////////////////////////////////////////////////////////////////
      statement_descriptor_suffix = "PARTYUS";

      // Calcular la longitud maxima del evento
      const lenEvento =
        22 -
        (statement_descriptor_suffix.length +
          2 + //"* "
          +1 + //"-"
          String(totalPersonasReservadas).length);

      let { titulo } = evento;
      // Poner el titulo del evento con mayuscula primera letra y eliminar espacios
      // para despues truncarlo a 10-len(personasReservadas) que son los caracteres restantes
      titulo = (titulo.charAt(0).toUpperCase() + titulo.slice(1).toLowerCase())
        .replace(/ /, "")
        .slice(0, lenEvento);
      // Para mostrar en el extracto bancario de la forma PARTYUS* evento-20 recortado a 22 caracteres
      // Recortar el evento a maximo 9 caracteres sin espacio
      statement_descriptor = titulo + "-" + totalPersonasReservadas;

      // Si por algo fallaron las cuentas y el descriptor mas el titulo mas "* " es mayor a 22, reducir
      if (
        (statement_descriptor_suffix + "* " + statement_descriptor).length > 22
      ) {
        console.log(
          "El extracto bancario fallo, cayendo a " + statement_descriptor
        );
        statement_descriptor = statement_descriptor.slice(
          0,
          22 - (statement_descriptor_suffix + "* ").length
        );
      }
    })();

    const res = await fetchFromStripe({
      path: "/v1/payment_intents",
      type: "POST",
      input: {
        // Multiplicar precio por 100 pues es en centavos
        amount: total * 100,
        currency: "mxn",
        // Multiplicar comision por 100 pues es en centavos
        application_fee_amount: comision * 100,

        metadata: {
          usuarioID,
          reservaID,
          eventoID,
          cuponID,
          boletos: JSON.stringify(boletos),
        },

        // Tiempo de expiracion del codigo oxxo en 1 dia
        payment_method_options: {
          oxxo: {
            expires_after_days: 1,
          },
        },

        // Aceptar automaticamente todos los tipos de pago autorizados en Dashboard
        automatic_payment_methods: { enabled: true },

        // Cliente a quien asociar el cargo
        customer: clientPaymentID,

        // Descripcion en stripe y extracto bancario
        description: description,

        // Descripcion del extracto bancario
        statement_descriptor,
        statement_descriptor_suffix,

        // Mandar correo de recibo si se ingreso desde el cliente
        receipt_email,

        // Transferir dinero al organizador el evento
        transfer_data: {
          destination: ownerPaymentID,
        },
      } as Stripe.PaymentIntentCreateParams,
    });

    return formatResponse({
      statusCode: 500,
      body: res,
    });
  } catch (error) {
    console.log(error);
    let msg = error.message
      ? error.message
      : error.description
      ? error.description
      : error.errorMessage
      ? error.errorMessage
      : error;

    return formatResponse({
      statusCode: 500,
      error: msg,
    });
  }
};
