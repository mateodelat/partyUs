import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";

import { Notificacion, TipoNotificacion } from "../../../models";
import { rojoClaro, shadowBaja, verde } from "../../../../constants";
import Element from "./Element";
import { DataStore } from "aws-amplify";

import { Entypo } from "@expo/vector-icons";

import useUser from "../../../Hooks/useUser";
import Header from "../../../navigation/components/Header";

export default function ({ navigation }) {
  useEffect(() => {
    handleFetch().then(setNotificaciones);
  }, []);

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>();
  const [refreshing, setRefreshing] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const { usuario, setNewNotifications } = useUser();

  async function handleFetch() {
    return DataStore.query(
      Notificacion,
      (e) =>
        e.showAt("lt", new Date().toISOString()).usuarioID("eq", usuario.id),

      {
        sort: (e) => e.showAt("DESCENDING").createdAt("DESCENDING"),
      }
    );
  }

  async function onRefresh() {
    setRefreshing(true);

    // Obtener eventos por filtro
    await handleFetch().then(setNotificaciones);

    setRefreshing(false);
  }

  async function handlePressItem(item: Notificacion, index: number) {
    // Al hacer click poner la notificacion en leido
    DataStore.query(Notificacion, item.id).then((not) =>
      DataStore.save(
        Notificacion.copyOf(not, (m) => {
          m.usuarioID = usuario.id;
          m.leido = true;
        })
      )
    );

    // Acutalizar el estado localmente
    setNotificaciones((prev) => {
      let newItem = prev[index];
      newItem = {
        ...newItem,
        leido: true,
      };

      prev[index] = newItem;
      return [...prev];
    });

    switch (item.tipo) {
      // Navegar a ver la reserva todas las siguientes notificaciones
      case TipoNotificacion.RESERVAEFECTIVOCREADA:
      case TipoNotificacion.RESERVAEFECTIVOPAGADA:
      case TipoNotificacion.RESERVATARJETACREADA:
      case TipoNotificacion.RESERVACANCELADA:
      case TipoNotificacion.RECORDATORIOPAGO:
        if (!item.reservaID) {
          Alert.alert("Error", "La notificacion no tiene ID de reserva");
          return;
        }

        navigation.navigate("MisReservas", { reservaID: item.reservaID });
        break;

      case TipoNotificacion.CALIFICAUSUARIO:
        Alert.alert(
          "Proximamente...",
          "Proximamente podras calificar al organizador del evento.\nSi tienes que reportar algo contacta al soporte"
        );
        break;
      case TipoNotificacion.EVENTOCREADO:
        navigation.navigate("MisEventos", { eventoID: item.eventoID });
        break;
      case TipoNotificacion.ADMIN:
        navigation.navigate("AdminStack");
        break;

      default:
        Alert.alert("Error", "Tipo de notificacion no programado");
        break;
    }
  }

  async function deleteAll() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    // Pedir las notificaciones otra vez y borrarlas
    handleFetch().then((r) => {
      r.map((not) => {
        DataStore.delete(Notificacion, not.id);
      });
    });
    setNotificaciones([]);
    setNewNotifications(0);
  }

  return (
    <View style={styles.container}>
      <Header
        title={notificaciones?.length === 0 ? "Notificaciones" : " "}
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
          <>
            <Pressable
              style={{
                backgroundColor: "#fff",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 20,
                height: 35,
                padding: 5,
                flexDirection: "row",
                paddingHorizontal: 20,
              }}
            >
              <Text style={styles.header}>Notificaciones</Text>
              {confirmDelete ? (
                <Text
                  onPress={deleteAll}
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    paddingHorizontal: 5,
                    color: rojoClaro,
                  }}
                >
                  BORRAR
                </Text>
              ) : (
                <Entypo
                  onPress={deleteAll}
                  name="cross"
                  size={25}
                  color={rojoClaro}
                />
              )}
            </Pressable>
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
          </>
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

  header: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
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
