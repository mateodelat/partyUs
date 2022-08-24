import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useRef } from "react";
import Header from "../../../navigation/components/Header";
import { EventoType } from "../Home";
import { NavigationProp } from "../../../shared/interfaces/navigation.interface";
import HeaderDetalleEvento from "../../../components/HeaderDetalleEvento";

export default function ({
  route,
  navigation,
}: {
  route: { params: EventoType };
  navigation: NavigationProp;
}) {
  let { titulo } = route.params;
  titulo = titulo ? titulo : "Detalles evento";

  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        style={styles.container}
      >
        <View style={styles.innerContainer}>
          <Text>index</Text>
        </View>
      </Animated.ScrollView>
      <HeaderDetalleEvento scrollY={scrollY} titulo={titulo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  innerContainer: {
    padding: 20,
    backgroundColor: "red",
    height: 4000,
  },
});
