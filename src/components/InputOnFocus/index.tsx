import {
  ColorValue,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
} from "react-native";
import React, { useRef, useState } from "react";
import { azulClaro, rojoClaro } from "../../../constants";

interface propsType extends TextInputProps {
  titulo?: string;
  color?: ColorValue;
  textStyle?: TextStyle;
}

export default function ({
  titulo,
  style,
  color,
  textStyle,
  ...props
}: propsType) {
  const [focused, setFocused] = useState(false);
  color = !color ? azulClaro : color;

  return (
    <View style={style}>
      {titulo && <Text style={styles.texto}>{titulo.toUpperCase()}</Text>}
      <TextInput
        {...props}
        style={{
          ...styles.input,
          borderColor: focused ? color : "#ddd",
          borderWidth: 1,
          ...textStyle,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  texto: {
    color: "#888",
    marginBottom: 5,
  },

  input: {
    padding: 10,
    paddingLeft: 20,
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
});
