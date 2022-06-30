import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import React from "react";

export default function ({
  titulo,
  subTitulo,
  style,
  textStyle,
}: {
  titulo: string;
  subTitulo: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}) {
  return (
    <View style={style}>
      <Text style={[styles.bigTxt, textStyle]}>{titulo}</Text>
      <Text style={[styles.info, textStyle]}>{subTitulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bigTxt: {
    fontSize: 30,
    fontWeight: "bold",
  },

  info: {
    fontSize: 16,
    marginTop: 10,
    color: "#888",
  },
});
