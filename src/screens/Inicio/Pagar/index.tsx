import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Entypo } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

import ElementoPersonas from "./ElementoPersonas";

import uuid from "react-native-uuid";

import Boton from "../../../components/Boton";
import { NavigationProp } from "../../../shared/interfaces/navigation.interface";
import {
  azulClaro,
  comisionApp,
  formatDateShort,
  formatMoney,
  getUserSub,
  precioConComision,
  rojoClaro,
  shadowMedia,
} from "../../../../constants";

import { BoletoType } from "../Boletos";
import { EventoType } from "../Home";
import { Boleto, Cupon } from "../../../models";

import Header from "../../../navigation/components/Header";
import { SvgUri } from "react-native-svg";
import { API, Auth, DataStore } from "aws-amplify";

enum TipoPagoEnum {
  "TARJETA" = "TARJETA",
  "EFECTIVO" = "EFECTIVO",
}

async function createPaymentIntent(event: {
  body: {
    eventoID: string;
    usuarioID: string;
    cuponID?: string;
    reservaID: string;

    total: number;
    boletos: string[];

    destinationStripeID: string;
  };
}) {
  try {
    let {
      total,
      cuponID,
      boletos,
      eventoID,
      usuarioID,
      reservaID,
      destinationStripeID,
    } = event.body;

    ////////////////////////////////////////////////////////////////////////
    /////////////////////////Verificaciones previas/////////////////////////
    ////////////////////////////////////////////////////////////////////////
    if (!boletos || boletos.length === 0) {
      return {
        statusCode: 400,
        body: "Error no se recibio una lista de boletos",
      };
    }

    if (!eventoID) {
      return {
        statusCode: 400,
        body: "Error no se recibio ID de evento",
      };
    }

    if (!usuarioID) {
      return {
        statusCode: 400,
        body: "Error no se recibio ID de usuario",
      };
    }

    if (!total) {
      return {
        statusCode: 400,
        body: "Error no se recibio un precio total",
      };
    }

    if (!reservaID) {
      return {
        statusCode: 400,
        body: "Error no se recibio id de la reserva",
      };
    }

    if (!destinationStripeID) {
      return {
        statusCode: 400,
        body: "Error no se recibio la cuenta a transferir fondos",
      };
    }

    console.log("Args de input:", event.body);

    total *= 100;
    const comisionApp = 0.15;

    // Create payment intent con tarjeta y con oxxo
    // Conviene obtener un id y desde aqui fetchear el precio de la reserva
    let cardPaymentIntent = stripe.paymentIntents.create({
      amount: total,
      currency: "mxn",
      application_fee_amount: total * comisionApp,
      metadata: {
        eventoID: eventoID,
        usuarioID: usuarioID,
        reservaID: reservaID,
        cuponID: cuponID,
        boletos: JSON.stringify(boletos),
      },

      // Extracto bancario
      statement_descriptor: "PARTYUS",

      transfer_data: {
        destination: destinationStripeID,
      },
    });
    let oxxoPaymentIntent = stripe.paymentIntents.create({
      amount: total,
      currency: "mxn",
      application_fee_amount: total * comisionApp,
      metadata: {
        eventoID: eventoID,
        usuarioID: usuarioID,
        reservaID: reservaID,
        cuponID: cuponID,
        boletos: JSON.stringify(boletos),
      },

      // Extracto bancario
      statement_descriptor: "PARTYUS",

      transfer_data: {
        destination: destinationStripeID,
      },
    });

    await Promise.all([cardPaymentIntent, oxxoPaymentIntent]);

    console.log("Payment intents results ", {
      cardPaymentIntent,
      oxxoPaymentIntent,
    });

    return {
      body: {
        cardPaymentIntent,
        oxxoPaymentIntent,
      },
      statusCode: 100,
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: error.message ? error.message : error,
    };
  }
}

