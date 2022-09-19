import {
  Amplify,
  Auth,
  AuthModeStrategyType,
  DataStore,
  Hub,
} from "aws-amplify";

import awsconfig from "./src/aws-exports";

import LoginStack from "./src/navigation/LoginStack";

import "react-native-gesture-handler";
import { SetStateAction, useEffect, useState } from "react";

import ContextProvider from "./src/contexts/ContextProvider";
import Router from "./src/navigation/Router";

import { LogBox } from "react-native";
import ErrorWrapper from "./src/components/ErrorWrapper";

LogBox.ignoreLogs([/\[WARN\] .* DataStore/g]);
// LogBox.ignoreAllLogs();

export default function App() {
  Amplify.configure({
    ...awsconfig,
    DataStore: {
      authModeStrategyType: AuthModeStrategyType.MULTI_AUTH,
    },
  });
  const [loading, setLoading] = useState(true);

  // const [cargandoModelos, setCargandoModelos] = useState(false);

  // const [currentUser, setCurrentUser]: [
  //   { email?: string; nickname?: string },
  //   SetStateAction<any>
  // ] = useState({});

  // async function start() {
  //   const info = await Auth.currentUserInfo().then((r) => {
  //     setCurrentUser({
  //       ...r.attributes,
  //     });
  //   });
  // if (info) {
  //   const { email,
  //     nickname,
  //     sub
  //   } = info.attributes
  //   Bugsnag.setUser(sub, email, nickname)
  // }
  // }

  useEffect(() => {
    DataStore.start();
  }, []);

  //   // Crear listener para cuando se acaben de obtener los modelos de datastore
  //   Hub.listen("datastore", async (hubData) => {
  //     const { event, data } = hubData.payload;

  //     if (event === "ready") {
  //       setLoading(false);
  //     }
  //   });

  //   return () => {
  //     Hub.remove("datastore", () => null);
  //   };
  // }, []);

  // if (loading) {
  //   return <Loading />;
  // } else {
  return (
    <ErrorWrapper>
      <ContextProvider>
        <Router />
      </ContextProvider>
    </ErrorWrapper>
  );
  // }
}
