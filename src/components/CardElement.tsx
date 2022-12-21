import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import React from "react";
import { cardType } from "../../types/openpay";
import { rojoClaro, shadowMedia } from "../../constants";

import { Entypo } from "@expo/vector-icons";
import { saveParams } from "./CardInput";

export default function ({
  tarjeta,
  onPress,
  selected,
  style,
}: {
  tarjeta: saveParams;
  onPress: () => void;
  style: ViewStyle;
  selected: boolean;
}) {
  if (!tarjeta.number) {
    return <View />;
  }
  const l = tarjeta.number.length;
  let last4 = tarjeta.number.slice(l - 4, l);

  return (
    <Pressable onPress={onPress} style={{ ...styles.container, ...style }}>
      <View style={styles.iconoIzquierda}>
        <Image
          style={{
            height: 30,
            resizeMode: "contain",
            width: 40,
          }}
          source={
            tarjeta.icon
              ? tarjeta.icon
              : require("../../assets/icons/stp_card_undefined.png")
          }
        />
      </View>

      {/* Numero de la tarjeta y tarjetahabiente */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            ...styles.titulo,
            color: selected ? "#222" : "#aaa",
          }}
        >
          **** **** **** {last4.toUpperCase()}
        </Text>
        {tarjeta.name && (
          <Text
            style={{
              ...styles.tarjetahabiente,
              color: selected ? "#777" : "#ddd",
            }}
          >
            {tarjeta.name?.toUpperCase()}
          </Text>
        )}
      </View>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: 30,
          height: 30,
        }}
      >
        {selected && <Entypo name="check" size={30} color={rojoClaro} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",

    ...shadowMedia,

    padding: 15,
    margin: 5,
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