async function createReserva(event: {
  body: {
    eventoID: string;
    usuarioID: string;
    cuponID?: string;
    reservaID: string;

    total: number;
    boletos: { quantity: number; id: string }[];
  };
}) {
  try {
    const { total, cuponID, boletos, eventoID, usuarioID, reservaID } =
      event.body;

    ////////////////////////////////////////////////////////////////////////
    /////////////////////////Verificaciones previas/////////////////////////
    ////////////////////////////////////////////////////////////////////////
    if (!boletos || boletos.length === 0) {
      return {
        statusCode: 400,
        body: "Error no se recibio una lista de boletos",
      };
    }

    if (!eventoID) {
      return {
        statusCode: 400,
        body: "Error no se recibio ID de evento",
      };
    }

    if (!usuarioID) {
      return {
        statusCode: 400,
        body: "Error no se recibio ID de usuario",
      };
    }

    if (!total) {
      return {
        statusCode: 400,
        body: "Error no se recibio un precio total",
      };
    }

    if (!reservaID) {
      return {
        statusCode: 400,
        body: "Error no se recibio id de reserva",
      };
    }

    /*
    Pedir el payment intent y verificar que:
    El transfer data sea el id del creador del evento,
    el precio total sea correcto,
    */

    // Funcion para sacar el query a mandar con filtro de boletosID
    const query = (boletosID: string[]) => {
      let string = "";
      boletosID.map((id, idx) => {
        string += `{id:{eq:"${id}"}},`;
      });

      if (cuponID)
        return /* GraphQL */ `
          query fetchData($eventoID: ID!, $cuponID: ID!) {
            getEvento(id: $eventoID) {
              _version
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
        query fetchData($eventoID: ID!) {
          getEvento(id: $eventoID) {
            _version
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
              titulo
              _version
            }
          }
        }
      `;
    };

    /* Primero hay que verificar que haya lugares disponibles en los boletos
       y ver que el precio corresponda al dado por el cliente
       */
    const response = await (
      API.graphql({
        query: query(boletos.map((e) => e.id)),
        variables: cuponID
          ? {
              eventoID,
              cuponID,
            }
          : {
              eventoID,
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
      };
    });

    const { boletos: boletosFetched, evento, cupon } = response;
    const porcentajeDescuento = cupon?.porcentajeDescuento;
    const cantidadDescuento = cupon?.cantidadDescuento;

    let reservadosEvento = evento.personasReservadas
      ? evento.personasReservadas
      : 0;

    //////////////////////////////////////////////////////////
    // Verificar que el precio total coincida con el pasado //
    //////////////////////////////////////////////////////////
    let totalFetched = boletosFetched
      .map((e: Boleto) => {
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
        body:
          "El precio total: " +
          total +
          " recibido no coincide con el calculado de la base de datos: " +
          totalFetched,
      };
    }
    //
    // Verificar que el total de personas en el evento sea menor al sumado hasta ahorita
    if (reservadosEvento > evento.personasMax) {
      return {
        statusCode: 400,
        body:
          "El evento esta lleno con " +
          evento.personasReservadas +
          " de un total de " +
          evento.personasMax,
      };
    }

    // Mutacion para actualizar los boletos, el evento y restar el personas disponibles de cupon
    await API.graphql({
      query: `
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
              // Quitar cupon si existe ID
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
        `,
      authMode: "AWS_IAM",
    }).then((r) => {
      if (r.errors)
        throw new Error("Hubo un error actualizando el boleto " + r);

      return r;
    });

    return {
      statusCode: 100,
      body: "La reserva fue creada con exito",
    };
  } catch (error: any) {
    // console.log(error);
    return {
      statusCode: 500,
      body: error.message ? error.message : error,
    };
  }
}

export default function ({
  route,
  navigation,
}: {
  route: {
    params: EventoType & {
      total: number;
      boletos: BoletoType[];
      imagenes: {
        uri: string;
        key: string;
      }[];
      descuento?: Cupon;
    };
  };
  navigation: NavigationProp;
}) {
  const {
    boletos,
    total,
    imagenes,
    imagenPrincipalIDX,
    titulo,
    fechaInicial,
    fechaFinal,
    detalles,
    owner,
    descuento,
    id: eventoID,
  } = {
    CreatorID: "75f153ae-e945-42fa-9e4d-d724a76d7ff7",
    _deleted: null,
    _lastChangedAt: 1663131008188,
    _version: 1,
    boletos: [
      {
        _deleted: null,
        _lastChangedAt: 1663131008401,
        _version: 1,
        cantidad: 30,
        createdAt: "2022-09-14T04:50:08.378Z",
        descripcion: "",
        eventoID: "16dd8192-d26b-4be1-a5de-4e2825119e27",
        id: "0748dd21-67d2-43d7-a3f5-91b4d3c2d330",
        owner: "75f153ae-e945-42fa-9e4d-d724a76d7ff7",
        personasReservadas: null,
        precio: 1100,
        quantity: 2,
        titulo: "VIP",
        updatedAt: "2022-09-14T04:50:08.378Z",
      },
      {
        _deleted: null,
        _lastChangedAt: 1663131009276,
        _version: 1,
        cantidad: 50,
        createdAt: "2022-09-14T04:50:09.251Z",
        descripcion: "Este boleto es el ordinario",
        eventoID: "16dd8192-d26b-4be1-a5de-4e2825119e27",
        id: "a7c6204b-3fa0-4ca2-8b73-16cb8fbc8f09",
        owner: "75f153ae-e945-42fa-9e4d-d724a76d7ff7",
        personasReservadas: null,
        precio: 400,
        quantity: 1,
        titulo: "Normal",
        updatedAt: "2022-09-14T04:50:09.251Z",
      },
    ],
    comodities: ["ALBERCA", "COMIDA", "BARRALIBRE"],
    createdAt: "2022-09-14T04:50:08.163Z",
    descuento: undefined,
    detalles: "Detalles del evento",
    fechaFinal: 1664409600000,
    fechaInicial: 1664395200000,
    id: "16dd8192-d26b-4be1-a5de-4e2825119e27",
    imagenPrincipalIDX: 0,
    imagenes: [
      {
        key: "https://i.picsum.photos/id/501/1100/800.jpg?hmac=BtlHyta2RVst5tlIRxzEZmLZtiezcDHFOQ_6H4mwuQ8",
        uri: "https://i.picsum.photos/id/501/1100/800.jpg?hmac=BtlHyta2RVst5tlIRxzEZmLZtiezcDHFOQ_6H4mwuQ8",
      },
      {
        key: "https://i.picsum.photos/id/666/1100/800.jpg?hmac=vhtpFJqofWTGHrh7zjwqGtkvc91P6TixazoMV96OrBQ",
        uri: "https://i.picsum.photos/id/666/1100/800.jpg?hmac=vhtpFJqofWTGHrh7zjwqGtkvc91P6TixazoMV96OrBQ",
      },
      {
        key: "https://i.picsum.photos/id/944/1100/800.jpg?hmac=FdqdJp002a_tRH1ffS_LNZjs_7emSUARzubtk_nOeJE",
        uri: "https://i.picsum.photos/id/944/1100/800.jpg?hmac=FdqdJp002a_tRH1ffS_LNZjs_7emSUARzubtk_nOeJE",
      },
    ],
    musOtra: null,
    musica: "REGGETON",
    owner: {
      _deleted: null,
      _lastChangedAt: 1663130831913,
      _version: 2,
      admin: false,
      calificacion: null,
      createdAt: "2022-09-14T04:36:53.419Z",
      email: "mateodelat@gmail.com",
      fechaNacimiento: null,
      foto: "https://ui-avatars.com/api/?name=mateodelat&bold=true&background=ffbf5e&color=000&length=1",
      id: "75f153ae-e945-42fa-9e4d-d724a76d7ff7",
      idData: null,
      idKey: null,
      idUploaded: false,
      imagenFondo: null,
      materno: null,
      nickname: "mateodelat",
      nombre: null,
      notificationToken: null,
      numResenas: null,
      organizador: true,
      owner: "75f153ae-e945-42fa-9e4d-d724a76d7ff7",
      paterno: null,
      phoneCode: null,
      phoneNumber: null,
      updatedAt: "2022-09-14T04:47:11.868Z",
      verified: false,
    },
    personasMax: 80,
    personasReservadas: null,
    precioMax: 1100,
    precioMin: 400,
    tipoLugar: "INTERIOR",
    titulo: "Nuevo evento",
    tosAceptance: {
      hora: "2022-09-14T04:50:00.892Z",
      ip: "10.0.2.16",
    },
    total: 3000,
    ubicacion: {
      latitude: 37.42683509471589,
      latitudeDelta: 0.02135405936986956,
      longitude: -122.08070307970047,
      longitudeDelta: 0.015137381851673126,
      ubicacionId: "ChIJAAAAAAAAAAARPT9VG0oB3x0",
      ubicacionNombre: "Shoreline Amphitheatre",
    },
    updatedAt: "2022-09-14T04:50:08.163Z",
  };

  // Variables de stripe
  // const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState(false);
  const [paymentLoaded, setPaymentLoaded] = useState(false);

  const [reservaID, setReservaID] = useState(uuid.v4() as string);

  // Id de transaccion
  const [idPago, setIdPago] = useState("");

  // Opciones que se llenan cuando damos agregar tarjeta
  const [paymentOption, setPaymentOption] = useState({});
  const [tarjetasGuardadas, setTarjetasGuardadas] = useState([
    {
      last4: "0021",
      type: "MASTERCARD",
      nombre: "Mateo de la torre",
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/2560px-MasterCard_Logo.svg.png",
    },
    {
      last4: "3020",
      nombre: "Sylvia vanesa H",
      type: "MASTERCARD",
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/2560px-MasterCard_Logo.svg.png",
    },
    {
      last4: "0021",
      type: "VISA",
      nombre: "Jorgito cara de pito",
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1280px-Visa_Inc._logo.svg.png",
    },
  ]);

  const [tipoPago, setTipoPago] = useState<TipoPagoEnum | number>();

  // UI del boton
  const [buttonLoading, setButtonLoading] = useState(false);

  const [sub, setSub] = useState("");

  const personasTotales = boletos
    .map((e: BoletoType) => {
      let { quantity } = e;
      quantity = quantity ? quantity : 0;

      return quantity;
    })
    .reduce((partialSum, a) => partialSum + a, 0);

  const precioTotal = total;

  // useEffect(() => {
  //   // Empezar a cargar el client secret primero
  //   fetchPaymentIntent().catch((e) => {
  //     setError(true);
  //     console.log(e);
  //   });
  // }, []);

  useEffect(() => {
    getUserSub().then(setSub);
    setTarjetasGuardadas([]);
  }, []);

  // useEffect(() => {
  //   // Una vez se obtiene preparar el modal de pago
  //   if (clientSecret) {
  //     initializePaymentSheet()
  //       .then((r) => {
  //         setPaymentLoaded(true);
  //       })
  //       .catch((e) => {
  //         console.log(e);
  //         setError(true);
  //       });
  //   }
  // }, [clientSecret]);

  ///////////////////////////////////////////////////////////////////
  /////////////////////////////FUNCIONES/////////////////////////////
  ///////////////////////////////////////////////////////////////////
  function verOpciones() {
    navigation.pop();
    navigation.pop();
    navigation.pop();
  }

  // Action tras darle click a agregar metodo de pago
  const handleAddPaymentMethod = async () => {
    if (!paymentLoaded) {
      Alert.alert(
        "Espera",
        "Espera unos segundos, todavia no carga la ventana de pago"
      );
      return;
    }

    if (error) {
      Alert.alert(
        "Error",
        "Error haciendo el pago, vuelve a intentarlo mas tarde"
      );
      return;
    }
    if (clientSecret !== null) {
      Alert.alert("Presentar modal de agregar tarjeta");
      return;
    } else {
      Alert.alert("Error", "Ocurrio un error, client secret missing");
      setError(true);
    }
  };

  const handleConfirm = async () => {
    const r = await createPaymentIntent({
      body: {
        eventoID,
        boletos: boletos.map((e: BoletoType) => ({
          id: e.id,
          quantity: e.quantity ? e.quantity : 0,
        })),
        total,
        usuarioID: sub,
        cuponID: "MATEO",
        reservaID,
      },
    });

    console.log(r);
  };

  function handleEditPayments() {
    console.log(tarjetasGuardadas);
  }
  return (
    <View style={styles.container}>
      <Header
        title={"Pagar"}
        navigation={navigation}
        style={{ paddingHorizontal: 5 }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Mostrar la aventura a pagar */}
        <View
          style={[
            styles.innerContainer,
            { flexDirection: "row", marginBottom: 0 },
          ]}
        >
          <Image
            source={{
              uri: imagenes[imagenPrincipalIDX ? imagenPrincipalIDX : 0].uri,
            }}
            style={styles.imgAventura}
          />

          <View style={styles.adventureTextContainer}>
            <View style={{ ...styles.row, marginTop: 0 }}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 16,
                  flex: 1,
                }}
              >
                {titulo}
              </Text>
              {/* Calificacion guia */}
              {owner?.verified ? (
                <Octicons
                  name="verified"
                  size={20}
                  color={azulClaro}
                  onPress={() =>
                    Alert.alert(
                      "Verificado",
                      "El organizador de este evento esta verificado por partyUs"
                    )
                  }
                />
              ) : (
                owner?.calificacion && (
                  <View style={{ ...styles.row, marginTop: 0, marginLeft: 10 }}>
                    <Entypo name="star" size={16} color="#F5BE18" />
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                      {owner.calificacion}
                    </Text>
                  </View>
                )
              )}
            </View>

            {/* Descripcion fecha */}
            {detalles && (
              <Text style={{ fontSize: 12, marginTop: 10 }} numberOfLines={2}>
                {detalles}
              </Text>
            )}

            <View style={styles.row}>
              {/* Guia */}
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: azulClaro }}>@{owner?.nickname}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.innerContainer, { padding: 15, paddingTop: 5 }]}>
          {boletos.map((e: BoletoType, index: number) => {
            const precioIndividualConComision = precioConComision(e.precio);

            if (!e.quantity) return <View key={index} />;

            return (
              <View key={index}>
                <ElementoPersonas
                  precio={precioIndividualConComision}
                  titulo={e.titulo ? e.titulo : ""}
                  cantidad={e.quantity ? e.quantity : 0}
                />

                <View style={styles.line} />
              </View>
            );
          })}

          {/* Descuentos */}
          {descuento && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 10,
              }}
            >
              <Text style={{ ...styles.titulo, fontWeight: "bold" }}>
                Descuento
              </Text>
              <Text style={styles.precioTotal}>
                {"-"}
                {descuento.porcentajeDescuento
                  ? descuento.porcentajeDescuento * 100 + "%"
                  : formatMoney(descuento.cantidadDescuento, true)}
              </Text>
            </View>
          )}

          {/* Precio total*/}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <Text style={{ ...styles.titulo, fontWeight: "bold" }}>Total</Text>
            <Text style={styles.precioTotal}>$ {Math.round(precioTotal)}</Text>
          </View>
        </View>

        {/* Metodos de pago */}
        <View style={styles.paymentContainer}>
          {
            // Si no hay tarjetas guardadas poner agregar tarjeta
            !tarjetasGuardadas.length ? (
              <>
                <Pressable
                  onPress={() => {
                    setTipoPago(undefined);
                    handleAddPaymentMethod();
                  }}
                  style={styles.metodoDePago}
                >
                  <View style={{ ...styles.iconoIzquierda }}>
                    <AntDesign name="creditcard" size={30} color="#aaa" />
                  </View>

                  <Text
                    style={{
                      ...styles.titulo,
                      color: "#aaa",
                    }}
                  >
                    TARJETA
                  </Text>
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      width: 30,
                      height: 30,
                    }}
                  >
                    <Entypo name="plus" size={30} color={"#aaa"} />
                  </View>
                </Pressable>
                <View style={styles.line} />
              </>
            ) : (
              <View>
                {/* Header con agregar tarjeta y configuracion pagos */}
                <View
                  style={{
                    ...styles.row,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: azulClaro,
                      padding: 20,
                      paddingVertical: 10,
                    }}
                    onPress={handleEditPayments}
                  >
                    EDITAR
                  </Text>
                  <Entypo
                    style={{
                      marginRight: 15,
                    }}
                    name="plus"
                    size={30}
                    color={azulClaro}
                    onPress={handleAddPaymentMethod}
                  />
                </View>

                {/* Mapeo de tarjetas guardadas */}
                {tarjetasGuardadas.map((tarjeta, idx: number) => {
                  return (
                    <View key={idx}>
                      <Pressable
                        onPress={() => {
                          setTipoPago(idx);
                        }}
                        style={styles.metodoDePago}
                      >
                        <View style={styles.iconoIzquierda}>
                          <Image
                            style={{
                              height: 30,
                              resizeMode: "contain",
                              width: 40,
                            }}
                            source={{ uri: tarjeta.icon }}
                          />
                        </View>

                        {/* Numero de la tarjeta y tarjetahabiente */}
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              ...styles.titulo,
                              color: tipoPago === idx ? "#222" : "#aaa",
                            }}
                          >
                            **** **** **** {tarjeta.last4.toUpperCase()}
                          </Text>
                          <Text
                            style={{
                              ...styles.tarjetahabiente,
                              color: tipoPago === idx ? "#777" : "#ddd",
                            }}
                          >
                            {tarjeta.nombre.toUpperCase()}
                          </Text>
                        </View>
                        <View
                          style={{
                            alignItems: "center",
                            justifyContent: "center",
                            width: 30,
                            height: 30,
                          }}
                        >
                          {tipoPago === idx && (
                            <Entypo name="check" size={30} color={azulClaro} />
                          )}
                        </View>
                      </Pressable>

                      <View
                        style={{
                          borderColor: "#aaa",
                          borderBottomWidth: 1,
                          marginHorizontal: 30,
                        }}
                      />
                    </View>
                  );
                })}
              </View>
            )
          }

          <Pressable
            onPress={() => {
              setTipoPago(TipoPagoEnum.EFECTIVO);
            }}
            style={styles.metodoDePago}
          >
            <View style={{ ...styles.iconoIzquierda }}>
              <SvgUri
                width={40}
                height={30}
                uri={"https://cdn.worldvectorlogo.com/logos/oxxo-logo.svg"}
              />
            </View>

            <Text
              style={{
                ...styles.titulo,
                color: tipoPago === "EFECTIVO" ? "#222" : "#aaa",
              }}
            >
              EFECTIVO
            </Text>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 30,
              }}
            >
              {tipoPago === "EFECTIVO" && (
                <Entypo name="check" size={30} color={azulClaro} />
              )}
            </View>
          </Pressable>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
      <View style={{ flex: 1 }} />
      <View
        style={{
          padding: 20,
        }}
      >
        <Boton
          loading={buttonLoading}
          titulo={"Confirmar"}
          onPress={handleConfirm}
          color={azulClaro}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },

  innerContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    ...shadowMedia,
    margin: 20,
    marginBottom: 20,
    minHeight: 100,

    alignItems: "center",
  },

  imgAventura: {
    flex: 2,
    height: "100%",
  },

  adventureTextContainer: {
    padding: 10,
    paddingVertical: 15,
    paddingRight: 15,
    flex: 3,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    justifyContent: "space-between",
  },

  precioTotal: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 18,

    textAlign: "right",
    paddingRight: 10,
  },

  guiaIcon: {
    width: 20,
    height: 20,
    tintColor: "#0000009E",
  },

  line: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 5,
    backgroundColor: "lightgray",
  },

  metodoDePago: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
  },

  paymentContainer: {
    borderRadius: 10,
    overflow: "hidden",
    marginHorizontal: 20,
    backgroundColor: "#fff",
    marginTop: 20,

    ...shadowMedia,
  },

  iconoIzquierda: {
    width: 55,
    alignItems: "center",
    marginRight: 20,
  },

  titulo: {
    fontSize: 18,
    color: "#AAA",
    fontWeight: "bold",
    flex: 1,
  },
  tarjetahabiente: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
