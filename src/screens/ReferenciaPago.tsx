import {
  Alert,
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
} from "../../constants";

import { Entypo } from "@expo/vector-icons";
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

export default function Ref({
  route,
}: {
  route: {
    params: {
      amount: number;
      codebar: {
        uri: string;
        number: number;
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

  // Poner uri con width = 2 (solo para openpay) para subir la calidad del codigo de barras
  let idx = codebar.uri.search("width=");
  if (idx) {
    const i = codebar.uri.slice(0, idx);

    const e = codebar.uri.slice(idx + 7, codebar.uri.length);
    codebar.uri = i + "width=2" + e;
  }

  const [showAll, setShowAll] = useState(false);
  const [imageStatus, setImageStatus] = useState<"GUARDANDO..." | "GUARDADA">();

  const [modalVisible, setModalVisible] = useState(false);

  const viewShowRef = useRef<ViewShot>(null);

  async function handleSaveImage() {
    const { granted } = await requestPermissionsAsync(true);
    if (granted) {
      setShowAll(true);
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
  const listaNegocios = [
    "https://www.paynet.com.mx/img/tiendas/walmart.jpg",
    "https://www.paynet.com.mx/img/tiendas/chedraui.png",
    "https://www.paynet.com.mx/img/seven.jpg",
    "https://www.paynet.com.mx/img/guadalajara.jpg",
    "https://www.paynet.com.mx/img/tiendas/sams.jpg",
    "https://www.paynet.com.mx/img/tiendas/farmaciaAhorro.jpg",
    "https://www.paynet.com.mx/img/tiendas/kiosko.jpg",
    "https://www.paynet.com.mx/img/tiendas/waldos.jpg",
    "https://www.paynet.com.mx/img/tiendas/walmart_express.png",
    "https://www.paynet.com.mx/img/tiendas/tiendas-k.jpg",
  ];

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
              <TouchableOpacity
                onPress={() => setShowAll(!showAll)}
                style={{
                  marginVertical: 10,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                {listaNegocios.map((item, idx) => {
                  if (idx < 4 || showAll)
                    return (
                      <Image
                        key={idx}
                        source={{ uri: item }}
                        style={styles.iconNegocio}
                      />
                    );
                  else return <View key={idx} />;
                })}
                {!showAll && (
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      width: 70,
                      marginTop: 20,
                    }}
                  >
                    <Entypo
                      name="dots-three-horizontal"
                      size={24}
                      color={azulClaro}
                    />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.amount}>MX{formatMoney(amount, true)}</Text>
              <View
                style={{
                  ...styles.bolita,
                  left: -8,
                  borderRightWidth: 1,
                  borderTopWidth: 1,
                }}
              />
              <View
                style={{
                  ...styles.bolita,
                  right: -8,
                  borderLeftWidth: 1,
                  borderBottomWidth: 1,
                }}
              />
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
              <Image
                source={{ uri: codebar.uri }}
                style={styles.codebarImage}
              />
              <Text style={styles.number}>{codebar.number}</Text>
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
            <View
              style={{
                ...styles.bottomContainer,
                borderTopWidth: 1,
                borderColor: "lightgray",
              }}
            >
              <Text style={{ fontSize: 12 }}>Concepto</Text>
              <Text style={styles.number}>{titulo}</Text>
            </View>
            {/* <View
              style={{
                ...styles.bottomContainer,
                borderBottomWidth: 0,
                justifyContent: "flex-start",
              }}
            >
              <Feather name="clock" size={20} color="black" />
              <Text style={{ fontSize: 12, marginLeft: 20 }}>
                Pagas y se acredita en 1 hora
              </Text>
            </View> */}
          </View>
          <View style={styles.footerImageContainer}>
            <Image
              source={require("../../assets/IMG/logoLetras.png")}
              style={styles.footerImage}
            />
            <Image
              source={{ uri: "https://www.paynet.com.mx/img/paynetv2.png" }}
              style={styles.footerImage}
            />
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
            <Text style={styles.tituloModal}>Pagar reserva en efectivo</Text>
            <View style={styles.line} />
            <Text style={styles.descripcionModal}>
              1. Acude a cualquier tienda aliada dentro de la fecha límite de
              pago.
            </Text>
            <Text style={styles.descripcionModal}>
              2. Dile a la persona de caja que realizarás un pago en efectivo
              Paynet, proporciona el código o número de referencia.
            </Text>
            <Text style={styles.descripcionModal}>
              3. Antes de pagar verifica que los datos coincidan con los de este
              recibo de pago.
            </Text>
            <Text style={styles.descripcionModal}>
              4. Realiza el pago en efectivo por el total a pagar, este se
              reflejará a mas tardar en una hora.
            </Text>
            <Text style={styles.descripcionModal}>
              5. Conserva tu comprobante de pago para cualquier aclaración.
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
    width: 70,
    height: 40,
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
