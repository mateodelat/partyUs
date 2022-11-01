import { StyleSheet, Text, View } from "react-native";

import { Entypo } from "@expo/vector-icons";

import React, { useRef } from "react";
import { rojoClaro } from "../../constants";
import { TouchableOpacity } from "react-native-gesture-handler";

const BUTTON_SIZE = 30;

export default function SimpleSelector({
  quantity,
  handleChange,

  min,
  max,
}: {
  handleChange: (minus: boolean, cantidad: number) => void;
  quantity?: number;

  min?: number;
  max?: number;
}) {
  let timer = useRef<NodeJS.Timeout | null>(null);
  let numero = useRef(0);

  function cantidad() {
    return numero.current < 10
      ? 1
      : numero.current < 15
      ? 5
      : numero.current < 20
      ? 10
      : numero.current < 25
      ? 50
      : numero.current < 30
      ? 100
      : 500;
  }

  quantity = quantity ? quantity : 0;

  min = min ? min : 0;

  const colorDisabled = rojoClaro + "55";
  const minusDisabled = quantity === min;
  const plusDisabled = quantity === max;

  //   Funcion que se activa cuando se presiona una vez
  function handlePressIn(minus: boolean) {
    // Cada que se cumple el tiempo se llama otra vez la funcion
    timer.current = setTimeout(
      () => {
        handleChange(minus, cantidad());
        handlePressIn(minus);
        numero.current++;
      },
      timer ? 100 : 400
    );
  }

  function handlePressOut(minus: boolean) {
    // Cuando se suelta se cancela la funcion del timer
    if (numero.current === 0) {
      handleChange(minus, cantidad());
    }

    if (timer.current !== null) {
      clearTimeout(timer.current);
    }
    numero.current = 0;
    timer.current = null;
  }

  return (
    <View style={{ ...styles.container }}>
      <TouchableOpacity
        style={{
          ...styles.minus,
          borderColor: minusDisabled ? colorDisabled : rojoClaro,
        }}
        activeOpacity={minusDisabled ? 1 : 0.3}
        onPressIn={() => handlePressIn(true)}
        onPressOut={() => handlePressOut(true)}
      >
        <Entypo
          name="minus"
          size={20}
          color={minusDisabled ? colorDisabled : rojoClaro}
        />
      </TouchableOpacity>

      <Text style={styles.quantity}>{quantity}</Text>

      <TouchableOpacity
        activeOpacity={plusDisabled ? 1 : 0.3}
        style={{
          ...styles.plus,
          backgroundColor: plusDisabled ? colorDisabled : rojoClaro,
        }}
        onPressIn={() => handlePressIn(false)}
        onPressOut={() => handlePressOut(false)}
      >
        <Entypo name="plus" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },

  minus: {
    alignItems: "center",
    justifyContent: "center",

    width: BUTTON_SIZE,
    aspectRatio: 1,

    borderWidth: 1,
    borderColor: rojoClaro,
    borderRadius: 4,
  },

  plus: {
    borderRadius: 4,
    backgroundColor: rojoClaro,

    alignItems: "center",
    justifyContent: "center",

    width: BUTTON_SIZE,
    aspectRatio: 1,
  },

  quantity: {
    width: 30,
    textAlign: "center",
    fontWeight: "bold",
    textAlignVertical: "center",
  },
});
