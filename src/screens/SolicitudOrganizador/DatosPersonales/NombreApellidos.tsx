import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import HeaderSolicitud from "../components/HeaderSolicitud";
import AnimatedInput from "../../../components/AnimatedInput";
import Boton from "../../../components/Boton";
import { azulClaro } from "../../../../constants";
import { useNavigation } from "@react-navigation/native";
import useUser from "../../../Hooks/useUser";

export default function ({
  onPress,
}: {
  onPress?: (props: {
    nombre: string;
    paterno: string;
    materno: string;
  }) => any;
}) {
  const navigation = useNavigation<any>();
  const {
    usuario: { materno: m, paterno: p, nombre: n },
  } = useUser();

  const [materno, setMaterno] = useState(m ? m : "");
  const [paterno, setPaterno] = useState(p ? p : "");
  const [nombre, setNombre] = useState(n ? n : "");

  const [errorNombre, setErrorNombre] = useState("");
  const [errorPaterno, setErrorPaterno] = useState("");
  const [errorMaterno, setErrorMaterno] = useState("");

  function handleSaveInfo() {
    if (!nombre) {
      setErrorNombre("Introduce tu nombre");
      return;
    }

    if (!paterno) {
      setErrorPaterno("Escribe tu apellido paterno");
      return;
    }
    if (!materno) {
      setErrorMaterno("Escribe tu apellido materno");
      return;
    }

    navigation.navigate("Step2", {
      nombre,
      paterno,
      materno,
    });
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
      }}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <HeaderSolicitud
          titulo="¿Como te llamas?"
          subTitulo="Escribe tu nombre como aparece en tu identificacion oficial"
        />

        {/* Nombres */}

        <AnimatedInput
          autoCapitalize="words"
          valid={!errorNombre}
          errorText={errorNombre}
          onFocus={() => setErrorNombre("")}
          styleContent={{ marginTop: 40 }}
          placeholder="Nombre"
          value={nombre}
          onChangeText={setNombre}
        />
        <AnimatedInput
          autoCapitalize="words"
          valid={!errorPaterno}
          errorText={errorPaterno}
          onFocus={() => setErrorPaterno("")}
          placeholder="Apellido paterno"
          value={paterno}
          onChangeText={setPaterno}
        />
        <AnimatedInput
          autoCapitalize="words"
          valid={!errorMaterno}
          errorText={errorMaterno}
          onFocus={() => setErrorMaterno("")}
          placeholder="Apellido materno"
          value={materno}
          onChangeText={setMaterno}
        />
      </ScrollView>
      <Boton
        style={{
          backgroundColor: azulClaro,
          margin: 20,
        }}
        titulo="Guardar informacion"
        onPress={
          onPress ? () => onPress({ nombre, paterno, materno }) : handleSaveInfo
        }
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
});
