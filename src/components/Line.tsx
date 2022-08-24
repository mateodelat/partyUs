import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

const Line = ({ style }: { style?: ViewStyle }) => {
  return <View style={[styles.line, style]} />;
};

export default Line;

const styles = StyleSheet.create({
  line: {
    margin: 20,
    marginVertical: 10,

    borderTopWidth: 1,
    borderTopColor: "lightgray",
  },
});
