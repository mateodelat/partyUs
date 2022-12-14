import React, { SetStateAction, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  TextInput,
  Pressable,
  Keyboard,
  Linking,
  ViewStyle,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { createMapLink } from "react-native-open-maps";

import MapView, { LatLng, Region } from "react-native-maps";

import { Entypo, Feather } from "@expo/vector-icons";

import {
  AsyncAlert,
  azulClaro,
  azulFondo,
  azulOscuro,
  defaultLocation,
  googleMapsSearchPlace,
  mapPlacesKey,
  verificarUbicacion,
} from "../../constants";

import { getLastKnownPositionAsync, reverseGeocodeAsync } from "expo-location";

import { Marker } from "react-native-maps";
import Loading from "./Loading";
import { Dispatch } from "react";
import Header from "../navigation/components/Header";
import HeaderModal from "./HeaderModal";
import useUser from "../Hooks/useUser";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import InputOnFocus from "./InputOnFocus";

const { height } = Dimensions.get("window");
export type locationType = Region & {
  titulo?: string;
  ubicacionNombre?: string;
  ubicacionId?: string;
};

// Abrir un link a google maps en el celular
let mapsAlertShown = false;

const ModalMap = ({
  style,

  selectedPlace,

  setModalVisible,
  modalVisible,
  handleSelectPlace,

  titulo,
}: {
  handleSelectPlace?: (p: locationType) => any;
  selectedPlace?: locationType;
  style?: ViewStyle;

  setModalVisible: Dispatch<SetStateAction<boolean>>;
  modalVisible: boolean;

  titulo?: string;
}) => {
  const map = useRef<any>(null);
  const { setStatusStyle } = useUser();

  const [region, setRegion] = useState(selectedPlace as Region);

  const [actualRegion, setActualRegion] = useState(selectedPlace as Region);

  // Variables del buscador
  const [buscar, setBuscar] = useState<string>();
  const [suggestedPlace, setSuggestedPlace] = useState([]);

  const [editingPlaceName, setEditingPlaceName] = useState(false);

  const [place, setPlace] = useState<locationType | undefined>(selectedPlace);

  const [locationPermision, setLocationPermision] = useState<boolean>();

  // Checar si la ubicacion esta activada solo si se activa el modal
  useEffect(() => {
    setStatusStyle("dark");
    modalVisible &&
      verificarUbicacion().then(async (r) => {
        // Si no hay permisos de ubicacion
        setLocationPermision(r);

        let latitude, longitude;
        let coords;

        // Si tenemos permisos de la ubicacion se detectan
        if (r) {
          coords = (await getLastKnownPositionAsync())?.coords;
        }

        latitude = coords?.latitude;
        longitude = coords?.longitude;
        if (!latitude || !longitude) {
          console.log("No hay latitud o longitud");
        }

        if (selectedPlace) {
          const region = {
            latitude: selectedPlace.latitude,
            longitude: selectedPlace.longitude,
            latitudeDelta: selectedPlace.latitudeDelta
              ? selectedPlace.latitudeDelta
              : 1,
            longitudeDelta: selectedPlace.longitudeDelta
              ? selectedPlace.longitudeDelta
              : 1,
          };
          setRegion(region);
          setActualRegion(region);

          return;
        }

        const location = {
          latitude,
          longitude,
          latitudeDelta: 2,
          longitudeDelta: 2,
        };
        const region = coords || latitude ? location : defaultLocation;

        setActualRegion(region);
      });
  }, [modalVisible]);

  const handlePressPlace = async (
    coordinate: Region,
    ubicacionId?: string,
    ubicacionNombre?: string
  ) => {
    if (!coordinate.latitudeDelta) {
      coordinate = {
        ...coordinate,
        latitudeDelta: actualRegion.latitudeDelta,
      };
    }
    if (!coordinate.longitudeDelta) {
      coordinate = {
        ...coordinate,
        longitudeDelta: actualRegion.longitudeDelta,
      };
    }

    // Si se presiona el mapa buscar lugares por ahi
    if (!ubicacionId) {
      // Si no se tiene permisos de ubicacion se da un error
      if (!locationPermision) {
        Alert.alert(
          "Error",
          "Se necesitan los permisos de ubicacion para poder seleccionar un lugar desde el mapa",
          [
            {
              text: "Cancelar",
            },
            {
              text: "Configuracion",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
        return;
      }
      reverseGeocodeAsync(coordinate).then((r: any) => {
        r = r[0];
        let ubicacionNombre;
        if (!r)
          return {
            ...coordinate,
            ubicacionNombre: null,
          };

        const city = r?.city ? r.city : "";
        const country = r?.country ? r.country : "";
        let name = r?.name ? r.name + ", " : "";
        const region = r?.region ? r.region + ", " : "";
        const street = r?.street ? r.street : "";

        if (!r.city) {
          if (r.name === r.region) {
            ubicacionNombre = region + country;
          } else {
            ubicacionNombre = name + region + country;
          }
        } else {
          name = r.name;

          if (r.street === r.name) {
            ubicacionNombre = name + ", " + region + city;
          } else {
            ubicacionNombre = street + " " + name + ", " + city;
          }
        }
        setPlace({
          ...coordinate,
          ubicacionNombre,
        });
      });
      return;
    }

    setPlace({
      ...coordinate,
      ubicacionId,
      ubicacionNombre,
    });
  };

  function guardarLugar(pl: locationType) {
    handleSelectPlace ? handleSelectPlace(pl) : null;
    setModalVisible(false);
  }

  // Buscar lugares con autocomplete
  const handleSearchPlace = (text: string, reg?: locationType) => {
    setBuscar(text);
    if (!text) return;

    // Ver si se le paso una region definida desde el useEffect si no buscar por la posicion del mapa
    const regionABuscar = reg
      ? reg
      : region
      ? region
      : { latitude: "", longitude: "" };
    const { latitude, longitude } = regionABuscar;

    const base = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
    const input = `?input=${text}`;
    const location = `&location=${latitude}%2C${longitude}`;
    const key = `&key=${mapPlacesKey}`;
    const radius = "&radius=1000";
    const language = "&language=es";

    const url = base + input + location + radius + key + language;

    fetch(url)
      .then((r) => {
        r.json().then((r) => {
          r = r.predictions;
          setSuggestedPlace(r);
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const clearSugested = () => {
    Keyboard.dismiss();
    setBuscar("");
    setSuggestedPlace([]);
  };

  const handlePressSuggested = async (e: { place_id: string }) => {
    clearSugested();
    const { place_id } = e;

    const region = await googleMapsSearchPlace(place_id);

    map?.current?.animateToRegion(region);

    setPlace(region);
  };

  function handleCancel() {
    mapsAlertShown = false;
    setPlace(selectedPlace);
    setModalVisible(false);
  }

  function openGoogleMaps(openAlways?: true) {
    // Mostrarlo solo una vez con la flag
    console.log({
      mapsAlertShown,
      openAlways,
    });
    (!mapsAlertShown || !!openAlways) &&
      AsyncAlert("Atencion", "Se abrira google maps, ??quieres continuar?").then(
        (r) => {
          mapsAlertShown = true;

          if (!r) {
            return;
          }

          try {
            let link = "";

            // Si tiene place ID, ir directo al mismo
            if (place.ubicacionId) {
              link = createMapLink({
                navigate: true,
                provider: "google",
                end: place.ubicacionNombre,
                endPlaceId: place.ubicacionId,
              });
            } else {
              // Ver por coordenadas
              link = createMapLink({
                navigate: true,
                provider: "google",
                latitude: place.latitude,
                longitude: place.longitude,
              });
            }

            Linking.openURL(link);

            console.log(link);
          } catch (error) {
            Alert.alert("Error", "Ocurrio un error abriendo el mapa");
          }
        }
      );
  }

  const { bottom } = useSafeAreaInsets();

  return (
    <Modal
      transparent={false}
      animationType={"none"}
      visible={modalVisible}
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <StatusBar translucent={false} animated={false} />
        <Pressable
          onPress={() => {
            // Si hay ubicacion link preguntar al usuario si desa ver en
            Keyboard.dismiss();

            !handleSelectPlace && openGoogleMaps();
          }}
          style={[styles.container, style]}
        >
          {/* Header */}
          <HeaderModal
            onPress={handleCancel}
            titulo={handleSelectPlace ? "Selecciona la ubicacion" : titulo}
          />

          {/* Buscador */}
          {handleSelectPlace && (
            <View
              style={{
                padding: 20,
                paddingVertical: 0,
                zIndex: 1,
              }}
            >
              <View
                style={{
                  ...styles.buscarContainer,
                  borderBottomRightRadius: !!buscar ? 0 : 7,
                  borderBottomLeftRadius: !!buscar ? 0 : 7,
                }}
              >
                <Feather
                  name="search"
                  size={25}
                  color="#7E7F84"
                  style={{
                    marginRight: 5,
                    position: "absolute",
                    bottom: 10,
                    left: 10,
                  }}
                />
                <TextInput
                  style={{
                    flex: 1,
                    marginLeft: 35,
                  }}
                  value={buscar}
                  placeholder="Buscar lugar"
                  onChangeText={handleSearchPlace}
                />
                {!!buscar && (
                  <Feather
                    onPress={clearSugested}
                    name="x"
                    size={25}
                    color="#7E7F84"
                    style={{
                      marginRight: 5,
                      position: "absolute",
                      bottom: 10,
                      right: 10,
                    }}
                  />
                )}
              </View>
              {!!buscar &&
                buscar?.length !== 0 &&
                (suggestedPlace.length !== 0 ? (
                  <View style={[styles.sugestionsContainer]}>
                    <View style={styles.line} />

                    <ScrollView showsVerticalScrollIndicator={false}>
                      {suggestedPlace.map((e: any, i) => {
                        const titulo = e.structured_formatting?.main_text;
                        const descripcion =
                          e.structured_formatting?.secondary_text;
                        return (
                          <Pressable
                            onPress={() => handlePressSuggested(e)}
                            key={i.toString()}
                            style={styles.suggestedPlace}
                          >
                            <Entypo
                              style={styles.icon}
                              name="location-pin"
                              size={30}
                              color={azulClaro}
                            />

                            <Text
                              numberOfLines={2}
                              style={styles.tituloSugested}
                            >
                              {titulo}{" "}
                              <Text style={styles.descripcionSugested}>
                                {descripcion}
                              </Text>
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                ) : (
                  <View style={[styles.sugestionsContainer]}>
                    <View style={styles.line} />
                    <View
                      style={{
                        ...styles.suggestedPlace,
                        flex: 1,
                      }}
                    >
                      <Text
                        numberOfLines={2}
                        style={{
                          ...styles.tituloSugested,
                          textAlign: "center",
                        }}
                      >
                        No se han encontrado lugares
                      </Text>
                    </View>
                  </View>
                ))}
              {place && (
                <InputOnFocus
                  onFocus={() => setEditingPlaceName(true)}
                  style={{
                    marginBottom: 10,
                  }}
                  textStyle={{
                    fontSize: 14,
                    color: azulClaro + "dd",
                    paddingLeft: 10,
                  }}
                  onChangeText={(te) => {
                    setPlace((prev) => ({
                      ...prev,
                      ubicacionNombre: te,
                    }));
                  }}
                  value={place?.ubicacionNombre}
                />
              )}
            </View>
          )}

          <View style={styles.mapContainer}>
            <MapView
              ref={map}
              provider={"google"}
              mapType={"standard"}
              showsUserLocation={locationPermision}
              loadingEnabled={true}
              onTouchStart={clearSugested}
              onPress={
                handleSelectPlace && !editingPlaceName
                  ? ({ nativeEvent }) => {
                      const { coordinate } = nativeEvent as any;
                      handlePressPlace(coordinate);
                    }
                  : () => null
              }
              onLongPress={
                handleSelectPlace && !editingPlaceName
                  ? ({ nativeEvent }) => {
                      const { coordinate } = nativeEvent as any;
                      handlePressPlace(coordinate);
                    }
                  : () => null
              }
              initialRegion={region ? region : defaultLocation}
              onPoiClick={
                handleSelectPlace && !editingPlaceName
                  ? ({ nativeEvent }) => {
                      const { coordinate, placeId, name } = nativeEvent as any;
                      handlePressPlace(coordinate, placeId, name);
                    }
                  : () => null
              }
              style={{
                ...StyleSheet.absoluteFillObject,
              }}
              onRegionChangeComplete={(r) => {
                setActualRegion(r);
              }}
            >
              {/* Marcador */}
              {place && (
                <Marker
                  onPress={() => openGoogleMaps(true)}
                  coordinate={place}
                />
              )}
            </MapView>

            {place?.ubicacionNombre && handleSelectPlace && (
              <View
                style={{
                  ...styles.locationTxtContainer,
                }}
              >
                <TouchableOpacity onPress={() => guardarLugar(place)}>
                  <Text
                    numberOfLines={2}
                    style={{
                      ...styles.locationTxt,
                      paddingBottom: bottom + 10,
                    }}
                  >
                    {place?.ubicacionNombre}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height,
  },

  textInput: {
    fontSize: 17,
    flex: 1,
    backgroundColor: "#f4f6f6",
    padding: 5,
    paddingLeft: 10,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "transparent",
  },

  captionTxt: {
    fontSize: 15,
    color: "black",
    marginLeft: 5,
    marginBottom: 5,
  },

  line: {
    borderTopWidth: 0.5,
    borderColor: azulClaro,
    marginHorizontal: 20,
  },

  mapContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  markerContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 200,
  },

  buscarContainer: {
    backgroundColor: "#f4f6f6",
    padding: 10,
    marginBottom: 10,
    borderRadius: 7,
    flexDirection: "row",
  },
  sugestionsContainer: {
    position: "absolute",
    backgroundColor: "#f4f6f6",
    left: 20,
    top: 40,
    width: "100%",
    maxHeight: height * 0.45,
    borderBottomRightRadius: 7,
    borderBottomLeftRadius: 7,
    paddingBottom: 10,
    zIndex: 2,
    elevation: 1,
  },

  suggestedPlace: {
    padding: 10,
    paddingLeft: 0,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
    elevation: 1,
  },

  tituloSugested: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },

  descripcionSugested: {
    fontSize: 16,
    color: "#00000066",
  },
  icon: {
    padding: 7,
  },
  locationTxtContainer: {
    position: "absolute",
    width: "100%",
    elevation: 2,
    zIndex: 2,
    bottom: 0,
    backgroundColor: azulFondo,
  },

  locationTxt: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: azulClaro,
    textAlign: "center",
    color: "#fff",
    fontSize: 16,

    paddingHorizontal: 20,
  },
});
export default ModalMap;
