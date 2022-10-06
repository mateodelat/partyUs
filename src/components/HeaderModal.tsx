import { StyleSheet, Text, View, TextStyle } from "react-native";
import React from "react";

import { Feather } from "@expo/vector-icons";
import { azulClaro } from "../../constants";
export default function ({
  titulo,
  onPress,
  textStyle,
  color,
  RightIcon,
}: {
  titulo: string;
  onPress: () => void;
  textStyle?: TextStyle;
  color?: string;
  RightIcon?: React.FunctionComponent;
}) {
  color = color ? color : azulClaro;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        paddingTop: 5,
      }}
    >
      <Text style={[styles.titleModal, { color }, textStyle]}>{titulo}</Text>
      <Feather
        style={styles.backIcon}
        name="x"
        size={30}
        color={color}
        onPress={onPress}
      />
      {RightIcon && <RightIcon />}
    </View>
  );
}

const styles = StyleSheet.create({
  titleModal: {
    fontSize: 18,
    color: azulClaro,

    top: 5,
  },

  backIcon: {
    padding: 5,
    top: 5,
    left: 2,
    position: "absolute",
  },
});
