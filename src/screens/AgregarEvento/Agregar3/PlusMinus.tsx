import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useRef } from "react";
import { azulClaro } from "../../../../constants";

import { Entypo } from "@expo/vector-icons";

export default function ({
  handleOperation,
}: {
  handleOperation: (minus: boolean, quantity: number) => void;
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

  //   Funcion que se activa cuando se presiona una vez
  function handlePressIn(minus: boolean) {
    // Cada que se cumple el tiempo se llama otra vez la funcion
    timer.current = setTimeout(
      () => {
        handleOperation(minus, cantidad());
        handlePressIn(minus);
        numero.current++;
      },
      timer ? 100 : 400
    );
  }

  function handlePressOut(minus: boolean) {
    // Cuando se suelta se cancela la funcion del timer
    if (numero.current === 0) {
      handleOperation(minus, cantidad());
    }

    if (timer.current !== null) {
      clearTimeout(timer.current);
    }
    numero.current = 0;
    timer.current = null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPressIn={() => {
          handlePressIn(false);
        }}
        onPressOut={() => handlePressOut(false)}
        style={styles.button}
      >
        <Entypo name="plus" size={20} color="#fff" />
      </TouchableOpacity>

      <View style={styles.line} />

      <TouchableOpacity
        onPressIn={() => {
          handlePressIn(true);
        }}
        onPressOut={() => handlePressOut(true)}
        style={styles.button}
      >
        <Entypo name="minus" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: azulClaro,
    flex: 1,
    alignItems: "center",
    width: "100%",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  line: {
    height: 1,
    backgroundColor: "#fff",
    marginVertical: 5,
    width: "100%",
  },
});
