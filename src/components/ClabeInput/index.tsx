import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
  Platform,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";

import Boton from "../Boton";
import { AsyncAlert, azulClaro, formatCuentaCLABE } from "../../../constants";
import InputOnFocusV2 from "../InputOnFocusV2";
import { AntDesign } from "@expo/vector-icons";
import { clabe } from "../../../constants/ClabeValidator";

export type saveParamsClabeInput = {
  clabe: string; //"4242 4242"
  bank_name: string; //"300",
  titular: string; //"Mateo de la torre"
};

export default function ({
  onAdd,
  setModalVisible,

  prevValues,
}: {
  onAdd: (params: saveParamsClabeInput) => void;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;

  prevValues?:
    | {
        clabe: string;
        titular: string;
      }
    | undefined;
}) {
  const [innerModal, setInnerModal] = useState(false);

  const [name, setName] = useState(prevValues?.titular);

  const [cuentaClabe, setCuentaClabe] = useState(
    prevValues?.clabe ? prevValues.clabe : ""
  );
  const [banco, setBanco] = useState(
    prevValues?.clabe ? clabe.validate(prevValues?.clabe).bank : ""
  );
  const [errorCuentaClabe, setErrorCuentaClabe] = useState("");

  const accountRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);

  const handleCloseModal = async () => {
    if (
      prevValues
        ? name !== prevValues?.titular || cuentaClabe !== prevValues?.clabe
        : name || cuentaClabe
    ) {
      await AsyncAlert("Atencion", "Se perderan los datos de la cuenta").then(
        (r) => {
          if (r) {
            setInnerModal(false);
            setModalVisible(false);
          }
        }
      );
    } else {
      setInnerModal(false);
      setModalVisible(false);
    }
  };

  useEffect(() => {
    setInnerModal(true);
  }, []);

  function handleSave() {
    if (!cuentaClabe) {
      Alert.alert("Error", "Agrega un numero de cuenta");
      return;
    }

    if (cuentaClabe.length !== 18) {
      Alert.alert("Error", "La clabe tiene que tener longitud de 18 digitos");
      return;
    }

    const cuenta = clabe.validate(cuentaClabe);

    if (!name) {
      Alert.alert("Error", "Agrega el nombre del titular");
      return;
    }

    if (!cuenta.ok) {
      Alert.alert("Error", "Cuenta clabe no valida");
      return;
    }

    onAdd({
      clabe: cuentaClabe,
      bank_name: cuenta.bank,
      titular: name,
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#00000099" }}>
      <Modal
        animationType={"slide"}
        transparent={true}
        visible={innerModal}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <Pressable onPress={handleCloseModal} style={{ flex: 1 }} />

          <Pressable
            onPress={() => Keyboard.dismiss()}
            style={styles.modalContainer}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.title}>
                {!prevValues?.clabe
                  ? "Agregar nueva cuenta"
                  : "Modificar cuenta CLABE"}
              </Text>
              <AntDesign name="Safety" size={24} color={azulClaro} />
            </View>
            <View style={styles.line} />

            {/* Numero de cuenta */}
            <InputOnFocusV2
              onLayout={() => {
                setTimeout(() => {
                  accountRef.current?.focus();
                }, 100);
              }}
              ref={accountRef}
              style={{
                marginBottom: 0,
              }}
              onSubmitEditing={() => {
                nameRef.current?.focus();
              }}
              returnKeyType={"next"}
              keyboardType={"numeric"}
              titulo={errorCuentaClabe ? errorCuentaClabe : "Cuenta CLABE"}
              valid={!errorCuentaClabe}
              onChangeText={(value) => {
                value = value.replace(/ /g, "");

                let validation = clabe.validate(value);
                setBanco(validation.bank);

                // Si ya son 18 digitos de largo y no es valida la cuenta, devolver error
                if (value.length === 18) {
                  // Si es valida, pasar al siguiente valor
                  if (validation.ok) {
                    setErrorCuentaClabe("");
                    nameRef.current.focus();
                  } else {
                    setErrorCuentaClabe(validation.message);
                  }
                } else if (value.length < 18) {
                  setErrorCuentaClabe("");
                }

                setCuentaClabe(value);
              }}
              value={formatCuentaCLABE(cuentaClabe)}
            />

            <Text style={styles.banco}>{banco}</Text>

            <InputOnFocusV2
              titulo={"Nombre del titular"}
              placeholder={"Escribe el nombre completo"}
              autoCapitalize={"characters"}
              onChangeText={setName}
              value={name}
              style={{ marginTop: 30 }}
              onSubmitEditing={handleSave}
              ref={nameRef}
            />

            <Boton
              style={{
                borderRadius: 10,
                marginTop: 20,
              }}
              titulo="Continuar"
              onPress={handleSave}
              color={azulClaro}
            />
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  checkContainer: {
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    width: 21,
    height: 21,
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
  },
  line: {
    marginTop: 15,
    marginBottom: 25,
    width: "100%",
    height: 1,
    backgroundColor: "lightgray",
  },
  inputContainer: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "lightgray",
  },

  banco: {
    marginTop: 5,
    color: azulClaro,
    marginLeft: 10,
  },
});
