import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { ScrollView } from "react-native-gesture-handler";

export default function ({ route }: { route: { params: Object } }) {
  const obj = route.params;

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <Text style={styles.txt}>{JSON.stringify(obj, null, 8)}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  txt: {
    fontSize: 16,
  },
});
