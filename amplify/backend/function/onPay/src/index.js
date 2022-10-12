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

import crypto from "@aws-crypto/sha256-js";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";

import { default as fetch, Request } from 'node-fetch';

import { createRequire } from "module"
const require = createRequire(import.meta.url)
const Openpay = require("openpay")

var openpay = new Openpay(process.env.MERCHANT_ID, process.env.SECRET_KEY);

const { Sha256 } = crypto;

const AWS_REGION = process.env.AWS_REGION || "us-east-1";



async function graphqlRequest({ query, variables }) {
  const endpoint = new URL(
    process.env.API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT
  );

  const signer = new SignatureV4({
    credentials: defaultProvider(),
    region: AWS_REGION,
    service: "appsync",
    sha256: Sha256,
  });

  const requestToBeSigned = new HttpRequest({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      host: endpoint.host,
    },
    hostname: endpoint.host,
    body: JSON.stringify(
      !!variables
        ? { query, variables }
        : {
          query,
        }
    ),
    path: endpoint.pathname,
  });

  const signed = await signer.sign(requestToBeSigned);
  const request = new Request(endpoint, signed);



  let statusCode = 200;
  let body;
  let response;

  try {
    response = await fetch(request)
    body = await response.json()
    if (body.errors) statusCode = 400;
  } catch (error) {
    console.log("Error fetcheando objeto")
    statusCode = 500;
    body = {
      error: [
        {
          status: response.status,
          message: error.message,
          stack: error.stack,
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

export const handler = async (event) => {
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
          }
          }
        }
      `,
      }).then((r) => {
        r = r.data;
        console.log(r)
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
      eventoID
    } = reserva;

    console.log(`listNotificacions(filter: {reservaID: {eq: "${reservaID}"}, tipo: {eq: RECORDATORIOPAGO}, usuarioID: {eq: "${usuarioID}"}}) {
      items {
        id
        _version
    }
`)

    const updateReservaInput = {
      id: reservaID,
      pagado: true,
      paymentTime: new Date().toISOString(),
      fechaExpiracionUTC: undefined,
      cancelado: false,
      canceledAt: undefined,
      _version,
    };

    // Si el precio a transferir al guia no coincide con lo pagado, lanzar un error
    if (comision + pagadoAlOrganizador !== amount) {
      throw new Error(
        "La suma de la comision y lo que hay que pagar al organizador no coincide con lo recibido en efectivo"
      );
    }

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
            order_id: "transfer>>>" + reservaID,
            description:
              "Transferencia: " + reservaID + " pagada en efectivo.",
          },
          (error, r) => {
            if (error) {
              rej(error);
            }

            console.log("\nTRANSFER RESULT:\n");
            console.log(r);
            res();
          }
        )
      }),
    ]);

    ///////////////////////////////////////////////////////
    // Modificar estado de reserva y mandar notificacion //
    ///////////////////////////////////////////////////////
    await graphqlRequest({
      query: /* GraphQL */ `
      mutation UpdateReserva($input: UpdateReservaInput!) {
        updateReserva(input: $input) {
          id
          _version
        }

        ${notificacionABorrar.id ? `deleteNotificacion(input: {id: "${notificacionABorrar.id}" _version:${notificacionABorrar._version}}) {
    id
  }`: ""}

        createNotificacion(input: {
        tipo: RESERVAEFECTIVOPAGADA,
        showAt: "${new Date().toISOString()}",
        titulo:"Pago exitoso",
        usuarioID:"${usuarioID}",
        reservaID:"${reservaID}",
        organizadorID:"${organizadorID}"
        descripcion: "Tu pago en efectivo por $${amount} fue procesado con exito. Haz click aqui para ver tu boleto",
    }){
        id
        _version
    }
    }
    `,
      variables: { input: updateReservaInput },
    }).then((r) => {
      console.log("Reserva actualizada con exito: ");
      console.log(r);
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
        body: `Tu pago en efectivo por $${amount} fue procesado con exito. Entra a la app para ver tu boleto`,
        badge: 1,
        priority: "high",
        data,
      };

      if (!data) {
        delete message.data;
      }

      console.log({
        url: "https://exp.host/--/api/v2/push/send",
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      })

      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      }).then((r) => {
        console.log("Push notification send to ", notificationToken);
        console.log(r)
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
