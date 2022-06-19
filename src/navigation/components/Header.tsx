import { ColorValue, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { ParamListBase } from "@react-navigation/native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function ({
  title,
  handleBack,
  navigation,
  color,
}: {
  title?: string | null;
  navigation: StackNavigationProp<ParamListBase, string, undefined>;
  handleBack?: undefined | (() => any);
  color?: ColorValue;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: color ? color : "#fff",
      }}
    >
      <Pressable
        onPress={() => (handleBack ? handleBack() : navigation.pop())}
        style={{ ...styles.backContainer }}
      >
        <AntDesign
          style={styles.backIcon}
          name="left"
          size={30}
          color="black"
        />
        <Text
          style={{
            ...styles.backText,
            textAlign: title ? "center" : "left",
            paddingLeft: title ? 0 : 35,
          }}
        >
          {title ? title : "Atras"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  backText: {
    // textAlign: "center",
    fontSize: 20,
    paddingLeft: 35,
    flex: 1,
  },

  backContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 5,
    paddingBottom: 10,
    width: "100%",
  },

  backIcon: {
    position: "absolute",
    left: 5,
    top: 5,
  },
});
