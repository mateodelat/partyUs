import {
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputEndEditingEventData,
  View,
} from "react-native";
import React, { Dispatch, SetStateAction } from "react";

import { Feather } from "@expo/vector-icons";

export default function ({
  value,
  setValue,
  onEndEditing,
}: {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  onEndEditing: (e: string) => void;
}) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
      }}
    >
      <TextInput
        style={styles.textInput}
        value={value}
        onEndEditing={({ nativeEvent: { text } }) => {
          onEndEditing(text);
        }}
        onChangeText={setValue}
        placeholderTextColor={"#bfbfbf"}
        placeholder={"Buscar"}
      />

      <Feather style={styles.icon} name="search" size={25} color="#bfbfbf" />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    position: "absolute",
    left: 10,
  },

  textInput: {
    backgroundColor: "#f7f7f7",

    borderRadius: 10,
    padding: 10,
    paddingLeft: 40,
  },
});
