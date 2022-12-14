import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Pressable,
  Image,
  ViewStyle,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Boleto, Reserva, ReservasBoletos, Usuario } from "../../../models";
import {
  formatAMPM,
  formatDateShort,
  formatMoney,
  rojoClaro,
  shadowMuyBaja,
} from "../../../../constants";

import { Ionicons } from "@expo/vector-icons";
import { DataStore } from "aws-amplify";
import { BoletoType } from "../Boletos";
import Loading from "../../../components/Loading";
import Line from "../../../components/Line";
import InfoBoleto from "../../../components/InfoBoleto";
import EmptyProfile from "../../../components/EmptyProfile";

export default function ({
  reserva,
  style,

  onLongPress,
  onPress,
}: {
  reserva: Reserva;
  style?: ViewStyle;

  onLongPress?: () => void;
  onPress?: () => void;
}) {
  const status = reserva.ingreso
    ? "INGRESADO"
    : reserva.cancelado
    ? "CANCELADO"
    : reserva.pagado
    ? "PAGADO"
    : "POR PAGAR";

  const [showDetails, setShowDetails] = useState(false);
  const [reparticionBoletos, setReparticionBoletos] = useState<BoletoType[]>();
  const [usuario, setUsuario] = useState(reserva.usuario);

  // Si no hay usuario asociado, pedirlo sin la foto
  useEffect(() => {
    if (!usuario) {
      DataStore.query(Usuario, reserva.usuarioID).then(setUsuario);
    }
  }, []);

  // Pedir detalles de boletos al hacer click en la reserva
  onPress = onPress
    ? onPress
    : () => {
        if (!reparticionBoletos && !showDetails) {
          // Pedir los boletos asociados con la reserva
          DataStore.query(ReservasBoletos, (e) =>
            e.reservaID("eq", reserva.id)
          ).then(async (rels) => {
            // Mapear y pedir el boleto asignado a la relacion
            const boletosReserva = await Promise.all(
              rels.map(async (rel) => {
                const bole = await DataStore.query(Boleto, rel.boletoID);
                return {
                  ...bole,
                  quantity: rel.quantity,
                };
              })
            );

            setReparticionBoletos(boletosReserva);
          });
        }
        setShowDetails(!showDetails);
      };

  const foto = usuario?.foto;

  return (
    <Pressable
      style={{ ...styles.reservaContainer, ...style }}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View
        style={{
          flexDirection: "row",

          alignItems: "center",
        }}
      >
        {/* Foto de perfil del usuario */}
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            marginRight: 10,
          }}
        >
          <ActivityIndicator
            style={{ position: "absolute" }}
            size={"small"}
            color={"#000"}
          />

          <Image
            source={{ uri: foto }}
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </View>
        {/* Detalles del evento */}
        <View style={{ flex: 1 }}>
          {/* Nickname */}
          <Text style={{ fontWeight: "bold" }}>@{usuario?.nickname}</Text>

          {/* Fecha de ultima actualizacion de la reserva */}
          <Text style={{ ...styles.lightTxt }}>
            {formatDateShort(reserva.updatedAt) +
              " a las " +
              formatAMPM(reserva.updatedAt)}
          </Text>
          <Text style={styles.statusReserva}>{status}</Text>
        </View>
        {/* Precio y personas */}
        <View
          style={{
            paddingVertical: 5,
          }}
        >
          <Text style={{ fontWeight: "bold", flex: 1 }}>
            {formatMoney(reserva.pagadoAlOrganizador)}
          </Text>
          <Text
            style={{
              textAlign: "right",
            }}
          >
            <Ionicons
              style={{ marginRight: 5 }}
              name="person"
              size={14}
              color="black"
            />
            {" " + reserva.cantidad}
          </Text>
        </View>
      </View>
      {/* Ver detalle de los boletos */}
      {showDetails && (
        <View>
          <Line />
          {!reparticionBoletos ? (
            <Loading indicator color={"#555"} />
          ) : (
            reparticionBoletos.map((bol) => {
              return <InfoBoleto item={bol} style={{ padding: 10 }} />;
            })
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  imagenPerfilReserva: {
    width: "100%",
    height: "100%",

    borderRadius: 30,
  },

  statusReserva: {
    color: rojoClaro + "99",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 3,
  },

  reservaContainer: {
    padding: 10,
    backgroundColor: "#fff",
    ...shadowMuyBaja,

    marginBottom: 10,
  },

  lightTxt: {
    color: "#0005",
  },
});
