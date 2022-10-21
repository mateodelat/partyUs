import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Evento } from "../../../models";
import { DataStore } from "aws-amplify";
import Loading from "../../../components/Loading";

import { BarCodeEvent, BarCodeScanner } from "expo-barcode-scanner";
import useUser from "../../../Hooks/useUser";

import { Entypo } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  AsyncAlert,
  rojoClaro,
  timer,
  vibrar,
  VibrationType,
} from "../../../../constants";
import { Reserva } from "../../../models";
import ScannedReserva from "./ScannedReserva";
import { Usuario } from "../../../models";

import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";

export default function ({ navigation, route }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState<boolean | undefined>(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [scannedReserva, setScannedReserva] = useState<Reserva>();

  const [scanning, setScanning] = useState(false);
  const [sound, setSound] = useState<Sound>();

  const barPosition = useRef(new Animated.Value(0)).current;

  const { usuario, setBottomMessage } = useUser();

  const eventoID = route?.params?.eventoID;

  async function loadSound() {
    const { sound: s } = await Audio.Sound.createAsync(
      require("../../../../assets/Sounds/QRScan.mp3")
    );

    setSound(s);
  }

  useEffect(() => {
    getCameraPermissions();
    fetchUserEvents();
    loadSound();

    // Valor del escaner del qr moviendose siempre
    Animated.loop(
      Animated.sequence([
        Animated.timing(barPosition, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(barPosition, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    return () => {
      sound?.unloadAsync();
    };
  }, []);

  // Ver si se tiene autorizacion para acceder a la camara
  const getCameraPermissions = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Error", "No se tiene permiso para acceder a la camara");
    }

    setHasPermission(status === "granted");
  };

  async function fetchUserEvents() {
    // Pedir los eventos del guia
    DataStore.query(Evento, (e) => e.CreatorID("eq", usuario.id)).then(
      async (r) => {
        if (!r?.length) {
          await AsyncAlert(
            "Error",
            "Primero crea un evento para poder escanear entradas"
          ).then(() => {
            navigation.pop();
          });
        }
      }
    );
  }

  const handleBarCodeScanned = async (d: BarCodeEvent) => {
    const { data } = d;
    if (error) return;

    try {
      setCodePosition(d.bounds);

      // Si el primer texto no es res devolver error
      if (data.slice(0, 4) !== "res>") {
        setError(true);
        Alert.alert("Error", "El codigo escaneado no es de una reserva");
        return;
      }

      // Obtener id de reserva
      var regex = new RegExp(/[^>]*$/);

      const reservaID = regex.exec(data)[0];

      setScanning(true);
      sound.setPositionAsync(0).then(() => {
        sound.playAsync();
      });

      vibrar(VibrationType.medium);

      const reservaObtenida = await DataStore.query(Reserva, reservaID).then(
        async (r) => {
          if (eventoID && r.eventoID !== eventoID) {
            throw new Error("La reserva no es del evento pedido");
          }
          if (r.organizadorID !== usuario.id) {
            throw new Error("La reserva no de un evento tuyo");
          }
          if (r.ingreso) {
            throw new Error(
              "La reserva ya fue escaneada e ingresada a tu evento."
            );
          }

          const evento = DataStore.query(Evento, (eve) =>
            eve.id("eq", r.eventoID)
          );
          const usr = DataStore.query(Usuario, r.usuarioID);

          setScannedReserva({
            ...r,
            evento: (await evento)[0],
            usuario: await usr,
          });

          return r;
        }
      );

      //
      // Verificar que sea valida
      //
      if (reservaObtenida.cancelado) {
        Alert.alert("Error", "El codigo escaneado esta cancelado");
        return;
      }

      if (!reservaObtenida.pagado) {
        Alert.alert("Error", "La reserva escaneada no ha sido pagada");
        return;
      }

      setModalVisible(true);

      // Si pasa las primeras pruebas mostrar el modal de personas y tipo de boleto a ingresar
    } catch (error) {
      Alert.alert(
        "Error",
        "Hubo un error escanenado el codigo\n" + error.message
      );
    }
  };

  const { top } = useSafeAreaInsets();

  const scanRef = useRef<BarCodeScanner>();

  async function handleClose() {
    navigation.pop();
  }

  const [codePosition, setCodePosition] = useState<
    | {
        origin: {
          x: number;
          y: number;
        };
        size: {
          height: number;
          width: number;
        };
      }
    | undefined
  >();

  useEffect(() => {
    // Si cambia la posicion se detona eso
    if (codePosition) {
      setTimeout(() => {
        setCodePosition((prev) => {
          if (codePosition === prev) {
            return undefined;
          } else {
            return prev;
          }
        });
      }, 300);
    }
  }, [codePosition]);

  useEffect(() => {
    // Si el error sigue por 0.5 segundos desactivarlo
    if (error) {
      setTimeout(() => {
        setError((prev) => {
          if (error === prev) {
            return undefined;
          } else {
            return prev;
          }
        });
      }, 500);
    }
  }, [error]);

  async function sucessMessage(mes: string) {
    setBottomMessage({ content: mes });
    await timer(3000);
    setBottomMessage(undefined);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar backgroundColor="#000" translucent={true} style={"light"} />

      {hasPermission === null ? (
        <Loading indicator />
      ) : (
        <BarCodeScanner
          ref={scanRef}
          barCodeTypes={["qr"]}
          onBarCodeScanned={scanning ? undefined : handleBarCodeScanned}
          style={{
            marginTop: 70,

            ...StyleSheet.absoluteFillObject,
          }}
        />
      )}
      {/* Cruz para cerrar la camara y mensaje de scanner */}
      <View style={{ ...styles.dataContainer, marginTop: top }}>
        {/* Cancelar */}
        <Entypo
          onPress={handleClose}
          name="cross"
          size={30}
          color="white"
          style={styles.cross}
        />

        {/* View de imagen */}
        {codePosition && scanning && (
          <View
            style={{
              position: "absolute",
              left: codePosition.origin.x,
              top: codePosition.origin.y + top + 70,

              width: codePosition.size.width,
              height: codePosition.size.height,
              backgroundColor: "#00000055",
            }}
          />
        )}

        <View
          style={{
            position: "absolute",
            padding: 10,
          }}
        >
          <View
            style={{
              width: 200,
              height: 200,
            }}
          >
            {/* Linea escaner */}
            <Animated.View
              style={{
                width: "100%",
                height: 2,
                backgroundColor: rojoClaro,
                position: "absolute",
                top: Animated.multiply(200, barPosition),
              }}
            />
          </View>
          {/* Esquina arriba derecha */}
          <View style={styles.esquinaArribaDerecha} />

          {/* Arriba izquierda */}
          <View style={styles.esquinaArribaIzquierda} />

          {/* Abajo izquierda */}
          <View style={styles.esquinaAbajoIzquierda} />

          {/* Abajo derecha */}
          <View style={styles.esquinaAbajoDerecha} />
        </View>
      </View>
      <Modal
        animationType="fade"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setScanning(false);
        }}
      >
        <ScannedReserva
          sucessMessage={sucessMessage}
          setModalVisible={(value: boolean) => {
            setScanning(false);
            setModalVisible(value);
          }}
          reserva={scannedReserva}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  dataContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  cross: {
    left: 0,
    padding: 20,
    top: 0,
    position: "absolute",
  },

  modalContainer: {
    padding: 20,
    backgroundColor: "red",
    flex: 1,
  },

  esquinaArribaDerecha: {
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderColor: rojoClaro,
    width: 20,
    height: 20,
    position: "absolute",
  },

  esquinaArribaIzquierda: {
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderColor: rojoClaro,
    width: 20,
    height: 20,
    right: 0,
    position: "absolute",
  },
  esquinaAbajoDerecha: {
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: rojoClaro,
    width: 20,
    height: 20,
    position: "absolute",
    right: 0,
    bottom: 0,
  },

  esquinaAbajoIzquierda: {
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderColor: rojoClaro,
    width: 20,
    height: 20,
    position: "absolute",
    bottom: 0,
  },
});
