import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { rojo } from "../../constants";

export default ({
  onPress,
  titulo,
  loading,
  done,
  style,
  disabled,
}: {
  onPress?: () => any;
  titulo: string;
  loading?: boolean | undefined;
  done?: boolean | undefined;
  style?: ViewStyle;
  disabled?: boolean | undefined;
}) => {
  if (loading !== undefined) {
    return (
      <TouchableOpacity
        disabled={disabled !== undefined ? disabled : done || loading}
        style={[styles.boton, style]}
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
      style={[{ backgroundColor: rojo }, styles.boton, style]}
      onPress={onPress}
    >
      <Text
        style={{
          fontSize: 16,
          color: "white",
          fontWeight: "bold",
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
    backgroundColor: rojo,
  },
});
