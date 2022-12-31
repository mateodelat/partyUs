import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
} from "react-native";
import { Camera, CameraCapturedPicture, CameraType } from "expo-camera";
import Boton from "./Boton";
import { azulClaro, getBase64FromUrl, matchWholeWord } from "../../constants";

import * as Device from "expo-device";

import { Feather } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";

import ImageViewer from "react-native-image-zoom-viewer";
import { stringAfecha } from "../screens/SolicitudOrganizador/components/functions";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function App({
  onTakePicture,
  isPassport,
}: {
  onTakePicture: (props: CameraCapturedPicture) => any;
  isPassport?: boolean;
}) {
  const [hasPermission, setHasPermission] = useState<null | Boolean>(null);
  const [isloaded, setIsloaded] = useState(false);

  const [takenImage, setTakenImage] = useState<CameraCapturedPicture | null>(
    null
  );

  const cameraRef = useRef<Camera>(null);

  const { width, height } = Dimensions.get("window");

  const { top } = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  function handleCancelImage() {
    setTakenImage(null);
  }

  function handleDoneImage() {
    if (takenImage) {
      onTakePicture(takenImage);
      setTakenImage(null);
    } else {
      Alert.alert("Error", "No se pudo guardar la imagen");
    }
  }

  async function simulateImg() {
    const base64 = await getBase64FromUrl(
      !isPassport
        ? "https://cdn.forbes.com.mx/2019/06/INE.jpg"
        : "https://www.immihelp.com/assets/article-images/sample-usa-passport.jpg"
    );

    setTakenImage({
      uri: !isPassport
        ? "https://cdn.forbes.com.mx/2019/06/INE.jpg"
        : "https://www.immihelp.com/assets/article-images/sample-usa-passport.jpg",
      width: 0,
      height: 0,
      base64: base64 ? base64 : undefined,
    });
  }

  async function handleTakePicture() {
    try {
      // Si es emulator, simular imagen

      if (!Device.isDevice) {
        simulateImg();
        return;
      }

      cameraRef.current
        ?.takePictureAsync({ base64: true, quality: 0.6 })
        .then(async (r) => {
          console.log("Image taken");

          setTakenImage(r);
        })
        .catch(async (err: string) => {});
    } catch (error) {
      simulateImg();
      Alert.alert(
        "Error",
        "Ocurrio un error tomando la foto, usando imagen test"
      );
      console.log(error);
    }
  }

  return (
    <View>
      <Camera
        ref={cameraRef}
        ratio={"4:3"}
        onCameraReady={() => setIsloaded(true)}
        style={styles.camera}
      />

      <View
        style={{
          width: "100%",
          height: "100%",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            left: -width / 2,
            right: -width / 2,
            bottom: 40,

            borderWidth: width / 2 + 20,
            opacity: 0.8,
          }}
        >
          <View
            style={{
              width: width - 40,
              height: "100%",
              borderWidth: 1,
              borderColor: "#fff",
            }}
          />
        </View>

        <View
          style={{
            padding: 20,
            backgroundColor: "#fff",
          }}
        >
          <Boton
            onPress={handleTakePicture}
            style={styles.buttonContainer}
            titulo="Tomar foto"
          />
        </View>
      </View>

      {/* Confirmar la imagen */}
      <Modal
        animationType="none"
        transparent={true}
        visible={!!takenImage?.uri}
        onRequestClose={() => {
          setTakenImage(null);
        }}
      >
        <View style={styles.imageViewerContainer}>
          <ImageViewer
            renderHeader={() => <View />}
            onSwipeDown={() => setTakenImage(null)}
            renderIndicator={() => <View />}
            enableSwipeDown={true}
            backgroundColor={"#fff"}
            imageUrls={[{ url: takenImage?.uri ? takenImage.uri : "" }]}
          />
          {/* Texto de confirmar o cancelar imagen */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              position: "absolute",
              width: "100%",
            }}
          >
            <Entypo
              onPress={handleCancelImage}
              style={styles.icon}
              name="cross"
              size={40}
              color={azulClaro}
            />

            <Feather
              onPress={handleDoneImage}
              style={styles.icon}
              name="check"
              size={40}
              color={azulClaro}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    aspectRatio: 3 / 4,
    position: "absolute",
    width: "100%",
    backgroundColor: "green",
  },
  buttonContainer: {
    backgroundColor: azulClaro,
  },

  imageViewerContainer: {
    flex: 1,
  },

  icon: {
    padding: 20,
  },
});
