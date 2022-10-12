import React, { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { AntDesign } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";

import { TipoNotificacion } from "../../../models";
import moment from "moment";
import { azulClaro } from "../../../../constants";

const sizeIcon = 30;
const Icon = ({ tipo }: { tipo: TipoNotificacion }) => {
  switch (tipo) {
    case TipoNotificacion.RESERVAEFECTIVOCREADA:
      return (
        <FontAwesome5 name="calendar-check" size={sizeIcon} color={"black"} />
      );

    case TipoNotificacion.RESERVAEFECTIVOPAGADA:
      return (
        <FontAwesome5 name="hand-holding-usd" size={sizeIcon} color={"black"} />
      );

    case TipoNotificacion.RESERVATARJETACREADA:
      return (
        <FontAwesome5 name="calendar-check" size={sizeIcon} color={"black"} />
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

export default ({
  titulo,
  descripcion,
  tiempo: time,
  onPress,
  leido,
  tipo,
}) => {
  const [tiempo, setTiempo] = useState(() => moment(time).from(moment()));

  useEffect(() => {
    const i = setInterval(() => {
      setTiempo(() => moment(time).from(moment()));
    }, 1000);

    return () => {
      clearTimeout(i);
    };
  }, [tiempo]);
  return (
    <Pressable
      onPress={onPress}
      style={{
        ...styles.container,
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
          style={{ flexDirection: "row", alignItems: "center", marginLeft: 10 }}
        >
          <AntDesign name="clockcircle" size={15} color="gray" />

          <Text style={styles.tiempo}>{tiempo}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
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
