import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  AsyncAlert,
  azulClaro,
  formatAMPM,
  formatDateShort,
  formatDay,
  formatMoney,
  msInHour,
  msInMinute,
  redondear,
  shadowBaja,
  shadowMedia,
  shadowMuyBaja,
  tipoRedondeo,
} from "../../../../constants";

import { FontAwesome5 } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Reserva } from "../../../models";
import { TipoPago } from "../../../models";
import { useNavigation } from "@react-navigation/native";

import moment from "moment";
moment.locale("es");

const claros = "#00000055";

export default function ElementoReserva({
  data,
  onPress,
}: {
  data: Reserva & { expirado: boolean };
  onPress: (e: any) => void;
}) {
  const imagenFondo = (data.evento as any).imagenPrincipal;

  const navigation = useNavigation() as any;

  const fecha = new Date(data.evento.fechaInicial);

  function navigateDetalleEvento() {
    navigation.popToTop();
    navigation.navigate("DetalleEvento", data.evento);
  }

  function handlePressTicket() {
    if (data.pagado) {
      navigation.navigate("QRCode", data);
    } else {
      navigation.navigate("ReferenciaPagoModal", {
        amount: data.total,
        titulo: data.evento.titulo,
        codebar: {
          number: data.cashBarcode,
        },
        limitDate: new Date(data.fechaExpiracionUTC).getTime(),
      });
    }
  }

  const [expireAt, setExpireAt] = useState<string>(
    calculateTime(data.fechaExpiracionUTC)
  );

  function calculateTime(input: string | number | Date) {
    const d = new Date(input);
    const now = new Date();

    const milisDiff = d.getTime() - now.getTime();
    const sec = Math.round(milisDiff / 1000);
    const min = redondear(sec / 60, 1, tipoRedondeo.ABAJO);
    const hour = redondear(min / 60, 1, tipoRedondeo.ABAJO);
    const dias = redondear(hour / 60, 1, tipoRedondeo.ABAJO);

    // Si hay dias poner el dia
    if (dias > 0) {
      return dias + "d";
    }

    if (hour > 0) {
      return hour + "h";
    }
    if (min > 0) {
      return min + "m";
    }
    if (sec > 0) {
      return sec + "s";
    } else {
      return "";
    }
  }

  const message:
    | "INGRESADO"
    | "PAGADO"
    | "CANCELADO"
    | String
    | "EXPIRADO"
    | "PASADO" = data.cancelado
    ? "CANCELADO"
    : data.ingreso
    ? "INGRESADO"
    : new Date() > new Date(data.fechaExpiracionUTC) &&
      data.tipoPago === "EFECTIVO" &&
      !data.pagado
    ? "EXPIRADO"
    : new Date() > new Date(data.evento.fechaFinal)
    ? "PASADO"
    : data.pagado
    ? "PAGADO"
    : new Date() < new Date(data.fechaExpiracionUTC)
    ? "EXPIRA EN " + expireAt
    : "NO DEFINIDO";

  const showBarcodeIcon =
    data.tipoPago === "TARJETA" ? false : data.pagado ? false : true;

  return (
    <Pressable
      onPress={() => {
        if (message === "EXPIRADO") {
          AsyncAlert(
            "Reserva expirada",
            "Tu reserva ha expirado. Intenta hacer otra reserva en el evento y paga antes del siguiente dia"
          ).then((e) => {
            if (e) {
              navigateDetalleEvento();
            }
          });
        } else if (data.cancelado) {
          Alert.alert(
            "Reserva cancelada",
            data.cancelReason === "CANCELADOPORCLIENTE"
              ? "Cancelaste tu reserva el " +
                  formatDateShort(data.canceledAt) +
                  " a las " +
                  formatAMPM(data.canceledAt)
              : "El organizador canceló el evento el " +
                  formatDateShort(data.canceledAt) +
                  " a las " +
                  formatAMPM(data.canceledAt)
          ) +
            (data.pagado
              ? ". No te preocupes, el saldo se agrego a tu cuenta"
              : "");
        } else {
          onPress(data);
        }
      }}
      style={styles.container}
    >
      <View
        style={{
          opacity: data.expirado || data.cancelado ? 0.4 : 1,
        }}
      >
        <View
          style={{
            padding: 15,
            paddingBottom: 0,
          }}
        >
          <View style={{ flexDirection: "row", flex: 1 }}>
            {/* Imagen principal */}
            <View style={styles.image}>
              <ActivityIndicator
                size={"small"}
                color={"#000"}
                style={{
                  position: "absolute",
                }}
              />
              <Image
                style={{ width: "100%", height: "100%" }}
                source={{
                  uri: imagenFondo
                    ? imagenFondo
                    : "https://static3.mujerhoy.com/www/multimedia/202203/17/media/cortadas/apertura-party-kjgF-U1601347275536ie-624x624@MujerHoy.jpeg",
                }}
              />
            </View>

            {/* Textos de titulo y creador */}
            <View style={styles.textContainer}>
              <View style={styles.row}>
                <Text
                  style={{
                    ...styles.message,
                    color:
                      message.startsWith("EXPIRA EN") ||
                      message.startsWith("PASADO")
                        ? "orange"
                        : azulClaro,
                    fontWeight: message === "PAGADO" ? "bold" : "normal",
                  }}
                >
                  {message}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.titulo} numberOfLines={1}>
                  {data.evento.titulo ? data.evento.titulo : "Evento"}
                </Text>
              </View>

              <Text style={styles.personTxt}>
                {formatDay(fecha, true) + " a las " + formatAMPM(fecha)}
              </Text>
            </View>
            <View
              style={{
                justifyContent: "center",
              }}
            >
              {data.ingreso || data.expirado || data.cancelado ? null : (
                <TouchableOpacity
                  disabled={data.expirado}
                  onPress={handlePressTicket}
                  style={styles.iconContainer}
                >
                  {showBarcodeIcon ? (
                    <MaterialCommunityIcons
                      name="barcode"
                      size={30}
                      color="black"
                    />
                  ) : (
                    <Ionicons name="md-qr-code" size={24} color="#0009" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoTitle}>{formatMoney(data.total)}</Text>
            <Text style={styles.infoDetails}>TOTAL</Text>
          </View>

          <View style={styles.verticalLine} />
          <View style={styles.infoItem}>
            <Text style={styles.infoTitle}>{data.cantidad}</Text>
            <Text style={styles.infoDetails}>
              RESERVADO{data.cantidad !== 1 ? "S" : ""}
            </Text>
          </View>
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
    ...shadowBaja,
  },

  iconContainer: {
    width: 55,
    alignItems: "center",
    height: 55,
    justifyContent: "center",

    borderRadius: 40,

    backgroundColor: "#fff",
    ...shadowBaja,
  },

  message: {
    fontSize: 14,
    color: azulClaro,
    flex: 1,
  },

  image: {
    width: 80,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    overflow: "hidden",

    marginRight: 20,
  },

  titulo: {
    fontWeight: "bold",
    fontSize: 20,

    flex: 1,
  },

  personTxt: {
    color: claros,
  },

  textContainer: {
    justifyContent: "center",
    flex: 1,
    marginRight: 5,
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
    marginTop: 5,
  },

  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
});
