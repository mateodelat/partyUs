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

const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");

const SECRET_KEY = production
  ? process.env.SECRET_KEY_PROD
  : process.env.SECRET_KEY_STAG;

const WEBHOOK_KEY = production
  ? process.env.WEBHOOK_KEY_PROD
  : process.env.WEBHOOK_KEY_STAG;

const stripe = require("stripe")(SECRET_KEY);

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// Funciones miscelaneas
const comisionApp = 0.15;
const msInDay = 86400000;

/*******************************************************************************************************************************
 ******************************************* CREAR RESERVA ( PAYMENT INTENT) ****************************************************
********************************************************************************************************************************/
app.post("/reservas/createReserva", async function (req, res) {
  if (!req || !req.body) {
    handleError(res, "No se recibio body en la solicitud");
    return;
  }

  const { body } = req;

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
    console.log({ body });

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

    // Si tenemos un total en efectivo pero no esta en el rango permitido por stripe para oxxo
    if (!!total && tipoPago === "EFECTIVO" && (total < 10 || total > 7000)) {
      return formatResponse({
        res,
        statusCode: 400,
        error: "Error el precio total debe ser entre 10$ y 7000$ para pagos en oxxo",
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
      r = r.data;

      // Asignar a 0 el numero de personas reservadas en todos los boletos
      let boletosFiltrados = r.listBoletos.items.map((bol) => ({
        ...bol,
        personasReservadas: 0,
      }));

      // Si hay mas reservas en efectivo por el mismo usuario dar error para evitar fraudes

      if (tipoPago === "EFECTIVO" && total !== 0) {
        const efectivoDeny = !!r.listReservas.items.find((e) => {
          console.log("Reserva:")
          console.log(e)
          // Si el evento ya fue pagado o borrado o la fecha de expiracion es menor a la del dioa de hoy da falso para ese item
          if (
            e.pagado ||
            e.fechaExpiracionUTC < new Date().toISOString() ||
            e._deleted
          )
            return false;
          else return true;
        });

        if (efectivoDeny) {
          throw new Error(
            "Solo se permite tener una reserva en efectivo por evento."
          );
        }
      }


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

    // Fecha de expiracion pagos en efectivo
    // Calcular fecha de expiracion
    let limitDate = new Date();

    // Restarle 6 horas al UTC para estar en UTC-6 (Mexico central)
    limitDate.setTime(limitDate.getTime() - 6 * 3600 * 1000);

    // Poner la hora a las (23:59:59) de el dia de hoy en UTC-6
    limitDate.setUTCHours(23);
    limitDate.setUTCMinutes(59);
    limitDate.setUTCSeconds(59);
    limitDate.setUTCMilliseconds(999);

    // Dar error al cliente

    if (limitDate.getTime() > evento.fechaInicial && tipoPago === "EFECTIVO") {
      return formatResponse({
        res,
        statusCode: 400,
        error:
          "no se puede realizar un pago en efectivo faltando 1 dia para el evento",
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

    let statement_descriptor = "";

    // Funcion para calcular el extrato bancario
    (() => {
      //////////////////////////////////////////////////////////////////////////////
      ///////////////////////////////Extracto bancario//////////////////////////////
      //////////////////////////////////////////////////////////////////////////////
      statement_descriptor = "PARTYUS-";

      const maxExtractLength = 21;

      // Calcular la longitud maxima del evento
      const lenEvento =
        maxExtractLength -
        (statement_descriptor.length +
          2 + //"- "
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
      statement_descriptor += titulo + " " + totalPersonasReservadas + " pers";

      // Si por algo fallaron las cuentas y el descriptor mas el titulo mas "* " es mayor a 22, reducir
      if (statement_descriptor.length > maxExtractLength) {
        statement_descriptor = statement_descriptor.slice(0, maxExtractLength);
      }
    })();

    // Datos de contacto para pagos en oxxo con el link
    const partyusEmail = "partyus_mx@outlook.com";
    const partyusPhone = "+5213312897347";

    let paymentIntent
    // Si hay un total, cobrarlo de lo contrario solo se hace el boleto ( reserva )
    if (total > 0) {
      // Crear el payment intent con stripe y confirmarlo ahi mismo
      paymentIntent = await stripe.paymentIntents.create({
        // Multiplicar precio por 100 pues es en centavos
        amount: total * 100,
        currency: "mxn",
        // Multiplicar comision por 100 pues es en centavos
        application_fee_amount: comision * 100,

        metadata: {
          usuarioID,
          reservaID,
          eventoID,

          // Poner informacion del cupon si existe
          cuponID,
          boletos: JSON.stringify(boletos),
          pagadoAlOrganizador: enviarACreador,

          tipoPago
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
                name: "Party us",
                phone: partyusPhone,
                email: partyusEmail,
              },
            }
            : undefined,

        ///////////////////// TARJETA /////////////////////
        //// Agregar la tarjeta si es pago con tarjeta ////
        payment_method: sourceID ? sourceID : undefined,

        // Aceptar metodos de pago oxxo y tarjeta
        payment_method_types: ["card", "oxxo"],

        // Cliente a quien asociar el cargo
        customer: clientPaymentID,

        // Descripcion en stripe y extracto bancario
        description: description,

        // Descripcion del extracto bancario
        statement_descriptor,

        // Mandar correo de recibo si se ingreso desde el cliente
        receipt_email,

        // Para que el se pongan los datos del organizador
        on_behalf_of: ownerPaymentID,

        // Transferir dinero al organizador el evento
        transfer_data: {
          destination: ownerPaymentID,
        },
        // Rastrear estado del pago al grupo de reserva
        transfer_group: reservaID,
      });

      // Si fue pago con oxxo, actualizar el expires_after para que el cliente que ve el payment intent lo lea

      if (tipoPago === "EFECTIVO") {
        paymentIntent.next_action.oxxo_display_details.expires_after =
          limitDate.getTime();
      }

      console.log({
        paymentIntent,
      });

      // Si nos da un estado de pago distinto a redirect url (3d secure) o pagos con oxxo, lanzar un error al cliente y no proceder con la reserva
      if (
        paymentIntent?.status !== "succeeded" &&
        paymentIntent?.status !== "requires_action" &&
        !paymentIntent.next_action?.oxxo_display_details &&
        !paymentIntent.next_action?.redirect_to_url
      ) {
        console.log(
          "Error inesperado, payment intent no esta completado o con tarjeta, 3d secure o con oxxo"
        );

        // Algun error inesperado cuando es distinto de pago con tarjeta o con oxxo o 3d secure

        return formatResponse({
          res,
          body: {
            paymentIntent,
            success: false,
          },
        });
      }

      // Si se requiere 3d secure, devolver el estado de stripe y manejarlo en cliente para despues llamar a confirm reserva
      if (paymentIntent.next_action?.type === "redirect_to_url") {
        console.log("Requiere verificacion 3d secure");
        return formatResponse({
          res,
          body: {
            paymentIntent,
            success: false,
          },
        });
      }
      // Manejar si tenemos activada la opcion de enviar a RP ( cuando alguien entra con el link de alguien mas )

      // Obtener del evento la comision a RP

      // Hacer un transfer con transfer_group reserva ID del organizador al RP
    }

    //////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////CREAR RESERVA GRAPHQL////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////

    // Regresarle las 6 horas al UTC para estar en UTC para guardarlo en graphql reserva
    limitDate.setTime(limitDate.getTime() + 6 * 3600 * 1000);


    const cashBarcode = paymentIntent?.next_action?.oxxo_display_details?.number
    const cashReference = paymentIntent?.next_action?.oxxo_display_details?.hosted_voucher_url


    const reservaInput = {
      cantidad: totalPersonasReservadas,
      comision,
      cuponID,
      eventoID,
      id: reservaID,
      organizadorID,
      pagadoAlOrganizador: enviarACreador,
      chargeID: paymentIntent?.id,
      total,

      // Si es un pago en oxxo y pago con total no nulo ( cuando se descuenta por uso de cupon )
      pagado: tipoPago === "EFECTIVO" && !!total ? false : true,
      usuarioID,

      // Expirar la reserva si es en efectivo a hoy a 11:59 de este dia en la hora UTC-6
      fechaExpiracionUTC: limitDate.toISOString(),
      cashBarcode,
      cashReference,
      tipoPago,
      paymentTime: new Date().toISOString(),
    };
    const q = `
    mutation myMutation($reservaInput:CreateReservaInput!) {
      ${boletosFetched.map((e, idx) => {
      // Actualizar personas reservadas por boleto

      const boletoCliente = boletos.find((cli) => cli.id === e.id);
      if (!boletoCliente) {
        throw new Error(
          "Ocurrio un error con los boletos obtenidos de la base de datos no se encotro el que coincida con " +
          e.id
        );
      }

      const personasReservadas =
        (e.personasReservadas ? e.personasReservadas : 0) +
        boletoCliente.quantity;

      return `
        bol${idx}: updateBoleto(input: {id:"${e.id}",personasReservadas:${personasReservadas},_version:${e._version}}) {
            ${updateBoletoReturns}
        }
        bol${idx}rel: createReservasBoletos(input:{
          boletoID:"${e.id}",
          reservaID:"${reservaID}",
          quantity:${boletoCliente.quantity},
        }){
            ${createReservasBoletosReturns}
            }
        `;
    })}

            updateEvento(input:{id:"${evento.id
      }", personasReservadas:${reservadosEvento}, _version:${evento._version
      }}){
            ${updateEventoReturns}                    
        }

      ${
      // Restar de cupon si existe ID
      cuponID
        ? `updateCupon(input: {id: "${cuponID}", restantes: ${cupon.restantes ? cupon.restantes - totalPersonasReservadas : 0
        },_version:${cupon._version}}) {
                ${updateCuponReturns}
          }`
        : ``
      }


        
    createReserva(input: $reservaInput) {
        ${reservaReturns}
    }
    }
  `;

    // Mutacion para actualizar los boletos, el evento, crear reservacion y restar el personas disponibles de cupon
    await graphqlRequest({
      query: q,
      variables: {
        reservaInput,
      },
    })

    // Se devuelve una respuesta exitosa y el payment intent con el que se hizo en caso tal
    return formatResponse({
      res,
      statusCode: 200,
      body: {
        paymentIntent,
        success: true,
      },
    });
  } catch (error) {
    return formatResponse({
      res,
      statusCode: 500,
      error,
    });
  }
});

/*******************************************************************************************************************************
 ******************************************* CONFIRMAR RESERVA DE 3D SECURE *****************************************************
********************************************************************************************************************************/
app.get(
  "/reservas/confirmReserva/:paymentIntentID",
  async function (req, res) {
    try {
      const { paymentIntentID } = req.params;

      // Validar que exista el parametro de id de paymentIntent
      if (!paymentIntentID) {
        console.log(req);
        res.status(404);
        res.json({
          error: "Error, no se recibio paymentIntentID",
        });
        return;
      }

      // Obtener el payment intent que se quiere confirmar
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentID
      );

      // Si el estado del payment intent no es confirmado, dar error
      if (paymentIntent.status !== "succeeded") {
        // Devolver error de last payment error o mensaje generico
        const mes = paymentIntent.last_payment_error?.message
          ? paymentIntent.last_payment_error.message
          : "ocurrio un error confirmando tu cargo, no se pudo realizar.";
        return formatResponse({
          res,
          error: mes,
          statusCode: 400,
        });
      }

      // Crear la reserva obteniendo informacion a partir de la metadata del payment intent
      await createReservaFromPaymentIntent(paymentIntent);

      // Resolver con payment intent si fue exitosa
      return formatResponse({
        res,
        statusCode: 200,
        body: paymentIntent,
      });
    } catch (error) {
      return formatResponse({
        res,
        statusCode: 500,
        error,
      });
    }
  }
);


/*******************************************************************************************************************************
 **************************************************** ONPAY( OXXO ) *************************************************************
********************************************************************************************************************************/
app.post("/reservas/onPay", function (req, res) {


  const { body } = req
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_KEY);

    if (event.type !== "payment_intent.succeeded") {
      throw "El tipo de evento no es de payment_intent.succeeded"
    }

    const paymentIntent = event.data.object;

    console.log({ body, event })




    // Return a 200 response to acknowledge receipt of the event
    response.send();
  } catch (err) {
    console.log(err)
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }


});

/*******************************************************************************************************************************
 *************************************************** CANCELAR RESERVA ************************************************************
********************************************************************************************************************************/
app.post("/reservas/cancel", function (req, res) {
  // Add your code here
  res.json({ success: "get call succeed!", url: req.url });
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
app.listen(3000);

/***********************************************************************************************************************************
 ************************************************** FUNCIONES MISC ******************************************************************
************************************************************************************************************************************/

async function createReservaFromPaymentIntent(
  paymentIntent
) {
  // Obtener datos para crear la reserva de los metadatos del payment intent

  let {
    boletos,
    eventoID,
    reservaID,
    usuarioID,
    tipoPago,
    cuponID,
    pagadoAlOrganizador,
  } = paymentIntent?.metadata;

  boletos = JSON.parse(boletos);
  console.log({
    boletos,
    eventoID,
    reservaID,
    usuarioID,
    tipoPago,
    cuponID,
    pagadoAlOrganizador,
  });

  // Si nos falta cualquiera de esos parametros, dar error
  if (!boletos || !eventoID || !reservaID || !usuarioID || !tipoPago) {
    throw "No se encontro los metadatos del payment intent";
  }

  // Obtener el total de la reserva y comision (de centavos a pesos)
  const total = paymentIntent.amount / 100
  const comision = paymentIntent.application_fee_amount / 100

  const personasReservadas = (
    boletos
  ).reduce((prev, bol) => prev + bol.quantity, 0);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////PEDIR EVENTO Y BOLETOS PARA SACAR VERSIONES Y PERSONAS RESERVADAS//////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Pedir evento, boleto y cupon
  let string = "";
  boletos.map((bol, idx) => {
    // Poner todos los boletos que queremos en un query
    string += `{id:{eq:"${bol.id}"}},`;
  });

  // Extraer resultado del graphql
  const {
    boletos: boletosFetched,
    cupon,
    evento,
  } = await graphqlRequest({
    query: /* GraphQL */ `
    query fetchData($eventoID: ID!, ${cuponID ? `,$cuponID:ID!` : ""}) {
      getEvento(id: $eventoID) {
        CreatorID
        _version
        id
        personasReservadas
      }
      listBoletos(filter:{or:[${string}]}) {
        items{
          id
          personasReservadas
          _version
        }
      }
      ${cuponID
        ? /* GraphQL */ `getCupon(id: $cuponID) {
        _version
        id
        restantes
      }`
        : ""
      }
    }
  `,
    variables: cuponID
      ? {
        eventoID,
        cuponID,
      }
      : {
        eventoID,
      },
  }).then((r) => {

    r = r.data;

    return {
      cupon: r.getCupon,
      evento: r.getEvento,
      boletos: r.listBoletos.items,
    };
  });


  //////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////CREAR RESERVA GRAPHQL////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////

  const reservaInput = {
    cantidad: personasReservadas,
    comision,
    cuponID,
    eventoID,
    id: reservaID,
    organizadorID: evento.CreatorID,
    pagadoAlOrganizador,
    chargeID: paymentIntent.id,
    total,

    // Cuando se llega a este estado, ya se verifico que el payment intent salga como confirmado
    pagado: true,
    usuarioID,

    // Expirar la reserva si es en efectivo a hoy a 11:59 de este dia en la hora UTC-6

    tipoPago,
    paymentTime: new Date().toISOString(),
  };


  // Sacar las personas reservadas en el evento
  let reservadosEvento = evento.personasReservadas
    ? evento.personasReservadas
    : 0;
  // Sumarle las personas reservadas actuales
  reservadosEvento += personasReservadas;

  const q = `
  mutation myMutation($reservaInput:CreateReservaInput!) {
  ${boletosFetched.map((e, idx) => {
    // Mapear los boletos obtenidos y cuadrarlo con los que teniamos en los metadatos del payment intent
    const boletoCliente = boletos.find((cli) => cli.id === e.id);
    if (!boletoCliente) {
      throw new Error(
        "Ocurrio un error con los boletos obtenidos de la base de datos no se encontro el que coincida con " +
        e.id
      );
    }

    const personasReservadas =
      (e.personasReservadas ? e.personasReservadas : 0) + boletoCliente.quantity;

    return `
    bol${idx}: updateBoleto(input: {id:"${e.id}",personasReservadas:${personasReservadas},_version:${e._version}}) {
        ${updateBoletoReturns}
    }
    bol${idx}rel: createReservasBoletos(input:{
      boletoID:"${e.id}",
      reservaID:"${reservaID}",
      quantity:${boletoCliente.quantity},
    }){
        ${createReservasBoletosReturns}
        }
    `;
  })}

        updateEvento(input:{id:"${eventoID}", personasReservadas:${reservadosEvento}, _version:${evento._version
    }}){
        ${updateEventoReturns}                    
    }

  ${
    // Restar de cupon si existe ID
    cuponID
      ? `updateCupon(input: {id: "${cuponID}", restantes: ${cupon.restantes ? cupon.restantes - personasReservadas : 0
      },_version:${cupon._version}}) {
            ${updateCuponReturns}
      }`
      : ``
    }
  createReserva(input: $reservaInput) {
    ${reservaReturns}
  }
  }
  `;

  // Mutacion para actualizar los boletos, el evento, crear reservacion y restar el personas disponibles de cupon
  await graphqlRequest({
    query: q,
    variables: {
      reservaInput,
    },
  })
}

// Sacar el precio con comision de in precio inicial
function precioConComision(inicial, comision) {
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

  console.log({
    query, variables
  })

  body = await graphqlOperation(
    !!variables
      ? { query, variables }
      : {
        query,
      },
    endpoint
  );
  if (body.errors) {

    throw body.errors[0].message + "\nSi se realizo el cargo, contactanos para cancelarlo"

  }


  return body;
}

// Mandar respuestas en una sola manera
function formatResponse({ error, res, body, statusCode }) {
  let r = {
    statusCode,
    body,
    error,
  };


  if (error) {

    handleError(res, {
      error,
      statusCode,
    });
    return
  }

  handleResponse(res, body);
  return r;
}

/***********************************************************************************************************************************
 ************************************************* RESPONSE HANDLERS *****************************************************************
************************************************************************************************************************************/
// Estandarizar respuestas exitosas y errores

function handleResponse(res, input) {
  console.log({ response: input })

  res.status(200);
  res.json({
    error: null,
    body: input,
  });
}

function handleError(res, error) {
  console.log({ error })

  error = error.error ? error.error : error

  const msg = error.raw ? (error.raw.code + ": " + error.raw.message)
    : error.message ? error.message : error.description
      ? error.description
      : error.errorMessage
        ? error.errorMessage
        : error;


  const statusCode = error?.statusCode ? error.statusCode : 500;

  res.status(statusCode);

  return res.json({
    error: msg,
  });
}
