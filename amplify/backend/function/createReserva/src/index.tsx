/* Amplify Params - DO NOT EDIT
  API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT
  API_PARTYUSAPI_GRAPHQLAPIIDOUTPUT
  API_PARTYUSAPI_GRAPHQLAPIKEYOUTPUT
  ENV
  REGION
Amplify Params - DO NOT EDIT */

import crypto from "@aws-crypto/sha256-js";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { default as fetch, Request } from "node-fetch";

var Openpay = require("openpay");
var openpay = new Openpay(process.env.MERCHANT_ID, process.env.SECRET_KEY);

const { Sha256 } = crypto;

const AWS_REGION = process.env.AWS_REGION || "us-east-1";

const comisionApp = 0.15;

function precioConComision(inicial: number | undefined | null) {
  if (!inicial) return 0;
  return redondear(inicial * (1 + comisionApp), 10);
}

const redondear = (numero: number | null | undefined, entero?: number) => {
  if (!entero) {
    entero = 1;
  }

  if (!numero) return 0;
  numero = Math.ceil(numero / entero) * entero;

  return numero;
};

async function graphqlRequest(query: any, variables?: any) {
  const endpoint = new URL(
    process.env.API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT as any
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

  console.log("Soicitud firmada:" + JSON.stringify(signed));

  let statusCode = 200;
  let body;
  let response;

  try {
    response = await fetch(request);
    body = await response.json();
    if (body.errors) statusCode = 400;
  } catch (error: any) {
    statusCode = 500;
    body = {
      errors: [
        {
          status: response.status,
          message: error.message,
          stack: error.stack,
        },
      ],
    };
  }

  return {
    statusCode,
    body: JSON.stringify(body),
  };
}

const crearReserva = /* GraphQL */ `
  mutation CreateReserva($input: CreateReservaInput!) {
    createReseva(input: $input) {
      id
    }
  }
`;

export const handler = async (event: {
  body: {
    eventoID?: string;
    organizadorID?: string;
    cuponID?: string;
    reservaID?: string;

    tipoPago: string;

    total?: number;
    boletos?: { quantity: number; id: string }[];

    sourceID?: string;
  };
}) => {
  try {
    const {
      total,
      cuponID,
      boletos,
      eventoID,
      organizadorID,
      reservaID,
      tipoPago,
      sourceID,
    } = event.body;

    ////////////////////////////////////////////////////////////////////////
    /////////////////////////Verificaciones previas/////////////////////////
    ////////////////////////////////////////////////////////////////////////
    if (!boletos || boletos.length === 0) {
      return {
        statusCode: 400,
        error: {
          description: "Error no se recibio una lista de boletos",
        },
      };
    }

    if (!eventoID) {
      return {
        statusCode: 400,
        error: {
          description: "Error no se recibio ID de evento",
        },
      };
    }

    if (!organizadorID) {
      return {
        statusCode: 400,
        error: {
          description: "Error no se recibio ID de organizador",
        },
      };
    }

    if (!total) {
      return {
        statusCode: 400,
        error: {
          description: "Error no se recibio un precio total",
        },
      };
    }

    if (!reservaID) {
      return {
        statusCode: 400,
        error: {
          description: "Error no se recibio id de reserva",
        },
      };
    }

    if (tipoPago !== "TARJETA" && tipoPago !== "TIENDA") {
      return {
        statusCode: 400,
        error: {
          description: "Error el tipo de pago debe ser TARJETA O TIENDA",
        },
      };
    }

    if (!sourceID && tipoPago === "TARJETA") {
      return {
        statusCode: 400,
        error: {
          description: "Error no se recibio source id",
        },
      };
    }

    // Funcion para sacar el query a mandar con filtro de boletosID
    const query = (boletosID: string[]) => {
      let string = "";
      boletosID.map((id, idx) => {
        string += `{id:{eq:"${id}"}},`;
      });

      if (cuponID)
        return /* GraphQL */ `
          query fetchData($eventoID: ID!,$usuarioID:ID!, $cuponID: ID!) {
            getEvento(id: $eventoID) {
              CreatorID
              _version
              id
              personasMax
              personasReservadas
            }
            getUsuario(id:$usuarioID){
              userPaymentID
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
            getCupon(id: $cuponID) {
              _version
              id
              cantidadDescuento
              porcentajeDescuento
              restantes
            }
          }
        `;
      else
        return /* GraphQL */ `
        query fetchData($eventoID: ID!,$usuarioID:ID!) {
          getEvento(id: $eventoID) {
            CreatorID
            _version
            id
            personasMax
            personasReservadas
          }
          getUsuario(id:$usuarioID){
            userPaymentID 
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
        }
      `;
    };

    /*////////////////////////////////////////
    Pedir todos los datos con id recibidos
    ////////////////////////////////////////*/
    /* Primero hay que verificar que haya lugares disponibles en los boletos
       y ver que el precio corresponda al dado por el cliente
       */
    const response = await (
      graphqlRequest(
        query(boletos.map((e) => e.id)),
        cuponID
          ? {
              eventoID,
              cuponID,
            }
          : {
              eventoID,
            }
      ) as any
    ).then((r: any) => {
      if (r.errors) {
        throw new Error("Error obteniendo datos: " + r.errors);
      }
      r = r.data;

      return {
        cupon: r.getCupon,
        evento: r.getEvento,
        boletos: r.listBoletos.items,
        usuario: r.getUsuario,
      };
    });

    const {
      boletos: boletosFetched,
      evento,
      cupon,
      usuario: { userPaymentID },
    } = response;
    const porcentajeDescuento = cupon?.porcentajeDescuento;
    const cantidadDescuento = cupon?.cantidadDescuento;

    console.log({
      boletosFetched,
      evento,
      cupon,
      userPaymentID,
    });

    //////////////////////////////////////////////////////////////////
    // Verificar que el usuario a pagarle sea el creador del evento //
    //////////////////////////////////////////////////////////////////

    if (evento.CreatorID !== organizadorID) {
      return {
        statusCode: 400,
        error: {
          description:
            "El creador del evento: " +
            eventoID +
            " recibido no coincide con el usuario a pagar recibido: " +
            organizadorID,
        },
      };
    }

    if (!userPaymentID) {
      return {
        statusCode: 400,
        error: {
          description:
            "Error, no se encontro id de pago para el usuario " + organizadorID,
        },
      };
    }

    let reservadosEvento = evento.personasReservadas
      ? evento.personasReservadas
      : 0;

    //////////////////////////////////////////////////////////
    // Verificar que el precio total coincida con el pasado //
    //////////////////////////////////////////////////////////
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

        let quantity = boletos.find((e) => e.id === id)?.quantity;
        if (!quantity) {
          console.log(
            "Error, no se encontro un boleto con el id obtenido de los fetched: " +
              id
          );
          throw new Error(
            "Ocurrio un error con los boletos pasados, no se encontro la cantidad"
          );
        }

        reservadosEvento += quantity;

        // Verificar que las personas reservadas mas los nuevos no exceda el maximo por boleto
        if (personasReservadas + quantity > cantidad) {
          throw new Error(
            "Error el boleto tipo " +
              tituloBoleto +
              " tiene " +
              personasReservadas +
              " personas reservadas de " +
              cantidad +
              ". No se pudieron registrar tus " +
              quantity +
              " entradas"
          );
        }

        return precioConComision(precio) * quantity;
      })
      .reduce((partialSum, a) => partialSum + a, 0);

    totalFetched -= porcentajeDescuento
      ? totalFetched * porcentajeDescuento
      : cantidadDescuento
      ? totalFetched - cantidadDescuento
      : 0;
    //
    // Verificar que el precio recibido coincida con los boletos fetcheados
    if (total !== totalFetched) {
      return {
        statusCode: 400,
        error: {
          description:
            "El precio total: " +
            total +
            " recibido no coincide con el calculado de la base de datos: " +
            totalFetched,
        },
      };
    }
    //
    // Verificar que el total de personas en el evento sea menor al sumado hasta ahorita
    if (reservadosEvento > evento.personasMax) {
      return {
        statusCode: 400,
        error: {
          description:
            "El evento esta lleno con " +
            evento.personasReservadas +
            " de un total de " +
            evento.personasMax,
        },
      };
    }

    //////////////////////////////////////////
    // Confirmar pago con tarjeta o tokenID //
    //////////////////////////////////////////

    new Promise((res,rej)=>{
    openpay.charges.create(,function (error, body, response) {
      if (error?.http_code) {
        rej(error)
      }
      if (body) {
        res(body)
      }
    })
  })
    
    // if (tipoPago === "TIENDA") {
    // } else if (tipoPago === "TARJETA") {
    // } else
    //   return {
    //     errorCode: 500,
    //     error: {
    //       description: "No se recibio tipo pago TARJETA O TIENDA",
    //     },
    //   };


    // Mutacion para actualizar los boletos, el evento, crear reservacion y restar el personas disponibles de cupon
    await graphqlRequest(`
          mutation myMutation {
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

              return `bol${idx}: updateBoleto(input: {id:"${e.id}",personasReservadas:${personasReservadas},_version:${e._version}}) {
              id
              personasReservadas
            }`;
            })}

            ${
              // Restar de cupon si existe ID
              cuponID
                ? `updateCupon(input: {id: "${cuponID}", restantes: ${
                    cupon.restantes ? cupon.restantes - 1 : 0
                  },_version:${cupon._version}}) {
              id
              restantes
            }`
                : ``
            }

            updateEvento(input: {id: "${
              evento.id
            }", personasReservadas: ${reservadosEvento}, _version:${
      evento._version
    }}) {
        id
        personasReservadas
      }

          }
        `).then((r) => {
      if (r.errors)
        throw new Error("Hubo un error actualizando el boleto " + r);

      return r;
    });
  } catch (error: any) {
    const msg = error.message?error.message:error.description?error.description:""
    return {
      statusCode: 500,
      error: {
        ...error,
        description:msg
      },
    };
  }
};
