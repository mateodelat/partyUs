import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import Boton from "../../components/Boton";

import MapView, { Marker, Region } from "react-native-maps";

import {
  AsyncAlert,
  azulClaro,
  azulFondo,
  defaultLocation,
  formatAMPM,
  formatDiaMesCompleto,
  getWeekDay,
  msInDay,
  msInHour,
  verificarUbicacion,
} from "../../../constants";

import { NavigationProp } from "../../shared/interfaces/navigation.interface";
import HeaderAgregar from "./Agregar1/HeaderAgregar";

import DateTimePickerModal from "react-native-modal-datetime-picker";

import { MaterialIcons } from "@expo/vector-icons";
import ModalMap, { locationType } from "../../components/ModalMap";
import { useEffect } from "react";
import useEvento from "../../Hooks/useEvento";

enum dateType {
  "inicial" = "inicial",
  "final" = "final",
}

export default function Agregar2({
  navigation,
}: {
  navigation: NavigationProp;
}) {
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const { setEvento, evento } = useEvento();

  let hoy = new Date();

  hoy.setHours(20, 0, 0, 0);

  const [fechaInicial, setFechaInicial] = useState<Date | undefined>(
    evento.fechaInicial
  );
  const [fechaFinal, setFechaFinal] = useState<Date | undefined>(
    evento.fechaFinal
  );

  const [ubicacion, setUbicacion] = useState<locationType | undefined>(
    evento.ubicacion
  );
  const [modalVisible, setModalVisible] = useState(false);

  // Estado para cuando se le hace click a la fecha
  const [isInitialDate, setIsInitialDate] = useState(true);

  const [region, setRegion] = useState<Region>(defaultLocation);

  const [locationPermision, setLocationPermision] = useState<boolean>();

  useEffect(() => {
    if (locationPermision === null) {
      // Checar si la ubicacion esta activada
      verificarUbicacion().then(async (r) => {
        // Si no hay permisos de ubicacion
        setLocationPermision(r);
      });
    }

    if (ubicacion) {
      const region = {
        latitude: ubicacion.latitude,
        longitude: ubicacion.longitude,
        latitudeDelta: ubicacion.latitudeDelta ? ubicacion.latitudeDelta : 2,
        longitudeDelta: ubicacion.longitudeDelta ? ubicacion.longitudeDelta : 2,
      };
      setRegion(region);
    }
  }, [ubicacion]);

  async function handleContinuar() {
    if (!ubicacion) {
      Alert.alert("Error", "Agrega primero la ubicacion de tu evento");
      return;
    }
    if (!fechaInicial || !fechaFinal) {
      Alert.alert("Error", "Agrega las fechas de tu evento");
    } else {
      await AsyncAlert(
        "Atencion",
        "Una vez puesta la ubicacion y fecha no se puden cambiar."
      )
        .then((r) => {
          navigation.navigate("Agregar3");

          setEvento((prev) => {
            return {
              ...prev,
              ubicacion,
              fechaFinal,
              fechaInicial,
            };
          });
        })
        .catch((e) => e);
    }
  }

  function openDatePicker(type: dateType) {
    setIsInitialDate(type === dateType.inicial);
    setIsDatePickerVisible(true);
  }

  function handleConfirmDate(date: Date) {
    setIsDatePickerVisible(false);

    if (isInitialDate) {
      setFechaInicial(date);

      if (fechaFinal) {
        if (
          // Si la fecha inicial ingresada es mayor a la final se corrige
          date >= fechaFinal ||
          // Si la fecha final es mayor a un dia de la fecha inicial se corrige
          fechaFinal.getTime() - msInDay >= date.getTime()
        ) {
          // Mensaje de error
          if (date >= fechaFinal) {
            Alert.alert(
              "Error",
              "La fecha final no puede ser superior a la inicial"
            );
          }
          if (fechaFinal.getTime() - msInDay >= date.getTime()) {
            Alert.alert(
              "Atencion",
              "Tu evento por ahora no puede durar mas de un dia"
            );
          }
          let newFinal = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            fechaFinal.getHours(),
            fechaFinal.getMinutes()
          );

          if (date >= newFinal) {
            newFinal.setHours(date.getHours() + 1, 0, 0, 0);
          }

          setFechaFinal(newFinal);
        }
      }

      // Si no hay fecha final se inicia el proceso para ponerla
      else {
        setIsInitialDate(false);
        setIsDatePickerVisible(true);
      }
    } else {
      // Validar fecha final

      if (fechaInicial && date <= fechaInicial) {
        Alert.alert(
          "Error",
          "La fecha final no puede ser antes que la fecha inicial"
        );
        date = new Date(new Date(fechaInicial).getTime() + msInDay);
        date.setHours(0, 0, 0, 0);
      }

      setFechaFinal(date);
    }
  }

  function formatearFecha(date: Date | undefined) {
    let s;
    s = getWeekDay(date) + " " + formatDiaMesCompleto(date);
    return s;
  }

  return (
    <View
      style={{
        backgroundColor: "#fff",
        flex: 1,
      }}
    >
      {/* Header con barra de nivel */}
      <HeaderAgregar step={2} />

      {/* Contenedor interno con padding */}
      <View style={styles.innerContainer}>
        {/*  */}
        <View style={{ flex: 1 }}>
          <Text style={styles.tituloFiltro}>UBICACION</Text>
          <View style={styles.mapContainer}>
            <MapView
              onPress={() => {
                setModalVisible(true);
              }}
              loadingIndicatorColor="black"
              loadingEnabled
              loadingBackgroundColor={azulClaro}
              pitchEnabled={false}
              rotateEnabled={false}
              zoomEnabled={false}
              scrollEnabled={false}
              provider={"google"}
              region={region}
              mapType={"standard"}
              style={{
                ...StyleSheet.absoluteFillObject,
                opacity: 0.5,
              }}
            >
              {/* Marcador de la ubicacion */}
              {ubicacion && (
                <Marker
                  onPress={() => setModalVisible(true)}
                  coordinate={ubicacion}
                />
              )}
            </MapView>
            {ubicacion && (
              <View style={styles.locationTxtContainer}>
                <Text numberOfLines={2} style={styles.locationTxt}>
                  {ubicacion.ubicacionNombre}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Fechas */}
        <View style={{ flex: 1 }}>
          <Text style={styles.tituloFiltro}>EMPIEZA</Text>
          <TouchableOpacity
            onPress={() => openDatePicker(dateType.inicial)}
            style={styles.initialDateContainer}
          >
            <View style={styles.dateContainer}>
              <Text style={styles.fechaTxt}>
                {formatearFecha(fechaInicial)}
              </Text>
              <Text style={styles.horaTxt}>{formatAMPM(fechaInicial)}</Text>
              <MaterialIcons
                name={"keyboard-arrow-right"}
                size={35}
                color={azulClaro + "88"}
              />
            </View>
          </TouchableOpacity>
          <View style={styles.line} />

          <Text style={styles.tituloFiltro}>TERMINA</Text>
          <TouchableOpacity
            onPress={() => {
              if (!fechaInicial) {
                Alert.alert("Error", "Agrega primero la hora inicial");
              } else {
                openDatePicker(dateType.final);
              }
            }}
            style={{ paddingBottom: 20 }}
          >
            <View style={styles.dateContainer}>
              <Text style={styles.fechaTxt}>{formatearFecha(fechaFinal)}</Text>
              <Text style={styles.horaTxt}>{formatAMPM(fechaFinal)}</Text>
              <MaterialIcons
                name={"keyboard-arrow-right"}
                size={35}
                color={azulClaro + "88"}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <Boton
        style={{ margin: 20 }}
        titulo="Continuar"
        onPress={handleContinuar}
        color={azulClaro}
      />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        date={
          isInitialDate
            ? fechaInicial
              ? fechaInicial
              : hoy
            : fechaFinal
            ? fechaFinal
            : hoy
        }
        minimumDate={fechaInicial && !isInitialDate ? fechaInicial : new Date()}
        maximumDate={
          fechaInicial && !isInitialDate
            ? new Date(new Date(fechaInicial).getTime() + msInDay)
            : new Date(new Date().getTime() + msInDay * 365)
        }
        onConfirm={handleConfirmDate}
        onCancel={() => setIsDatePickerVisible(false)}
      />
      <ModalMap
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        selectedPlace={ubicacion}
        handleSelectPlace={setUbicacion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    padding: 20,
    flex: 1,
  },

  tituloFiltro: {
    color: "#888",
  },
  initialDateContainer: {
    paddingBottom: 20,
  },

  line: {
    marginBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: azulClaro + "88",
    width: "100%",
    height: 1,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationContainer: {
    flexDirection: "row",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 20,
  },

  fechaTxt: {
    fontWeight: "bold",
    width: 200,
    fontSize: 14,
  },
  horaTxt: {
    flex: 1,
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
  },

  mapContainer: {
    height: 200,
    marginBottom: 30,
    marginTop: 10,
    borderRadius: 5,
    overflow: "hidden",
  },

  locationTxtContainer: {
    position: "absolute",
    width: "100%",
    backgroundColor: "#fff",
    bottom: 0,
    textAlign: "center",
    color: azulClaro,
  },

  locationTxt: {
    width: "100%",
    padding: 10,
    paddingVertical: 15,
    backgroundColor: azulFondo,
    textAlign: "center",
    color: azulClaro,
  },
});
