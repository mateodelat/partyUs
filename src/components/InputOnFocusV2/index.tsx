import {
  ColorValue,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import React, { useRef, useState } from "react";
import {
  TextInputMask,
  TextInputMaskTypeProp,
  TextInputMaskOptionProp,
} from "react-native-masked-text";

import { azulClaro, rojoClaro } from "../../../constants";

interface propsType extends TextInputProps {
  titulo?: string;
  color?: ColorValue;
  textStyle?: TextStyle;
  valid?: boolean;
  type?: TextInputMaskTypeProp;
  options?: TextInputMaskOptionProp;
  RightIcon?: React.FunctionComponent<{ focused: boolean }>;
  style?: ViewStyle;
}

export default React.forwardRef(
  (
    {
      titulo,
      style,
      color,
      textStyle,
      type,
      valid,
      RightIcon,

      ...props
    }: propsType,
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    color = !color ? azulClaro : color;
    valid = valid === undefined ? true : valid;
    const textColor = valid ? "#000" : "red";

    return (
      <View
        style={{
          ...style,
          flexDirection: "row",
          alignItems: "center",
          borderColor: valid ? (focused ? color : "#ddd") : "red",
          borderWidth: 1,
          borderRadius: 10,
        }}
      >
        {type ? (
          <TextInputMask
            ref={ref as any}
            {...props}
            style={{
              ...styles.input,
              color: textColor,

              ...textStyle,
            }}
            onFocus={() => setFocused(true)}
            type={type}
            onBlur={() => setFocused(false)}
            blurOnSubmit={false}
            placeholderTextColor={"lightgray"}
          />
        ) : (
          <TextInput
            ref={ref as any}
            placeholderTextColor={"lightgray"}
            {...props}
            style={{
              ...styles.input,
              color: textColor,

              ...textStyle,
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            blurOnSubmit={false}
          />
        )}
        {titulo && (
          <Text
            style={{
              ...styles.texto,
              color: valid ? (focused ? color : "#333") : "red",
            }}
          >
            {titulo}
          </Text>
        )}
        {RightIcon && <RightIcon focused={focused} />}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  texto: {
    color: "#888",
    marginBottom: 5,
    position: "absolute",
    backgroundColor: "#fff",
    top: -10,
    left: 15,
    paddingHorizontal: 2,
    fontSize: 13,
    fontWeight: "400",
  },

  input: {
    flex: 1,
    padding: 5,
    paddingTop: 10,
    paddingLeft: 15,
  },
});
