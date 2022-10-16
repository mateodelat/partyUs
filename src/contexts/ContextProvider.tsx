import React, { useEffect, useState, Dispatch, SetStateAction } from "react";
import UserContext from "./UserContext";
import { View, ActivityIndicator, Text, Platform } from "react-native";

import { PropsWithChildren } from "react";
import { Usuario } from "../models";
import { API, DataStore, Hub } from "aws-amplify";
import { getUserSub, graphqlRequest, rojoClaro } from "../../constants";

import * as Notifications from "expo-notifications";
import { getUsuario } from "../graphql/queries";
import { StatusBarStyle } from "expo-status-bar";

export default function ({
  children,

  usuario,
  setUsuario,
  setStatusStyle,
}: PropsWithChildren<{
  usuario: Usuario;
  setUsuario: Dispatch<SetStateAction<Usuario>>;
  setStatusStyle: Dispatch<SetStateAction<StatusBarStyle>>;
}>) {
  const defultUSR = {
    id: "guest",
    nickname: "guest",
    email: "guest",
  };

  const [loading, setLoading] = useState(false);

  async function fetchUsuario(sub: string, api?: boolean) {
    if (api) {
      setUsuario(
        await graphqlRequest<{ getUsuario: Usuario }>({
          query: getUsuario,
          variables: { id: sub },
        }).then((r) => r.getUsuario)
      );
    } else {
      DataStore.query(Usuario, sub).then(async (r) => {
        registerForPushNotificationsAsync(r);
        if (!r) {
          // Pedirlo directamete de graphql
          r = await graphqlRequest<{ getUsuario: Usuario }>({
            query: getUsuario,
            variables: { id: sub },
          }).then((r) => r.getUsuario);

          if (!r) {
            throw new Error(
              "Error, no hay usuario en la base de datos con el id: " +
                r +
                " para asignar al use context"
            );
          }
        }

        setUsuario(r);
      });
    }
  }
  async function registerForPushNotificationsAsync(usuario: Usuario) {
    let token: Notifications.ExpoPushToken["data"];
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync())?.data;

    // Subir a datastore el token
    if (token && token !== usuario.notificationToken) {
      await DataStore.save(
        Usuario.copyOf(usuario, (usr) => {
          usr.notificationToken = token;
        })
      );
      console.log("Token de notificacion actualizado con exito" + token);
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: rojoClaro,
      });
    }
  }

  const [registrado, setRegistrado] = useState(false);

  // Escuchar actualizaciones a auth para asignar al usuario local
  useEffect(() => {
    // Si hay sub obtener el usuario
    getUserSub().then((r) => {
      if (!r) return;
      fetchUsuario(r);
    });

    const r = Hub.listen("auth", (data) => {
      const { event } = data.payload;

      const username = data.payload?.data?.username;

      switch (event) {
        case "signIn":
          if (!username) {
            throw new Error(
              "No hay nombre de usuario cuando inicia sesion en context provider"
            );
          }

          fetchUsuario(username, registrado);
          break;

        case "signOut":
          // Borrar usuario default
          setUsuario(defultUSR);
          DataStore.clear();

          // cancelAllScheduledNotificationsAsync();
          // Bugsnag.setUser("", "", "");
          break;

        case "signUp":
          setRegistrado(true);
          break;

        default:
          break;
      }
    });
    return () => {
      Hub.remove("auth", () => null);
      r();
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        usuario,
        setUsuario,

        setStatusStyle,

        loading,
        setLoading,
      }}
    >
      {children}
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
    </UserContext.Provider>
  );
}
