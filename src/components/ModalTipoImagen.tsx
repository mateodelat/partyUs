import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  colorFondo,
  isUrl,
  openCameraPickerAsync,
  openImagePickerAsync,
} from "../../constants";

import { Feather } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

export default function ({
  setModalVisible,
  setImage,

  // Parametros opcionales
  video,

  // Parametros para camara
  cameraEnabled,
  aspectRatio,
  quality,
}: {
  setModalVisible: Dispatch<SetStateAction<boolean>>;
  setImage: ({}: { uri: string; key?: string; link?: boolean }) => void;

  // Parametros opcionales
  video?: any;

  // Parametros para camara
  cameraEnabled?: any;
  aspectRatio?: any;
  quality?: any;
}) {
  const [innerModal, setInnerModal] = useState(false);

  const [modalType, setModalType] = useState("pick");
  const [linkImage, setLinkImage] = useState("");

  const [randomLoading, setRandomLoading] = useState(false);

  useEffect(() => {
    setInnerModal(true);
  }, []);

  function handleLinkImage() {
    setModalType("inputUrl");
  }

  async function handleDeviceImage() {
    let image = await openImagePickerAsync(!!video ? false : true, 0.9);
    if (!image) return;

    setImage(image);
    handleCloseModal();
  }

  function handleSaveLink() {
    // Verificar validez
    if (!isUrl(linkImage)) {
      Alert.alert("Error", "Escribe un link valido");
      return;
    }
    setImage({
      uri: linkImage,
      key: linkImage,
      link: true,
    });
    handleCloseModal();
  }

  function handleCloseModal() {
    setInnerModal(false);
    setModalVisible(false);
  }

  async function handleCamera() {
    const image = await openCameraPickerAsync(aspectRatio, quality);
    if (!image) return;
    setImage(image);
  }

  async function handleRandomImage() {
    setRandomLoading(true);
    await fetch("https://picsum.photos/1100/800")
      .then((r) => {
        setImage({
          uri: r.url,
          link: true,
        });
      })
      .catch((e) => {
        Alert.alert("Error", "Error obteniendo imagen, intenta otro metodo");
        console.log(e);
      })
      .finally(() => {
        setRandomLoading(false);
        handleCloseModal();
      });
  }

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={innerModal}
        onRequestClose={() => {
          setInnerModal(false);
          setModalVisible(false);
        }}
      >
        {modalType === "pick" ? (
          <>
            <Pressable onPress={handleCloseModal} style={{ flex: 1 }} />
            <View style={styles.innerContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Tipo de la imagen</Text>
                <Feather
                  onPress={handleCloseModal}
                  name="x"
                  size={30}
                  color="gray"
                />
              </View>

              {/* Imagen random de fiesta */}
              <Pressable onPress={handleRandomImage} style={styles.row}>
                <View style={styles.icon}>
                  {randomLoading ? (
                    <ActivityIndicator size={"small"} color={"black"} />
                  ) : (
                    <MaterialCommunityIcons
                      name="dice-multiple-outline"
                      size={25}
                      color="black"
                    />
                  )}
                </View>

                <Text style={styles.subTitle}>Imagen aleatoria</Text>
              </Pressable>

              {/* Imagen desde camara */}
              {cameraEnabled && (
                <Pressable onPress={handleCamera} style={styles.row}>
                  <View style={styles.icon}>
                    <Feather name="camera" size={24} color="black" />
                  </View>
                  <Text style={styles.subTitle}>Tomar foto</Text>
                </Pressable>
              )}

              {/* Link a imagen */}
              <Pressable onPress={handleLinkImage} style={styles.row}>
                <View style={styles.icon}>
                  <Entypo name="link" size={24} color="black" />
                </View>
                <Text style={styles.subTitle}>
                  {video ? "Link del video" : "Link de la imagen"}
                </Text>
              </Pressable>

              {/* Imagen desde el dispositivo */}
              <Pressable onPress={handleDeviceImage} style={styles.row}>
                <View style={styles.icon}>
                  <MaterialIcons name="phone-iphone" size={24} color="black" />
                </View>
                <Text style={styles.subTitle}>
                  Subir {video ? "video" : "imagen"} del dispositivo
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <Pressable onPress={handleCloseModal} style={{ flex: 1 }} />
            <View style={styles.innerContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Link de la imagen</Text>
                {linkImage.length === 0 ? (
                  <Feather
                    onPress={handleCloseModal}
                    name="x"
                    size={30}
                    color="gray"
                  />
                ) : (
                  <Feather
                    onPress={handleSaveLink}
                    name="check"
                    size={30}
                    color="gray"
                  />
                )}
              </View>

              {/* Link a imagen */}
              <View style={styles.row}>
                <View style={styles.icon}>
                  <Entypo name="link" size={24} color="black" />
                </View>
                <TextInput
                  value={linkImage}
                  onChangeText={setLinkImage}
                  onEndEditing={handleSaveLink}
                  placeholder={
                    video
                      ? "https://exampleVideo.mp4"
                      : "https://exampleImage.jpg"
                  }
                  style={styles.inputText}
                />
              </View>
            </View>
          </>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000cc",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  innerContainer: {
    backgroundColor: colorFondo,
    padding: 15,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  icon: {
    borderRadius: 100,
    backgroundColor: "#00000022",
    marginRight: 20,
    width: 55,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
  },

  row: {
    flexDirection: "row",
    marginVertical: 10,
    alignItems: "center",
  },

  subTitle: {
    fontSize: 18,
  },

  inputText: {
    fontSize: 18,
    padding: 10,
    backgroundColor: "#00000015",
    flex: 1,
    marginRight: 10,
    borderRadius: 7,
  },

  mas: {
    position: "absolute",
    left: 32,
    top: 13,
  },
});
