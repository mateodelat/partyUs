import { StyleSheet, Text, View, ViewStyle } from "react-native";
import React from "react";

export default function ({ style }: { style?: ViewStyle }) {
  return <View style={[styles.triangle, style]} />;
}
const styles = StyleSheet.create({
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 50,
    borderRightWidth: 50,
    borderBottomWidth: 200,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "red",
  },
});
