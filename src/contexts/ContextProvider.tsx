import React, { useEffect, useState, Dispatch, SetStateAction } from "react";
import UserContext from "./UserContext";
import {
  View,
  ActivityIndicator,
  Text,
  Platform,
  TextStyle,
  Dimensions,
} from "react-native";

import { PropsWithChildren } from "react";
import { Notificacion, Usuario } from "../models";
import { API, DataStore, Hub } from "aws-amplify";
import {
  getUserSub,
  graphqlRequest,
  rojoClaro,
  shadowBaja,
  shadowMedia,
} from "../../constants";

import * as Notifications from "expo-notifications";
import { getUsuario } from "../graphql/queries";
import { StatusBarStyle } from "expo-status-bar";
import { TipoNotificacion } from "../models";
import { queryNewNotifications } from "../screens/Inicio/Home";
import Bugsnag from "@bugsnag/expo";

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
  const [newNotifications, setNewNotifications] = useState(0);
  const [bottomMessage, setBottomMessage] = useState<{
    style: TextStyle;
    content: string;
  }>();

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

        Bugsnag.setUser(sub, r.email, r.nickname);

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
    if (token && token !== usuario?.notificationToken) {
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
  async function resetDatastore() {
    return DataStore.clear().then((r) => DataStore.start());
  }

  const [registrado, setRegistrado] = useState(false);

  // Escuchar actualizaciones a auth para asignar al usuario local
  useEffect(() => {
    // Si hay sub obtener el usuario
    getUserSub().then((r) => {
      if (!r) return;
      fetchUsuario(r);
    });

    const r = Hub.listen("auth", async (data) => {
      const { event } = data.payload;

      const username = data.payload?.data?.username;

      switch (event) {
        case "signIn":
          setLoading(true);
          // Esperar a que se limpie y se vuelvan a pedir los datos
          await resetDatastore();

          // Pedir las notificaciones nuevas del usuario tras 3 segundos para esperar a que carguen los modelos
          setTimeout(() => {
            queryNewNotifications().then(setNewNotifications);
          }, 3000);
          setLoading(false);
          if (!username) {
            throw new Error(
              "No hay nombre de usuario cuando inicia sesion en context provider"
            );
          }

          fetchUsuario(username, registrado);
          break;

        case "signOut":
          setLoading(true);
          // Borrar usuario default
          setUsuario(defultUSR);
          setNewNotifications(0);
          await resetDatastore();

          setLoading(false);
          // cancelAllScheduledNotificationsAsync();
          Bugsnag.setUser("", "", "");
          break;

        case "signUp":
          setRegistrado(true);
          break;

        default:
          break;
      }
    });

    const subscript = DataStore.observe(Notificacion).subscribe((r) => {
      if (
        // Solo agregar si es notificacion nueva y no creada por la pestaña de pagos
        r.opType === "INSERT" &&
        r.element.tipo !== TipoNotificacion.RESERVATARJETACREADA &&
        r.element.tipo !== TipoNotificacion.RESERVAEFECTIVOCREADA
      ) {
        console.log("Nueva notificacion insertada");
        setNewNotifications((prev) => prev++);
      }
    });

    return () => {
      Hub.remove("auth", () => null);
      r();
      subscript.unsubscribe();
    };
  }, []);

  const { width } = Dimensions.get("window");

  return (
    <UserContext.Provider
      value={{
        newNotifications,
        setNewNotifications,

        usuario,
        setUsuario,

        setStatusStyle,

        loading,
        setLoading,

        setBottomMessage,
      }}
    >
      {children}

      {bottomMessage && (
        <Text
          style={{
            position: "absolute",

            backgroundColor: "#fff",
            fontSize: 18,

            color: rojoClaro,
            bottom: 10,
            width: width - 40,
            padding: 15,
            textAlign: "center",
            margin: 20,
            borderRadius: 5,

            ...shadowBaja,
          }}
        >
          {bottomMessage.content}
        </Text>
      )}
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
