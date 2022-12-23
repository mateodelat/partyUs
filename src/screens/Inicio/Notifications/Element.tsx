import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { AntDesign } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";

import { TipoNotificacion } from "../../../models";
import moment from "moment";
import {
  azulClaro,
  rojoClaro,
  shadowBaja,
  vibrar,
  VibrationType,
} from "../../../../constants";
import { Swipeable } from "react-native-gesture-handler";

const sizeIcon = 30;
const Icon = ({ tipo }: { tipo: TipoNotificacion }) => {
  switch (tipo) {
    case TipoNotificacion.RESERVAEFECTIVOCREADA:
    case TipoNotificacion.RESERVATARJETACREADA:
      return (
        <View style={styles.center}>
          <FontAwesome5 name="calendar" size={sizeIcon} color={"black"} />
          <FontAwesome
            name="check"
            size={16}
            style={{
              position: "absolute",
              top: 11,
            }}
            color={rojoClaro}
          />
        </View>
      );

    case TipoNotificacion.RESERVAEFECTIVOPAGADA:
      return (
        <FontAwesome5 name="hand-holding-usd" size={sizeIcon} color={"black"} />
      );

    case TipoNotificacion.RECORDATORIOPAGO:
      return <Feather name="clock" size={sizeIcon} color={"black"} />;

    case TipoNotificacion.RECORDATORIOEVENTO:
      return (
        <MaterialCommunityIcons
          name="bell-ring-outline"
          size={sizeIcon + 5}
          color="black"
        />
      );

    case TipoNotificacion.RECORDATORIOPAGO:
      return <Feather name="clock" size={sizeIcon} color={"black"} />;

    case TipoNotificacion.CALIFICAUSUARIO:
      return (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Feather name="user-check" size={sizeIcon} color="black" />
        </View>
      );

    case TipoNotificacion.ADMIN:
      return (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <MaterialCommunityIcons name="shield-edit" size={30} color="black" />
        </View>
      );

    default:
      return (
        <Image
          style={{ flex: 1, width: "100%", height: "100%" }}
          source={require("../../../../assets/IMG/Logo512.png")}
        />
      );
  }
};

export default function Element({
  titulo,
  descripcion,
  tiempo: time,
  onPress,
  leido,
  tipo,
  handleDeleteItem,
}) {
  const [tiempo, setTiempo] = useState(() => moment(time).from(moment()));
  let scrollX = useRef(new Animated.Value(0));

  useEffect(() => {
    const i = setInterval(() => {
      setTiempo(() => moment(time).from(moment()));
    }, 1000);

    return () => {
      clearTimeout(i);
      scrollX.current?.removeAllListeners();
    };
  }, [tiempo]);

  const { width } = Dimensions.get("screen");

  const dismissing = useRef(false);

  const widthDismiss = 100;

  return (
    <Swipeable
      onEnded={(r) => {
        if (dismissing.current) {
          // Animar hasta el final
          handleDeleteItem();
        }
      }}
      rightThreshold={widthDismiss}
      renderRightActions={(...props) => {
        scrollX.current = props[1];
        scrollX.current.addListener((e) => {
          // Si se pasa de 100 y no se ha visualizado hacer el dismising a true
          if (e.value < -widthDismiss && !dismissing.current) {
            vibrar(VibrationType.medium);
            dismissing.current = true;

            // Si se regresa resetar
          } else if (e.value > -widthDismiss && dismissing.current) {
            vibrar(VibrationType.medium);
            dismissing.current = false;
          }
        });

        return (
          <Animated.View
            style={{
              justifyContent: "center",
              width,
              height: 10,
            }}
          />
        );
      }}
    >
      <View style={styles.container}>
        <Pressable
          onPress={onPress}
          style={{
            flexDirection: "row",
            opacity: leido ? 0.4 : 1,
          }}
        >
          {/* Puntito de notificacion */}

          {/* Imagen de notificacion */}
          <View style={styles.image}>
            <Icon tipo={tipo} />
          </View>

          {/* Textos */}
          <View style={styles.textos}>
            <View style={{ flex: 1 }}>
              <Text style={styles.titulo} numberOfLines={1}>
                {titulo}
              </Text>
              <Text numberOfLines={5} style={styles.descripcion}>
                {descripcion}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 10,
              }}
            >
              <AntDesign name="clockcircle" size={15} color="gray" />

              <Text style={styles.tiempo}>{tiempo}</Text>
            </View>
          </View>
        </Pressable>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    backgroundColor: "#fff",
    padding: 20,
    margin: 20,

    ...shadowBaja,
  },

  image: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 60,
    marginRight: 10,
    backgroundColor: "#fff",
  },

  textos: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },

  titulo: {
    fontWeight: "bold",
  },

  descripcion: {
    fontSize: 11,
    lineHeight: 13,
  },

  tiempo: {
    fontSize: 10,
    marginLeft: 4,
  },

  unread: {
    backgroundColor: azulClaro,
    height: 6,
    width: 6,
    position: "absolute",
    left: 5,
    borderRadius: 10,
  },
});
