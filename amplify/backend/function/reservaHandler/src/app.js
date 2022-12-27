/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/


/* Amplify Params - DO NOT EDIT
  ENV
  REGION
  API_PARTYUSAPI_GRAPHQLAPIIDOUTPUT
  API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT
  API_PARTYUSAPI_GRAPHQLAPIKEYOUTPUT
  SECRET_KEY_STAG
Amplify Params - DO NOT EDIT */

const production = process.env.ENV === "production";

const {
  updateBoletoReturns,
  createReservasBoletosReturns,
  updateEventoReturns,
  updateCuponReturns,
  reservaReturns,
} = require("/opt/graphqlReturns");
const { graphqlOperation } = require("/opt/graphqlOperation");


const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

const SECRET_KEY = production ? process.env.SECRET_KEY_PROD : process.env.SECRET_KEY_STAG

const stripe = require('stripe')(SECRET_KEY);


// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});


// Funciones miscelaneas
const comisionApp = 0.15;
const msInDay = 86400000;

/*******************************************************************************************************************************
******************************************* CREAR RESERVA ( PAYMENT INTENT) ****************************************************
********************************************************************************************************************************/
app.post('/createReserva', async function (req, res) {
  //   event.body = JSON.parse(event.body);

  if (!req || !req.body) {
    handleError(res, "No se recibio body en la solicitud")
    return
  }

  const { body } = req



  // Variables por si falla la creacion del boleto devolver cargos

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
    organizadorID,
    sourceID,
    tipoPago,
  } = body;
  try {
    // Ojo pagos en oxxo solo se permiten 1 dia antes y calcular fecha de expiracion dependiendo
    // Si faltan 2 dias

    ////////////////////////////////////////////////////////////////////////
    /////////////////////////Verificaciones previas/////////////////////////
    ////////////////////////////////////////////////////////////////////////
    if (!boletos || boletos.length === 0) {
      return formatResponse({
        res,
        statusCode: 400,
        error: "Error no se recibio una lista de boletos",
      });
    }

    if (!eventoID) {
      return formatResponse({
        res,
        statusCode: 400,
        error: "Error no se recibio ID de evento",
      });
    }

    if (!sourceID && tipoPago !== "EFECTIVO") {
      return formatResponse({
        res,
        statusCode: 400,
        error: "Error no se recibio metodo de pago con tarjeta",
      });
    }

    // Si tenemos sourceID y tipo de pago EFECTIVO dar error
    if (sourceID && tipoPago === "EFECTIVO") {
      return formatResponse({
        res,
        statusCode: 400,
        error: "Error no se puede hacer un pago en efectivo con sourceID",
      });
    }

    if (!usuarioID) {
      return formatResponse({
        res,
        statusCode: 400,
        error: "Error no se recibio ID de usuario",
      });
    }

    if (total !== 0 && !total) {
      return formatResponse({
        res,
        statusCode: 400,
        error: "Error no se recibio un precio total",
      });
    }

    if (!reservaID) {
      return formatResponse({
        res,
        statusCode: 400,
        error: "Error no se recibio id de reserva",
      });
    }

    if (!organizadorID) {
      return formatResponse({
        res,
        statusCode: 400,
        error: "Error no se recibio id de reserva",
      });
    }

    // Funcion para sacar el query a mandar con filtro de boletosID
    const query = (boletosID) => {
      let string = "";
      boletosID.map((id, idx) => {
        string += `{id:{eq:"${id}"}},`;
      });

      return /* GraphQL */ `
            query fetchData($eventoID: ID!, $usuarioID:ID!, $organizadorID:ID! ${cuponID ? `,$cuponID:ID!` : ""
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
                email
                nombre
                paterno
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

              ${cuponID
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

    ////////////////////////////////////////////
    // Pedir todos los datos con id recibidos //
    ////////////////////////////////////////////

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
    }).then((r) => {
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
        email: emailCliente,
        nombre: nombreCliente,
        paterno: paternoCliente,
      },
      // Parametro de stripe account
      owner: { paymentAccountID: ownerPaymentIDFetched },
    } = response;
    // Obtener organizador desde evento
    const { CreatorID: organizadorIDFetched } = evento;

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
        res,
        statusCode: 400,
        error: "El cupon ha expirado",
      });
    }

    if (cupon?.restantes - totalPersonasReservadas <= 0) {
      // Si los restantes por cupon mas los que quiere pagar el cliente exeden a las personas maximas
      return formatResponse({
        res,
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

    // Si el organizador no coincide con el obtenido del evento dar error
    if (organizadorIDFetched !== organizadorID) {
      return formatResponse({
        res,
        statusCode: 400,
        error: "el id obtenido del evento no coincide",
      });
    }

    if (!clientPaymentID) {
      return formatResponse({
        res,
        statusCode: 400,
        error: "no se encontro id de customer para tu cuenta de pagos",
      });
    }

    if (!ownerPaymentID) {
      return formatResponse({
        res,
        statusCode: 400,
        error:
          "no se encontro id de account para la cuenta de pagos del creador del evento ",
      });
    }

    // Verificar que el owner id no sea igual a client id para evitar problemas de transferencias
    if (ownerPaymentID === clientPaymentID && total !== 0) {
      return formatResponse({
        res,
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
        res,
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
        res,
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

    // Si el nickname es dividle en 2 hacerlo y verificar que tenga 2 caracteres minimo para pagos con oxxo
    let nombre = nombreCliente ? nombreCliente : nicknameCliente.slice(0, 2);
    let paterno = paternoCliente ? paternoCliente : nicknameCliente.slice(2);

    nombre = nombre.length < 2 ? "nombre" : nombre;
    paterno = paterno.length < 2 ? "apellido" : paterno;
    const name = nombre + " " + paterno;

    // Crear el payment intent con stripe y confirmarlo ahi mismo
    const res = await stripe.paymentIntents.create({
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

      // Confirmar el pago al momento
      confirm: true,

      // Url para cuando agregue autenticacion 3d secure
      return_url: "https://www.partyusmx.com",

      ///////////////////// OXXO /////////////////////
      // Tiempo de expiracion del codigo oxxo en 1 dia
      payment_method_options: {
        oxxo: {
          expires_after_days: 1,
        },
      },
      // Si el tipo de pago es oxxo, crear metodo de pago oxxo con ese parametro
      payment_method_data:
        tipoPago === "EFECTIVO"
          ? {
            type: "oxxo",
            billing_details: {
              name,
              email: emailCliente,
            },
          }
          : undefined,

      ///////////////////// TARJETA /////////////////////
      //// Agregar la tarjeta si es pago con tarjeta ////
      payment_method: sourceID ? sourceID : undefined,

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
      // Rastrear estado del pago al grupo de reserva
      transfer_group: "Reserva: " + reservaID,
    });

    // Si nos da un estado de pago distinto a redirect url (3d secure) o pagos con oxxo, lanzar un error al cliente y no proceder con la reserva
    if (
      res?.status !== "succeeded" &&
      res?.status !== "requires_action" &&
      !res.next_action?.oxxo_display_details &&
      !res.next_action?.redirect_to_url
    ) {
      console.log(
        "El payment intent no esta completado o con tarjeta, 3d secure o con oxxo"
      );


      return formatResponse({
        res,
        statusCode: 400,
        error:
          "no se pudo crear la reserva, hubo un error con tu tarjeta. Si el cargo se realizo, contactanos para devolverte el dinero",
      });
    }

    // Manejar si tenemos activada la opcion de enviar a RP ( cuando alguien entra con el link de alguien mas )

    // Obtener del evento la comision a RP

    // Hacer un transfer con transfer_group reserva ID del organizador al RP

    return formatResponse({
      res,
      statusCode: 200,
      body: res,
    });
  } catch (error) {
    let msg = error.message
      ? error.message
      : error.description
        ? error.description
        : error.errorMessage
          ? error.errorMessage
          : error;

    return formatResponse({
      res,
      statusCode: 500,
      error: msg,
    });
  }
});

/*******************************************************************************************************************************
******************************************* CONFIRMAR RESERVA DE 3D SECURE *****************************************************
********************************************************************************************************************************/
app.post('/confirmReserva', function (req, res) {
  // Add your code here
  res.json({ success: 'get call succeed!', url: req.url });
});

/*******************************************************************************************************************************
**************************************************** ONPAY( OXXO ) *************************************************************
********************************************************************************************************************************/
app.post('/onPay', function (req, res) {
  // Add your code here
  res.json({ success: 'get call succeed!', url: req.url });
});

/*******************************************************************************************************************************
*************************************************** CANCELAR RESERVA ************************************************************
********************************************************************************************************************************/
app.post('/cancel', function (req, res) {
  // Add your code here
  res.json({ success: 'get call succeed!', url: req.url });
});


// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
app.listen(3000);

/***********************************************************************************************************************************
************************************************** FUNCIONES MISC ******************************************************************
************************************************************************************************************************************/

// Sacar el precio con comision de in precio inicial
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

// Hacer una peticion con graphql request
async function graphqlRequest({ query, variables }) {
  const endpoint = process.env.API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT;

  let body = {};

  try {
    body = await graphqlOperation(
      !!variables
        ? { query, variables }
        : {
          query,
        },
      endpoint
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

// Mandar respuestas en una sola manera
function formatResponse({
  error,
  res,
  body,
  statusCode,
}) {
  let r = {
    statusCode,
    body,
    error,
  };
  if (error) {
    handleError(res, body)
  }

  if (body) {
    handleResponse(res, body)
  }
  return r;
}



/***********************************************************************************************************************************
************************************************* RESPONSE HANDLERS *****************************************************************
************************************************************************************************************************************/
// Estandarizar respuestas exitosas y errores

function handleResponse(res, input) {

  res.status(200)
  res.json({
    error: null,
    body: input
  })
}

function handleError(res, e) {
  console.log(e)


  const mes = e.message
  const statusCode = e?.statusCode ? e.statusCode : 500

  res.status(statusCode)

  return res.json({
    error: mes,
    body: e.error
  });

}
