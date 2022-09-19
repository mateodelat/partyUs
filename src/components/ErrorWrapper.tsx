import React, { ReactChild } from "react";
import { View, Text, SafeAreaView, StyleSheet } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as Updates from "expo-updates";
import Boton from "./Boton";

class ErrorRouter extends React.Component {
  state = {
    error: false,
  };

  static getDerivedStateFromError() {
    return { error: true };
  }

  componentDidCatch(error: Error) {
    console.log(error);
    // Bugsnag.notify(error)
  }

  render() {
    if (this.state.error) {
      return (
        <SafeAreaView style={styles.safeAreaView}>
          <View style={styles.container}>
            <View style={styles.content}>
              <Ionicons name="ios-information-circle" size={60} />
              <Text style={{ fontSize: 32 }}>
                Oops, tuvimos un inconveniente
              </Text>
              <Text
                style={{
                  marginVertical: 10,
                  lineHeight: 23,
                  fontWeight: "500",
                }}
              >
                La aplicacion tuvo un problema que no la dejo continuar,
                presiona el boton de abajo para volver a cargar la app. Por
                favor contactanos si el problema persiste
              </Text>
            </View>
          </View>
          <Boton
            titulo={"Volver a cargar"}
            onPress={() => {
              Updates.reloadAsync();
            }}
            style={{
              margin: 20,
            }}
          />
        </SafeAreaView>
      );
    } else {
      return this.props.children;
    }
  }
}

export default function ({ children }: { children: ReactChild }) {
  return <ErrorRouter>{children}</ErrorRouter>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    alignItems: "center",
    justifyContent: "center",
  },

  safeAreaView: {
    flex: 1,
  },
});
