import React, { useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Agregar1 from "../screens/AgregarEvento/Agregar1";
import Agregar2 from "../screens/AgregarEvento/Agregar2";
import Agregar3 from "../screens/AgregarEvento/Agregar3";
import Agregar4 from "../screens/AgregarEvento/Agregar4";
import { EventoType } from "../screens/Inicio/Home";
import EventContext from "../contexts/EventContext";
import { KeyboardAvoidingView, Platform } from "react-native";

export default function AgregarEvento() {
  const Stack = createStackNavigator();
  const [evento, setEvento] = useState<EventoType>({} as any);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <EventContext.Provider
        value={{
          evento,
          setEvento,
        }}
      >
        <Stack.Navigator
          // initialRouteName="Agregar3"
          screenOptions={{
            animationEnabled: false,
            headerShown: false,
          }}
        >
          <Stack.Screen name="Agregar1" component={Agregar1} />
          <Stack.Screen name="Agregar2" component={Agregar2} />
          <Stack.Screen name="Agregar3" component={Agregar3} />
          <Stack.Screen name="Agregar4" component={Agregar4} />
        </Stack.Navigator>
      </EventContext.Provider>
    </KeyboardAvoidingView>
  );
}
