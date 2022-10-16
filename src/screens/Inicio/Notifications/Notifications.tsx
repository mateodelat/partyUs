import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";

import { Notificacion } from "../../../models";
import { shadowBaja } from "../../../../constants";
import Element from "./Element";
import { DataStore } from "aws-amplify";
import useUser from "../../../Hooks/useUser";

export default function () {
  useEffect(() => {
    handleFetch();
  }, []);

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>();
  const [refreshing, setRefreshing] = useState(false);

  const { usuario } = useUser();

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
    console.log(item);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            onRefresh={onRefresh}
            refreshing={refreshing || notificaciones === undefined}
          />
        }
      >
        {notificaciones?.length === 0 ? (
          <Text
            style={{
              fontSize: 16,
              padding: 40,
            }}
          >
            No hay notificaciones
          </Text>
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

  notificationContainer: {
    backgroundColor: "#fff",

    margin: 20,

    ...shadowBaja,
  },
});
