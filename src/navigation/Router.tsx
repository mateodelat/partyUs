import { Alert, StyleSheet, Text, View } from "react-native";
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
import DetalleEvento from "../screens/Inicio/DetalleEvento";
import Perfil from "../screens/Inicio/Perfil";
import SolicitudOrganizador from "../screens/SolicitudOrganizador";
import SeleccionaID from "../screens/SolicitudOrganizador/SeleccionaID";
import SubirDocumento from "../screens/SolicitudOrganizador/SubirDocumento";
import PersonalDataStack from "./PersonalDataStack";
import NombreApellido from "../screens/SolicitudOrganizador/DatosPersonales/NombreApellidos";
import useUser from "../Hooks/useUser";

function NombreApellidosOnPress({ navigation }: any) {
  const setUsuario = useUser().setUsuario;

  function handleContinuar({
    nombre,
    paterno,
    materno,
  }: {
    nombre: string;
    paterno: string;
    materno: string;
  }) {
    setUsuario((p) => ({
      ...p,
      materno,
      nombre,
      paterno,
    }));
    Alert.alert("Exito", "Nombre actualizado con exito");
    navigation.pop();
  }

  return <NombreApellido onPress={handleContinuar} />;
}

export default function () {
  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator
        // initialRouteName="AgregarEventoStack"
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
          name="DetalleEvento"
          component={DetalleEvento}
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
        <Stack.Screen
          name="SolicitudOrganizador"
          component={SolicitudOrganizador}
          options={{
            title: " ",
          }}
        />
        <Stack.Screen
          name="DatosPersonales"
          component={PersonalDataStack}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EditNombre"
          component={NombreApellidosOnPress}
          options={{
            title: "Modifica nombre",
          }}
        />
        <Stack.Screen
          name="SeleccionaID"
          component={SeleccionaID}
          options={{
            title: " ",
          }}
        />
        <Stack.Screen
          name="SubirDocumento"
          component={SubirDocumento}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
