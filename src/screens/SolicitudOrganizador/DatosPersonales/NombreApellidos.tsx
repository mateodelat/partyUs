import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import HeaderSolicitud from "../components/HeaderSolicitud";
import AnimatedInput from "../../../components/AnimatedInput";
import Boton from "../../../components/Boton";
import {
  azulClaro,
  formatTelefono,
  isEmulator,
  produccion,
} from "../../../../constants";
import { useNavigation } from "@react-navigation/native";
import useUser from "../../../Hooks/useUser";
import { CountryList } from "react-native-country-codes-picker";
import ModalBottom from "../../../components/ModalBottom";

export default function ({
  onPress,
}: {
  onPress?: (props: {
    nombre: string;
    paterno: string;
    materno: string;
  }) => Promise<any>;
}) {
  const navigation = useNavigation<any>();
  let {
    setLoading,
    usuario: {
      materno: m,
      paterno: p,
      nombre: n,
      phoneCode: phc,
      phoneNumber: phn,
    },
  } = useUser();

  // Si estamos en desarrollo, poner nombres de prueba
  if (!produccion) {
    m = m ? m : "Margarita";
    p = p ? p : "Gomez";
    n = n ? n : "Velazquez";

    phn = phn ? phn : "3344443343";
  }

  // Nombre y apellidos
  const [materno, setMaterno] = useState(m ? m : "");
  const [paterno, setPaterno] = useState(p ? p : "");
  const [nombre, setNombre] = useState(n ? n : "");

  // Numero de telefono
  const [phoneCode, setPhoneCode] = useState(phc ? phc : "+52");
  const [phoneFlag, setPhoneFlag] = useState("🇲🇽");
  const [codePickerVisible, setCodePickerVisible] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState(
    phn ? formatTelefono(phn) : ""
  );

  // Erorres formato
  const [errorNombre, setErrorNombre] = useState("");
  const [errorPaterno, setErrorPaterno] = useState("");
  const [errorMaterno, setErrorMaterno] = useState("");
  const [errorPhoneNumber, setErrorPhoneNumber] = useState("");

  const [country, setCountry] = useState("");

  function handleSaveInfo() {
    if (!nombre) {
      setErrorNombre("Introduce tu nombre");
      return;
    }

    if (!paterno) {
      setErrorPaterno("Escribe tu apellido paterno");
      return;
    }

    if (!phoneNumber) {
      setErrorPhoneNumber("Escribe tu numero telefonico");

      return;
    }

    // Eliminar los espacios
    const numero = phoneNumber.replace(/ /g, "");

    navigation.navigate("Step2", {
      nombre,
      paterno,
      materno,
      phoneCode,
      phoneNumber: numero,
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

        {/* Numeros de telefono */}
        <View style={styles.phoneNumberContainer}>
          <TouchableOpacity
            onPress={() => setCodePickerVisible(true)}
            style={styles.phoneCodeContainer}
          >
            <Text style={styles.phoneCodeTxt}>
              {phoneFlag + " " + phoneCode}
            </Text>
          </TouchableOpacity>
          <AnimatedInput
            styleContent={{ flex: 1 }}
            valid={!errorPhoneNumber}
            keyboardType={"phone-pad"}
            errorText={errorPhoneNumber}
            onFocus={() => setErrorPhoneNumber("")}
            placeholder=""
            value={phoneNumber}
            onChangeText={(tel) => {
              tel = formatTelefono(tel);
              setPhoneNumber(tel);
            }}
          />
        </View>
      </ScrollView>
      <Boton
        style={{
          backgroundColor: azulClaro,
          margin: 20,
        }}
        titulo="Guardar informacion"
        onPress={
          onPress
            ? async () => {
                setLoading(true);
                await onPress({ nombre, paterno, materno });
                setLoading(false);
              }
            : handleSaveInfo
        }
      />

      <ModalBottom
        modalVisible={codePickerVisible}
        setModalVisible={setCodePickerVisible}
      >
        <View style={styles.countriesContainer}>
          <TextInput
            placeholder="País"
            style={styles.searchBar}
            value={country}
            onChangeText={setCountry}
          />
          <View style={styles.line} />
          <CountryList
            searchValue={country}
            lang={"en"}
            pickerButtonOnPress={(item) => {
              setPhoneFlag(item.flag);

              setPhoneCode(item.dial_code);
              setCodePickerVisible(false);
            }}
          />
        </View>
      </ModalBottom>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    flex: 1,
  },

  countriesContainer: {
    height: "50%",
    backgroundColor: "#fff",
    padding: 10,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },

  searchBar: {
    backgroundColor: "#F5F5F5",

    borderRadius: 10,
    padding: 10,
  },

  line: {
    width: "100%",
    backgroundColor: "lightgray",
    height: 1,

    marginVertical: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },

  phoneCodeContainer: {
    padding: 10,
    bottom: 7,
    paddingRight: 20,
    justifyContent: "flex-end",
  },
  phoneCodeTxt: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 18,
  },

  tituloInput: {
    marginTop: 40,
    marginBottom: 20,
    fontSize: 20,
    fontWeight: "bold",
  },

  phoneNumberContainer: { marginTop: 40, flexDirection: "row" },
});
