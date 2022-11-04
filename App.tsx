import {
  Amplify,
  Auth,
  AuthModeStrategyType,
  DataStore,
  Hub,
} from "aws-amplify";

import awsconfig from "./src/aws-exports";

import "react-native-gesture-handler";
import { useEffect, useState } from "react";

import ContextProvider from "./src/contexts/ContextProvider";
import Router from "./src/navigation/Router";

import { Alert, LogBox } from "react-native";
import ErrorWrapper from "./src/components/ErrorWrapper";
import Loading from "./src/components/Loading";
import { StatusBar, StatusBarStyle } from "expo-status-bar";
import moment from "moment";

import Bugsnag from "@bugsnag/expo";

LogBox.ignoreLogs([/\[WARN\] .* DataStore/g]);
// LogBox.ignoreAllLogs();
moment.locale("es");

export default function App() {
  Amplify.configure({
    ...awsconfig,
    DataStore: {
      authModeStrategyType: AuthModeStrategyType.MULTI_AUTH,
    },
  });
  const [loading, setLoading] = useState(true);

  const defaultUSR = {
    id: "guest",
    nickname: "guest",
    email: "guest",
  };

  const [usuario, setUsuario] = useState(defaultUSR);
  const [statusStyle, setStatusStyle] = useState<StatusBarStyle>("dark");

  useEffect(() => {
    DataStore.start();
    Bugsnag.start();

    // Crear listener para cuando se acaben de obtener los modelos de datastore en caso de cierre de sesion
    const dstore = Hub.listen("datastore", async (hubData) => {
      const { event, data } = hubData.payload;

      if (event === "syncQueriesReady") {
        setLoading(false);
      }
    });

    // // Iniciar una cuenta regresiva de 7 segundos para mostrarlo despues de ese tiempo
    // setTimeout(() => {
    //   setLoading(false);
    // }, 7000);

    return () => {
      dstore();

      Hub.remove("datastore", () => null);
    };
  }, []);

  if (loading) return <Loading />;
  else
    return (
      <ErrorWrapper>
        <ContextProvider
          usuario={usuario}
          setUsuario={setUsuario}
          setStatusStyle={setStatusStyle}
        >
          <StatusBar style={statusStyle} translucent={true} />

          <Router />
        </ContextProvider>
      </ErrorWrapper>
    );
}
