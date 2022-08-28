import { StyleSheet, Text, View } from "react-native";
import React from "react";

import { Ionicons } from "@expo/vector-icons";
import { azulClaro } from "../../constants";

export default function EmptyProfile() {
  return (
    <View style={styles.container}>
      <Ionicons name="person" size={35} color="#333" style={styles.icon} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 42,
    height: 42,

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
