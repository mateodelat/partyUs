import { Image, StyleSheet, Text, View } from "react-native";

export default function () {
  return (
    <View>
      <Image
        source={require("../../assets/IMG/Logo512.png")}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 120,
    height: 120,
  },
});
