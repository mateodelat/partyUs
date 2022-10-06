import React, { useState, useRef, Fragment, useEffect, LegacyRef } from "react";
import {
  Animated,
  Image,
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Modal,
} from "react-native";

import { Entypo } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import ImageFullScreen from "../../../components/ImageFullScreen";
import { StatusBar } from "expo-status-bar";

//Los 3 puntitos creados mediante views con color negro y radius para que sean circulos
const Indicator = ({
  scrollX,
  width,
  data,
  opacity,
}: {
  width: number;
  opacity: Animated.Value;
  data: { uri: string; video?: boolean }[];
  scrollX: Animated.Value;
}) => {
  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 50,
        flexDirection: "row",
        borderRadius: 10,
        opacity,
      }}
    >
      {data?.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const scale = scrollX.interpolate({
          inputRange,
          outputRange: [0.8, 1, 0.8],
          extrapolate: "clamp",
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.4, 0.8, 0.4],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={"inidicator-" + i}
            style={{
              height: 15,
              width: 15,
              borderRadius: 15,
              backgroundColor: "white",
              margin: 5,
              opacity,
              // transform: [{
              //     scale
              // }]
            }}
          ></Animated.View>
        );
      })}
    </Animated.View>
  );
};

export default ({
  scrollX,
  images,
}: {
  scrollX: Animated.Value;
  images: { uri: string }[];
}) => {
  const data = images;
  let { width, height } = Dimensions.get("screen");
  width = width < height ? width : height;

  const aspectRatio = 11 / 8;

  ////////////Indicador y ocultarlo tras cierto tiempo////////////
  const opacityIndicator = useRef(new Animated.Value(1)).current;
  var tiempoIndicator: NodeJS.Timeout;

  const [modalVisible, setModalVisible] = useState(false);
  const [initialImageIdx, setInitialImageIdx] = useState(0);

  const ocultarIndicator = () => {
    tiempoIndicator = setTimeout(() => {
      Animated.timing(opacityIndicator, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }, 1800);
  };

  useEffect(() => {
    ocultarIndicator();
  }, []);

  const [errorImagenes, setErrorImagenes] = useState(
    [...Array(data?.length ? data.length - 1 : 0).keys()].map(() => false)
  );
  const [imagesLoading, setImagesLoading] = useState(
    [...Array(data?.length ? data.length - 1 : 0).keys()].map(() => true)
  );

  /////////////VIDEO//////////////////

  const viewConfig = useRef({
    itemVisiblePercentThreshold: 10,
  });

  // Cada que se cambia de elemento
  const onViewChange = useRef((props: any) => {
    const { viewableItems } = props;
    if (viewableItems.length > 0) {
      clearTimeout(tiempoIndicator);
      opacityIndicator.setValue(1);
      ocultarIndicator();
    }
  });

  //////////MODIFICAR o VER IMAGENES/////////////////
  const handlePressImage = (index: number) => {
    let indexVideo: boolean | number;
    let indexaAbrir;

    // Logica para detectar si el elemento anterior al index a abrir es video
    indexaAbrir = index;
    indexVideo = false;
    setInitialImageIdx(
      indexVideo === false || indexVideo > indexaAbrir
        ? indexaAbrir
        : indexaAbrir - 1
    );
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar hideTransitionAnimation="none" hidden={false} />

      {!data?.length ? (
        <View
          style={{
            ...styles.imgContainer,
            width,
          }}
        ></View>
      ) : null}
      <Animated.FlatList
        data={data}
        horizontal
        scrollEventThrottle={32}
        pagingEnabled
        keyExtractor={(i, idx) => "imagen-" + String(idx)}
        //Configuracion para pausar el video si se reproducio
        viewabilityConfig={viewConfig.current}
        onViewableItemsChanged={onViewChange.current}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => {
          return (
            <View style={{ ...styles.imgContainer, width, aspectRatio }}>
              <Pressable
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() =>
                  errorImagenes[index] ? null : handlePressImage(index)
                }
              >
                {errorImagenes[index] ? (
                  <Entypo name="image" size={50} color="black" />
                ) : (
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {imagesLoading[index] && (
                      <ActivityIndicator
                        size={"large"}
                        color={"black"}
                        style={{ position: "absolute" }}
                      />
                    )}
                    <Image
                      onLoad={() => {
                        let newImagesLoading = [...imagesLoading];
                        newImagesLoading[index] = false;

                        setImagesLoading([...newImagesLoading]);
                      }}
                      onError={({ nativeEvent: { error } }) => {
                        console.log(item);
                        console.log(error);
                        let newArray = [...errorImagenes];
                        newArray[index] = true;
                        setErrorImagenes([...newArray]);
                      }}
                      source={{ uri: item.uri }}
                      style={{ resizeMode: "cover", width, aspectRatio }}
                    />
                  </View>
                )}
                <Animated.View
                  style={{
                    ...styles.fullScreen,
                    opacity: opacityIndicator,
                  }}
                >
                  <MaterialIcons
                    onPress={() => handlePressImage(index)}
                    name="fullscreen"
                    size={35}
                    color="white"
                  />
                </Animated.View>
              </Pressable>
            </View>
          );
        }}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <ImageFullScreen
          initialImageIdx={initialImageIdx}
          setModalVisible={setModalVisible}
          images={images.map((e) => e.uri)}
          titulo={"Fotos"}
        />
      </Modal>

      <Indicator
        opacity={opacityIndicator}
        data={data}
        scrollX={scrollX}
        width={width}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  //contenedor general
  container: {
    alignItems: "center",
    overflow: "hidden",
  },

  //Estilos de la imagen
  imgContainer: {
    overflow: "hidden",
    justifyContent: "center",
  },

  fullScreen: {
    bottom: 50,
    right: 20,
    position: "absolute",
  },
});
