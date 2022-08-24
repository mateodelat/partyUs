import React from "react";
import { StyleSheet, Text, Pressable, View, ColorValue } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { azulClaro, azulOscuro } from "../../constants";

const RadioButton = ({
  checked,
  color,
}: {
  checked: boolean;
  color?: ColorValue;
}) => {
  color = color ? color : azulOscuro;
  return (
    <View
      style={{
        ...styles.container,
        borderColor: color,
        backgroundColor: checked ? azulClaro : "transparent",
      }}
    >
      {checked && <Entypo name="check" size={20} color={"#fff"} />}
    </View>
  );
};

export default RadioButton;

const styles = StyleSheet.create({
  container: {
    borderWidth: 0.5,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
  },
});
