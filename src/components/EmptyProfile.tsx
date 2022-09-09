import { StyleSheet, Text, View } from "react-native";
import React from "react";

import { Ionicons } from "@expo/vector-icons";
import { azulClaro } from "../../constants";

export default function EmptyProfile({ size }: { size?: number }) {
  size = size ? size : 42;
  return (
    <View style={{ ...styles.container, width: size }}>
      <Ionicons
        name="person"
        size={size - 7}
        color="#333"
        style={styles.icon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 42,

    aspectRatio: 1,

    borderRadius: 40,
    borderWidth: 2,

    borderColor: "#333",

    overflow: "hidden",

    alignItems: "center",
  },

  icon: {
    bottom: -6,
    position: "absolute",
  },
});
