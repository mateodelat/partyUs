import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { azulClaro, azulFondo } from "../../constants";

export default function ({
  data,
}: {
  data: {
    title: string;
    onPress: () => void;
  }[];
}) {
  const [selector, setSelector] = useState(0);

  function handlePressSelector(idx: number) {
    // Llamar a la funcion asociada con ese elemento
    data[idx].onPress();

    // Poner el selector ahi
    setSelector(idx);
  }

  return (
    <View style={styles.selector}>
      {data.map((el, idx) => {
        return (
          <Pressable
            key={idx}
            onPress={() => handlePressSelector(idx)}
            style={{
              ...styles.selectorPressable,
              backgroundColor: selector === idx ? azulClaro : "transparent",
            }}
          >
            <Text
              style={{
                color: selector === idx ? "#fff" : "#000",
              }}
            >
              {el.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    padding: 5,
    borderRadius: 10,
    backgroundColor: azulFondo,
    flexDirection: "row",
    marginTop: 0,
  },

  selectorPressable: {
    padding: 10,
    borderRadius: 10,

    flex: 1,
    alignItems: "center",
  },
});
