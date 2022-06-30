import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Header from "./components/Header";
import Agregar1 from "../screens/AgregarEvento/Agregar1";
import Agregar2 from "../screens/AgregarEvento/Agregar2";
import Agregar3 from "../screens/AgregarEvento/Agregar3";

export default function () {
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        header: ({ route: { name }, navigation, options: { title: tit } }) => {
          const title = tit ? tit : name;
          return <Header title={title} navigation={navigation} />;
        },
      }}
    >
      <Stack.Screen
        name="Agregar1"
        component={Agregar1}
        options={{
          title: "Nuevo evento",
        }}
      />
      <Stack.Screen
        name="Agregar2"
        component={Agregar2}
        options={{
          title: "Nuevo evento",
        }}
      />
      <Stack.Screen
        name="Agregar3"
        component={Agregar3}
        options={{
          title: "Nuevo evento",
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({});
