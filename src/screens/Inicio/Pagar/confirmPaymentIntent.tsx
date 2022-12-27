import { API } from "aws-amplify";
import Stripe from "stripe";
import { fetchFromStripe, log } from "../../../../constants";
import { STRIPE_SECRET_KEY } from "../../../../constants/keys";
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

function formatResponse({ error, body, statusCode }: any) {
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
      body, //: JSON.stringify(body, null, 2),
    };
  }
  return r;
}

export default async (event: {
  body: {
    paymentIntentID: string;
  };
}) => {
  //   event.body = JSON.parse(event.body);
  if (!event?.body) {
    return formatResponse({
      statusCode: 400,

      error: "No se recibio cuerpo de la respuesta",
    });
  }

  try {
    const { paymentIntentID } = event.body;

    if (!paymentIntentID) {
      return formatResponse({
        statusCode: 400,
        error: "No se recibio payment intent ID",
      });
    }

    const res = (await fetchFromStripe({
      path: "/v1/payment_intents/" + paymentIntentID,
      type: "GET",
      secretKey: STRIPE_SECRET_KEY,
    })) as Stripe.PaymentIntent;

    // Si el estado del payment intent no es confirmado, dar error
    if (res.status !== "succeeded") {
      // Devolver error de last payment error o mensaje generico
      const mes = res.last_payment_error?.message
        ? res.last_payment_error.message
        : "ocurrio un error confirmando tu cargo, no se pudo realizar.";
      return formatResponse({
        error: mes,
        statusCode: 400,
      });
    }

    // Crear reserva, notificaciones y actualizar evento

    return formatResponse({
      statusCode: 200,
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
