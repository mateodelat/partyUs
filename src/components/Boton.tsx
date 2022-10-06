import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { rojo } from "../../constants";

export default ({
  onPress,
  titulo,
  loading,
  done,
  style,
  textStyle,
  disabled,
  color,
}: {
  onPress?: (any: any) => any;
  titulo: string;
  loading?: boolean;
  done?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  color?: string;
}) => {
  if (loading !== undefined) {
    return (
      <TouchableOpacity
        disabled={disabled !== undefined ? disabled : done || loading}
        style={[{ backgroundColor: color ? color : rojo }, styles.boton, style]}
        onPress={onPress}
      >
        {loading ? (
          <ActivityIndicator color={"white"} size={"small"} />
        ) : done ? (
          <Entypo name={"check"} size={24} color={"#fff"} />
        ) : (
          <Text
            style={{
              fontSize: 16,
              color: "white",
              fontWeight: "bold",
              ...textStyle,
            }}
          >
            {titulo}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[{ backgroundColor: color ? color : rojo }, styles.boton, style]}
      onPress={onPress}
    >
      <Text
        style={{
          fontSize: 16,
          color: "white",
          fontWeight: "bold",
          ...textStyle,
        }}
      >
        {titulo}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  boton: {
    borderRadius: 3,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
