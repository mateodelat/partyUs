import { ScrollView, StyleSheet, Text, View, Alert } from "react-native";
import React, { useState } from "react";
import HeaderSolicitud from "../components/HeaderSolicitud";
import AnimatedInput from "../../../components/AnimatedInput";
import Boton from "../../../components/Boton";
import {
  azulClaro,
  fetchFromAPI,
  formatCuentaCLABE,
  validateClabe,
} from "../../../../constants";
import { useNavigation } from "@react-navigation/native";
import useUser from "../../../Hooks/useUser";

import { bankAccount_type } from "../../../../types/openpay";

export default function ({ route }: { route: any }) {
  const navigation = useNavigation<any>();
  const { usuario, setUsuario, setLoading } = useUser();

  const { cuentaBancaria: c } = usuario;

  const [cuentaBancaria, setCuentaBancaria] = useState(c);
  const [clabeData, setClabeData] = useState(validateClabe(c));

  const [error, setError] = useState("");

  async function handleSaveInfo() {
    const status = validateClabe(cuentaBancaria);

    if (!validateClabe(cuentaBancaria).ok) {
      const message = status?.message;

      setError(message);
      return;
    }

    setLoading(true);
    // Quitar espacios
    let clabe = cuentaBancaria.replace(/\D/g, "");

    // Acutalizar el usuario localmente
    setUsuario({
      ...usuario,
      ...route.params,
      cuentaBancaria: clabe,
    });

    const input = {
      holder_name:
        usuario.nombre + " " + usuario.paterno + " " + usuario.materno,
      alias: "Cuenta principal",
      clabe,
      customer_id: usuario.userPaymentID,
    };

    await fetchFromAPI<bankAccount_type>("/payments/bankaccount", "POST", input)
      .then((e) => {
        const r = e.body?.id;
        return r;
      })
      .catch((e) => {
        console.log(e);
        Alert.alert(
          "Error",
          "Hubo un error creando la cuenta bancaria: " + e.error.description
        );
      });
    setLoading(false);

    navigation.navigate("SolicitudOrganizador");
  }

  const bankCity = clabeData?.city ? clabeData?.city : "";
  const bankName = clabeData?.bank ? clabeData?.bank : "";

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
          titulo="¿Como te enviamos el dinero?"
          subTitulo="Introduce tu cuenta CLABE (Clave Bancaria Estandarizada de México) para poder enviarte el dinero"
        />

        {/* CLABE */}

        <AnimatedInput
          styleContent={{ marginTop: 40 }}
          keyboardType="decimal-pad"
          valid={!error}
          errorText={error}
          onFocus={() => setError("")}
          placeholder="CLABE"
          value={cuentaBancaria}
          onChangeText={(r) => {
            setCuentaBancaria(formatCuentaCLABE(r));
            setClabeData(validateClabe(r));
          }}
        />

        <Text style={styles.bankTxt}>{bankName + " " + bankCity}</Text>
      </ScrollView>
      <Boton
        style={{
          backgroundColor: azulClaro,
          margin: 20,
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
  bankTxt: {
    color: azulClaro,
    fontSize: 16,
    marginTop: 20,
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
