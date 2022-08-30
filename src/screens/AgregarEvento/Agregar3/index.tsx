import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import { ImagenesType } from "../Agregar1";
import {
  AsyncAlert,
  azulClaro,
  azulFondo,
  azulOscuro,
  comisionApp,
  formatMoney,
  maxEventPrice,
  mayusFirstLetter,
  minEventPrice,
  redondear,
  shadowMarcada,
} from "../../../../constants";
import HeaderAgregar from "../Agregar1/HeaderAgregar";
import { NavigationProp } from "../../../shared/interfaces/navigation.interface";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";

import { TouchableOpacity } from "react-native-gesture-handler";
import InputOnFocus from "../../../components/InputOnFocus";
import { useState } from "react";
import Selector from "../../../components/Selector";
import PlusMinus from "./PlusMinus";
import useEvento from "../../../Hooks/useEvento";
import Boton from "../../../components/Boton";
import Line from "../../../components/Line";
import { DataStore } from "aws-amplify";
import { Boleto } from "../../../models";

export type boletoType = {
  titulo: string;
  descripcion: string;
  precio: number;
  cantidad: number;
};

export default function Agregar2({
  route,
  navigation,
}: {
  route: {
    params: {
      titulo: string;
      detalles: string;
      imagenes: ImagenesType;
    };
  };
  navigation: NavigationProp;
}) {
  const {
    evento: { boletos: b },
    setEvento,
  } = useEvento();
  const [priceDetails, setPriceDetails] = useState(false);

  const { height } = Dimensions.get("window");

  const [boletos, setBoletos] = useState<any[]>(
    b
      ? b
      : [
          {
            titulo: "Entrada normal",
            descripcion: "",
            precio: 400,
            cantidad: 50,
          },
        ]
  );

  function handleAddTicket() {
    setPriceDetails(false);
    setBoletos((ne) => {
      return [
        ...ne,
        {
          titulo: "",
          descripcion: "",
          precio: 400,
          cantidad: 50,
        },
      ];
    });
  }

  async function handleGuardar() {
    let err = "";
    let alerta = false;

    // Revisar que todos los boletos tengan mas de uno
    boletos.map((e) => {
      if (e.cantidad <= 0 && !err) {
        err = "Asegurate que tienes un boleto en cada tipo";
      }

      if (!e.descripcion) {
        alerta = true;
      }

      if (!e.titulo) {
        err = "Asegurate de agregar titulo a todos tus boletos";
      }
    });

    if (err) {
      Alert.alert("Error", err);
      return;
    }
    if (alerta) {
      if (
        !(await AsyncAlert(
          "Atencion",
          "Seguro que quieres continuar sin descripcion del boleto?"
        ))
      )
        return;
    }

    // Agregar los boletos al estado actual

    setEvento((prev) => {
      let after = { ...prev };
      after.boletos = [...boletos];
      return after;
    });

    navigation.navigate("Agregar4");
  }

  function handleChangeQuantity(minus: boolean, cambio: number, index: number) {
    setBoletos((prev) => {
      let cantidad = prev[index].cantidad;
      if (minus) {
        cantidad - cambio <= 0 ? (cambio = 0) : (cantidad -= cambio);
      } else {
        cantidad += cambio;
      }

      cantidad = cambio === 0 && minus ? 0 : redondear(cantidad, cambio);

      prev[index].cantidad = cantidad;

      return [...prev];
    });
  }

  function handleRemoveTicket(index: number) {
    let neTickets = [...boletos];
    neTickets.splice(index, 1);
    setBoletos(neTickets);
  }

  let precioTotal = 0;
  boletos.map((e) => {
    precioTotal += e.cantidad * e.precio;
  });

  function handleInfoPagos() {
    Alert.alert(
      "",
      "Por seguridad, el dinero de cada boleto comprado llega a tu cuenta hasta 7 dias despues de haber confirmado el pago"
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", minHeight: height }}>
      <HeaderAgregar step={3} />
      <View style={{ flex: 1 }}>
        <ScrollView
          onTouchStart={() => setPriceDetails(false)}
          style={styles.innerContainer}
          showsVerticalScrollIndicator={false}
        >
          {boletos.map((boleto, index) => {
            return (
              <View key={index} style={styles.itemContainer}>
                <View style={{ flexDirection: "row" }}>
                  {/* Icono de quitar boleto */}

                  <View style={styles.icon}>
                    <MaterialCommunityIcons
                      name="ticket-confirmation-outline"
                      size={24}
                      color="#fff"
                    />
                    <Text style={styles.cantidad}>x {boleto.cantidad}</Text>
                  </View>

                  {!!index && (
                    <View style={styles.removeTicketsContainer}>
                      <TouchableOpacity
                        activeOpacity={0.9}
                        style={{
                          alignItems: "center",
                          justifyContent: "center",

                          backgroundColor: "red",

                          width: "100%",
                          height: "100%",
                        }}
                        onPress={() => handleRemoveTicket(index)}
                      >
                        <Entypo name="minus" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <InputOnFocus
                    color={azulClaro}
                    style={{ flex: 1 }}
                    textStyle={{ ...styles.inputStyle, borderBottomWidth: 0.5 }}
                    value={boleto.titulo}
                    numberOfLines={1}
                    placeholder={"Titulo boleto"}
                    onChangeText={(te) => {
                      setBoletos((r) => {
                        r[index].titulo = te;
                        return [...r];
                      });
                    }}
                  />
                  <InputOnFocus
                    color={azulClaro}
                    style={{ flex: 1 }}
                    textStyle={{
                      borderTopWidth: 0.5,
                      ...styles.inputStyle,
                      color: azulOscuro + "a0",
                    }}
                    multiline={true}
                    value={boleto.descripcion}
                    numberOfLines={5}
                    placeholder={"Que incluye el boleto (opcional)"}
                    onChangeText={(te) => {
                      setBoletos((r) => {
                        r[index].descripcion = te;
                        return [...r];
                      });
                    }}
                  />
                </View>
                <View>
                  <PlusMinus
                    handleOperation={(minus: boolean, quantity: number) =>
                      handleChangeQuantity(minus, quantity, index)
                    }
                  />
                  <Selector
                    value={boleto.precio}
                    cambio={50}
                    onChangeValue={(n) => {
                      n = n < minEventPrice ? minEventPrice : n;
                      n = n > maxEventPrice ? maxEventPrice : n;

                      let b = [...boletos];
                      b[index].precio = n;

                      setBoletos(b);
                    }}
                    style={{
                      marginHorizontal: 10,
                    }}
                  />
                </View>
              </View>
            );
          })}

          <TouchableOpacity onPress={handleAddTicket}>
            <Text style={styles.addTxt}>+ Agregar mas precios</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View
        style={{
          ...shadowMarcada,
          backgroundColor: azulFondo,
        }}
      >
        {/* Detalle de precio al presionar */}

        <View>
          <ScrollView
            style={{ maxHeight: 170 }}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              style={styles.footerTextContainer}
              onPress={() => setPriceDetails(!priceDetails)}
              activeOpacity={0.4}
            >
              {!priceDetails && (
                <Entypo
                  style={{ alignSelf: "center" }}
                  name="dots-three-horizontal"
                  size={24}
                  color="#777"
                />
              )}

              {/* Total evento lleno */}
              {priceDetails && (
                <>
                  <View
                    style={{
                      marginBottom: 5,
                    }}
                  >
                    {boletos.map((e, index) => {
                      return (
                        <TextMonney
                          key={index}
                          cantidad={e.cantidad * e.precio}
                          titulo={
                            (e.titulo ? e.titulo : "Tipo " + (index + 1)) +
                            " (x " +
                            e.cantidad +
                            ")"
                          }
                        />
                      );
                    })}
                  </View>
                  {/* <TextMonney cantidad={comision} titulo={"Comisiones"} minus /> */}

                  <Line />
                </>
              )}

              {/* Total evento lleno */}
              <TextMonney
                bold
                cantidad={precioTotal}
                titulo={"Total evento lleno"}
              />
            </TouchableOpacity>
          </ScrollView>
          <Text style={styles.infoTxt}>
            El dinero se envia 7 dias despues de recibido
            <Text onPress={handleInfoPagos} style={styles.masInfo}>
              {" "}
              mas info
            </Text>
          </Text>
        </View>

        <Boton
          style={{ margin: 20 }}
          titulo="Continuar"
          onPress={handleGuardar}
          color={azulClaro}
        />
      </View>
    </View>
  );
}

function TextMonney({
  titulo,
  cantidad,
  minus,
  bold,
}: {
  titulo: string;
  cantidad: number;
  minus?: boolean;
  bold?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
      }}
    >
      <Text
        style={{
          ...styles.footerText,
          fontWeight: bold ? "bold" : "normal",
          flex: 1,
          marginRight: 20,
        }}
      >
        {titulo}
      </Text>
      <Text
        style={{
          ...styles.footerText,
          color: bold ? "#777" : "#888d",
        }}
      >
        {minus && "- "}
        {formatMoney(cantidad)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    padding: 20,
  },

  inputStyle: {
    padding: 5,
    fontSize: 16,
    paddingLeft: 10,
    color: azulOscuro,
  },

  icon: {
    backgroundColor: azulClaro,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  addTxt: {
    color: azulClaro,
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 40,
  },
  removeTicketsContainer: {
    position: "absolute",
    top: 0,
    left: 0,

    width: "100%",
    height: 40,
  },
  itemContainer: {
    flexDirection: "row",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 20,
  },
  cantidad: {
    color: "#fff",
    marginTop: 5,
  },

  footerTextContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  footerText: {
    fontSize: 16,
    marginVertical: 2,
  },

  infoTxt: {
    paddingHorizontal: 20,
    paddingTop: 5,
    textAlign: "center",
  },

  masInfo: {
    color: azulClaro,
  },
});
