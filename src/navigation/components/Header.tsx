import {
  ColorValue,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ({
  title,
  handleBack,
  color,
  textStyle,
  style,
  RightIcon,
}: {
  title?: string | null;
  handleBack?: undefined | (() => any);
  color?: ColorValue;
  textStyle?: TextStyle;
  style?: ViewStyle;
  RightIcon?: React.FunctionComponent;
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as any;

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: color ? color : "#fff",
        paddingBottom: 10,
        ...style,
      }}
    >
      <View style={{ ...styles.backContainer }}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => {
            handleBack ? handleBack() : navigation?.pop();
          }}
        >
          <AntDesign name="left" size={30} color="black" />
        </TouchableOpacity>
        <Text
          style={{
            ...styles.backText,
            textAlign: title ? "center" : "left",
            paddingLeft: title ? 0 : 35,
            fontWeight: title ? "bold" : "normal",
            ...textStyle,
          }}
        >
          {title ? title : "Atras"}
        </Text>
        {RightIcon && <RightIcon />}
      </View>
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
    left: 0,
    top: 0,
    padding: 5,
    paddingRight: 40,
    elevation: 1,
    zIndex: 1,
  },
});
