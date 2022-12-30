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
import { Feather } from "@expo/vector-icons";
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
  LeftIcon,
  showHelp,
}: {
  title?: string | null;
  handleBack?: undefined | (() => any);
  color?: ColorValue;
  textStyle?: TextStyle;
  showHelp?: boolean;
  style?: ViewStyle;
  RightIcon?: React.FunctionComponent;
  LeftIcon?: React.FunctionComponent;
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as any;

  function navigateHelp() {
    navigation.navigate("Soporte");
  }

  return (
    <View
      style={{
        paddingTop: insets.top + 20,
        backgroundColor: color ? color : "#fff",
        paddingBottom: 10,
        ...style,
      }}
    >
      <View style={{ ...styles.backContainer }}>
        {!LeftIcon ? (
          <TouchableOpacity
            style={styles.backIcon}
            onPress={() => {
              handleBack ? handleBack() : navigation?.pop();
            }}
          >
            <AntDesign name="left" size={30} color="black" />
          </TouchableOpacity>
        ) : (
          <LeftIcon />
        )}
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
        {showHelp ? (
          <TouchableOpacity onPress={navigateHelp} style={styles.helpIcon}>
            <Feather name="help-circle" size={30} color="black" />
          </TouchableOpacity>
        ) : (
          RightIcon && <RightIcon />
        )}
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
    width: "100%",
  },

  backIcon: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: 5,
    paddingRight: 40,
    zIndex: 12,
  },
  helpIcon: {
    position: "absolute",
    right: 0,
    padding: 20,
    paddingRight: 5,
  },
});
