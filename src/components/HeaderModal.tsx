import { StyleSheet, Text, View, TextStyle } from "react-native";
import React from "react";

import { Feather } from "@expo/vector-icons";
import { azulClaro } from "../../constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function ({
  titulo,
  onPress,
  textStyle,
  color,
  RightIcon,

  noInsets,
}: {
  titulo: string;
  onPress: () => void;
  textStyle?: TextStyle;
  color?: string;
  RightIcon?: React.FunctionComponent;

  noInsets?: boolean;
}) {
  color = color ? color : azulClaro;

  let { top } = useSafeAreaInsets();

  top = noInsets ? 20 : top + 20;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        paddingTop: top,
      }}
    >
      <Text style={[styles.titleModal, { color }, textStyle]}>{titulo}</Text>
      <Feather
        style={{ ...styles.backIcon, top: top }}
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
    textAlign: "center",

    top: 5,

    paddingHorizontal: 20,
  },

  backIcon: {
    padding: 5,
    top: 5,
    left: 2,
    position: "absolute",
  },
});
