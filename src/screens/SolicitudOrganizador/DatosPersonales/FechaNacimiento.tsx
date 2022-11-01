import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import HeaderSolicitud from "../components/HeaderSolicitud";
import Boton from "../../../components/Boton";
import {
  azulClaro,
  clearDate,
  mayusFirstLetter,
  mesAString,
  msInDay,
} from "../../../../constants";
import { useNavigation } from "@react-navigation/native";

import DateTimePickerModal from "react-native-modal-datetime-picker";

import useUser from "../../../Hooks/useUser";
import { DataStore } from "aws-amplify";
import { Usuario } from "../../../models";

export default function ({
  route,
}: {
  route: {
    params: {
      nombre: string;
      materno: string;
      paterno: string;
    };
  };
}) {
  const navigation = useNavigation<any>();
  const {
    usuario: { fechaNacimiento: fNac },
    usuario,
  } = useUser();

  const nombre = route.params?.nombre;
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  // Si ya tenemos fecha de nacimiento del usuario ponerla si no es indefinido
  const [fechaNacimiento, setFechaNacimiento] = useState<Date | undefined>(
    fNac ? new Date(fNac) : undefined
  );
  const [error, setError] = useState("");

  const hours = new Date().getTimezoneOffset() * 60 * 1000;

  const maxDate = new Date(new Date().getTime() - msInDay * 18 * 365);

  const dateBorn = fechaNacimiento
    ? new Date(fechaNacimiento.getTime() + hours)
    : maxDate;

  async function handleSaveInfo() {
    if (!fechaNacimiento) {
      setError("Agrega tu fecha de nacimiento");
      return;
    }
    // Establecer la fecha de hace 18 años
    let hace18Años = new Date();
    hace18Años.setUTCFullYear(new Date().getUTCFullYear() - 18);
    hace18Años = clearDate(hace18Años);

    // Si el usuario tiene mas de 18 años pasa
    if (hace18Años.getTime() >= fechaNacimiento.getTime()) {
      const { materno, paterno, nombre } = route.params;

      navigation.navigate("Step3", {
        ...usuario,
        nombre,
        paterno,
        materno,
        fechaNacimiento: fechaNacimiento.toISOString(),
      });
    } else {
      setError("Debes ser mayor de 18 años para poder estar en partyus");
    }
  }

  const { dia, mes, año } = {
    dia: fechaNacimiento?.getUTCDate(),
    mes: mesAString(fechaNacimiento?.getUTCMonth()),
    año: fechaNacimiento?.getUTCFullYear(),
  };

  function handleConfirmDate(date: Date) {
    setIsDatePickerVisible(false);
    date = clearDate(date);
    setFechaNacimiento(date);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <HeaderSolicitud
        titulo={
          mayusFirstLetter(nombre) + (nombre ? ", " : "") + "¿Cuando naciste?"
        }
        subTitulo="Para que nunca olvidemos tu cumpleaños"
      />

      <Pressable
        onPress={() => {
          setIsDatePickerVisible(true);
          setError("");
        }}
        style={{
          ...styles.datePressable,
          borderColor: error ? "red" : "#888",
        }}
      >
        <Text style={[styles.diaTxt, styles.text]}>{dia ? dia : "Dia"}</Text>
        <Text style={[styles.mesTxt, styles.text]}>{mes ? mes : "Mes"}</Text>
        <Text style={[styles.añoTxt, styles.text]}>{año ? año : "Año"}</Text>
      </Pressable>
      <Text style={styles.error}>{error}</Text>
      <View style={{ flex: 1 }} />

      <DateTimePickerModal
        textColor={"#000"}
        isVisible={isDatePickerVisible}
        mode="date"
        date={dateBorn}
        maximumDate={maxDate}
        onConfirm={handleConfirmDate}
        onCancel={() => setIsDatePickerVisible(false)}
      />

      <Boton
        style={{
          backgroundColor: azulClaro,
        }}
        titulo="Guardar informacion"
        onPress={handleSaveInfo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    flex: 1,
  },

  inputContainer: {
    marginBottom: 20,
  },

  tituloInput: {
    marginTop: 40,
    marginBottom: 20,
    fontSize: 20,
    fontWeight: "bold",
  },
  datePressable: {
    marginTop: 60,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#888",
    padding: 10,
    flexDirection: "row",
  },

  text: {
    color: "#888",
  },

  diaTxt: {
    width: 80,
  },
  mesTxt: {
    flex: 1,
  },
  añoTxt: {
    width: 80,
  },

  infoTxt: {
    color: "#888",
  },
  error: {
    color: "red",
    marginTop: 5,
  },
});
