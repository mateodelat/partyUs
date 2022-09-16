/* Amplify Params - DO NOT EDIT
  API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT
  API_PARTYUSAPI_GRAPHQLAPIIDOUTPUT
  API_PARTYUSAPI_GRAPHQLAPIKEYOUTPUT
  ENV
  REGION
Amplify Params - DO NOT EDIT */


import crypto from '@aws-crypto/sha256-js';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { default as fetch, Request } from 'node-fetch';

const { Sha256 } = crypto;


const AWS_REGION = process.env.AWS_REGION || 'us-east-1'



async function graphqlRequest(query, variables) {
  const endpoint = new URL(process.env.API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT);

  const signer = new SignatureV4({
    credentials: defaultProvider(),
    region: AWS_REGION,
    service: 'appsync',
    sha256: Sha256
  });

  const requestToBeSigned = new HttpRequest({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      host: endpoint.host
    },
    hostname: endpoint.host,
    body: JSON.stringify(
      !!variables ? { query, variables }
        : {
          query
        }),
    path: endpoint.pathname
  });

  const signed = await signer.sign(requestToBeSigned);
  const request = new Request(endpoint, signed);

  console.log("Soicitud firmada:" + JSON.stringify(signed))

  let statusCode = 200;
  let body;
  let response;

  try {
    response = await fetch(request);
    body = await response.json();
    if (body.errors) statusCode = 400;
  } catch (error) {
    statusCode = 500;
    body = {
      errors: [
        {
          status: response.status,
          message: error.message,
          stack: error.stack
        }
      ]
    };
  }

  return {
    statusCode,
    body: JSON.stringify(body)
  };
}

const crearReserva = /* GraphQL */`
    mutation CreateReserva(
      $input: CreateReservaInput!
    ) {
      createReseva(input: $input) {
        id
      }
    }
  `;


export const handler = async (event) => {
  try {
    const { body } = event

    const {
      total,
      descuentoID,
      boletos,
      eventoID,
      cuponID,
      usuarioID,


    } = body

    /*
    boletos:[
      {
        quantity:2,
        
      }
    ]
    */

    ////////////////////////////////////////////////////////////////////////
    /////////////////////////Verificaciones previas/////////////////////////
    ////////////////////////////////////////////////////////////////////////
    if (!boletos || boletos.length === 0) {
      return {
        statusCode: 400,
        body: "Error no se recibio una lista de boletos"
      }
    }

    if (!eventoID) {
      return {
        statusCode: 400,
        body: "Error no se recibio ID de evento"
      }
    }

    // Funcion para sacar el query a mandar con filtro de boletosID
    const query = (boletosID) => {
      let string = "";
      boletosID.map((id, idx) => {
        string += `{id:{eq:"${id}"}},`;
      });

      return /* GraphQL */ `
      query fetchData($eventoID: ID!, $cuponID: ID!) {
        getEvento(id: $eventoID) {
          id
          personasMax
          personasReservadas
        }
        listBoletos(filter:{or:[${string}]}) {
          items{
            id
            cantidad
            personasReservadas
            precio
            eventoID
          }
        }
        getCupon(id: $cuponID) {
          id
          cantidadDescuento
          porcentajeDescuento
        }
      }
    `;
    };


    data = await (
      API.graphql({
        query: query(boletos.map(e => e.id)),
        variables: {
          eventoID: eventoID,
          cuponID: cuponID,
        },
      })
    ).then((r) => {
      r = r.data;
      return {
        cupon: r.getCupon,
        evento: r.getEvento,
        boletos: r.listBoletos.items,
      };
    });


    /* Primero hay que verificar que haya lugares disponibles en los boletos
     y ver que el precio corresponda al dado por el cliente
     */



    console.log(body)

    const response = await graphqlRequest(query, {
      eventoID: eventoID,
      cuponID: "MATEO",
    }
    )

    return response
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    }
  }

};