import {
  Alert,
  Dimensions,
  Image,
  Route,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { NavigationProp } from "../../shared/interfaces/navigation.interface";
import {
  azulClaro,
  callGoogleVisionAsync,
  tipoDocumento,
  matchWholeWord,
} from "../../../constants";
import HeaderSolicitud from "./components/HeaderSolicitud";

import { FontAwesome5 } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import Boton from "../../components/Boton";
import HeaderBarIndicator from "../../components/HeaderBarIndicator";
import Header from "../../navigation/components/Header";
import SimpleCam from "../../components/SimpleCam";
import { CameraCapturedPicture } from "expo-camera";
import useUser from "../../Hooks/useUser";
import { textoAbajoPasaporte } from "./components/functions";
import { idData } from "../../contexts/UserContext";

interface ruta extends Route {
  params: tipoDocumento;
}

enum estadoDocumento {
  "INFOPRIMERAFOTO",
  "PRIMERAFOTO",
  "DETALLEPRIMERAFOTO",
}

export default function SubirDocumento({
  navigation,
  route,
}: {
  navigation: NavigationProp;
  route: ruta;
}) {
  const usuario = useUser().usuario;
  const setUsuario = useUser().setUsuario;

  const tipoDoc = route.params;

  const [estado, setEstado] = useState(estadoDocumento.INFOPRIMERAFOTO + 1);
  const [scanningImage, setScanningImage] = useState(false);
  const [takenImage, setTakenImage] = useState<null | string>(null);

  const [dataToUpload, setDataToUpload] = useState<idData | undefined>();

  const [loading, setLoading] = useState(false);

  function handleBack() {
    if (!estado) {
      navigation.pop();
    } else {
      setEstado(estado - 1);
    }
  }

  async function scanImage(base64: string | ArrayBuffer | null, idURI: string) {
    let r = await callGoogleVisionAsync(base64);

    let textoAbajo;
    let curp: string | undefined;

    let error: string | boolean = false;

    /////////////////////////////////////////////////
    /////////////////////PASAPORTE///////////////////
    /////////////////////////////////////////////////
    if (tipoDoc === tipoDocumento.PASAPORTE) {
      textoAbajo = textoAbajoPasaporte(r);

      // Ver si el documento tiene la estructura de P<
      if (!textoAbajo) error = "No se pudo detectar el pasaporte";
    }
    /////////////////////////////////////////////////
    ///////////////////////INE///////////////////////
    /////////////////////////////////////////////////
    else {
      // Si el pasaporte dice mexico, verificar que este el curp
      const mexico = r.search(/M.*XICO/) !== -1;

      // Encontrar el curp
      const curpIdx = r.search(
        /[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}/
      );

      curp = curpIdx === -1 ? undefined : r.slice(curpIdx, curpIdx + 18);

      // Que diga lo del INE y credencial para votar
      const validText =
        r.search(/INSTITUTO NACIONAL ELECTORAL.+CREDENCIAL PARA VOTAR/) >= 0;

      // Encontrar que diga mexico
      if (!mexico) {
        error = "Solo se aceptan INE's mexicanas";
      }
      // Error personalizado
      else if (!validText) {
        error = "No se detecto INE";
      } else if (!curp) {
        error = "No se detecto el curp";
      }
    }
    if (error) {
      Alert.alert(
        "Error",
        String(error) +
          "\nAsegurate que tienes buena iluminacion y se ve nitida la imagen"
      );

      setScanningImage(false);
      setTakenImage(null);
      setEstado((e) => e - 1);
      return;
    }

    // Buscar que los valores del nombre, apellidos y fecha de nacimiento se encuentren en la ID
    if (usuario) {
      let { nombre, paterno, materno } = usuario;

      // Verificar que existan todos los parametros
      if (nombre && paterno && materno) {
        // Nombre
        if (!matchWholeWord(nombre, r)) {
          error = "El nombre que introduciste no se encontro en tu ID";
        } else if (!matchWholeWord(paterno, r)) {
          error =
            "El apellido paterno que introduciste no se encontro en tu ID";
        } else if (!matchWholeWord(materno, r)) {
          error =
            "El apellido materno que introduciste no se encontro en tu ID";
        }
        if (error) {
          // Verificar error para otro tipo de alerta en donde se navegue a la otra pestaña
          Alert.alert(
            "Error",
            String(error) +
              ". Puedes cambiarlo o si esta correcto toma la foto con buena iluminacion",
            [
              {
                text: "CAMBIAR",
                onPress: () => navigation.navigate("EditNombre"),
              },
              { text: "OK" },
            ]
          );
          setScanningImage(false);
          setTakenImage(null);
          setEstado((e) => e - 1);
          return;
        }
      }
    } else throw new Error("No se encontro usuario en useContext");

    r = r.replace(/\\n|\n/g, "\n");

    setDataToUpload({
      curp,
      detectedText: r,
      tipoDocumento: tipoDoc,
      textoAbajoPasaporte: textoAbajo,
      uri: idURI,
    });

    setScanningImage(false);
  }

  async function handleDone() {
    setUsuario({
      ...usuario,
      idUploaded: true,
      idData: JSON.stringify(dataToUpload),
    });
    navigation.pop(2);
    setLoading(false);
  }

  async function handleTakePicture(props: CameraCapturedPicture) {
    // Si se tomo la primera foto entonces ver el detalle
    const { uri, base64 } = props;
    // if (uri) {
    setScanningImage(true);
    setEstado(estadoDocumento.DETALLEPRIMERAFOTO);
    setTakenImage(uri);

    if (base64) {
      scanImage(base64, uri);
    } else {
      Alert.alert("Error", "Hubo un error obteniendo el link de la imagen");
    }
  }

  const lengthEstado = Object.keys(estadoDocumento).length;

  /////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////Imagen del pasaporte///////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <Header
        title={estado === estadoDocumento.PRIMERAFOTO ? "FOTO" : " "}
        handleBack={handleBack}
      />

      <View
        style={{
          ...styles.container,
          padding: estado === estadoDocumento.PRIMERAFOTO ? 0 : 20,
        }}
      >
        {/* Indicador del header */}
        <HeaderBarIndicator
          step={estado + 1}
          totalSteps={lengthEstado / 2}
          style={{
            marginBottom: 20,
            paddingHorizontal: estado === estadoDocumento.PRIMERAFOTO ? 20 : 0,
          }}
        />
        {estado === estadoDocumento.INFOPRIMERAFOTO ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
            {tipoDoc === tipoDocumento.INE ? (
              <AntDesign name="idcard" size={50} color="black" />
            ) : (
              <FontAwesome5 name="passport" size={50} color="black" />
            )}
            <HeaderSolicitud
              style={{ marginTop: 40 }}
              titulo={
                "Toma una foto de tu " +
                (tipoDoc === tipoDocumento.INE ? "INE" : "pasaporte")
              }
              subTitulo="Asegurate de tener buena iluminacion y que todos los datos sean legibles"
              textStyle={{ textAlign: "center" }}
            />
            <View style={{ flex: 1 }} />
            <Boton
              style={{ width: "100%", backgroundColor: azulClaro }}
              titulo="Continuar"
              onPress={() => setEstado(estadoDocumento.PRIMERAFOTO)}
            />
          </View>
        ) : estado === estadoDocumento.PRIMERAFOTO ? (
          <View
            style={{
              flex: 1,
              backgroundColor: "#000",
            }}
          >
            <SimpleCam onTakePicture={handleTakePicture} />
          </View>
        ) : estado === estadoDocumento.DETALLEPRIMERAFOTO ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {takenImage && scanningImage ? (
              <Image style={styles.imageTaken} source={{ uri: takenImage }} />
            ) : null}
            <HeaderSolicitud
              titulo={scanningImage ? "Espera..." : "Listo"}
              subTitulo={
                scanningImage
                  ? "Estamos escaneando la imagen"
                  : "Imagen escaneada con exito"
              }
              textStyle={{ textAlign: "center" }}
            />
            <Boton
              style={{
                width: "100%",
                backgroundColor: azulClaro,
                position: "absolute",
                bottom: 0,
              }}
              loading={scanningImage || loading}
              titulo="Continuar"
              onPress={handleDone}
            />
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
            <FontAwesome5 name="passport" size={50} color="black" />

            <HeaderSolicitud
              style={{ marginTop: 40 }}
              titulo="Confirmar imagen"
              subTitulo="Asegurate de tener buena iluminacion"
              textStyle={{ textAlign: "center" }}
            />
            <View style={{ flex: 1 }} />
            <Boton
              style={{ width: "100%", backgroundColor: azulClaro }}
              titulo="Confirmar"
              onPress={() => setEstado(estadoDocumento.PRIMERAFOTO)}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 0,
  },

  imageTaken: {
    width: 100,
    height: 100,
  },
});
