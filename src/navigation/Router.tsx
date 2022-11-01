import { Alert, StyleSheet, Text, Linking } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";

import Header from "./components/Header";
import AgregarEventoStack from "./AgregarEventoStack";
import { MisReservas } from "../screens/Inicio/MisReservas/index";
import QRCode from "../screens/Inicio/QRCode";

import Notifications from "../screens/Inicio/Notifications/Notifications";
import Home from "../screens/Inicio/Home";
import DetalleEvento from "../screens/Inicio/DetalleEvento";
import Perfil from "../screens/Inicio/Perfil";
import SolicitudOrganizador from "../screens/SolicitudOrganizador";
import SeleccionaID from "../screens/SolicitudOrganizador/SeleccionaID";
import SubirDocumento from "../screens/SolicitudOrganizador/SubirDocumento";
import PersonalDataStack from "./PersonalDataStack";
import NombreApellido from "../screens/SolicitudOrganizador/DatosPersonales/NombreApellidos";
import useUser from "../Hooks/useUser";
import LoginStack from "./LoginStack";

import Boletos from "../screens/Inicio/Boletos";
import Pagar from "../screens/Inicio/Pagar";
import ExitoScreen from "../screens/Inicio//Pagar/ExitoScreen";
import ReferenciaPago from "../screens/ReferenciaPago";
import QRScanner from "../screens/Inicio/QRScanner";

import Saldo from "../screens/Perfil/Saldo";
import MisEventos from "../screens/Perfil/MisEventos";
import Soporte from "../screens/Perfil/Soporte";
import Loading from "../components/Loading";

import AdminStack from "./AdminStack";

function NombreApellidosOnPress({ navigation }: any) {
  const { setUsuario, usuario } = useUser();

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

  const config = {
    screens: {
      DetalleEvento: "evento",
    },
  };

  const linking = {
    prefixes: [
      "partyus://",
      "exp://192.168.1.77:19000/--",
      "exp://exp.host/@mateodelat/partyus/--",
    ],
    config,
  };

  return (
    <NavigationContainer linking={linking} fallback={<Loading indicator />}>
      <Stack.Navigator
        screenOptions={{
          header: ({
            route: { name, params },
            navigation,
            options: { title: tit },
          }) => {
            const title = tit ? tit : name;
            const showHelp = (params as any)?.showHelp;

            return <Header title={title} showHelp={showHelp} />;
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
          name="Boletos"
          component={Boletos}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="MisReservas"
          component={MisReservas}
          initialParams={{ showHelp: true }}
          options={{
            title: "Mis reservas",
          }}
        />

        <Stack.Screen
          name="QRScanner"
          component={QRScanner}
          options={{
            headerShown: false,
            ...TransitionPresets.ModalTransition,
          }}
        />

        <Stack.Screen
          name="QRCode"
          component={QRCode}
          options={{
            headerShown: false,
            ...TransitionPresets.ModalTransition,
          }}
        />
        <Stack.Screen
          name="Perfil"
          component={Perfil}
          options={{
            title: " ",
          }}
        />

        <Stack.Screen
          name="Notifications"
          component={Notifications}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Pagar"
          component={Pagar}
          options={{
            headerShown: false,
            animationEnabled: false,
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
          name="Saldo"
          component={Saldo}
          initialParams={{ showHelp: true }}
          options={{
            title: "Saldo",
            animationEnabled: false,
          }}
        />
        <Stack.Screen
          name="MisEventos"
          component={MisEventos}
          initialParams={{ showHelp: true }}
          options={{
            title: "Mis eventos",
          }}
        />
        <Stack.Screen
          name="ReferenciaPago"
          component={ReferenciaPago}
          options={{
            animationEnabled: false,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ReferenciaPagoModal"
          component={ReferenciaPago}
          options={{
            headerShown: false,
            ...TransitionPresets.ModalTransition,
          }}
        />

        <Stack.Screen name="Soporte" component={Soporte} />
        <Stack.Screen
          name="AdminStack"
          component={AdminStack}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="ExitoScreen"
          component={ExitoScreen}
          options={{
            animationEnabled: false,
            headerShown: false,
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
        <Stack.Screen
          name="LoginStack"
          component={LoginStack}
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
