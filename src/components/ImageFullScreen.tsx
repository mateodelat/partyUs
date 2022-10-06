import React, { Dispatch, Fragment, SetStateAction } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";

import { Entypo } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

// Funcion para ver las imagenes en pantalla completa
const ImageFullScreen = ({
  setModalVisible,
  images,
  titulo,
  initialImageIdx,
}: {
  setModalVisible: Dispatch<SetStateAction<boolean>>;
  images: string[];
  titulo?: string;
  initialImageIdx?: number;
}) => {
  const imgs = images.map((e) => ({
    url: e,
  }));

  initialImageIdx !== undefined ? initialImageIdx : 0;
  let { height, width } = Dimensions.get("screen");
  console.log(height);
  height = height > width ? height : width;

  return (
    <View
      style={{
        height,
        backgroundColor: "#000",
      }}
    >
      <StatusBar hideTransitionAnimation="none" hidden={true} />
      <ImageViewer
        index={initialImageIdx}
        renderHeader={() => <Fragment />}
        loadingRender={() => <ActivityIndicator size="large" color={"white"} />}
        enableSwipeDown={true}
        onSwipeDown={() => setModalVisible(false)}
        imageUrls={imgs}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          position: "absolute",
          width: "100%",
        }}
      >
        <Text style={styles.titulo}>{titulo}</Text>
        <Pressable onPress={() => setModalVisible(false)} style={styles.button}>
          <Entypo name="cross" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

export default ImageFullScreen;

const styles = StyleSheet.create({
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    position: "absolute",
    width: "100%",
    textAlign: "center",
  },

  button: {
    marginLeft: 20,
    padding: 6,
    alignSelf: "flex-start",
  },
});
