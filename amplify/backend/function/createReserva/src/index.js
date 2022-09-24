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


// async function createReserva(event: {
//   body: {
//     eventoID: string;
//     usuarioID: string;
//     cuponID?: string;
//     reservaID: string;

//     total: number;
//     boletos: { quantity: number; id: string }[];
//   };
// }) {
//   try {
//     const { total, cuponID, boletos, eventoID, usuarioID, reservaID } =
//       event.body;

//     ////////////////////////////////////////////////////////////////////////
//     /////////////////////////Verificaciones previas/////////////////////////
//     ////////////////////////////////////////////////////////////////////////
//     if (!boletos || boletos.length === 0) {
//       return {
//         statusCode: 400,
//         body: "Error no se recibio una lista de boletos",
//       };
//     }

//     if (!eventoID) {
//       return {
//         statusCode: 400,
//         body: "Error no se recibio ID de evento",
//       };
//     }

//     if (!usuarioID) {
//       return {
//         statusCode: 400,
//         body: "Error no se recibio ID de usuario",
//       };
//     }

//     if (!total) {
//       return {
//         statusCode: 400,
//         body: "Error no se recibio un precio total",
//       };
//     }

//     if (!reservaID) {
//       return {
//         statusCode: 400,
//         body: "Error no se recibio id de reserva",
//       };
//     }

//     /*
//     Pedir el payment intent y verificar que:
//     El transfer data sea el id del creador del evento,
//     el precio total sea correcto,
//     */

//     // Funcion para sacar el query a mandar con filtro de boletosID
//     const query = (boletosID: string[]) => {
//       let string = "";
//       boletosID.map((id, idx) => {
//         string += `{id:{eq:"${id}"}},`;
//       });

//       if (cuponID)
//         return /* GraphQL */ `
//           query fetchData($eventoID: ID!, $cuponID: ID!) {
//             getEvento(id: $eventoID) {
//               _version
//               id
//               personasMax
//               personasReservadas
//             }
//             listBoletos(filter:{or:[${string}]}) {
//               items{
//                 id
//                 cantidad
//                 personasReservadas
//                 precio
//                 eventoID
//                 titulo
//                 _version
//               }
//             }
//             getCupon(id: $cuponID) {
//               _version
//               id
//               cantidadDescuento
//               porcentajeDescuento
//               restantes
//             }
//           }
//         `;
//       else
//         return /* GraphQL */ `
//         query fetchData($eventoID: ID!) {
//           getEvento(id: $eventoID) {
//             _version
//             id
//             personasMax
//             personasReservadas
//           }
//           listBoletos(filter:{or:[${string}]}) {
//             items{
//               id
//               cantidad
//               personasReservadas
//               precio
//               eventoID
//               titulo
//               _version
//             }
//           }
//         }
//       `;
//     };

//     /* Primero hay que verificar que haya lugares disponibles en los boletos
//        y ver que el precio corresponda al dado por el cliente
//        */
//     const response = await (
//       API.graphql({
//         query: query(boletos.map((e) => e.id)),
//         variables: cuponID
//           ? {
//               eventoID,
//               cuponID,
//             }
//           : {
//               eventoID,
//             },
//       }) as any
//     ).then((r: any) => {
//       if (r.errors) {
//         throw new Error("Error obteniendo datos: " + r.errors);
//       }
//       r = r.data;

//       return {
//         cupon: r.getCupon,
//         evento: r.getEvento,
//         boletos: r.listBoletos.items,
//       };
//     });

//     const { boletos: boletosFetched, evento, cupon } = response;
//     const porcentajeDescuento = cupon?.porcentajeDescuento;
//     const cantidadDescuento = cupon?.cantidadDescuento;

//     let reservadosEvento = evento.personasReservadas
//       ? evento.personasReservadas
//       : 0;

