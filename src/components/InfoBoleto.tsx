import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import React, { useState } from "react";

import {
  formatMoney,
  mayusFirstLetter,
  precioConComision,
  rojo,
  rojoClaro,
  shadowBaja,
} from "../../constants";
import { BoletoType } from "../screens/Inicio/Boletos";

import { Ionicons } from "@expo/vector-icons";

export default function ({
  item,
  style,
}: {
  item: BoletoType;
  style?: ViewStyle;
}) {
  let { titulo, descripcion, cantidad, precio, personasReservadas, quantity } =
    item;

  const [showDescripcion, setShowDescripcion] = useState(false);

  //  Si esta not show description, reemplazar \n por muchos espacios para forzar brinco de linea en number of lines
  descripcion = showDescripcion
    ? descripcion
    : descripcion.replace(
        "\n",
        "                                                                                                        "
      );

  return (
    <Pressable
      onPress={() => setShowDescripcion(!showDescripcion)}
      style={{ ...styles.boletoContainer, ...style }}
    >
      <View
        style={{
          justifyContent: "center",
          flex: 1,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.titulo} numberOfLines={1}>
            {titulo}
          </Text>
        </View>

        {!!descripcion ? (
          <Text
            style={styles.descripcion}
            numberOfLines={showDescripcion ? undefined : 1}
          >
            {mayusFirstLetter(descripcion)}
          </Text>
        ) : (
          <View style={{ marginBottom: 10 }} />
        )}
      </View>

      {/* Informacion del precio individual (sin comision) y personas reservadas */}

      {/* Precio y personas */}
      <View
        style={{
          paddingVertical: 5,
        }}
      >
        <Text style={{ flex: 1 }}>{formatMoney(precio) + " x" + quantity}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boletoContainer: {
    flex: 1,
    flexDirection: "row",

    backgroundColor: "#fff",
  },

  infoTxt: {
    backgroundColor: rojoClaro + "30",
    padding: 5,
    paddingHorizontal: 12,
    borderRadius: 10,
    color: rojoClaro,
    fontWeight: "bold",
  },

  titulo: {
    flex: 1,
    fontWeight: "bold",
    color: rojo,
  },

  descripcion: {
    color: "#777",
    marginVertical: 10,
  },

  monney: {
    fontWeight: "bold",
    fontSize: 16,
    flex: 1,
  },
});
