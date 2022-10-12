import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { DataStore, Predicates } from "aws-amplify";
import { Notificacion } from "../../../models";
import { getUserSub, shadowBaja } from "../../../../constants";
import Element from "./Element";

export default function () {
  useEffect(() => {
    handleFetch();
  }, []);

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>();
  const [refreshing, setRefreshing] = useState(false);

  async function handleFetch() {
    return DataStore.query(Notificacion, Predicates.ALL, {
      sort: (e) => e.showAt("DESCENDING"),
    }).then((r) => {
      setNotificaciones([...r]);
    });
  }

  async function onRefresh() {
    setRefreshing(true);

    // Obtener eventos por filtro
    await handleFetch();

    setRefreshing(false);
  }

  async function handlePressItem(item: Notificacion, index: number) {
    console.log(await getUserSub());
    // console.log(item);
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
        {notificaciones?.map((item, index) => {
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
        })}
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
