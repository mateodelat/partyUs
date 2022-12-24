import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";
import { azulClaro } from "../../../../constants";

export default function ({
  titulo,
  subTitulo,
  style,
  textStyle,
  done,
}: {
  titulo: string;
  subTitulo?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  done?: boolean;
}) {
  return (
    <View style={{ ...style, alignItems: "center" }}>
      {done && (
        <AntDesign
          style={styles.iconStyle}
          name="checkcircleo"
          size={50}
          color={azulClaro}
        />
      )}
      <Text style={[styles.bigTxt, textStyle]}>{titulo}</Text>
      <Text style={[styles.info, textStyle]}>{subTitulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bigTxt: {
    fontSize: 30,
    fontWeight: "bold",
  },

  info: {
    fontSize: 16,
    marginTop: 10,
    color: "#888",
  },
  iconStyle: { marginBottom: 40 },
});
