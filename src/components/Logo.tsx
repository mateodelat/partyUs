import { Image, StyleSheet, Text, View } from "react-native";

export default function ({ size }: { size?: number }) {
  const s = size ? size : 120;

  return (
    <View>
      <Image
        source={require("../../assets/IMG/Logo512.png")}
        style={{
          width: s,
          height: s,
        }}
      />
    </View>
  );
}
