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

const Openpay = require("openpay")
var openpay = new Openpay(process.env.MERCHANT_ID, process.env.SECRET_KEY);

const { Sha256 } = crypto;

const AWS_REGION = process.env.AWS_REGION || "us-east-1";

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

    console.log("Solicitud firmada:" + JSON.stringify(signed));

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

export const handler = async (event
    //     : {
    //     body: {
    //         eventoID?: string;
    //         organizadorID?: string;
    //         cuponID?: string;
    //         reservaID?: string;

    //         tipoPago: string;

    //         total?: number;
    //         boletos?: { quantity: number; id: string }[];

    //         sourceID?: string;
    //         usuarioID?: string;
    //         device_session_id?: string;
    //     };
    // }
) => {
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
            usuarioID,
            device_session_id,
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

        if (!usuarioID) {
            return {
                statusCode: 400,
                error: {
                    description: "Error no se recibio ID de usuario",
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

        if (!device_session_id) {
            return {
                statusCode: 400,
                error: {
                    description: "Error no se recibio id de sesion para pagar",
                },
            };
        }

        if (tipoPago !== "TARJETA" && tipoPago !== "EFECTIVO") {
            return {
                statusCode: 400,
                error: {
                    description: "Error el tipo de pago debe ser TARJETA O EFECTIVO",
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
        const query = (boletosID
            // : string[]
        ) => {
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
              }
              cliente:getUsuario(id:$usuarioID){
                userPaymentID,
                nickname
              }
              owner:getUsuario(id:$organizadorID){
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
              ${cuponID
                    ? /* GraphQL */ `getCupon(id: $cuponID) {
                _version
                id
                cantidadDescuento
                porcentajeDescuento
                restantes
              }`
                    : ""
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
            graphqlRequest({
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
            })
        ).then((r) => {
            if (r.errors) {
                throw new Error("Error obteniendo datos: " + r.errors);
            }
            r = r.data;

            return {
                cupon: r.getCupon,
                evento: r.getEvento,
                boletos: r.listBoletos.items,
                client: r.cliente,
                owner: r.owner,
            };
        });

        const {
            boletos: boletosFetched,
            evento,
            cupon,

            // Obtener id de pago de OPENPAY
            client: { userPaymentID: clientPaymentID, nickname: nicknameCliente },
            owner: { userPaymentID: ownerPaymentID },
        } = response;
        // const ownerPaymentID = "ammifkd5zensfos9ypjw";

        const porcentajeDescuento = cupon?.porcentajeDescuento;
        const cantidadDescuento = cupon?.cantidadDescuento;
        const totalPersonasReservadas = boletos
            .map((e) => e.quantity)
            .reduce((prev, a) => prev + a);

        const description =
            "Pago " +
            totalPersonasReservadas +
            " personas " +
            nicknameCliente +
            " en " +
            evento.titulo;

        console.log({
            clientPaymentID,
            ownerPaymentID,
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

        if (!clientPaymentID) {
            return {
                statusCode: 400,
                error: {
                    description: "no se encontro id de pago para el cliente ",
                },
            };
        }

        if (!ownerPaymentID) {
            return {
                statusCode: 400,
                error: {
                    description: "no se encontro id de pago para el creador del evento ",
                },
            };
        }

        // Verificar que el owner id no sea igual a client id para evitar problemas de transferencias
        if (ownerPaymentID === clientPaymentID) {
            return {
                statusCode: 409,
                error: {
                    description:
                        "el creador del evento tiene el mismo id de pago que el cliente",
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

        ////////////////////////////////////////////////////////////////////////////
        // Confirmar cargo, crear transaccion hacia el guia y comision de partyus //
        ////////////////////////////////////////////////////////////////////////////
        let limitDate = new Date(evento.fechaFinal);
        // Si la fecha final es menor a un dia se pone la fecha final como limite de pago
        limitDate =
            limitDate.getTime() - new Date().getTime() < msInDay
                ? limitDate
                : new Date(new Date().getTime() + msInDay);

        let body
            // : {
            //     paymentID?: string;
            //     reservaID?: string;
            //     tipoPago: "EFECTIVO" | "TARJETA";
            //     voucher?: {
            //         barcode_url: string;
            //         reference: string;
            //         limitDate: number;
            //     };
            // }
            = {
            tipoPago,
        };

        await new Promise((res, rej) => {
            // Pago hacia la cuenta del cliente comprador del producto
            openpay.customers.charges.create(
                clientPaymentID,
                {
                    device_session_id: device_session_id,
                    method: tipoPago === "EFECTIVO" ? "store" : "card",
                    source_id: sourceID,
                    amount: total,
                    description,
                    order_id: "charge>>>" + reservaID,
                    due_date: tipoPago === "EFECTIVO" ? limitDate : undefined,
                },
                async function (error, e) {
                    if (error) {
                        rej(error);
                    }
                    const comision = comisionApp * e.amount;
                    const enviarACreador = e.amount - comision;

                    body.paymentID = e.id;

                    if (tipoPago === "EFECTIVO") {
                        if (!e.payment_method) {
                            throw new Error(
                                "No se recibio url del voucher de la api de pagos"
                            );
                        }
                        const { barcode_url, reference } = e.payment_method;

                        body.voucher = {
                            barcode_url,
                            reference,
                            limitDate: limitDate.getTime(),
                        };
                        res();
                    }

                    await Promise.all([
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
                                        rej("Error creando el fee sobre el cargo");
                                        throw new Error(
                                            "Error enviando fondos. Contactanos para cancelar el cargo"
                                        );
                                    }

                                    console.log("\nFEE RESULT:\n");
                                    console.log(fee);
                                    res();
                                }
                            );
                        }),
                        new Promise((res, rej) => {
                            // Transferencia del comprador al organizador
                            openpay.customers.transfers.create(
                                clientPaymentID,
                                {
                                    customer_id: ownerPaymentID,
                                    amount: enviarACreador,
                                    description,
                                    order_id: "transfer>>>" + reservaID,
                                },
                                (error, r) => {
                                    if (error) {
                                        rej("Error creando la transferencia sobre el cargo");
                                    }

                                    console.log("\nTRANSFER RESULT:\n");
                                    console.log(r);
                                    res();
                                }
                            );
                        }),
                    ])
                        .then(() => {
                            res();
                        })
                        .catch((e) => {
                            console.log(e);
                            rej(e);
                        });
                }
            );
        });

        const reservaInput = {
            cantidad: totalPersonasReservadas,
            comision: total * comisionApp,
            cuponID,
            eventoID,
            id: reservaID,
            organizadorID,
            pagadoAlOrganizador: total - total * comisionApp,
            pagoID: body.paymentID,
            precioIndividual: total / totalPersonasReservadas,
            total,
            pagado: tipoPago === "EFECTIVO" ? false : true,
            usuarioID,
        };

        // Mutacion para actualizar los boletos, el evento, crear reservacion y restar el personas disponibles de cupon
        await (
            graphqlRequest({
                query: `
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
              id
              personasReservadas
            }
            bol${idx}rel: createReservasBoletos(input:{
              boletoID:"${e.id}",
              reservaID:"${reservaID}",
              quantity:${boletoCliente.quantity}
            }){
              id
            }
            `;
                })}
  
          ${
                    // Restar de cupon si existe ID
                    cuponID
                        ? `updateCupon(input: {id: "${cuponID}", restantes: ${cupon.restantes ? cupon.restantes - 1 : 0
                        },_version:${cupon._version}}) {
            id
            restantes
          }`
                        : ``
                    }
  
          createReserva(input: $reservaInput) {
            id
          }
        }
      `,
                variables: {
                    reservaInput,
                },
            })
        ).then((r) => {
            console.log(r);
            body = {
                ...body,
                reservaID: r.data?.createReserva?.id,
            };
            if (r.errors)
                throw new Error("Hubo un error actualizando el boleto " + r);
        });

        return {
            body,
        };
    } catch (error) {
        console.log(error);
        const msg = error.message
            ? error.message
            : error.description
                ? error.description
                : JSON.stringify(error);
        return {
            statusCode: 500,
            error: {
                description: msg,
            },
        };
    }
};
