import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import NavBar from "./NavBar";

import Header from "./components/Header";
import AgregarEventoStack from "./AgregarEventoStack";
import MisReservas from "../screens/Inicio/MisReservas";
import QRCode from "../screens/Inicio/QRCode";

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
          name="NavBar"
          component={NavBar}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="MisReservas" component={MisReservas} />
        <Stack.Screen name="QRCode" component={QRCode} />
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
