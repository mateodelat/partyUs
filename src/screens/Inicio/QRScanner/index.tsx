import { Alert, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Evento } from "../../../models";
import { DataStore } from "aws-amplify";
import Loading from "../../../components/Loading";

import { BarCodeScanner } from "expo-barcode-scanner";
import useUser from "../../../Hooks/useUser";
import { AsyncAlert } from "../../../../constants";

export default function () {
  const [eventos, setEventos] = useState<Evento[]>();

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  const { usuario } = useUser();

  useEffect(() => {
    getBarCodeScannerPermissions();
    fetchUserEvents();
  }, []);

  // Ver si se tiene autorizacion para acceder a la camara
  const getBarCodeScannerPermissions = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Error", "No se tiene permiso para acceder a la camara");
    }

    setHasPermission(status === "granted");
  };

  async function fetchUserEvents() {
    // Pedir los eventos del guia
    DataStore.query(Evento, (e) => e.CreatorID("eq", usuario.id)).then((r) => {
      setEventos(r);
    });
  }

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View>
      {!eventos && hasPermission === null ? (
        <Loading indicator />
      ) : (
        <View style={{ flex: 1, backgroundColor: "red" }}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={{
              backgroundColor: "red",
              ...StyleSheet.absoluteFillObject,
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({});
