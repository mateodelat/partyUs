import React from "react";

import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../../Login/Login";
import Register1 from "../../Login/Register/Register1";
import Register2 from "../../Login/Register/Register2";
import Header from "../components/Header";
import Landing from "../../Login/Landing";

import { SafeAreaProvider } from "react-native-safe-area-context";
import PasswordForget from "../../Login/PasswordForget";
import Confirm from "../../Login/Confirm";
import { KeyboardAvoidingView, Platform } from "react-native";

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

export default function LoginStack() {
  const Stack = createStackNavigator();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={MyTheme}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{
            flex: 1,
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
                return <Header title={title} navigation={navigation} />;
              },
            }}
          >
            <Stack.Screen
              name="Landing"
              component={Landing}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register1" component={Register1} />
            <Stack.Screen name="Register2" component={Register2} />
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
        </KeyboardAvoidingView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
