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

import API from "@aws-amplify/api";
import ElementoPersonas from "./ElementoPersonas";
import { DataStore } from "@aws-amplify/datastore";

import uuid from "react-native-uuid";

import Boton from "../../../components/Boton";
import { NavigationProp } from "../../../shared/interfaces/navigation.interface";
import {
  azulClaro,
  formatDateShort,
  formatMoney,
  precioConComision,
  rojoClaro,
  shadowMedia,
} from "../../../../constants";

import { BoletoType } from "../Boletos";
import { EventoType } from "../Home";
import { Cupon } from "../../../models";

import Header from "../../../navigation/components/Header";
import { SvgUri } from "react-native-svg";

enum TipoPagoEnum {
  "TARJETA" = "TARJETA",
  "EFECTIVO" = "EFECTIVO",
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
  // // Calcular precios correctos
  // console.log(
  //   boletos
  //     .map((e) => {
  //       let { quantity } = e;
  //       quantity = quantity ? quantity : 0;

  //       return precioConComision(quantity * e.precio);
  //     })
  //     .reduce((partialSum, a) => partialSum + a, 0)
  // );
  // return;

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
  } = route.params;

  const imagenFondo = imagenes[imagenPrincipalIDX];

  // Variables de stripe
  // const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState(false);
  const [paymentLoaded, setPaymentLoaded] = useState(false);

  const [reservaID, setReservaID] = useState(uuid.v4());

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
      Alert.alert("Error", "Ocurrio un error, vuelve a intentarlo mas tarde");
      setError(true);
    }
  };

  const handleConfirm = async () => {
    Alert.alert("Confirmar pago");
    return;
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
              uri: imagenes[imagenPrincipalIDX].uri,
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

            if (!e.quantity) return <></>;

            return (
              <View key={index}>
                <ElementoPersonas
                  precio={precioIndividualConComision}
                  titulo={e.titulo}
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
          {/* Icono de agregar tarjeta y configuracion pagos */}

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

          {tarjetasGuardadas.map((tarjeta, idx: number) => {
            return (
              <>
                <Pressable
                  onPress={() => {
                    setTipoPago(idx);
                  }}
                  style={styles.metodoDePago}
                >
                  <View style={styles.iconoIzquierda}>
                    <Image
                      style={{ height: 30, resizeMode: "contain", width: 40 }}
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
              </>
            );
          })}

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
  },

  imgAventura: {
    flex: 2,
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
