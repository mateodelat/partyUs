import { Animated, StyleSheet, Text, View } from "react-native";
import React from "react";
import Logo from "./Logo";

export default function () {
  return (
    <View style={styles.container}>
      <Logo size={200} />

      {/* Bolita animada */}
      {/* <Animated.View
        style={{
          ...styles.bolita,
        }}
      ></Animated.View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  bolita: {
    position: "absolute",

    backgroundColor: "#000",

    width: 120,
    height: 120,
    borderRadius: 120,
  },
});
