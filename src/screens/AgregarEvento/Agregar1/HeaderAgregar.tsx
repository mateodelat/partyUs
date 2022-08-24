import {
  ColorValue,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeaderBarIndicator from "../../../components/HeaderBarIndicator";
import { azulClaro } from "../../../../constants";

export default function ({
  editing,
  step,
  handleDelete,
  handleDone,
  handleBack,
}: {
  editing?: boolean;
  handleDelete?: () => void;
  handleDone?: () => void;
  handleBack?: () => void;
  step: number;
}) {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation<any>();

  const title = editing ? "" : "Agregar evento";

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: "#fff",
        paddingBottom: 10,
      }}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.backText}>{title}</Text>

        {editing ? (
          <Feather
            onPress={handleDelete}
            name={"trash-2"}
            style={{ ...styles.backIcon, left: 10 }}
            size={30}
            color={azulClaro}
          />
        ) : (
          <AntDesign
            onPress={handleBack ? handleBack : () => navigation.pop()}
            style={styles.backIcon}
            name="left"
            size={30}
            color={azulClaro}
          />
        )}

        {editing && (
          <Feather
            onPress={handleDone}
            name={"check"}
            style={{ position: "absolute", right: 15, top: 5 }}
            size={30}
            color={azulClaro}
          />
        )}
      </View>
      <View
        style={{
          marginHorizontal: 30,
          marginTop: 10,
        }}
      >
        <HeaderBarIndicator step={step} totalSteps={4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
    flex: 1,
  },

  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 5,
    paddingBottom: 10,
    width: "100%",
    marginBottom: 0,
  },

  backIcon: {
    position: "absolute",
    left: 5,
    top: 5,
  },
});
