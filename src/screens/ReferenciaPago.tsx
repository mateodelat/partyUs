import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState, useRef } from "react";
import {
  azulClaro,
  azulFondo,
  azulOscuro,
  formatAMPM,
  formatDateShort,
  formatMoney,
  formatTelefono,
  openEmail,
  openWhatsapp,
  partyusEmail,
  partyusPhone,
} from "../../constants";

import { Feather } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

import Header from "../navigation/components/Header";
import {
  requestPermissionsAsync,
  saveToLibraryAsync,
} from "expo-media-library";
import ViewShot from "react-native-view-shot";
import MessageBox from "../components/MessageBox";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Boton from "../components/Boton";

import Barcode from "@kichiyaki/react-native-barcode-generator";

export default function Ref({
  route,
}: {
  route: {
    params: {
      amount: number;
      codebar: {
        uri: string;
        number: string;
      };
      limitDate: number | Date;
      titulo: string;
    };
  };
}) {
  let { amount, codebar, titulo } = route.params;

  let { limitDate } = route.params;
  if (limitDate) {
    limitDate = new Date(limitDate);
  }

  let number = "";
  for (let index = 0; index < codebar.number?.length; index++) {
    const element = codebar.number[index];
    // Si vamos en un multiplo de 4 agregar un espacio
    if (index % 4 === 0 && !!index) {
      number += " " + element;
    } else {
      number += element;
    }
  }

  const [imageStatus, setImageStatus] = useState<"GUARDANDO..." | "GUARDADA">();

  const [modalVisible, setModalVisible] = useState(false);

  const viewShowRef = useRef<ViewShot>(null);

  async function handleSaveImage() {
    const { granted } = await requestPermissionsAsync(true);
    if (granted) {
      setTimeout(async () => {
        setImageStatus("GUARDANDO...");
        const localUri = viewShowRef.current?.capture
          ? await viewShowRef.current.capture()
          : null;
        !!localUri &&
          saveToLibraryAsync(localUri).then(() => setImageStatus("GUARDADA"));
      }, 10);
    } else {
      Alert.alert(
        "Error",
        "No se tiene acceso guardar imagenes pero puedes tomar una captura de pantalla"
      );
    }
  }

  const { width } = Dimensions.get("screen");

  const { top } = useSafeAreaInsets();
  return (
    <>
      <Header
        title={titulo}
        style={{ paddingBottom: 0 }}
        RightIcon={() => (
          <TouchableOpacity
            style={styles.helpIcon}
            onPress={() => setModalVisible(true)}
          >
            <Feather name="help-circle" size={30} color="black" />
          </TouchableOpacity>
        )}
      />

      <MessageBox
        message={imageStatus === "GUARDADA" ? "IMAGEN GUARDADA" : imageStatus}
        time={imageStatus === "GUARDADA" ? 1500 : 0}
        style={{
          top,
          paddingVertical: 10,
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <ViewShot
          ref={viewShowRef as any}
          style={{ flex: 1, backgroundColor: "#ffff" }}
        >
          <View style={styles.innerContainer}>
            {/* Contenedor de arriba */}
            <View style={styles.topContainer}>
              <View
                style={{
                  marginVertical: 10,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Image
                  source={require("../../assets/IMG/Oxxo_Logo.png")}
                  style={styles.iconNegocio}
                />
              </View>
              <Text style={styles.amount}>MX{formatMoney(amount, true)}</Text>
              <Text
                style={{
                  bottom: -9,
                  position: "absolute",
                  backgroundColor: "#fff",
                  paddingHorizontal: 4,
                  color: "#555",
                }}
              >
                REFERENCIA DE PAGO
              </Text>
            </View>

            {/* Contenedor de en medio */}
            <View style={styles.middleContainer}>
              <Barcode
                value={number.replace(/ /g, "")}
                text={number}
                maxWidth={width - 80}
                textStyle={{ marginTop: 10 }}
                height={80}
                format={"CODE128"}
                style={{}}
              />
              <TouchableOpacity
                style={styles.buttonContainer}
                onPress={handleSaveImage}
              >
                <AntDesign name="camerao" size={20} color={azulClaro} />
                <Text
                  style={{
                    color: azulClaro,
                    fontWeight: "bold",
                    marginLeft: 10,
                  }}
                >
                  Guardar
                </Text>
              </TouchableOpacity>
            </View>

            {/* Contenedores de abajo */}
            <View style={styles.bottomContainer}>
              <Text style={{ fontSize: 12 }}>Limite de pago</Text>
              <Text style={styles.number}>
                {formatDateShort(limitDate) + " " + formatAMPM(limitDate)}
              </Text>
            </View>
          </View>
          <View
            style={{
              ...styles.bottomContainer,
              borderBottomWidth: 0,
              paddingHorizontal: 0,
            }}
          >
            <Feather
              style={{ marginLeft: 20 }}
              name="clock"
              size={20}
              color="black"
            />
            <Text
              style={{
                fontSize: 12,
                width: "100%",
                textAlign: "center",
                position: "absolute",
              }}
            >
              Pagas y se acredita tu reserva en 1 dia hábil
            </Text>
          </View>
        </ViewShot>
      </ScrollView>

      {/* Informacion para realizar el pago */}
      <Modal
        animationType={"none"}
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <Pressable
          onPress={() => setModalVisible(false)}
          style={{ flex: 1, backgroundColor: "#00000099" }}
        />

        <View style={{ backgroundColor: "#00000099" }}>
          <View style={styles.modalContainer}>
            <Text style={styles.tituloModal}>Pagar reserva en tienda</Text>
            <View style={styles.line} />
            <Text style={styles.descripcionModal}>
              1. Entrega el cupón al cajero para que escanee el código de
              barras.
            </Text>
            <Text style={styles.descripcionModal}>
              2. Entrega el pago en efectivo al cajero.
            </Text>
            <Text style={styles.descripcionModal}>
              3. Cuando se haya completado el pago, guarda el recibo de pago
              para tu archivo.
            </Text>
            <Text style={styles.descripcionModal}>
              4. Si tienes alguna pregunta, ponte en contacto con nosotros
              escribiendo al{" "}
              <Text
                onPress={() => openWhatsapp(partyusPhone)}
                style={{
                  color: azulClaro,
                }}
              >
                +52{" "}
                {formatTelefono(
                  partyusPhone.slice(
                    partyusPhone.length - 10,
                    partyusPhone.length
                  )
                )}
              </Text>{" "}
              o al correo{" "}
              <Text
                onPress={() => openEmail(partyusEmail)}
                style={{
                  color: azulClaro,
                }}
              >
                {partyusEmail}
              </Text>
            </Text>
            <Boton
              titulo="OK"
              onPress={() => setModalVisible(false)}
              style={{
                marginTop: 20,
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  footerImageContainer: {
    minHeight: 50,
    flex: 1,
    marginVertical: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  footerImage: {
    flex: 1,
    resizeMode: "contain",
    marginRight: 10,
    width: 500,
    height: 40,
  },

  buttonContainer: {
    backgroundColor: azulFondo,
    padding: 5,
    borderRadius: 10,
    alignSelf: "center",
    marginVertical: 20,
    marginBottom: 0,
    paddingHorizontal: 10,
    flexDirection: "row",
  },
  container: {
    backgroundColor: "#fff",
    flex: 1,
    padding: 10,
    paddingHorizontal: 20,
  },
  innerContainer: {
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 20,
  },
  topDesc: {
    marginVertical: 20,
    textAlign: "center",
    maxWidth: "95%",
  },
  helpIcon: {
    position: "absolute",
    padding: 20,
    right: 0,
    paddingVertical: 5,
    zIndex: 1,
  },

  topContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "lightgray",
    alignItems: "center",
    width: "100%",
  },
  middleContainer: {
    borderBottomWidth: 1,
    borderColor: "lightgray",
    padding: 30,
  },

  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  number: {
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
    color: "#000",
  },
  amount: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  iconNegocio: {
    height: 50,
    marginTop: 20,
    resizeMode: "contain",
    marginRight: 3,
    marginLeft: 3,
  },
  bolita: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 15,
    height: 15,
    position: "absolute",
    bottom: -8,
    borderColor: "lightgray",

    transform: [{ rotate: "45deg" }],
  },
  codebarImage: {
    width: "100%",
    height: 60,
    resizeMode: "stretch",
    marginBottom: 10,
  },

  tituloModal: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 10,
  },

  modalContainer: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: "#fff",
    padding: 20,
  },

  descripcionModal: {
    color: "#000",
    marginBottom: 5,
  },

  line: {
    width: "100%",
    height: 0.5,
    backgroundColor: "gray",
    marginVertical: 10,
  },
});
