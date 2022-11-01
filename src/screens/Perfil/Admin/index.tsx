import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { azulClaro, rojoClaro, shadowMedia } from "../../../../constants";

import { AntDesign } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";

export default function ({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={{ ...styles.texto, marginTop: 0 }}>Datos cliente</Text>
      {/* Usuarios de la app */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Usuarios")}
        style={styles.buttonContainer}
      >
        <Feather style={styles.icon} name="users" size={24} color={"#fff"} />
        <Text style={styles.textoBoton}>Usuarios en la app</Text>
      </TouchableOpacity>

      {/* Eventos de la app */}
      <TouchableOpacity
        onPress={() => navigation.navigate("EventosAdmin")}
        style={styles.buttonContainer}
      >
        <MaterialIcons
          style={styles.icon}
          name="event"
          size={24}
          color="white"
        />
        <Text style={styles.textoBoton}>Eventos creados</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },

  buttonContainer: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: rojoClaro,

    ...shadowMedia,

    alignItems: "center",
    justifyContent: "center",
  },

  textoBoton: {
    color: "#fff",
    fontSize: 16,
  },

  icon: {
    position: "absolute",
    left: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  texto: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: "bold",
  },
});
