import { ColorValue, StyleSheet, Text, View, ViewStyle } from "react-native";
import React from "react";
import { azulClaro, redondear } from "../../constants";

const bgColor = "#eee";

export default function ({
  step,
  totalSteps,
  style,

  color,
}: {
  step: number;
  style?: ViewStyle;
  totalSteps: number;
  color?: ColorValue;
}) {
  if (!color) {
    color = azulClaro;
  }

  return (
    <View style={[styles.seccionsContainer, style]}>
      {[...Array(totalSteps).keys()].map((_, idx) => {
        return (
          <View
            key={idx}
            style={{
              ...styles.line,
              backgroundColor: idx < step ? color : bgColor,
              flex: 1,
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: bgColor,
    borderRadius: 10,
  },

  seccionsContainer: {
    width: "100%",
    borderRadius: 10,
    flexDirection: "row",
  },

  line: {
    height: 3,
    borderRadius: 10,
    marginHorizontal: 5,
  },
});
