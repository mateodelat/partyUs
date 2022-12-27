import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Image,
  Keyboard,
  Alert,
  Platform,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";

import Boton from "../Boton";
import { azulClaro, currency, fetchFromStripe, log } from "../../../constants";

import { AntDesign } from "@expo/vector-icons";
import { cardBrand_type } from "../../../types/stripe";
import useUser from "../../Hooks/useUser";

export type saveParams = {
  last4?: string; //"4242 4242"
  expiry?: { month: string; year: string }; //"06/19"
  brand?: cardBrand_type;
  postalCode?: string;
};

export default function ({
  onAdd,
  setModalVisible,
  clientSecret,
}: {
  onAdd: (params: saveParams) => void;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  clientSecret: string;
}) {
  const [innerModal, setInnerModal] = useState(false);

  const [cardValidation, setCardValidation] =
    useState<CardFieldInput.Details>();

  const { usuario } = useUser();

  const handleCloseModal = async () => {
    setInnerModal(false);
    setModalVisible(false);
  };

  useEffect(() => {
    setInnerModal(true);
  }, []);

  async function handleSave() {
    if (!cardValidation) {
      handleCloseModal();
      return;
    }
    const {
      last4,
      expiryMonth,
      expiryYear,
      complete,
      brand,
      validExpiryDate,
      validNumber,
      validCVC,
      postalCode,
    } = cardValidation;
    log(cardValidation);

    if (
      validNumber === "Invalid" ||
      validCVC === "Invalid" ||
      validExpiryDate === "Invalid"
    ) {
      Alert.alert("Error", "Corrige la informacion introducida");
      return;
    }

    if (!complete) {
      Alert.alert("Error", "Debes completar todos los campos primero");
      return;
    }
    const cardTok = await createToken({
      type: "Card",
      address: usuario?.direccion ? usuario.direccion : undefined,
      currency,
      name: usuario?.nickname,
    });

    log(cardTok);

    // confirmSetupIntent(clientSecret, {
    //   paymentMethodType:"Card",
    //   paymentMethodData:{

    //   }
    // });

    // fetchFromStripe({
    //   path: "/v1/payment_methods",
    //   type: "POST",
    //   input: {

    //     type:"card",
    //     customer:
    //   } as Stripe.PaymentMethodCreateParams,
    //   secretKey: STRIPE_SECRET_KEY,
    // }).then(log);

    return;
    onAdd({
      brand: brand as cardBrand_type,
      expiry: { month: String(expiryMonth), year: String(expiryYear) },
      last4,
      postalCode,
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
              <Text style={styles.title}>Agregar nueva tarjeta</Text>
              <AntDesign name="Safety" size={24} color={azulClaro} />
            </View>
            <View style={styles.line} />
            <CardField
              autofocus
              postalCodeEnabled={true}
              placeholders={{
                number: "4242 4242 4242 4242",
              }}
              cardStyle={{
                backgroundColor: "#FFFFFF",
                textColor: "#000000",
              }}
              style={{
                width: "100%",
                height: 50,
                marginVertical: 20,
              }}
              onCardChange={setCardValidation}
            />

            <Boton
              style={{
                borderRadius: 10,
                backgroundColor: "#fff",
              }}
              textStyle={{
                color: azulClaro,
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
    marginBottom: 0,
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
