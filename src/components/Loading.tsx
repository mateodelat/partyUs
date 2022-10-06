import {
  ActivityIndicator,
  Animated,
  ColorValue,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import React from "react";
import Logo from "./Logo";

export default function ({
  indicator,
  color,
}: {
  indicator?: boolean;
  color?: ColorValue;
}) {
  color = color ? color : "#000";

  return (
    <View style={styles.container}>
      {indicator ? (
        <ActivityIndicator size={"large"} color={color} />
      ) : (
        <Logo size={200} />
      )}

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
