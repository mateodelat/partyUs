import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";

import { Notificacion, TipoNotificacion } from "../../../models";
import { shadowBaja } from "../../../../constants";
import Element from "./Element";
import { DataStore } from "aws-amplify";
import useUser from "../../../Hooks/useUser";
import Header from "../../../navigation/components/Header";

export default function ({ navigation }) {
  useEffect(() => {
    handleFetch();
  }, []);

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>();
  const [refreshing, setRefreshing] = useState(false);

  const { usuario, setNewNotifications } = useUser();

  async function handleFetch() {
    DataStore.query(Notificacion, (e) => e.usuarioID("eq", usuario.id), {
      sort: (e) => e.showAt("DESCENDING").createdAt("DESCENDING"),
    }).then(setNotificaciones);
  }

  async function onRefresh() {
    setRefreshing(true);

    // Obtener eventos por filtro
    await handleFetch();

    setRefreshing(false);
  }

  async function handlePressItem(item: Notificacion, index: number) {
    // console.log(await DataStore.query(Reserva, item.reservaID));

    switch (item.tipo) {
      // Navegar a ver la reserva todas las siguientes notificaciones
      case TipoNotificacion.RESERVAEFECTIVOCREADA:
      case TipoNotificacion.RESERVAEFECTIVOPAGADA:
      case TipoNotificacion.RESERVATARJETACREADA:
        if (!item.reservaID) {
          Alert.alert("Error", "La notificacion no tiene ID de reserva");
          return;
        }
        navigation.navigate("MisReservas", { reservaID: item.reservaID });
        break;

      default:
        break;
    }
  }

  return (
    <View style={styles.container}>
      <Header
        title={"Notificaciones"}
        handleBack={() => {
          // Buscar notificaciones no leidas todavia
          const sinLeer = notificaciones.filter(
            (e) => !e.leido && e.showAt < new Date().toISOString()
          ).length;

          setNewNotifications(sinLeer);

          navigation.pop();
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            onRefresh={onRefresh}
            refreshing={refreshing || notificaciones === undefined}
          />
        }
      >
        {notificaciones?.length === 0 ? (
          <Text style={styles.noHay}>No hay notificaciones</Text>
        ) : (
          notificaciones?.map((item, index) => {
            return (
              <View
                key={index}
                style={{
                  flex: 1,
                  marginBottom: index === notificaciones.length - 1 ? 40 : 0,
                  ...styles.notificationContainer,
                }}
              >
                <Element
                  tipo={item.tipo}
                  titulo={item.titulo}
                  descripcion={item.descripcion}
                  tiempo={item.showAt ? item.showAt : item.createdAt}
                  leido={!!item.leido}
                  onPress={() => handlePressItem(item, index)}
                />
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 0,
  },
  noHay: {
    fontWeight: "bold",
    margin: 20,
    fontSize: 16,
  },

  notificationContainer: {
    backgroundColor: "#fff",

    margin: 20,

    ...shadowBaja,
  },
});