//     //////////////////////////////////////////////////////////
//     // Verificar que el precio total coincida con el pasado //
//     //////////////////////////////////////////////////////////
//     let totalFetched = boletosFetched
//       .map((e: Boleto) => {
//         let {
//           precio,
//           id,
//           personasReservadas,
//           cantidad,
//           titulo: tituloBoleto,
//         } = e;
//         precio = precio ? precio : 0;
//         personasReservadas = personasReservadas ? personasReservadas : 0;
//         cantidad = cantidad ? cantidad : 0;

//         let quantity = boletos.find((e) => e.id === id)?.quantity;
//         if (!quantity) {
//           console.log(
//             "Error, no se encontro un boleto con el id obtenido de los fetched: " +
//               id
//           );
//           throw new Error(
//             "Ocurrio un error con los boletos pasados, no se encontro la cantidad"
//           );
//         }

//         reservadosEvento += quantity;

//         // Verificar que las personas reservadas mas los nuevos no exceda el maximo por boleto
//         if (personasReservadas + quantity > cantidad) {
//           throw new Error(
//             "Error el boleto tipo " +
//               tituloBoleto +
//               " tiene " +
//               personasReservadas +
//               " personas reservadas de " +
//               cantidad +
//               ". No se pudieron registrar tus " +
//               quantity +
//               " entradas"
//           );
//         }

//         return precioConComision(precio) * quantity;
//       })
//       .reduce((partialSum, a) => partialSum + a, 0);

//     totalFetched -= porcentajeDescuento
//       ? totalFetched * porcentajeDescuento
//       : cantidadDescuento
//       ? totalFetched - cantidadDescuento
//       : 0;
//     //
//     // Verificar que el precio recibido coincida con los boletos fetcheados
//     if (total !== totalFetched) {
//       return {
//         statusCode: 400,
//         body:
//           "El precio total: " +
//           total +
//           " recibido no coincide con el calculado de la base de datos: " +
//           totalFetched,
//       };
//     }
//     //
//     // Verificar que el total de personas en el evento sea menor al sumado hasta ahorita
//     if (reservadosEvento > evento.personasMax) {
//       return {
//         statusCode: 400,
//         body:
//           "El evento esta lleno con " +
//           evento.personasReservadas +
//           " de un total de " +
//           evento.personasMax,
//       };
//     }

//     // Mutacion para actualizar los boletos, el evento y restar el personas disponibles de cupon
//     await API.graphql({
//       query: `
//           mutation myMutation {
//             ${boletosFetched.map((e, idx) => {
//               // Actualizar personas reservadas por boleto

//               const boletoCliente = boletos.find((cli) => cli.id === e.id);
//               if (!boletoCliente) {
//                 throw new Error(
//                   "Ocurrio un error con los boletos obtenidos de la base de datos no se encotro el que coincida con " +
//                     e.id
//                 );
//               }

//               const personasReservadas =
//                 (e.personasReservadas ? e.personasReservadas : 0) +
//                 boletoCliente.quantity;

//               return `bol${idx}: updateBoleto(input: {id:"${e.id}",personasReservadas:${personasReservadas},_version:${e._version}}) {
//               id
//               personasReservadas
//             }`;
//             })}

//             ${
//               // Quitar cupon si existe ID
//               cuponID
//                 ? `updateCupon(input: {id: "${cuponID}", restantes: ${
//                     cupon.restantes ? cupon.restantes - 1 : 0
//                   },_version:${cupon._version}}) {
//               id
//               restantes
//             }`
//                 : ``
//             }

//             updateEvento(input: {id: "${
//               evento.id
//             }", personasReservadas: ${reservadosEvento}, _version:${
//         evento._version
//       }}) {
//         id
//         personasReservadas
//       }

//           }
//         `,
//       authMode: "AWS_IAM",
//     }).then((r) => {
//       if (r.errors)
//         throw new Error("Hubo un error actualizando el boleto " + r);

//       return r;
//     });

//     return {
//       statusCode: 100,
//       body: "La reserva fue creada con exito",
//     };
//   } catch (error: any) {
//     // console.log(error);
//     return {
//       statusCode: 500,
//       body: error.message ? error.message : error,
//     };
//   }
// }


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