import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Home from "../../screens/Inicio/Home";
import MyTabBar from "./components/MyTabBar";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";

import Plus from "./components/Plus";
import useUser from "../../Hooks/useUser";
import Perfil from "../../screens/Inicio/Perfil";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colorFondo } from "../../../constants";
const Tab = createBottomTabNavigator();

function PlusScreen() {
  return null;
}

export default function () {
  const organizador = useUser()?.usuario;

  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      tabBar={(props) => <MyTabBar {...props} />}
      screenOptions={{
        header: () => (
          <View
            style={{
              paddingTop: insets.top,
              backgroundColor: colorFondo,
            }}
          />
        ),
      }}
    >
      <Tab.Screen
        name="Descubrir"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => {
            if (focused)
              return <Ionicons name="ios-compass" size={24} color="black" />;
            return (
              <Ionicons name={"ios-compass-outline"} size={24} color="black" />
            );
          },
        }}
      />

      {/* Si el usuario es organizador se renderiza el mas, si no se pone la lista de eventos */}
      {organizador ? (
        <Tab.Screen
          name="Plus"
          component={PlusScreen}
          options={{
            tabBarIcon: () => {
              return <Plus />;
            },
          }}
        />
      ) : (
        <Tab.Screen
          name="Reservas"
          component={Home}
          options={{
            tabBarIcon: ({ focused }) => {
              if (focused)
                return (
                  <MaterialCommunityIcons
                    name="ticket-confirmation"
                    size={24}
                    color="black"
                  />
                );
              return (
                <MaterialCommunityIcons
                  name="ticket-confirmation-outline"
                  size={24}
                  color="black"
                />
              );
            },
          }}
        />
      )}

      <Tab.Screen
        name="Perfil"
        component={Perfil}
        options={{
          tabBarIcon: ({ focused }) => {
            if (focused)
              return <FontAwesome name="user" size={24} color="black" />;
            return <FontAwesome name="user-o" size={24} color="black" />;
          },
        }}
      />
    </Tab.Navigator>
  );
}
