import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  TextInput,
  Image,
  Keyboard,
  Alert,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";

import Boton from "../Boton";
import {
  AsyncAlert,
  azulClaro,
  azulFondo,
  getCardIcon,
  normalizeCardType,
} from "../../../constants";
import InputOnFocusV2 from "../InputOnFocusV2";
import valid from "card-validator";
import { CardNumberVerification } from "./card-number";
import { TextInputMask } from "react-native-masked-text";

import { Feather } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { cardBrand_type } from "../../../types/openpay";

enum cardType {
  "visa" = "visa",
  "master-card" = "master-card",
  "american-express" = "american-express",
  "diners-club" = "diners-club",
  "discover" = "discover",
  "jcb" = "jcb",
  "unionpay" = "unionpay",
  "maestro" = "maestro",
}

type input = {
  value: string;
  validation?: CardNumberVerification;
};

export type saveParams = {
  number: string; //"4242 4242"
  expiry: { month: string; year: string }; //"06/19"
  cvv: string; //"300",
  icon: NodeRequire; // Icono de la tarjeta
  name: string; //"Sam",
  type?: cardBrand_type;
  saveCard: boolean;
};

export default function ({
  onAdd,
  setModalVisible,
  comprasFuturasEnabled,
}: {
  onAdd: (params: saveParams) => void;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  comprasFuturasEnabled?: boolean;
}) {
  const [innerModal, setInnerModal] = useState(false);

  const [cvv, setCvv] = useState<input>();

  const [expiry, setExpiry] = useState<input>();

  const [number, setNumber] = useState<input>();

  const [name, setName] = useState("");

  const [saveCard, setSaveCard] = useState(true);

  const numberRef = useRef<{ _inputElement: TextInputMask & TextInput }>(null);
  const expiryRef = useRef<{ _inputElement: TextInputMask & TextInput }>(null);
  const cvcRef = useRef<{ _inputElement: TextInputMask & TextInput }>(null);
  const nameRef = useRef<
    { _inputElement: TextInputMask & TextInput } & TextInput
  >(null);

  const handleCloseModal = async () => {
    if (name || number || expiry || cvv) {
      await AsyncAlert("Atencion", "Se perderan los datos de la tarjeta").then(
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

    // setNumber({
    //   value: "4242424242424242",
    //   validation: {
    //     card: {
    //       cvv: 3,
    //       type: "visa",
    //     },
    //     isPotentiallyValid: true,
    //     isValid: true,
    //   },
    // });
    // setName("Test name");
    // setExpiry({
    //   value: "02/24",
    //   validation: {
    //     isPotentiallyValid: true,
    //     isValid: true,
    //   },
    // });
    // setCvv({
    //   value: "022",
    //   validation: {
    //     isPotentiallyValid: true,
    //     isValid: true,
    //   },
    // });
  }, []);

  function handleSave() {
    const exp = valid.expirationDate(expiry?.value);
    if (!number?.value || !number.validation?.isValid) {
      Alert.alert("Error", "Numero de la tajeta no valido");
      return;
    }
    if (!exp.month || !exp.year) {
      Alert.alert("Error", "Fecha de expiracion no valida");
      return;
    }
    if (!cvv?.value || !cvv.validation?.isValid) {
      Alert.alert("Error", "El CVV no valido");
      return;
    }
    if (!name) {
      Alert.alert("Error", "Agrega el nombre del tarjetahabiente");
      return;
    }

    const tipoTarjeta = normalizeCardType(
      number.validation.card?.type as cardType
    );
    onAdd({
      cvv: cvv?.value,
      expiry: {
        month: exp.month,
        year: exp.year,
      },
      number: number?.value,
      name,
      icon: getCardIcon(tipoTarjeta),
      type: normalizeCardType(number.validation.card?.type as cardType),
      saveCard,
    });
    setModalVisible(false);
    setInnerModal(false);
  }

  let issuer = number?.validation?.card?.type;
  issuer =
    issuer === "visa" || issuer === "mastercard"
      ? "visa-or-mastercard"
      : issuer === "american-express"
      ? "amex"
      : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: "#00000099" }}>
      <Modal
        animationType={"slide"}
        transparent={true}
        visible={innerModal}
        onRequestClose={handleCloseModal}
      >
        <Pressable onPress={handleCloseModal} style={{ flex: 1 }} />

        <Pressable
          onPress={() => Keyboard.dismiss()}
          style={styles.modalContainer}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.title}>Agregar nueva tarjeta</Text>
            <AntDesign name="Safety" size={24} color={azulClaro} />
          </View>
          <View style={styles.line} />

          {/* Numero de tarjeta */}
          <InputOnFocusV2
            onLayout={() => {
              setTimeout(() => {
                numberRef.current?._inputElement.focus();
              }, 50);
            }}
            ref={numberRef}
            style={{
              marginBottom: 20,
            }}
            onSubmitEditing={() => {
              expiryRef.current?._inputElement.focus();
            }}
            returnKeyType={"next"}
            titulo={"Numero de tarjeta"}
            onChangeText={(value) => {
              let validation = valid.number(value);
              value = value.replace(/ /g, "");
              const cardLenght = validation.card?.lengths[0];

              // Si es valido y se llego a los caracteres que son, cambiar
              if (value.length === cardLenght && validation.isValid) {
                expiryRef.current?._inputElement.focus();
              }
              if (value.length === cardLenght && !validation.isValid) {
                validation.isPotentiallyValid = false;
              }

              setNumber({
                value,
                validation: {
                  isPotentiallyValid: validation.isPotentiallyValid,
                  isValid: validation.isValid,
                  card: {
                    type: validation.card?.type,
                    cvv: validation.card?.code.size,
                  },
                },
              });
            }}
            type={"credit-card"}
            options={
              issuer
                ? {
                    issuer: issuer as "visa-or-mastercard" | "amex",
                  }
                : undefined
            }
            value={number?.value}
            valid={
              number?.validation?.isPotentiallyValid ||
              number?.validation?.isValid
            }
            RightIcon={() => (
              <Image
                style={styles.icon}
                source={getCardIcon(number?.validation?.card?.type)}
              />
            )}
          />

          <View style={{ flexDirection: "row" }}>
            {/* Fecha de expiracion */}
            <InputOnFocusV2
              ref={expiryRef}
              type={"custom"}
              options={{
                mask: "99/99",
              }}
              style={{ flex: 1, marginRight: 10 }}
              returnKeyType={"next"}
              keyboardType={"numeric"}
              titulo={"Fecha vencimiento"}
              placeholder={"mm/aa"}
              onChangeText={(value) => {
                const validation = valid.expirationDate(value);
                value =
                  value.length === 2 ? value + "/" : value.replace(/\//g, "");

                // Auto poner 0
                if (value.length === 1 && Number(value) > 1) {
                  value = "0" + value;
                }

                // Si se llego al final cambiar de input
                if (value.length === 4 && validation.isValid) {
                  cvcRef.current?._inputElement.focus();
                }

                setExpiry({
                  value,
                  validation: {
                    isPotentiallyValid: validation.isPotentiallyValid,
                    isValid: validation.isValid,
                  },
                });
              }}
              value={expiry?.value}
              valid={
                expiry?.validation?.isPotentiallyValid ||
                expiry?.validation?.isValid
              }
              onSubmitEditing={() => {
                cvcRef.current?._inputElement.focus();
              }}
              RightIcon={({ focused }) => {
                return (
                  <Feather
                    style={{
                      marginRight: 10,
                    }}
                    name="calendar"
                    size={24}
                    color={focused ? azulClaro : "black"}
                  />
                );
              }}
            />

            {/* CVC */}
            <InputOnFocusV2
              type={"custom"}
              options={{
                mask: number?.validation?.card?.cvv === 4 ? "9999" : "999",
              }}
              style={{ flex: 1, marginLeft: 10 }}
              ref={cvcRef}
              returnKeyType={"next"}
              keyboardType={"numeric"}
              titulo={"CVV"}
              placeholder={number?.validation?.card?.cvv === 4 ? "●●●●" : "●●●"}
              onChangeText={(value) => {
                const validation = valid.cvv(value, [3, 4]);

                if (
                  validation.isValid &&
                  value.length === number?.validation?.card?.cvv
                ) {
                  nameRef.current?.focus();
                }

                setCvv({
                  value,
                  validation: {
                    isPotentiallyValid: validation.isPotentiallyValid,
                    isValid: validation.isValid,
                  },
                });
              }}
              value={cvv?.value}
              valid={
                cvv?.validation?.isPotentiallyValid || cvv?.validation?.isValid
              }
              onSubmitEditing={() => {
                nameRef.current?.focus();
              }}
              RightIcon={() => {
                return (
                  <Image
                    source={require("../../../assets/icons/stp_card_cvc_amex.png")}
                    style={{
                      width: 30,
                      height: 20,
                      marginRight: 10,
                    }}
                  />
                );
              }}
            />
          </View>

          <InputOnFocusV2
            titulo={"Nombre del tarjetahabiente"}
            placeholder={"Escribe el nombre completo"}
            autoCapitalize={"characters"}
            onChangeText={setName}
            value={name}
            style={{ marginTop: 30 }}
            onSubmitEditing={handleSave}
            ref={nameRef}
          />

          <Text style={styles.infoTxt}>
            Al momento de crear la tarjeta se hara un cargo de 10$ para
            verificar que es valida y se devolvera al instante
          </Text>

          {/* Guardar tarjeta para compras futuras */}
          {!comprasFuturasEnabled ? (
            <Pressable
              onPress={() => {
                setSaveCard(!saveCard);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 20,
              }}
            >
              <View
                style={{
                  ...styles.checkContainer,
                  backgroundColor: saveCard ? azulClaro : "#fff",
                }}
              >
                {saveCard && (
                  <FontAwesome name="check" size={12} color="#fff" />
                )}
              </View>
              <Text
                style={{
                  fontWeight: "500",
                  flex: 1,
                  marginLeft: 10,
                  color: "#000",
                }}
              >
                Guardar para compras futuras
              </Text>
            </Pressable>
          ) : (
            <View style={{ marginTop: 20 }} />
          )}

          <Boton
            style={{
              borderRadius: 10,
            }}
            titulo="Continuar"
            onPress={handleSave}
            color={azulClaro}
          />
        </Pressable>
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
  icon: {
    width: 40,
    height: 25,
    marginRight: 5,
  },
  infoTxt: {
    color: "#888",
    fontSize: 12,
    paddingTop: 10,
  },
});
