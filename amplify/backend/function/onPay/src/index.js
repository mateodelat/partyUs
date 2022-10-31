/* Amplify Params - DO NOT EDIT
  ENV
  REGION
  API_PARTYUSAPI_GRAPHQLAPIIDOUTPUT
  API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT
  API_PARTYUSAPI_GRAPHQLAPIKEYOUTPUT
  MERCHANT_ID
  SECRET_KEY
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const { graphqlOperation } = require('/opt/graphqlOperation')
const { createNotificacionReturns, reservaReturns } = require('/opt/graphqlReturns')

const Openpay = require("openpay")
var openpay = new Openpay(process.env.MERCHANT_ID, process.env.SECRET_KEY);
const axios = require('axios');


async function graphqlRequest({ query, variables }) {
  const endpoint = process.env.API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT

  let body = {}

  try {
    body = await graphqlOperation(!!variables
      ? { query, variables }
      : {
        query,
      },
      endpoint
    )




  } catch (error) {
    console.log(error)
    body = {
      error: [
        {
          message: error.message,
        },
      ],
    };
  }

  return body
}


function formatResponse({ error, body, statusCode = 200 }) {
  let r = {
    statusCode,
  }
  if (error) {
    body = {
      ...body,
      error
    }
  }

  if (body) {
    r = {
      ...r,
      body: JSON.stringify(body, null, 2)
    }
  }
  console.log(r)
  return r

}

exports.handler = async (event) => {
  const getReserva = /* GraphQL */ `
      query GetReserva($id: ID!) {
        getReserva(id: $id) {
          id
          total
          comision
          pagadoAlOrganizador
          organizadorID
          usuarioID
          _version
          eventoID
          cancelado
        }
      }
    `;
  event.body = JSON.parse(event.body)
  if (!event?.body) {
    return formatResponse({
      statusCode: 400,

      error: {
        description: "No se recibio cuerpo de la respuesta"
      }
    })
  }

  console.log({ event })



  // Add your code here
  try {
    const { body } = event;

    // Si se manda el codigo de verificacion de openpay devolver codigo 200
    if (body.verification_code) {
      console.log(body)
      return formatResponse({
        body: {
          message: "Codigo recibido con exito"
        },
      })

    }

    const { status, method, order_id, amount } = body.transaction; //status: 'completed', method: store
    const { type } = body; //charge.succeeded

    console.log(body)

    if (type !== "charge.succeeded") {
      return formatResponse({
        body: {
          ...body,
          message: "Transaccion no es de tipo charge.succeeded"
        },
      })
    }

    if (method !== "store") {
      return formatResponse({
        body: {
          ...body,
          message: "Transaccion no es pago en efectivo"
        },
      })
    }

    if (status !== "completed") {
      return formatResponse({
        body: {
          ...body,
          message: "La transaccion no tiene status.completed"
        },
      })
    }


    // Obtener info de la reserva
    var regex = /[^>]*$/;
    const reservaID = order_id.match(regex)[0];

    if (!reservaID) {
      throw new Error("Error no se encontro reserva ID en los datos recibidos");
    }

    let clientPaymentID = "",
      ownerPaymentID = "",
      notificationToken = "",
      notificacionABorrar = {}


    const reserva = await graphqlRequest({
      query: getReserva,
      variables: { id: reservaID },
    }).then(async (r) => {
      r = r.data.getReserva;
      const { usuarioID, organizadorID } = r;

      await graphqlRequest({
        query: /* GraphQL */ `
            query getUsuarios {
              client: getUsuario(id: "${usuarioID}") {
                userPaymentID
                notificationToken
              }
              organizador: getUsuario(id: "${organizadorID}") {
                userPaymentID
              }
              
              listNotificacions(filter: {reservaID: {eq: "${reservaID}"}, tipo: {eq: RECORDATORIOPAGO}, usuarioID: {eq: "${usuarioID}"}}) {
                items {
                  id
                  _version
              }
              }
            }
          `,
      }).then((r) => {
        r = r.data;
        notificacionABorrar = r.listNotificacions?.items[0]

        clientPaymentID = r.client.userPaymentID;
        notificationToken = r.client.notificationToken

        ownerPaymentID = r.organizador.userPaymentID;

      });

      return r
    });


    // Obtener detalles del fee y cuanto se lleva el organizador
    const {
      pagadoAlOrganizador,
      comision,
      organizadorID,
      usuarioID,
      _version,
      eventoID,
      cancelado
    } = reserva;



    // Si el precio a transferir al guia no coincide con lo pagado, lanzar un error
    if (comision + pagadoAlOrganizador !== amount) {
      throw new Error(
        "La suma de la comision y lo que hay que pagar al organizador no coincide con lo recibido en efectivo"
      );
    }

    let feeID = ""
    let transactionID = ""


    // Solo realizar transaccion de dinero si la reserva no esta cancelada
    if (!cancelado) {

      await Promise.all([
        ////////////////////////////////////
        // Comision de app al organizador //
        ////////////////////////////////////
        new Promise((res, rej) => {
          // Cargo comision al comprador
          openpay.fees.create(
            {
              amount: comision,
              description: "Reserva: " + reservaID + " comision partyus.",
              order_id: "fee>>>" + reservaID,
              customer_id: clientPaymentID,
            },
            function (error, fee) {
              if (error) {
                rej(error);
              }

              console.log("\nFEE RESULT:\n");
              console.log(fee);

              feeID = fee.id

              res();
            }
          )
        }),

        ////////////////////////////////////////////////
        // Transferencia del comprador al organizador //
        ////////////////////////////////////////////////
        new Promise((res, rej) => {
          openpay.customers.transfers.create(
            clientPaymentID,
            {
              customer_id: ownerPaymentID,
              amount: pagadoAlOrganizador,
              order_id: "cashtransfer>>>" + reservaID,
              description:
                "cashtransfer>>>" + reservaID + "><" + "Pago reserva en tienda autorizada",
            },
            (error, r) => {
              if (error) {
                rej(error);
              }

              console.log("\nTRANSFER RESULT:\n");
              console.log(r);

              transactionID = r.id
              res();
            }
          )
        }),
      ]);
    } else {
      console.log("Se recibio el pago pero la reserva esta cancelada. Agregando a saldo del usuario...")
    }



    const updateReservaInput = {
      id: reservaID,
      pagado: true,
      paymentTime: new Date().toISOString(),
      fechaExpiracionUTC: undefined,
      cancelado: false,
      canceledAt: undefined,
      transactionID,
      feeID,
      _version,
    };

    const q = /*GraphQL*/`
      mutation UpdateReserva($input: UpdateReservaInput!) {
        ${!cancelado ? `
        updateReserva(input: $input) {
          ${reservaReturns}
      }
      `: ""}
  
        ${notificacionABorrar?.id ? `
        deleteNotificacion(input: {id: "${notificacionABorrar.id}" _version:${notificacionABorrar._version}}) {
          id
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
      }
  `: ""}
  
        createNotificacion(input: {
        tipo: RESERVAEFECTIVOPAGADA,
        showAt: "${new Date().toISOString()}",
        titulo:"Pago exitoso",
        usuarioID:"${usuarioID}",
        reservaID:"${reservaID}",
        organizadorID:"${organizadorID}",
        descripcion: "Tu pago en efectivo por $${amount} fue procesado con exito. ${cancelado ? `Como la reserva esta cancelada se agrego al saldo de tu cuenta` : `Haz click aqui para ver tu boleto`}"
    }){
      ${createNotificacionReturns}
    }
    }
    `


    ///////////////////////////////////////////////////////
    // Modificar estado de reserva y mandar notificacion //
    ///////////////////////////////////////////////////////
    await graphqlRequest({
      query: q,
      variables: { input: updateReservaInput },
    }).then((r) => {
      if (r.errors) {
        throw new Error(r)
      }
      console.log("Reserva actualizada con exito: ");
    });

    // Enviar push notification
    if (notificationToken) {

      let data = {
        reservaID,
        eventoID,
        type: "PAYMENTRECEIVED"
      }

      let message = {
        to: notificationToken,
        sound: "default",
        title: "Pago recibido",
        body: `Tu pago en efectivo por $${amount} fue procesado con exito. ` + (cancelado ? "Como la reserva esta cancelada se agrego al saldo de tu cuenta" : "Entra a la app para ver tu boleto"),
        badge: 1,
        priority: "high",
        data,
      };

      if (!data) {
        delete message.data;
      }

      await axios({
        method: "POST",
        url: "https://exp.host/--/api/v2/push/send",
        headers: {
          "Accept": "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        data: JSON.stringify(message),
      }).then((r) => {
        console.log("Push notification send to ", notificationToken);
      });
    }




    return formatResponse({
      statusCode: 200,
      body: "Pago procesado con exito",
    })

    /////////////////////
    // Manejar errores //
    /////////////////////
  } catch (e) {
    console.log(e)
    e = e.message
      ? e.message
      : e.description
        ? e.description
        : e;


    if (e.errors) {
      e = e.errors[0].message;
    }
    return formatResponse({
      statusCode: 500,
      error: {
        description: e,
      },
    })
  }
};
