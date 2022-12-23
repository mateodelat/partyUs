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

const production = process.env.ENV === "production";

const MERCHANT_ID = production
    ? process.env.MERCHANT_ID_PROD
    : process.env.MERCHANT_ID_STAG;
const SECRET_KEY = production
    ? process.env.SECRET_KEY_PROD
    : process.env.SECRET_KEY_STAG;

const { graphqlOperation } = require("/opt/graphqlOperation");
const {
    updateBoletoReturns,
    createReservasBoletosReturns,
    updateEventoReturns,
    updateCuponReturns,
    reservaReturns,
} = require("/opt/graphqlReturns");

const Openpay = require("openpay");
var openpay = new Openpay(MERCHANT_ID, SECRET_KEY);
openpay.setProductionReady(production);

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

function formatResponse({
    error,
    body,
    statusCode,
}) {
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
            body: JSON.stringify(body, null, 2),
        };
    }
    console.log(r);
    return r;
}

exports.handler = async (event) => {
    event.body = JSON.parse(event.body);
    if (!event?.body) {
        return formatResponse({
            statusCode: 400,

            error: "No se recibio cuerpo de la respuesta",
        });
    }

    // Variables por si falla la creacion del boleto devolver cargos
    let chargeID = "";
    let transactionID = "";
    let feeID = "";

    let clientPaymentID = "";
    let ownerPaymentID = "";
    let enviarACreador = 0;

    const {
        total,
        cuponID,
        eventoID,
        organizadorID,
        reservaID,
        tipoPago,
        sourceID,
        usuarioID,
        device_session_id,
        boletos,
    } = event.body;
    try {
        console.log(event.body)

        ////////////////////////////////////////////////////////////////////////
        /////////////////////////Verificaciones previas/////////////////////////
        ////////////////////////////////////////////////////////////////////////
        if (!boletos || boletos.length === 0) {
            return formatResponse({
                statusCode: 400,
                error: "Error no se recibio una lista de boletos",
            });
        }

        if (!eventoID) {
            return formatResponse({
                statusCode: 400,
                error: "Error no se recibio ID de evento",
            });
        }

        if (!usuarioID) {
            return formatResponse({
                statusCode: 400,
                error: "Error no se recibio ID de usuario",
            });
        }

        if (!organizadorID) {
            return formatResponse({
                statusCode: 400,
                error: "Error no se recibio ID de organizador",
            });
        }

        if (total !== 0 && !total) {
            return formatResponse({
                statusCode: 400,
                error: "Error no se recibio un precio total",
            });
        }

        if (!reservaID) {
            return formatResponse({
                statusCode: 400,
                error: "Error no se recibio id de reserva",
            });
        }

        if (!device_session_id) {
            return formatResponse({
                statusCode: 400,
                error: "Error no se recibio id de sesion para pagar",
            });
        }

        if (tipoPago !== "TARJETA" && tipoPago !== "EFECTIVO") {
            return formatResponse({
                statusCode: 400,
                error: "Error el tipo de pago debe ser TARJETA O EFECTIVO",
            });
        }

        if (!sourceID && tipoPago === "TARJETA") {
            return formatResponse({
                statusCode: 400,
                error: "Error no se recibio source id",
            });
        }

        // No permitir operaciones de mas de 2000 pesos en efectivo
        if (tipoPago === "EFECTIVO" && total > 2000) {
            return formatResponse({
                statusCode: 400,
                error: "No se permiten pagos mayores a 2000 pesos en efectivo",
            });
        }

        // Funcion para sacar el query a mandar con filtro de boletosID
        const query = (
            boletosID
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

        /*////////////////////////////////////////
              Pedir todos los datos con id recibidos
              ////////////////////////////////////////*/
        /* Primero hay que verificar que haya lugares disponibles en los boletos
                 y ver que el precio corresponda al dado por el cliente
                 */

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

            // Si hay mas reservas en efectivo por el mismo usuario dar error para evitar fraudes

            if (tipoPago === "EFECTIVO" && total !== 0) {
                const efectivoDeny = !!r.listReservas.items.find((e) => {
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
                    console.log({
                        Reservas: r.listReservas.items,
                    });
                    throw new Error(
                        "Solo se permite tener una reserva en efectivo por evento."
                    );
                }
            }

            let personasEnEvento = 0;

            // Calcular personas reservadas en el evento a partir de las reservas validas
            r.getEvento.Reservas.items.map((res) => {
                if (res._deleted) return false;
                // Si esta pagada o aun no ha expirado, ES VALIDA
                else if (
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
                            // Si el cliente solo busca un boleto, no hay nececidad de ver mas
                            return;
                        } else {
                            // Sumarle la cantidad del boleto asociado a el boleto maestro encontrado
                            boletosFiltrados[idx].personasReservadas =
                                boletosFiltrados[idx].personasReservadas + bol.quantity;
                        }
                    });

                    return true;
                } else {
                    return false;
                }
            });

            // Calcular personas reservadas en el boleto a partir de las reservas validas

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

            // Obtener id de pago de OPENPAY
            client: {
                userPaymentID: clientPaymentIDFetched,
                nickname: nicknameCliente,
            },
            owner: { userPaymentID: ownerPaymentIDFetched },
        } = response;

        clientPaymentID = clientPaymentIDFetched;
        ownerPaymentID = ownerPaymentIDFetched;
        // const ownerPaymentID = "ammifkd5zensfos9ypjw";

        // Verificacion de validez del cupon si se ingresa
        if (cupon?.vencimiento < new Date().getTime()) {
            return formatResponse({
                statusCode: 400,
                error: "El cupon ha expirado",
            });
        }

        if (cupon?.restantes <= 0) {
            return formatResponse({
                statusCode: 400,
                error: "No hay personas disponibles para ese cupon",
            });
        }

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

        //////////////////////////////////////////////////////////////////
        // Verificar que el usuario a pagarle sea el creador del evento //
        //////////////////////////////////////////////////////////////////

        if (evento.CreatorID !== organizadorID) {
            return formatResponse({
                statusCode: 400,
                error:
                    "El creador del evento: " +
                    eventoID +
                    " recibido no coincide con el usuario a pagar recibido: " +
                    organizadorID,
            });
        }

        if (!clientPaymentID) {
            return formatResponse({
                statusCode: 400,
                error: "no se encontro id de pago para el cliente ",
            });
        }

        if (!ownerPaymentID) {
            return formatResponse({
                statusCode: 400,
                error: "no se encontro id de pago para el creador del evento ",
            });
        }

        // Verificar que el owner id no sea igual a client id para evitar problemas de transferencias
        if (ownerPaymentID === clientPaymentID && total !== 0) {
            return formatResponse({
                statusCode: 409,
                error: "el creador del evento tiene el mismo id de pago que el cliente",
            });
        }

        let reservadosEvento = evento.personasReservadas
            ? evento.personasReservadas
            : 0;

        let comision = 0;

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

        totalFetched -= porcentajeDescuento
            ? totalFetched * porcentajeDescuento
            : cantidadDescuento
                ? totalFetched - cantidadDescuento
                : 0;

        enviarACreador = total - comision;

        // Verificar que el precio recibido coincida con los boletos fetcheados
        if (total !== totalFetched) {
            return formatResponse({
                statusCode: 400,
                error:
                    "El precio total: " +
                    total +
                    " recibido no coincide con el calculado de la base de datos: " +
                    totalFetched,
            });
        }
        //
        // Verificar que el total de personas en el evento sea menor al sumado hasta ahorita
        if (reservadosEvento > evento.personasMax) {
            return formatResponse({
                statusCode: 400,
                error:
                    "El evento esta lleno con " +
                    evento.personasReservadas +
                    " de un total de " +
                    evento.personasMax,
            });
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

        let body = {
            tipoPago,
        };
        if (total !== 0) {
            // Si hay un total cobrarlo de lo contrario solo actualizar la reservacion nueva
            // Crear el payment intent con los datos de la tarjeta y confirmarlo aqui mismo
            // input: {
            //     amount: total * 100,
            //     currency,
            //     // Permitir pagos de otros metodos (supongo que de oxxo)
            //     automatic_payment_methods: {
            //       enabled: true,
            //     },
            //     // Podemos poner el total aqui pues despues cuando se crea el create reserva y confirmar el pago de dar precios diferentes no se hace nada
            //     application_fee_amount: precioTotalSinComision,
            //     metadata: {
            //       eventoID,
            //       usuarioID: usuario.id,
            //       reservaID,
            //       boletosID: JSON.stringify(boletos.map((e) => e.id)),
            //     },
            //     payment_method_types: ["card", "oxxo"],
            //     // Guardar pagos en la tarjeta
            //     setup_future_usage: "off_session",
            //     // Cliente al quien guardarle los datos de tarjeta
            //     customer: usuario.paymentClientID,
            //     // Descripcion en stripe y extracto bancario
            //     description: route.params.detalles,
            //     statement_descriptor:
            //       "PARTYUS--" + mayusFirstLetter(route.params.titulo.slice(0, 10)),
            //     // If the payment requires any follow-up actions from the
            //     // customer, like two-factor authentication, Stripe will error
            //     // and you will need to prompt them for a new payment method.>
            //     error_on_requires_action: true,
            //     transfer_data: {
            //       destination: creator.paymentAccountID,
            //     },
            //   }
            //   await new Promise((res, rej) => {
            //     // Pago hacia la cuenta del cliente comprador del producto
            //     openpay.customers.charges.create(
            //       clientPaymentID,
            //       {
            //         device_session_id: device_session_id,
            //         method: tipoPago === "EFECTIVO" ? "store" : "card",
            //         source_id: sourceID,
            //         amount: total,
            //         description,
            //         redirect_url: "https://www.partyusmx.com",
            //         order_id: "charge>>>" + reservaID,
            //         capture: true,
            //         due_date: tipoPago === "EFECTIVO" ? limitDate : undefined,
            //       },
            //       async function (error, e) {
            //         console.log({
            //           resultadoCrearCargo: e,
            //         });
            //         if (error) {
            //           rej(error);
            //         }
            //         body.paymentID = e.id;
            //         chargeID = e.id;
            //         if (tipoPago === "EFECTIVO") {
            //           if (!e.payment_method) {
            //             rej("No se recibio url del voucher de la api de pagos");
            //           }
            //           const { barcode_url, reference } = e.payment_method;
            //           body.voucher = {
            //             barcode_url,
            //             reference,
            //             limitDate: limitDate.getTime(),
            //           };
            //           res();
            //         } else {
            //           // Verificar si no hay field de authorization, no esta autorizada con openpay
            //           if (!e.authorization) {
            //             rej(
            //               "por el momento no podemos procesar ese tipo de tarjeta. Intenta con otra o pagando en efectivo en una tienda."
            //             );
            //             return;
            //           }
            //           await Promise.all([
            //             new Promise((res, rej) => {
            //               // Cargo comision al comprador
            //               openpay.fees.create(
            //                 {
            //                   amount: comision,
            //                   description:
            //                     "Reserva: " + reservaID + " comision partyus.",
            //                   order_id: "fee>>>" + reservaID,
            //                   customer_id: clientPaymentID,
            //                 },
            //                 function (error, fee) {
            //                   feeID = fee.id;
            //                   if (error) {
            //                     rej(error);
            //                     return;
            //                   }
            //                   console.log("\nFEE RESULT:\n");
            //                   console.log(fee);
            //                   res();
            //                 }
            //               );
            //             }),
            //             new Promise((res, rej) => {
            //               // Transferencia del comprador al organizador
            //               openpay.customers.transfers.create(
            //                 clientPaymentID,
            //                 {
            //                   customer_id: ownerPaymentID,
            //                   amount: enviarACreador,
            //                   description:
            //                     "cardtransfer>>>" + reservaID + "><" + description,
            //                   order_id: "cardtransfer>>>" + reservaID,
            //                 },
            //                 (error, r) => {
            //                   transactionID = r.id;
            //                   if (error) {
            //                     rej(error);
            //                     return;
            //                   }
            //                   console.log("\nTRANSFER RESULT:\n");
            //                   console.log(r);
            //                   res();
            //                 }
            //               );
            //             }),
            //           ])
            //             .then(() => {
            //               res();
            //             })
            //             .catch((e) => {
            //               console.log(e);
            //               rej(e);
            //               return;
            //             });
            //         }
            //       }
            //     );
            //   });
        }

        const reservaInput = {
            cantidad: totalPersonasReservadas,
            comision,
            cuponID,
            eventoID,
            id: reservaID,
            organizadorID,
            pagadoAlOrganizador: enviarACreador,
            chargeID: body.paymentID,
            transactionID,
            feeID,
            total,
            pagado: tipoPago === "EFECTIVO" && total !== 0 ? false : true,
            usuarioID,
            fechaExpiracionUTC: new Date(limitDate).toISOString(),
            cashBarcode: body?.voucher?.barcode_url,
            cashReference: body?.voucher?.reference,
            tipoPago,
            paymentTime: new Date().toISOString(),
        };

        console.log(`
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
                ? `updateCupon(input: {id: "${cuponID}", restantes: ${cupon.restantes ? cupon.restantes - 1 : 0
                },_version:${cupon._version}}) {
                    ${updateCuponReturns}
              }`
                : ``
            }
  

            
        createReserva(input: $reservaInput) {
            ${reservaReturns}
        }
        }
      `);
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
                ? `updateCupon(input: {id: "${cuponID}", restantes: ${cupon.restantes ? cupon.restantes - 1 : 0
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
        }).then((r) => {
            console.log(r);
            body = {
                ...body,
                reservaID: r.data?.createReserva?.id,
            };
            if (r.errors)
                throw new Error("Hubo un error actualizando el boleto " + r);
        });

        return formatResponse({
            statusCode: 200,
            body,
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

        // Cancelar el cargo en caso de error en la funcion
        // if (tipoPago !== "EFECTIVO" && chargeID) {
        //     // Primer esperar a que se devuelvan transaccion y fee
        //     await Promise.all([
        //         new Promise((res, rej) => {
        //             // Regresar comision del comprador
        //             openpay.fees.refund(
        //                 feeID, {
        //                 description: "Fallo al crear reserva, comision devuelta"
        //             },
        //                 function (error, fee) {
        //                     feeID = fee.id

        //                     if (error) {
        //                         rej("Error cancelando el fee sobre el cargo");
        //                     }

        //                     res();
        //                 }
        //             );
        //         }),
        //         new Promise((res, rej) => {
        //             // Devolver del organizador al comprador
        //             openpay.customers.transfers.create(
        //                 ownerPaymentID,
        //                 {
        //                     customer_id: clientPaymentID,
        //                     amount: enviarACreador,
        //                     order_id: "transferRefund>>>" + reservaID,
        //                 },
        //                 (error, r) => {
        //                     transactionID = r.id

        //                     if (error) {
        //                         rej("Error creando la transferencia sobre el cargo");
        //                     }

        //                     console.log("\nTRANSFER RESULT:\n");
        //                     console.log(r);
        //                     res();
        //                 }
        //             );
        //         }),
        //     ]).then(r => {
        //         msg = "Fallo en crear la reserva, cargos devueltos"
        //         return openpay.customers.charges.refund(clientPaymentID, chargeID, {
        //             description: "Fallo en crear la reserva, cargo devuelto"
        //         }, (err, charge) => {
        //             console.log("Cargo cancelado con exito: " + charge)
        //         })

        //     })

        // }

        return formatResponse({
            statusCode: 500,
            error: msg,
        });
    }
};
