import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Header from "../components/Header";
import NombreApellidos from "../../screens/SolicitudOrganizador/DatosPersonales/NombreApellidos";
import FechaNacimiento from "../../screens/SolicitudOrganizador/DatosPersonales/FechaNacimiento";

export default function () {
  const Stack = createStackNavigator();

  const pasos = 2;

  return (
    <Stack.Navigator
      screenOptions={{
        animationEnabled: false,
        header: ({ route: { name }, navigation, options: { title: tit } }) => {
          const title = tit ? tit : name;
          return (
            <Header
              textStyle={{
                fontWeight: "normal",
              }}
              title={title}
              navigation={navigation}
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
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({});
