import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Logo from "../../../components/Logo";

export default function ({ register }: { register?: boolean }) {
  return (
    <View style={styles.container}>
      <Logo />

      <View
        style={{
          marginTop: 50,
        }}
      />

      <Text style={styles.descTxt}>
        {register ? "Empieza con tu" : "Continua con tu"}
      </Text>
      <Text style={styles.loginTxt}>{register ? "Registro" : "Login"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 80,
    marginTop: 20,
  },

  descTxt: {
    fontSize: 30,
  },

  loginTxt: {
    fontWeight: "bold",
    fontSize: 45,
  },
});
