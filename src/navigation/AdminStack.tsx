import React from "react";

import { createStackNavigator } from "@react-navigation/stack";
import Header from "./components/Header";
import Admin from "../screens/Perfil/Admin";
import Usuarios from "../screens/Perfil/Admin/Usuarios";
import EventosAdmin from "../screens/Perfil/Admin/EventosAdmin";

// import Home from '../screens/Admin'
// import SolicitudesPendientes from '../screens/Admin/SolicitudesPendientes';

// import FechasYReservas from '../screens/Admin/FechasYReservas';

// import Header from '../components/header';
// import VerSolicitudes from '../screens/Admin/VerSolicitudes';
// import GuiasAutorizados from '../screens/Admin/GuiasAutorizados';
// import ModificarAventuras from '../screens/Admin/ModificarAventuras';

// import EditarAventura1 from '../screens/Admin/EditarAventura/EditarAventura1';
// import { mayusFirstLetter } from '../../assets/constants';
// import Publicidad from '../screens/Admin/Publicidad';
// import Usuarios from '../screens/Admin/Usuarios';

export default function AdminStack() {
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        header: (params) => {
          const {
            options: { title: tit },
          } = params;

          const { name } = params.route;

          const title = tit ? tit : name;

          return <Header title={title} />;
        },
      }}
    >
      <Stack.Screen
        name={"Usuarios"}
        component={Usuarios}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name={"Home"}
        component={Admin}
        options={{
          title: "Administrar app",
        }}
      />
      <Stack.Screen name={"EventosAdmin"} component={EventosAdmin} />
    </Stack.Navigator>
  );
}
