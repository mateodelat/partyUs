import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import React from "react";
import {
  formatDateShort,
  formatMoney,
  rojoClaro,
  shadowBaja,
  shadowMedia,
} from "../../../../constants";

import { Ionicons } from "@expo/vector-icons";

import { EventoType } from ".";

const claros = "#00000055";

export default function ({
  data,
  onPress,
  handleScan,
}: {
  data: EventoType;
  onPress: (an: any) => void;
  handleScan: (evento: EventoType) => void;
}) {
  const imagenPrincipal = data.imagenes[
    data.imagenPrincipalIDX ? data.imagenPrincipalIDX : 0
  ] as any;

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
            <Text style={styles.statusTxt}>{data.status}</Text>
          </View>

          {/* Boton de escanear codigo */}
          <View>
            {data.status === "PASADO" ? null : (
              <TouchableOpacity
                onPress={() => handleScan(data)}
                style={{
                  ...styles.iconContainer,
                  backgroundColor: "#fff",
                  ...shadowBaja,
                  padding: 4,
                }}
              >
                <Ionicons name="md-qr-code" size={16} color="#0009" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Text style={styles.infoTitle}>
            {data.personasReservadas}/{data.personasMax}
          </Text>
          <Text style={styles.infoDetails}>PERSONAS</Text>
        </View>
        <View style={styles.verticalLine} />
        <View style={styles.infoItem}>
          <Text style={styles.infoTitle}>{formatMoney(data.recibido)}</Text>
          <Text style={styles.infoDetails}>RECIBIDO</Text>
        </View>
        <View style={styles.verticalLine} />
        <View style={styles.infoItem}>
          <Text style={styles.infoTitle}>
            {formatDateShort(data.fechaInicial)}
          </Text>
          <Text style={styles.infoDetails}>DIA</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 10,

    ...shadowMedia,
  },
  statusTxt: {
    color: rojoClaro + "99",
    fontWeight: "bold",
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
  iconContainer: {
    width: 35,
    alignItems: "center",
    height: 35,
    justifyContent: "center",

    borderRadius: 40,
  },

  infoTitle: {
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
  },
  infoDetails: {
    fontSize: 14,
    color: claros,
  },
});
