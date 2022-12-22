import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";

import { Feather } from "@expo/vector-icons";

import sharedStyles from "../sharedStyles";
import InputOnFocus from "../../../components/InputOnFocus";
import {
  AsyncAlert,
  azulClaro,
  rojo,
  uploadImageToStripe,
} from "../../../../constants";

import { useNavigation } from "@react-navigation/native";
import HeaderAgregar from "./HeaderAgregar";
import Boton from "../../../components/Boton";
import ImageFullScreen from "../../../components/ImageFullScreen";
import ModalTipoImagen from "../../../components/ModalTipoImagen";
import uuid from "react-native-uuid";
import useEvento from "../../../Hooks/useEvento";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { logger } from "react-native-logs";
import Stripe from "stripe";

const log = logger.createLogger();

export type ImagenesType = {
  uri: string;
  key?: string;
  selected?: boolean;
  imagenPrincipal?: boolean;
}[];

enum enumModal {
  "OPENIMAGE" = "OPENIMAGE",
  "SELECTIMAGE" = "SELECTIMAGE",
}

export default function () {
  const { evento, setEvento } = useEvento();
  const id = evento.id ? evento.id : uuid.v4().toString(); // ⇨ '11edc52b-2918-4d71-9058-f7285e29d894'

  const navigation = useNavigation<any>();

  const [titulo, setTitulo] = useState("");
  const [detalles, setDetalles] = useState("");

  const [imagenes, setImagenes] = useState<ImagenesType>([]);

  const editingImages = true;

  const [imageSelected, setImageSelected] = useState<undefined | number>();

  const [modalVisible, setModalVisible] = useState(false);
  const [tipoModal, setTipoModal] = useState<enumModal>();

  function handlePressImage(index?: number, abrir?: boolean) {
    // Cambiar estado si no esta seleccionada
    if (!abrir) {
      setImagenes((o) => {
        o[index].selected = !o[index].selected;
        return [...o];
      });
    }
    // Abrir imagen si no estamos en estado de seleccion
    else {
      setModalVisible(true);
      setTipoModal(enumModal.OPENIMAGE);
      setImageSelected(index);
    }
  }

  let imagenPrincipal = imagenes
    .map((el, idx) => ({ ...el, idx }))
    .find((el) => el.imagenPrincipal);

  const oneImageSelectedIdx =
    imagenes.filter((d) => d.selected).length === 1
      ? imagenes.findIndex((e) => e.selected)
      : false;

  let imagenPrincipalIdx = imagenes.findIndex((e) => e.imagenPrincipal);
  imagenPrincipalIdx = imagenPrincipalIdx !== -1 ? imagenPrincipalIdx : 0;

  function makeMainImage() {
    if (typeof oneImageSelectedIdx !== "number") return;

    setImagenes((ne) => {
      // Limpiar la imagen principal vieja
      ne = ne.map((e) => ({
        ...e,
        selected: false,
        imagenPrincipal: false,
      }));

      // Asignar nueva imagen principal a la selecionada
      ne[oneImageSelectedIdx].imagenPrincipal = true;

      return [...ne];
    });
  }

  function handleDeleteImages() {
    // Si no hay elementos seleccionados devolver
    if (!imagenes.find((s) => s.selected)) {
      Alert.alert("Error", "Selecciona una imagen a borrar");
      return;
    }
    setImagenes((old) => {
      // Filtrar solo por imagenes seleccionadas
      old = old
        .filter((e) => {
          if (!e.selected) return true;
          else {
            return false;
          }
        })
        .map((el, idx) => {
          // Hacer imagen principal el primer elemento

          if (!idx) {
            return {
              ...el,
              imagenPrincipal: true,
            };
          } else {
            return {
              ...el,
              imagenPrincipal: false,
            };
          }
        });

      return old;
    });
  }

  async function handleContinuar() {
    // Validaciones

    // Si no hay titulo devolver
    if (!titulo) {
      Alert.alert("Error", "Introduce el titulo de tu evento");
      return;
    }

    // Si no hay imagenes devolver un errror
    if (imagenes.length === 0) {
      Alert.alert("Error", "Debes agregar aunque sea una imagen de tu evento");
      return;
    }

    let imgs = [...imagenes].map((r) => {
      // Borrar esa propiedad
      delete r.selected;
      return r;
    });

    // Si no hay imagen principal explicita asignarsela a la primera
    if (!imagenes.find((im) => im.imagenPrincipal)) {
      imgs[0].imagenPrincipal = true;
    }

    const mainImageUri = imagenes.find((im) => im.imagenPrincipal).uri;

    // Actualizar estado
    setEvento((prev: any) => {
      return {
        ...prev,
        id: id,
        titulo,

        // Subir imagen principal de producto a stripe como promesa y asignarla
        stripeFileImagenPrincipal: uploadImageToStripe({
          uri: mainImageUri,
          purpose: "product_image",
          name: "Img evento:" + id,
          getLink: true,
        }).then((r) => {
          return r.url;
        }),

        imagenes: imgs as {
          imagenPrincipal: boolean;
          uri: string;
          key: string;
        }[],
        detalles,
      };
    });

    navigation.navigate("Agregar2");
  }

  function handleAddImage(img: { uri: string; key?: string }) {
    setImagenes((ne) => {
      ne = [
        ...ne,

        {
          uri: img.uri,
          selected: false,
          key: img.key,
        },
      ];
      return ne;
    });
  }

  function handlePressAdd() {
    setModalVisible(true);
    setTipoModal(enumModal.SELECTIMAGE);
  }

  const { height } = Dimensions.get("window");

  const { top, bottom } = useSafeAreaInsets();

  return (
    <View style={{ backgroundColor: "#fff", flex: 1, minHeight: height }}>
      <HeaderAgregar
        step={1}
        handleDelete={handleDeleteImages}
        handleBack={() => {
          if (evento) {
            AsyncAlert(
              "Atencion",
              "Todo el progreso se perdera, quieres continuar??"
            ).then((r) => {
              r && navigation.pop();
            });
          } else {
            navigation.pop();
          }
        }}
        editing={!!imagenes.length}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={sharedStyles.container}
      >
        <InputOnFocus
          color={azulClaro}
          style={styles.inputContainer}
          titulo={"Titulo"}
          value={titulo}
          maxLength={30}
          onChangeText={setTitulo}
        />

        <InputOnFocus
          color={azulClaro}
          style={styles.inputContainer}
          titulo={"Detalles"}
          value={detalles}
          onChangeText={setDetalles}
          multiline
        />

        <View style={styles.imagesContainer}>
          <Text
            style={{
              color: "#888",
              marginBottom: 5,
            }}
          >
            IMAGENES
          </Text>

          {imagenes.length !== 0 ? (
            <View style={styles.mainImageContainer}>
              {/* Si se selecciona solo una imagen entonces permitir establecerla como imagen de fondo */}
              {oneImageSelectedIdx !== false ? (
                <Pressable
                  onPress={makeMainImage}
                  style={{
                    flex: 1,
                  }}
                >
                  <Image
                    blurRadius={2}
                    style={{ flex: 1 }}
                    source={{
                      uri: imagenes[oneImageSelectedIdx].uri,
                    }}
                  />

                  {/* Mascara oscura */}
                  <View
                    style={{
                      position: "absolute",

                      backgroundColor: "#00000044",
                      width: "100%",
                      height: "100%",
                    }}
                  />

                  <View
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 20,
                        paddingHorizontal: 20,
                        textAlign: "center",
                      }}
                    >
                      PRESIONA PARA IMAGEN PRINCIPAL
                    </Text>
                  </View>
                </Pressable>
              ) : (
                <Pressable
                  style={{ flex: 1 }}
                  onPress={() => handlePressImage(imagenPrincipalIdx, true)}
                >
                  <Image
                    style={{ flex: 1 }}
                    source={{
                      uri: imagenPrincipal
                        ? imagenPrincipal.uri
                        : imagenes[0]?.uri,
                    }}
                  />
                </Pressable>
              )}
            </View>
          ) : (
            <Pressable onPress={handlePressAdd} style={styles.noImageContainer}>
              <Feather name="upload" size={24} color={azulClaro} />
              <Text style={{ color: azulClaro, marginTop: 5 }}>Subir</Text>
            </Pressable>
          )}

          {imagenes.length !== 0 && (
            <FlatList
              horizontal
              data={[
                ...imagenes,
                {
                  uri: "ADD",
                  selected: false,
                },
              ]}
              style={styles.rowImages}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, idx) => idx.toString()}
              renderItem={({ item: { uri, selected }, index }) => {
                const add = uri === "ADD";

                if (add) {
                  return (
                    <Pressable
                      onPress={handlePressAdd}
                      style={{
                        height: 100,
                        aspectRatio: 1,
                        marginLeft: index ? 20 : 0,

                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: azulClaro,
                          fontSize: 40,
                        }}
                      >
                        +
                      </Text>
                    </Pressable>
                  );
                }

                return (
                  // Seleccionar la imagen al hacer click
                  <Pressable
                    onPress={() => handlePressImage(index)}
                    style={{
                      height: 100,
                      aspectRatio: 1,
                      marginLeft: index ? 20 : 0,
                    }}
                  >
                    <Image
                      style={{ ...styles.imageItem }}
                      source={{
                        uri,
                      }}
                    />

                    {/* Boton de seleccion */}
                    {editingImages && (
                      <>
                        <View
                          style={{
                            position: "absolute",
                            borderRadius: 50,
                            alignItems: "center",
                            justifyContent: "center",
                            top: 5,
                            left: 5,
                            backgroundColor: "#ffffff",
                          }}
                        >
                          <View
                            style={{
                              borderRadius: 40,
                              margin: 4,

                              width: 12,
                              height: 12,

                              backgroundColor: selected ? rojo : "transparent",
                            }}
                          />
                        </View>
                      </>
                    )}
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </ScrollView>

      <View style={{ margin: 20, marginBottom: bottom ? bottom : 20 }}>
        <Boton titulo="Continuar" onPress={handleContinuar} color={azulClaro} />
      </View>

      {/* Renderizar el modal de la imagen si se hace click */}
      <Modal
        animationType={tipoModal === enumModal.SELECTIMAGE ? "none" : "slide"}
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        {tipoModal === "OPENIMAGE" ? (
          <ImageFullScreen
            images={imagenes.map((e) => e.uri)}
            setModalVisible={setModalVisible}
            initialImageIdx={imageSelected}
            top={top}
          />
        ) : (
          <ModalTipoImagen
            aspectRatio={[3, 2]}
            quality={0.5}
            setImage={handleAddImage}
            setModalVisible={setModalVisible}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },

  noImageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 16 / 9,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "lightgray",
    borderStyle: "dotted",
  },

  imagesContainer: {
    flex: 1,
    marginTop: 20,
  },

  mainImageContainer: {
    aspectRatio: 16 / 9,
    borderRadius: 10,
    overflow: "hidden",
  },

  rowImages: {
    flex: 1,
    marginTop: 20,
    marginBottom: 40,
    flexDirection: "row",
  },
  imageItem: {
    aspectRatio: 1,
    borderRadius: 10,
  },
});
