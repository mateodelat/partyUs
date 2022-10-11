import React from "react";

import { DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/Login/Login";
import Register from "../screens/Login/Register";
import Header from "./components/Header";
import PasswordForget from "../screens/Login/PasswordForget";
import Confirm from "../screens/Login/Confirm";
import { View } from "react-native";

// import Register from '../screens/Login/Register';
// import Landing from '../screens/Login/Landing';
// import Confirm from '../screens/Login/Confirm';
// import NewPassword from '../screens/Login/NewPassword';
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#fff",
  },
};

export default function LoginStack({
  route: {
    params: { onLogin },
  },
}: {
  route: {
    params: { onLogin: () => void };
  };
}) {
  const Stack = createStackNavigator();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#00000088",
      }}
    >
      <Stack.Navigator
        screenOptions={{
          header: ({
            route: { name },
            navigation,
            options: { title: tit },
          }) => {
            const title = tit ? tit : null;
            return <Header title={title} />;
          },
        }}
      >
        {/* <Stack.Screen
          name="Landing"
          component={Landing}
          options={{
            headerShown: false,
          }}
        /> */}
        <Stack.Screen
          name="Login"
          component={Login}
          initialParams={{ onLogin }}
        />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen
          name="PasswordForget"
          component={PasswordForget}
          options={{
            title: "Contraseña olvidada",
          }}
        />
        <Stack.Screen
          name="Confirm"
          component={Confirm}
          options={{
            title: "Confirmar codigo",
          }}
        />
      </Stack.Navigator>
    </View>
  );
}
