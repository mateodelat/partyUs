import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import NavBar from "./NavBar";

import Header from "./components/Header";
import AgregarEventoStack from "./AgregarEventoStack";
import MisReservas from "../screens/Inicio/MisReservas";
import QRCode from "../screens/Inicio/QRCode";
import Notifications from "../screens/Inicio/Notifications";
import Home from "../screens/Inicio/Home";
import Perfil from "../screens/Inicio/Perfil";

export default function () {
  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          header: ({
            route: { name },
            navigation,
            options: { title: tit },
          }) => {
            const title = tit ? tit : name;
            return <Header title={title} navigation={navigation} />;
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MisReservas"
          component={MisReservas}
          options={{
            title: "Mis reservas",
          }}
        />
        <Stack.Screen
          name="QRCode"
          component={QRCode}
          options={{
            title: "Escanear codigo",
          }}
        />
        <Stack.Screen
          name="Perfil"
          component={Perfil}
          options={{
            title: "Mi perfil",
          }}
        />
        <Stack.Screen
          name="Notifications"
          component={Notifications}
          options={{
            title: "Notificaciones",
          }}
        />
        <Stack.Screen
          name="AgregarEventoStack"
          component={AgregarEventoStack}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
