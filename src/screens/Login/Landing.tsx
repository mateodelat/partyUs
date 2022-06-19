import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useCallback, useContext, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { rojo } from "../../../constants";
import Logo from "../../components/Logo";
import AnimatedIndicator from "./components/AnimatedIndicator";
import { NavigationProp } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function Landing({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) {
  function doneViewing() {
    navigation.navigate("Register");
  }

  const [currentIdx, setCurrentIdx] = useState(0);

  const data = [
    {
      titulo: "Party us",
      descripcion: "Accede a las mejores fiestas del momento",
    },
    {
      titulo: "Justo lo que quieres",
      descripcion: "En Party us nos ajustamos a tus necesidades",
    },
    {
      titulo: "Anunciate",
      descripcion: "Organiza eventos increibles y consigue gente",
    },
  ];

  const scrollX = useRef(new Animated.Value(0)).current;

  const inputRange = [0, 1 * width, 2 * width];

  const backgroundColor = scrollX.interpolate({
    inputRange,
    outputRange: ["rgb(239, 63, 6)", "rgb(239, 42, 23)", "rgb(239, 23, 40)"],
  });

  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      style={{
        ...styles.container,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor,
      }}
    >
      {/* Logo con efecto de focus */}

      <View
        style={{
          ...styles.outCircle,
          backgroundColor: "#ffffff18",
          position: "absolute",
          top: height / 4,
        }}
      >
        <View
          style={{
            ...styles.outCircle,
            backgroundColor: "#ffffff20",
          }}
        >
          <View
            style={{
              ...styles.outCircle,
              backgroundColor: "#ffffff30",
            }}
          >
            <View style={styles.logoContainer}>
              <Logo />
            </View>
          </View>
        </View>
      </View>

      {/* Desilzable */}
      <Animated.FlatList
        data={data}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item: { titulo, descripcion } }) => {
          return (
            <Pressable onPress={doneViewing} style={styles.itemContainer}>
              <Text style={styles.titulo}>{titulo}</Text>
              <Text style={styles.descripcion}>{descripcion}</Text>
            </Pressable>
          );
        }}
      />

      {/* Footer */}
      <View style={styles.footerContainer}>
        <AnimatedIndicator scrollX={scrollX} width={width} data={data} />
        {/* <Entypo
          style={{
            position: "absolute",
            right: 20,
          }}
          name="check"
          size={24}
          color="white"
        /> */}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    borderRadius: 200,
    padding: 20,
    backgroundColor: "#fff",
  },

  outCircle: {
    padding: 20,
    borderRadius: 200,
  },

  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: rojo,
    justifyContent: "center",
  },

  itemContainer: {
    width,
    justifyContent: "flex-end",
    padding: 20,
    alignItems: "center",
    marginBottom: 50,
  },

  titulo: {
    color: "#fff",
    fontSize: 35,
    textAlign: "center",
    fontWeight: "bold",
  },

  descripcion: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },

  footerContainer: {
    width: "100%",
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    bottom: 20,
    marginTop: 20,
  },
});
