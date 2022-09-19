import { StyleSheet, Text, View, ViewStyle } from "react-native";
import React, { useEffect, useState } from "react";

export default function ({
  color = "#fff",
  message,
  time,
  style,
}: {
  color?: string;
  message?: string;
  time?: number;
  style: ViewStyle;
}) {
  useEffect(() => {
    setLocalMsg(message);
    time &&
      setTimeout(() => {
        setLocalMsg("");
      }, time);
  }, [message]);

  const [localMsg, setLocalMsg] = useState(message);

  return !!localMsg ? (
    <View
      style={{
        ...styles.message,
        backgroundColor: color,
        ...style,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          textAlign: "center",
          color: "#000",
          fontWeight: "bold",
        }}
      >
        {localMsg}
      </Text>
    </View>
  ) : (
    <View />
  );
}

const styles = StyleSheet.create({
  message: {
    position: "absolute",
    alignSelf: "center",
    width: "100%",
    padding: 15,
    paddingHorizontal: 5,
  },
});
