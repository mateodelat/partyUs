import { Amplify, AuthModeStrategyType, DataStore, Hub } from "aws-amplify";

import awsconfig from "./src/aws-exports";

import "react-native-gesture-handler";
import { useEffect, useState } from "react";
import * as React from "react";
import { LogBox, View } from "react-native";

import ContextProvider from "./src/contexts/ContextProvider";
import Router from "./src/navigation/Router";

import ErrorWrapper from "./src/components/ErrorWrapper";
import Loading from "./src/components/Loading";
import { StatusBar, StatusBarStyle } from "expo-status-bar";
import moment from "moment";

import { STRIPE_PUBLISHABLE_KEY } from "./constants/keys";

LogBox.ignoreLogs(["new NativeEventEmitter"]); // Ignore log notification by message
moment.locale("es");

const App = () => {
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
    // Bugsnag.start();

    // Crear listener para cuando se acaben de obtener los modelos de datastore en caso de cierre de sesion
    const dstore = Hub.listen("datastore", async (hubData) => {
      const { event, data } = hubData.payload;

      if (event === "syncQueriesReady" || event === "ready") {
        setLoading(false);
      }
    });

    return () => {
      dstore();

      Hub.remove("datastore", () => null);
    };
  }, []);

  if (loading) return <Loading />;
  else
    return (
      <View style={{ flex: 1 }}>
        {/* <ErrorWrapper> */}
        <ContextProvider
          usuario={usuario}
          setUsuario={setUsuario}
          setStatusStyle={setStatusStyle}
        >
          <StatusBar style={statusStyle} translucent={true} />

          <Router />
        </ContextProvider>
        {/* </ErrorWrapper> */}
      </View>
    );
};
export default App;
