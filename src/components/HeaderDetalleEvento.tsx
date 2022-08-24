import React from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { rojoClaro } from "../../constants";

export default ({
  scrollY,
  height,
  titulo,
  handleBack,
  IconRight,
  IconLeft,
}: {
  scrollY: Animated.Value;
  height?: number;
  titulo: string;
  handleBack?: (a: any) => void;
  IconRight?: any;
  IconLeft?: any;
}) => {
  height = height ? height : Dimensions.get("window").height;

  const navigation = useNavigation<any>();

  const inputRange = [height * 0.1, height * 0.28];

  const opacity = scrollY.interpolate({
    inputRange,
    outputRange: [0, 1],
  });

  const opacityBackground = scrollY.interpolate({
    inputRange,
    outputRange: [0, 1],
  });

  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      {/* Header con animaciones de fondo y titulo */}
      {/* Filtro morado de header */}
      <Animated.View
        style={{
          position: "absolute",
          backgroundColor: rojoClaro,
          opacity: opacityBackground,
          width: "100%",
          height: insets.top ? 55 + insets.top : "100%",
        }}
      />

      <View
        style={{
          ...styles.rowJustify,
          marginTop: insets.top,
          paddingTop: insets.top ? 0 : 10,
        }}
      >
        {/* Texto animado cuando se pasa la imagen */}
        <Animated.Text
          numberOfLines={1}
          style={{
            ...styles.title,
            position: "absolute",
            width: "100%",
            alignSelf: "center",
            left: 10,
            opacity: opacity,
          }}
        >
          {titulo}
        </Animated.Text>

        {IconLeft ? (
          <IconLeft style={styles.backContainer} />
        ) : (
          <Pressable
            onPress={handleBack ? handleBack : () => navigation.pop()}
            style={styles.backContainer}
          >
            <MaterialIcons
              name={"keyboard-arrow-left"}
              size={35}
              color={rojoClaro}
            />
          </Pressable>
        )}

        {IconRight && <IconRight style={styles.backContainer} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
  },

  rowJustify: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },

  backContainer: {
    alignSelf: "flex-start",

    alignItems: "center",
    justifyContent: "center",
    width: 43,
    height: 43,
    backgroundColor: "#fff",
    borderRadius: 22,
  },

  title: {
    fontSize: 20,
    flex: 1,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
