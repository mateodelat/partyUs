import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import React, { useState } from "react";
import { azulFondo, formatMoney, redondear } from "../../constants";

import { Entypo } from "@expo/vector-icons";

export default function ({
  style,
  value,
  cambio,

  onChangeValue,
}: {
  value: number;
  style?: ViewStyle;
  cambio?: number;

  onAdd?: () => void;
  onSubstract?: () => void;
  onChangeValue: (v: number) => void;
}) {
  cambio = cambio ? cambio : 1;

  function handleChangeText(ne: string) {
    const num = Number(ne.replace(/\$|\..{0,}|\,/gm, ""));
    onChangeValue(num ? num : 0);
  }

  function handleAdd() {
    cambio = cambio ? cambio : 1;
    onChangeValue(redondear(value + cambio, cambio));
  }

  function handleMinus() {
    cambio = cambio ? cambio : 1;

    onChangeValue(redondear(value > 0 ? value - cambio : 0, cambio));
  }

  return (
    <View style={{ ...styles.container, ...style }}>
      {/* Agregar */}
      <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
        <Entypo name="plus" size={20} color="#1E5A20" />
      </TouchableOpacity>
      {/* Restar */}
      <TextInput
        keyboardType="decimal-pad"
        style={styles.txt}
        value={formatMoney(value)}
        onChangeText={handleChangeText}
      />
      <TouchableOpacity onPress={handleMinus} style={styles.minusButton}>
        <Entypo name="minus" size={20} color="#700B0A" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    backgroundColor: azulFondo,
  },
  txt: {
    borderWidth: 0.5,
    borderColor: "#444",
    borderRadius: 5,

    padding: 7,
    paddingVertical: 2,
    margin: 4,

    width: 60,
    textAlign: "center",
    backgroundColor: "#fff",
  },
  addButton: {
    width: "100%",
    // backgroundColor: "#E0F5DF",

    borderRadius: 5,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,

    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },

  minusButton: {
    width: "100%",
    // backgroundColor: "#FAE5E3",

    borderRadius: 5,
    borderTopLeftRadius: 0,
    bordeTopRightRadius: 0,

    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
});
