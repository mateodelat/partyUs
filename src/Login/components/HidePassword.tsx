import { StyleSheet, Text, View } from "react-native";
import React from "react";

export default function ({
  setHidePassword,
  hidePassword,
}: {
  setHidePassword: (b: boolean) => any;
  hidePassword: boolean;
}) {
  return (
    <Text
      onPress={() => setHidePassword(!hidePassword)}
      style={styles.hidePasswordTxt}
    >
      {hidePassword ? "Mostrar" : "Ocultar"}
    </Text>
  );
}

const styles = StyleSheet.create({
  hidePasswordTxt: {
    color: "#a0a0a0",
    position: "absolute",
    bottom: 20,
    right: 0,
    backgroundColor: "#fff",
    paddingLeft: 10,
  },
});
