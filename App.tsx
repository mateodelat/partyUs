import { Amplify, Auth, DataStore, Hub } from "aws-amplify";
import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView, StyleSheet, Text, View } from "react-native";

import awsconfig from "./src/aws-exports";

import { NavigationContainer } from "@react-navigation/native";
import { rojo } from "./constants";
import LoginStack from "./src/navigation/LoginStack/LoginStack";

import "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Register1 from "./src/Login/Register/Register1";
import { SetStateAction, useEffect, useState } from "react";
import Boton from "./src/components/Boton";

export default function App() {
  Amplify.configure(awsconfig);
  const [authenticated, setAuthenticated] = useState(false);

  const [loading, setLoading] = useState(false);
  const [cargandoModelos, setCargandoModelos] = useState(false);

  const [currentUser, setCurrentUser]: [
    { email?: string; nickname?: string },
    SetStateAction<any>
  ] = useState({});

  async function start() {
    const info = await Auth.currentUserInfo().then((r) => {
      setCurrentUser({
        ...r.attributes,
      });
    });
    // DataStore.start();
    // if (info) {
    //   const { email,
    //     nickname,
    //     sub
    //   } = info.attributes
    //   Bugsnag.setUser(sub, email, nickname)
    // }
  }

  useEffect(() => {
    // Ver si el usuario esta autenticado
    Auth.currentUserCredentials()
      .then((user) => {
        setLoading(false);
        if (user.authenticated) {
          start();
          setAuthenticated(true);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log("Error getting credentials", err);
      });

    // Escuchar a actualizaciones de auth
    Hub.listen("auth", (data) => {
      const { event, message } = data.payload;

      switch (event) {
        case "signIn":
          setCargandoModelos(true);
          start();
          setLoading(false);
          setAuthenticated(true);
          break;
        case "signOut":
          // Cancelar todas las notificaciones al celular
          // cancelAllScheduledNotificationsAsync();
          // Bugsnag.setUser("", "", "");
          setLoading(false);
          setAuthenticated(false);
          break;

        default:
          break;
      }
    });

    // Crear listener para cuando se acaben de obtener los modelos de datastore
    Hub.listen("datastore", async (hubData) => {
      const { event, data } = hubData.payload;
      console.log(event);
    });

    return () => {
      Hub.remove("auth", () => null);
      Hub.remove("datastore", () => null);
    };
  }, []);

  if (!authenticated)
    return (
      // {!authenticated &&

      <LoginStack />

      // return <NavigationContainer>
      // </NavigationContainer>;
      // }
    );
  else {
    return (
      <View style={styles.container}>
        <Text>Nickname: {currentUser.nickname}</Text>
        <Text>Email: {currentUser.email}</Text>
        <Boton
          style={{
            marginTop: 20,
            padding: 10,
          }}
          titulo="Cerrar sesion"
          onPress={() => Auth.signOut()}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
