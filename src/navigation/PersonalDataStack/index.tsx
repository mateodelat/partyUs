import { StyleSheet, Text, KeyboardAvoidingView, Platform } from "react-native";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Header from "../components/Header";
import NombreApellidos from "../../screens/SolicitudOrganizador/DatosPersonales/NombreApellidos";
import FechaNacimiento from "../../screens/SolicitudOrganizador/DatosPersonales/FechaNacimiento";
import DatosBancarios from "../../screens/SolicitudOrganizador/DatosPersonales/DatosBancarios";

export default function PersonalData() {
  const Stack = createStackNavigator();

  const pasos = 3;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Stack.Navigator
        screenOptions={{
          animationEnabled: false,
          header: ({
            route: { name },
            navigation,
            options: { title: tit },
          }) => {
            const title = tit ? tit : name;
            return (
              <Header
                textStyle={{
                  fontWeight: "normal",
                }}
                title={title}
              />
            );
          },
        }}
      >
        <Stack.Screen
          name="Step1"
          component={NombreApellidos}
          options={{
            title: "Paso 1 de " + pasos,
          }}
        />
        <Stack.Screen
          name="Step2"
          component={FechaNacimiento}
          options={{
            title: "Paso 2 de " + pasos,
          }}
        />
        <Stack.Screen
          name="Step3"
          component={DatosBancarios}
          options={{
            title: "Paso 3 de " + pasos,
          }}
        />
      </Stack.Navigator>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({});
