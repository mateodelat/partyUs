import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { EventoType } from "../screens/Inicio/Home";
import {
  colorFondo,
  formatAMPM,
  mayusFirstLetter,
  mesAString,
  shadowMedia,
} from "../../constants";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

const claros = "#00000055";

export default function ElementoEvento({
  data,
  onPress,
  handleLike,
  handleMore,
}: {
  data: EventoType;
  onPress: (an: any) => void;
  handleMore?: (an: any) => void;
  handleLike?: (an: any) => void;
}) {
  const imagenPrincipal = data.imagenes[data.imagenPrincipalIDX] as any;

  const fecha = new Date(data.fechaInicial ? data.fechaInicial : "error");

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={{ padding: 20, paddingBottom: 0 }}>
        <View style={{ flexDirection: "row", flex: 1 }}>
          {/* Imagen principal */}
          <Image
            style={styles.image}
            source={{
              uri: imagenPrincipal
                ? imagenPrincipal.uri
                : "https://static3.mujerhoy.com/www/multimedia/202203/17/media/cortadas/apertura-party-kjgF-U1601347275536ie-624x624@MujerHoy.jpeg",
            }}
          />

          {/* Textos de titulo y creador */}
          <View style={styles.textContainer}>
            <Text style={styles.titulo}>
              {data.titulo ? data.titulo : "Evento"}
            </Text>
            <Text style={styles.personTxt}>{data.owner?.nickname}</Text>
          </View>

          {/* Botones favoritos y mas opciones */}
          <View>
            {handleMore && (
              <Entypo
                style={{
                  padding: 10,
                }}
                name="dots-three-vertical"
                size={20}
                color={"#000"}
              />
            )}
            {handleLike && (
              <AntDesign
                onPress={handleLike}
                style={{
                  padding: 10,
                }}
                name={("heart" + (data.favoritos ? "" : "o")) as "heart"}
                size={20}
                color={"#000"}
              />
            )}
          </View>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Text style={styles.infoTitle}>{data.personasMax}</Text>
          <Text style={styles.infoDetails}>CAPACIDAD</Text>
        </View>
        <View style={styles.verticalLine} />
        <View style={styles.infoItem}>
          <Text style={styles.infoTitle}>
            {fecha.getDate() +
              " " +
              mayusFirstLetter(mesAString(fecha.getMonth()))}
          </Text>
          <Text style={styles.infoDetails}>DIA</Text>
        </View>
        <View style={styles.verticalLine} />
        <View style={styles.infoItem}>
          <Text style={styles.infoTitle}>
            {formatAMPM(fecha).toUpperCase()}
          </Text>
          <Text style={styles.infoDetails}>HORA</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    ...shadowMedia,
    margin: 10,
    borderRadius: 10,
  },

  image: {
    width: 80,
    aspectRatio: 1,
    borderRadius: 10,

    marginRight: 20,
  },

  titulo: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 5,
  },

  personTxt: {
    color: claros,
  },

  textContainer: {
    justifyContent: "center",
    flex: 1,
  },

  infoContainer: {
    flexDirection: "row",
    padding: 20,
    paddingHorizontal: 0,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
  },
  verticalLine: {
    width: 1,
    height: "100%",
    marginVertical: 5,
    backgroundColor: claros,
  },

  infoTitle: {
    fontWeight: "bold",
    fontSize: 20,
  },
  infoDetails: {
    fontSize: 14,
    color: claros,
  },
});
