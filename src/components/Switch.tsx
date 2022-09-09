import {
  ColorValue,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";
import React, { Dispatch, SetStateAction } from "react";
import { rojoClaro, vibrar, VibrationType } from "../../constants";

export default function ({
  color,
  enabled,
  setEnabled,

  text,

  textStyle,
  style,
}: {
  color?: ColorValue;
  enabled: boolean;
  setEnabled: Dispatch<SetStateAction<boolean>>;

  text: string;

  textStyle?: TextStyle;
  style?: ViewStyle;
}) {
  color = color ? color : rojoClaro;
  const colorFondo = color.toString() + "10";

  return (
    <Pressable
      onPress={() => {
        setEnabled(!enabled);
        vibrar(VibrationType.medium);
      }}
      style={{
        ...style,
        padding: 10,
        paddingHorizontal: 0,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Text style={textStyle ? textStyle : styles.text}>{text}</Text>
      <Switch
        trackColor={{
          true: color.toString() + "60",
          false: colorFondo,
        }}
        thumbColor={color}
        onValueChange={() => setEnabled(!enabled)}
        value={enabled}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    flex: 1,
    color: "#000",

    fontWeight: "bold",
  },
});
