import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";
import HeaderSolicitud from "./components/HeaderSolicitud";
import { azulClaro, tipoDocumento } from "../../../constants";
import { NavigationProp } from "../../shared/interfaces/navigation.interface";

export default function ({ navigation }: { navigation: NavigationProp }) {
  function handleIne() {
    navigation.navigate("SubirDocumento", tipoDocumento.INE);
  }

  function handlePasaporte() {
    navigation.navigate("SubirDocumento", tipoDocumento.PASAPORTE);
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <AntDesign name="idcard" size={80} color="black" />
      </View>

      <HeaderSolicitud
        style={{ padding: 20 }}
        titulo={"Prueba de identidad"}
        subTitulo={
          "Necesitamos ver tu nombre claramente en un documento oficial"
        }
      />

      {/* Lista documentos */}
      <Text style={[styles.subTitle, styles.pressable]}>
        TIPOS DE DOCUMENTOS QUE PUEDES SUBIR
      </Text>

      {/* Pasaporte */}
      <TouchableOpacity onPress={handlePasaporte} style={styles.pressable}>
        <Text style={styles.textPressable}>Pasaporte</Text>

        {/* Label de recomendado */}
        <Text style={styles.recomendado}>Recomendado</Text>
        <View style={{ flex: 1 }} />

        <AntDesign
          style={{
            marginRight: 20,
          }}
          name="right"
          size={24}
          color={azulClaro}
        />
      </TouchableOpacity>

      {/* INE */}
      <TouchableOpacity onPress={handleIne} style={styles.pressable}>
        <Text style={styles.textPressable}>Credencial de elector (INE)</Text>

        <View style={{ flex: 1 }} />

        <AntDesign
          style={{
            marginRight: 20,
          }}
          name="right"
          size={24}
          color={azulClaro}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
  },

  subTitle: {
    marginTop: 40,
    fontSize: 16,
    fontWeight: "bold",
    paddingLeft: 20,
    paddingBottom: 10,
  },

  pressable: {
    borderBottomColor: "#aaa",
    borderBottomWidth: 0.5,
    flexDirection: "row",
    alignItems: "center",
  },

  textPressable: {
    marginLeft: 20,
    marginVertical: 15,
    fontSize: 16,
    marginRight: 40,
  },

  recomendado: {
    backgroundColor: azulClaro + "29",
    color: azulClaro + "bb",
    fontWeight: "bold",
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});
