import {
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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
  formatMoney,
  azulClaro,
  timer,
} from "../../../../constants";

import { Boleto, Reserva } from "../../../models";
import { Ionicons } from "@expo/vector-icons";

import { FontAwesome } from "@expo/vector-icons";
import Loading from "../../../components/Loading";
import useUser from "../../../Hooks/useUser";

import { Entypo } from "@expo/vector-icons";
import { DataStore } from "aws-amplify";
import { ReservasBoletos } from "../../../models";
import EmptyProfile from "../../../components/EmptyProfile";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ({
  reserva,
  setModalVisible,
  sucessMessage,
}: {
  reserva: Reserva | undefined;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  sucessMessage: (s: string) => void;
}) {
  if (!reserva) {
    return <Loading indicator />;
  }

  const {
    evento: { titulo, fechaInicial, imagenes, imagenPrincipalIDX },
    usuario,
  } = reserva;

  const { setStatusStyle } = useUser();

  const [imagenFondo, setImagenFondo] = useState("");
  const [userPic, setUserPic] = useState<string>();
  const [boletos, setBoletos] = useState<ReservasBoletos[]>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getImageUrl(imagenes[imagenPrincipalIDX]).then(setImagenFondo);
    getImageUrl(usuario.foto).then(setUserPic);

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

  async function handleIngresarReserva() {
    setLoading(true);

    try {
      await DataStore.query(Reserva, reserva.id).then((res) => {
        // Actualizar la reserva nueva
        DataStore.save(
          Reserva.copyOf(res, (mut) => {
            mut.ingreso = true;
            mut.horaIngreso = new Date().toISOString();
          })
        );
      });
      setLoading(false);
      setModalVisible(false);
      sucessMessage("La reserva fue ingresada con exito");
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        "Hubo un error intentando ingresar al usuario\n" + error.message
      );
    }
  }

  const { top } = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={{
            paddingBottom: 10,
            paddingTop: top,
            width: "100%",
            zIndex: 1,
          }}
        >
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: 70,
            }}
          >
            <Text style={styles.ticket}>Reserva</Text>
            <Entypo
              onPress={() => {
                setModalVisible(false);
                setStatusStyle("dark");
              }}
              style={styles.cross}
              name="cross"
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
          <TouchableOpacity
            onPress={handleIngresarReserva}
            style={{
              aspectRatio: 1.6,
              alignItems: "center",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <FontAwesome name="hand-o-up" size={100} color={azulClaro} />
            <Text style={styles.ingresarPersona}>
              Click para confirmar entrada
            </Text>
          </TouchableOpacity>

          <View style={styles.textContainer}>
            <View style={{ flexDirection: "row" }}>
              {userPic === undefined ? (
                <Loading indicator />
              ) : userPic !== "error" ? (
                <Image
                  style={styles.profilePicture}
                  source={{ uri: userPic }}
                  onError={() => {
                    setUserPic("error");
                  }}
                />
              ) : (
                <EmptyProfile />
              )}
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.value}>{usuario.nickname}</Text>
                <Text style={styles.subtitle}>{usuario.email}</Text>
              </View>
            </View>
            <View style={styles.line} />

            <View style={{ flexDirection: "row", marginTop: 20 }}>
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

            {/* Fecha de pago del evento*/}
            <View
              style={{
                flexDirection: "row",
                marginTop: 30,
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.subtitle}>Pagado el</Text>
                <Text style={styles.value}>
                  {formatDateShort(reserva.paymentTime) +
                    " a las " +
                    formatAMPM(reserva.paymentTime)}
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 20 }}>
              <View style={styles.line} />
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
                      <Text style={styles.subtitle}>Boleto</Text>
                      <Text style={{ ...styles.value, color: rojoClaro }}>
                        {formatMoney(e.boleto.precio * e.quantity)}
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
      {loading && (
        <View
          style={{
            flex: 1,
            backgroundColor: "#000000dd",
            position: "absolute",
            width: "100%",
            height: "100%",

            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size={"large"} color={"#fff"} />
          <Text
            style={{
              marginTop: 20,
              fontSize: 18,
              color: "#fff",
            }}
          >
            Cargando...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ingresarPersona: {
    color: rojoClaro,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },

  boletoContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#D5DCE5",
  },

  profilePicture: {
    width: 45,
    height: 45,
    borderRadius: 30,
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
  line: {
    width: "100%",
    height: 0.5,
    backgroundColor: "gray",
    marginTop: 20,
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

  cross: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: 20,
  },

  value: {
    fontSize: 16,
    fontWeight: "bold",
  },

  subtitle: {
    color: azulOscuro + "80",
    marginBottom: 3,
  },

  paymentTypeTxt: {
    color: rojoClaro,
    fontWeight: "bold",
  },
});
