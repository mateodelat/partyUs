import { API, loadingContainer } from "aws-amplify";
import { Alert, StyleSheet, Text, View } from "react-native";
import {
  comisionApp,
  fetchFromOpenpay,
  msInDay,
  precioConComision,
} from "../../../../constants";

export default async (event: {
  body: {
    eventoID?: string;
    organizadorID?: string;
    cuponID?: string;
    reservaID?: string;

    tipoPago: string;

    total?: number;
    boletos?: { quantity: number; id: string }[];

    sourceID?: string;
    usuarioID?: string;
    device_session_id?: string;
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
    const query = (boletosID: string[]) => {
      let string = "";
      boletosID.map((id, idx) => {
        string += `{id:{eq:"${id}"}},`;
      });

      return /* GraphQL */ `
            query fetchData($eventoID: ID!, $usuarioID:ID!, $organizadorID:ID! ${
              cuponID ? `,$cuponID:ID!` : ""
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
              ${
                cuponID
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
      API.graphql({
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
      }) as any
    ).then((r: any) => {
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

    let body: {
      paymentID?: string;
      reservaID?: string;
      tipoPago: "EFECTIVO" | "TARJETA";
      voucher?: {
        barcode_url: string;
        reference: string;
        limitDate: number;
      };
    } = {
      tipoPago,
    };

    await fetchFromOpenpay({
      // Pago hacia la cuenta del cliente comprador del producto
      path: `/customers/${clientPaymentID}/charges`,
      type: "POST",
      input: {
        device_session_id: device_session_id,
        method: tipoPago === "EFECTIVO" ? "store" : "card",
        source_id: sourceID,
        amount: total,
        description,
        order_id: "charge>>>" + reservaID,
        due_date: tipoPago === "EFECTIVO" ? limitDate : undefined,
      },
      secretKey: "sk_e266853b34704432b3fbac85079350ac",
    }).then(async (e: any) => {
      const comision = comisionApp * e.amount;
      const enviarACreador = e.amount - comision;

      body.paymentID = e.id;

      if (tipoPago === "EFECTIVO") {
        if (!e.payment_method) {
          throw new Error("No se recibio url del voucher de la api de pagos");
        }
        const { barcode_url, reference } = e.payment_method;

        body.voucher = {
          barcode_url,
          reference,
          limitDate: limitDate.getTime(),
        };
        return;
      }

      return await Promise.all([
        e,

        // Cargo comision al comprador
        fetchFromOpenpay({
          path: `/fees`,
          type: "POST",
          input: {
            amount: comision,
            description: "Reserva: " + reservaID + " comision partyus.",
            order_id: "fee>>>" + reservaID,
            customer_id: clientPaymentID,
          },
          secretKey: "sk_e266853b34704432b3fbac85079350ac",
        }).then((r) => {
          console.log("\nFEE RESULT:\n");
          console.log(r);
        }),

        // Transferencia del comprador al guia
        fetchFromOpenpay({
          path: `/customers/${clientPaymentID}/transfers`,
          type: "POST",
          input: {
            customer_id: ownerPaymentID,
            amount: enviarACreador,
            description,
            order_id: "transfer>>>" + reservaID,
          },
          secretKey: "sk_e266853b34704432b3fbac85079350ac",
        }).then((r) => {
          console.log("\nTRANSFER RESULT:\n");
          console.log(r);
        }),
      ]).catch((e) => {
        throw new Error(
          "Error enviando fondos. Conta ctanos para cancelar el cargo"
        );
      });
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
      API.graphql({
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
              ? `updateCupon(input: {id: "${cuponID}", restantes: ${
                  cupon.restantes ? cupon.restantes - 1 : 0
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
        authMode: "AWS_IAM",
      }) as any
    ).then((r: any) => {
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
  } catch (error: any) {
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

const styles = StyleSheet.create({});
