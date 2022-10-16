import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";

import {
  getImageUrl,
  azulOscuro,
  mayusFirstLetter,
  formatAMPM,
  formatDateShort,
  getWeekDay,
  rojoClaro,
  precioConComision,
  formatMoney,
} from "../../../../constants";

import { Boleto, Reserva } from "../../../models";
import { Ionicons } from "@expo/vector-icons";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import Loading from "../../../components/Loading";
import useUser from "../../../Hooks/useUser";

import QRCode from "react-native-qrcode-svg";
import { TouchableOpacity } from "react-native-gesture-handler";

import { Entypo } from "@expo/vector-icons";
import ModalMap, { locationType } from "../../../components/ModalMap";
import { DataStore } from "aws-amplify";
import { ReservasBoletos } from "../../../models";

export default function ({
  handleBack,
  navigation,
  route,
}: {
  route: { params: Reserva };
  handleBack: () => void;
  navigation: any;
}) {
  const reserva = route.params;

  const {
    evento: { titulo, fechaInicial, imagenes, imagenPrincipalIDX },
  } = reserva;

  const ubicacion: locationType = reserva.evento.ubicacion as any;

  const { setStatusStyle } = useUser();

  const [imagenFondo, setImagenFondo] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [boletos, setBoletos] = useState<ReservasBoletos[]>();

  useEffect(() => {
    getImageUrl(imagenes[imagenPrincipalIDX]).then(setImagenFondo);
    setStatusStyle("light");

    DataStore.query(ReservasBoletos, (e) => e.reservaID("eq", reserva.id)).then(
      async (r) => {
        r = await Promise.all(
          r.map(async (r) => {
            return {
              ...r,
              boleto: await DataStore.query(Boleto, r.boletoID),
            };
          }) as any
        );

        setBoletos(r);
      }
    );
  }, []);

  const { top: t } = useSafeAreaInsets();
  const [top, setTop] = useState(t);

  const qrString = "res>" + reserva.id;

  const { height } = Dimensions.get("screen");

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View
          style={{
            paddingTop: top,
            paddingBottom: 10,
            width: "100%",
            zIndex: 1,
          }}
        >
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: 40,
            }}
          >
            <Text style={styles.ticket}>Ticket</Text>
            <AntDesign
              onPress={() => {
                navigation.pop();
                setStatusStyle("dark");
              }}
              style={styles.backIcon}
              name="left"
              size={30}
              color="#fff"
            />
          </View>
          <Text style={styles.titulo} numberOfLines={2}>
            {mayusFirstLetter(titulo)}
          </Text>
        </View>

        {/* Imagen de fondo */}
        <View style={styles.image}>
          {imagenFondo ? (
            <>
              <Image
                style={{ flex: 1, width: "100%" }}
                source={{ uri: imagenFondo }}
              />
              <View style={styles.filter} />
            </>
          ) : (
            <Loading indicator />
          )}
        </View>

        <View style={styles.innerContainer}>
          <View style={{ padding: 20 }}>
            <QRCode value={qrString} size={height / 6} />
          </View>

          <View style={styles.textContainer}>
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subtitle}>Fecha</Text>
                <Text style={styles.value}>
                  {getWeekDay(fechaInicial) +
                    " " +
                    formatDateShort(fechaInicial)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.subtitle}>Empieza</Text>
                <Text style={styles.value}>{formatAMPM(fechaInicial)}</Text>
              </View>
            </View>

            {/* Lugar */}

            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{
                flexDirection: "row",
                marginTop: 15,
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.subtitle}>Lugar</Text>
                <Text style={styles.value}>{ubicacion.ubicacionNombre}</Text>
              </View>
              <Entypo
                style={styles.icon}
                name="location-pin"
                size={30}
                color={rojoClaro}
              />
            </TouchableOpacity>

            <View style={{ marginTop: 20 }}>
              <View
                style={{
                  width: "100%",
                  height: 1,
                  backgroundColor: "gray",
                  position: "absolute",
                }}
              />
            </View>

            {/* Boletos */}
            {!boletos ? (
              <Loading
                indicator
                style={{
                  marginTop: 30,
                }}
              />
            ) : (
              boletos.map((e, idx) => {
                return (
                  <View style={styles.boletoContainer} key={idx}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subtitle}>Precio total</Text>
                      <Text style={{ ...styles.value, color: rojoClaro }}>
                        {formatMoney(
                          precioConComision(e.boleto.precio) * e.quantity
                        )}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.subtitle}>{e.boleto.titulo}</Text>
                      <View
                        style={{
                          justifyContent: "flex-end",
                          alignItems: "center",
                          marginRight: 0,
                          flexDirection: "row",
                        }}
                      >
                        <Text style={styles.value}>{e.quantity}</Text>
                        <Ionicons
                          style={{
                            marginLeft: 5,
                          }}
                          name="person"
                          size={20}
                          color="black"
                        />
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
      <ModalMap
        titulo={ubicacion.ubicacionNombre}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        selectedPlace={ubicacion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  boletoContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#D5DCE5",
  },

  image: {
    width: "100%",
    aspectRatio: 11 / 8,
    alignItems: "center",

    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",

    position: "absolute",
  },

  filter: {
    backgroundColor: "#505050b0",
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  header: {
    padding: 20,

    alignItems: "center",
  },

  icon: {
    backgroundColor: rojoClaro + "44",
    padding: 10,
    borderRadius: 15,
  },

  innerContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    margin: 20,
    alignItems: "center",

    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  textContainer: {
    backgroundColor: "#F7F8FA",
    width: "100%",
    padding: 15,
    paddingTop: 20,
    paddingBottom: 30,
  },

  ticket: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    color: "#fff",
  },

  titulo: {
    fontWeight: "900",
    fontSize: 26,
    textAlign: "center",
    color: "#fff",
    marginVertical: 10,
  },

  backIcon: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: 5,
  },

  value: {
    fontSize: 16,
    fontWeight: "bold",
  },

  subtitle: {
    color: azulOscuro + "80",
    marginBottom: 3,
  },
});
