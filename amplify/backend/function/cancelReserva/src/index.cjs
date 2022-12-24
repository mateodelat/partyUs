// This is sample code. Please update this to suite your schema

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */


/* Amplify Params - DO NOT EDIT
  API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT
  API_PARTYUSAPI_GRAPHQLAPIIDOUTPUT
  API_PARTYUSAPI_GRAPHQLAPIKEYOUTPUT
  ENV
  REGION
Amplify Params - DO NOT EDIT */

const { graphqlOperation } = require('/opt/graphqlOperation')
const { reservaReturns } = require("/opt/graphqlReturns")

const production = process.env.ENV === "production"

const MERCHANT_ID = production ? process.env.MERCHANT_ID_PROD : process.env.MERCHANT_ID_STAG
const SECRET_KEY = production ? process.env.SECRET_KEY_PROD : process.env.SECRET_KEY_STAG



const Openpay = require("openpay")
// Actualizar url de produccion a fee refund
var openpay = new Openpay(MERCHANT_ID, SECRET_KEY);
const axios = require('axios');
const url =
    !production ? "https://sandbox-api.openpay.mx/v1/" :
        "https://api.openpay.mx/v1/";
openpay.setProductionReady(production);



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


function formatResponse({ error, body, statusCode }) {
    let r = {
        statusCode,
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


const getData = /* GraphQL */ `
  query GetData($reservaID: ID!, $clientID: ID!, $organizadorID: ID!) {
    getReserva(id: $reservaID) {
      id
      total
      comision
      pagadoAlOrganizador
      cantidad
      pagado
      paymentTime
      tipoPago
      chargeID
      transactionID
      feeID
      cashBarcode
      cashReference
      ingreso
      horaIngreso
      cancelado
      canceledAt
      cancelReason
      fechaExpiracionUTC
      eventoID
      usuarioID
      cuponID
      organizadorID
      _version
    }
    client: getUsuario(id: $clientID) {
      userPaymentID
    }

    organizador: getUsuario(id: $organizadorID) {
      userPaymentID
    }
  }
`;

exports.handler = async function cancelReserva(event) {
    try {
        event.body = JSON.parse(event.body)
        if (!event?.body) {

            return formatResponse({
                statusCode: 400,

                error: {
                    description: "No se recibio cuerpo de la respuesta"
                }
            })
        }


        const {
            organizadorID,
            reservaID,
            clientID } = event?.body;


        if (!reservaID) {
            return formatResponse({
                statusCode: 400,
                error: {
                    description: "Error no se recibio ID de reserva",
                },
            })
        }

        if (!organizadorID) {
            return formatResponse({
                statusCode: 400,
                error: {
                    description: "Error no se recibio ID de organizador",
                },
            })
        }

        if (!clientID) {
            return formatResponse({
                statusCode: 400,
                error: {
                    description: "Error no se recibio ID de cliente",
                },
            })
        }



        return await // Pedir la reserva a cancelar desde la base de datos para verificar que es posible cancelarla

            (
                graphqlRequest({
                    query: getData,
                    variables: { reservaID, clientID, organizadorID },
                })
            ).then(async (r) => {
                const res = r.data.getReserva;
                // Verificar si la reserva no esta ya cancelada
                if (res.cancelado) {
                    throw new Error("La reserva ya fue cancelada");
                }

                // Verificar que la reserva no haya sido ingresada
                if (res.ingreso) {
                    throw new Error("La reserva ya fue ingresada");
                }

                // Verificar que el organizador de la reserva es de quien tenemos el id de pago
                if (res.organizadorID !== organizadorID) {
                    throw new Error("El organizador no coincide");
                }

                // Verificar que el usuario de la reserva es de quien tenemos el id de pago
                if (res.usuarioID !== clientID) {
                    throw new Error("El cliente no coincide");
                }

                const clientPaymentID =
                    r?.data?.client?.userPaymentID;
                const organizadorPaymentID =
                    r?.data?.organizador?.userPaymentID;

                // Si ya se pago y no tiene fee asociado significa que ocurio algo raro y no se guardo o el usuario
                // modifico el parametro de pagado alternativamente
                if (
                    res.pagado &&
                    (!res.feeID ||
                        !res.transactionID ||
                        !clientPaymentID ||
                        !organizadorPaymentID)
                ) {
                    console.log({
                        clientPaymentID,
                        organizadorPaymentID,
                    });
                    throw new Error(
                        "La reserva tiene un error, contactanos para mas informacion"
                    );
                }

                // Opciones para cancelar la reserva
                const updateReservaInput = {
                    id: reservaID,
                    cancelado: true,
                    cashBarcode: undefined,
                    cashReference: undefined,
                    fechaExpiracionUTC: undefined,
                    cancelReason: "CANCELADOPORCLIENTE",
                    canceledAt: new Date().toISOString(),
                };

                let authKey = Buffer.from(process.env.SECRET_KEY).toString('base64').replace("=", "6")


                // Si hay un pago asociado es porque hay feeID y transactionID, cancelarlos
                if (res.pagado) {
                    const { feeID, transactionID, pagadoAlOrganizador } = res;

                    console.log({
                        method: "post",
                        url: url + process.env.MERCHANT_ID + "/fees/" + feeID + "/refund",
                        headers: {
                            "Authorization": "Basic " + authKey,
                            'Content-Type': 'application/json'

                        },
                        data: JSON.stringify({
                            description: "Cancelacion comision reserva " + reservaID,
                        })
                    })

                    await Promise.all([
                        new Promise((res, rej) =>
                            // Cancelar transaccion desde el organizador hacia el cliente
                            openpay.customers.transfers.create(
                                organizadorPaymentID,
                                {
                                    customer_id: clientPaymentID,
                                    amount: pagadoAlOrganizador,
                                    description: "canceltransfer>>>" + reservaID + "><" + "Cancelacion reserva ",
                                    order_id: "canceltransfer>>>" + reservaID,
                                },
                                (error, r) => {

                                    if (error) {
                                        // Si el organizador no tiene fondos entonces modificar el mensaje de error
                                        if (error.error_code === 4001) {
                                            error.description =
                                                "No se pudo cancelar la transferencia, el organizador ya retirado el dinero. Contactanos para mas detalles";
                                        }


                                        rej(error.description);
                                    }


                                    console.log("\nTRANSFER RESULT:\n");
                                    console.log(r);
                                    res();
                                }
                            )
                        ),


                        // Cancelar comision de partyus por http
                        axios({
                            method: "post",
                            url: url + process.env.MERCHANT_ID + "/fees/" + feeID + "/refund",
                            headers: {
                                "Authorization": "Basic " + authKey,
                                'Content-Type': 'application/json'

                            },
                            data: JSON.stringify({
                                description: "Cancelacion comision reserva " + reservaID,
                            }),
                        }).then((fee) => {
                            console.log("\nFEE RESULT:\n");
                            console.log(fee);
                        })
                    ]);
                }

                //////////////////////////
                ///Cancelar la reserva ///
                //////////////////////////
                await (
                    graphqlRequest({
                        query: /* GraphQL */ `
                            mutation UpdateReserva($updateReservaInput:UpdateReservaInput!) {
                                updateReserva(input: $updateReservaInput) {
                                    ${reservaReturns}
                                }
                            }
                        `,
                        variables: { updateReservaInput },
                    })
                ).then((r) => {
                    console.log(r);
                });

                return formatResponse({
                    statusCode: 200,
                    body: "Reserva cancelada con exito",
                });
            });
    } catch (error) {
        let msg = error.message
            ? error.message
            : error.description
                ? error.description
                : error;

        return formatResponse({
            statusCode: 500,
            error: {
                description: msg,
            },
        });
    }
}
