import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import {
  azulClaro,
  getBlob,
  sendAdminNotification,
  shadowBaja,
} from "../../../constants";

import { AntDesign } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";

import { NavigationProp } from "../../shared/interfaces/navigation.interface";

import HeaderSolicitud from "./components/HeaderSolicitud";
import useUser from "../../Hooks/useUser";
import Boton from "../../components/Boton";
import { DataStore, Storage } from "aws-amplify";
import { Usuario } from "../../models";

export default function ({ navigation }: { navigation: NavigationProp }) {
  function handleDatosPersonales() {
    navigation.navigate("DatosPersonales");
  }

  const usuario = useUser()?.usuario;
  const setUsuario = useUser()?.setUsuario;
  const nombre = usuario?.nombre;
  const materno = usuario?.materno;
  const paterno = usuario?.paterno;
  const idUploaded = usuario?.idUploaded;

  const allowUpload = nombre && paterno;

  const [loading, setLoading] = useState(false);

  function handleIdentificacion() {
    // Ver si ya se tiene el curp generado para comprobar ID

    if (allowUpload) {
      navigation.navigate("SeleccionaID");
    } else {
      Alert.alert("Atencion", "Primero debes verificar tus datos personales");
    }
  }

  const colorPruebaIdentidad = allowUpload ? azulClaro : azulClaro + "88";

  async function handleSaveInfo() {
    try {
      const { idData, fechaNacimiento } = usuario;

      const key = "usr-" + usuario.id + "|id.jpg";

      if (!idData) {
        Alert.alert("Error", "Ha habido un error");
        throw new Error(
          "Error al guardar informacion del usuario pues no hay idData"
        );
      }
      const uri = JSON.parse(idData).uri;
      setLoading(true);

      // Subir imagen de id
      getBlob(uri).then((image) => {
        Storage.put(key, image);
      });

      // Notificar al los administradores que el usuario se verfico como organizador
      sendAdminNotification({
        titulo: "Usuario es organizador",
        sender: usuario,
        organizadorID: usuario.id,

        descripcion: " es ahora organizador de partyus",
      });

      // Subir datos a datastore
      await DataStore.query(Usuario, usuario.id).then((r) => {
        if (!r) return;
        return DataStore.save(
          Usuario.copyOf(r, (ne) => {
            ne.idUploaded = true;
            ne.organizador = true;

            ne.idKey = key;
            ne.idData = idData;

            ne.nombre = nombre;
            ne.paterno = paterno;
            ne.materno = materno;

            ne.fechaNacimiento = fechaNacimiento;
          })
        ).then(setUsuario);
      });
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Hubo un error subiendo tus documentos");
      throw new Error("Error subiendo documentos del usuario" + e);
    }

    setLoading(false);
    Alert.alert("Exito", "Ya puedes agregar eventos a Party Us!!");

    navigation.pop();
  }

  return (
    <View style={styles.container}>
      {/* Info de header */}
      <HeaderSolicitud
        titulo={"Por seguridad necesitamos saber mas sobre ti"}
        subTitulo={
          "Tenemos comprobar que eres tu para que puedas agregar todos los eventos que quieras!!"
        }
      />
      {/* Lista de botones informacion */}
      <View style={{ marginTop: 40 }}>
        {/* Datos personales */}
        <Pressable
          style={styles.buttonContainer}
          onPress={handleDatosPersonales}
        >
          {/* Icono */}
          <View
            style={{
              alignItems: "center",
              width: 25,
            }}
          >
            <FontAwesome name="file-o" size={24} color={azulClaro} />

            <FontAwesome5
              style={{
                position: "absolute",
                bottom: -7,
                backgroundColor: "#fff",
              }}
              name="user-alt"
              size={15}
              color={azulClaro}
            />
          </View>
          <View style={{ marginLeft: 20, flex: 1 }}>
            <Text style={styles.buttonTitle}>Datos personales</Text>
            <Text style={styles.buttonDescription}>
              Comprueba tu informacion y agrega tus datos bancarios para recibir
              pagos
            </Text>
          </View>

          {!nombre || !paterno ? (
            <AntDesign
              style={{
                marginLeft: 10,
                width: 25,
              }}
              name="right"
              size={24}
              color={azulClaro}
            />
          ) : (
            <AntDesign
              style={{
                width: 25,
                marginLeft: 10,
              }}
              name="checkcircleo"
              size={24}
              color={azulClaro}
            />
          )}
        </Pressable>

        {/* Prueba de identidad */}
        <Pressable
          style={styles.buttonContainer}
          onPress={handleIdentificacion}
        >
          <AntDesign name="idcard" size={24} color={colorPruebaIdentidad} />
          <View style={{ marginLeft: 20, flex: 1 }}>
            <Text
              style={{
                ...styles.buttonTitle,
                color: allowUpload ? "#333" : "#999",
              }}
            >
              Prueba de identidad
            </Text>
            <Text
              style={{
                ...styles.buttonDescription,
                color: allowUpload ? "#888" : "#ccc",
              }}
            >
              Sube una foto de tu documento de identidad o pasaporte
            </Text>
          </View>

          {allowUpload &&
            (!idUploaded ? (
              <AntDesign
                style={{
                  marginLeft: 10,
                  width: 25,
                }}
                name="right"
                size={24}
                color={azulClaro}
              />
            ) : (
              <AntDesign
                style={{
                  marginLeft: 10,
                  width: 25,
                }}
                name="checkcircleo"
                size={24}
                color={azulClaro}
              />
            ))}
        </Pressable>
      </View>

      <View style={{ flex: 1 }} />

      {idUploaded && (
        <Boton
          titulo="Guardar info"
          onPress={handleSaveInfo}
          loading={loading}
          style={{ backgroundColor: azulClaro }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    padding: 20,
  },

  buttonContainer: {
    padding: 20,
    borderRadius: 5,
    backgroundColor: "#fff",
    ...shadowBaja,
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 20,
  },

  buttonTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },

  buttonDescription: {
    fontSize: 16,
    color: "#888",
  },
});
