import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import React from "react";

import { FontAwesome5 } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";

import {
  AsyncAlert,
  azulClaro,
  partyusEmail,
  partyusPhone,
  verde,
} from "../../../../constants";

export default function () {
  function handleWhatsapp() {
    AsyncAlert(
      "Abrir whatsapp",
      "Se te dirigira a whatsapp para comunicarte con el soporte"
    ).then((r) => {
      if (!r) return;
      Linking.openURL(
        "whatsapp://send?text=Hola, tengo un problema con partyus: &phone=" +
          partyusPhone
      ).catch((e) => {
        Alert.alert("Error", "Es probable que no tengas whatsapp instalado");
      });
    });
  }

  function handleMail() {
    AsyncAlert(
      "Enviar correo",
      "Se abrira un correo nuevo al soporte de partyus"
    ).then((r) => {
      if (!r) return;
      Linking.openURL(
        "mailto: " + partyusEmail + "?subject=SOPORTE PARTYUS"
      ).catch((e) => {
        Alert.alert("Error", "Es probable que no tengas whatsapp instalado");
      });
    });
  }

  function hanldeCall() {
    AsyncAlert(
      "Llamar",
      "Se te dirigira a una nueva llamada al soporte de partyus"
    ).then((r) => {
      if (!r) return;
      Linking.openURL("tel:" + partyusPhone).catch((e) => {
        Alert.alert("Error", "Es probable que no tengas whatsapp instalado");
      });
    });
  }

  return (
    <View style={styles.container}>
      <FontAwesome5 name="headset" size={50} color={verde} />
      <Text style={styles.title}>¿Como te podemos ayudar?</Text>

      {/* Llamada urgente contacto */}
      <TouchableOpacity onPress={hanldeCall} style={styles.buttonContainer}>
        <Feather
          style={styles.icon}
          name="phone-call"
          size={30}
          color={verde}
        />
        <Text style={styles.textButton}>Llamada urgente</Text>
        <MaterialIcons name={"keyboard-arrow-right"} size={35} color={verde} />
      </TouchableOpacity>

      {/* Whatsapp contacto */}
      <TouchableOpacity onPress={handleWhatsapp} style={styles.buttonContainer}>
        <FontAwesome
          style={styles.icon}
          name="whatsapp"
          size={30}
          color={verde}
        />
        <Text style={styles.textButton}>Linea de atencion Whatsapp</Text>
        <MaterialIcons name={"keyboard-arrow-right"} size={35} color={verde} />
      </TouchableOpacity>

      {/* Contacto por correo electronico */}
      <TouchableOpacity onPress={handleMail} style={styles.buttonContainer}>
        <Feather style={styles.icon} name="mail" size={30} color={verde} />

        <Text style={styles.textButton}>Contacto por email</Text>
        <MaterialIcons name={"keyboard-arrow-right"} size={35} color={verde} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    paddingVertical: 20,

    marginTop: 15,
    marginBottom: 20,
  },

  icon: {
    width: 30,
    alignSelf: "center",
  },

  buttonContainer: {
    borderColor: verde,
    borderWidth: 1,
    padding: 20,
    borderRadius: 10,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: verde + "20",

    marginBottom: 20,
  },

  textButton: {
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 20,
    flex: 1,
  },
});
