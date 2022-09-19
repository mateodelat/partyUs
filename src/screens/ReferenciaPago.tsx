import {
  Alert,
  CameraRoll,
  Image,
  Modal,
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
import MediaLibrary, {
  requestPermissionsAsync,
  saveToLibraryAsync,
} from "expo-media-library";
import ViewShot from "react-native-view-shot";
import MessageBox from "../components/MessageBox";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ({
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
      createdAt: number | Date;
      details: string;
    };
  };
}) {
  const { amount, codebar } = route.params;
  let { limitDate, createdAt } = route.params;
  if (limitDate && createdAt) {
    limitDate = new Date(limitDate);
    createdAt = new Date(createdAt);
  }

  const [showAll, setShowAll] = useState(false);
  const [imageStatus, setImageStatus] = useState<"GUARDANDO..." | "GUARDADA">();

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
        console.log(localUri);
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
      <Header title={"Nombre del evento"} style={{ paddingBottom: 0 }} />
      <MessageBox
        message={imageStatus === "GUARDADA" ? "IMAGEN GUARDADA" : imageStatus}
        time={imageStatus === "GUARDADA" ? 3000 : 0}
        style={{
          top,
          paddingVertical: 10,
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <ViewShot
          ref={viewShowRef}
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
              <Text style={styles.topDesc}>
                Gracias por tu compra, paga en cualquiera de las sucursales para
                completar tu reserva.
              </Text>
              <Text style={styles.amount}>MX{formatMoney(amount)}</Text>
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
              <Text style={{ fontSize: 12 }}>Fecha de vencimiento</Text>
              <Text style={styles.number}>
                {formatDateShort(limitDate) + " " + formatAMPM(limitDate)}
              </Text>
            </View>
            <View
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
            </View>
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
    borderBottomWidth: 1,
    borderColor: "lightgray",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  number: {
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
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
});
