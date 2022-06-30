import {
  Image,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  comoditiesEnum,
  enumToArray,
  placeEnum,
  musicEnum,
  requestLocation,
  rojoClaro,
} from "../../../../constants";

import { FontAwesome5 } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

import { NavigationProp } from "../../../shared/interfaces/navigation.interface";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import SearchBar from "../../../components/SearchBar";
import Plus from "../../../navigation/NavBar/components/Plus";
import FiltersModal, { filterResult } from "./components/FiltersModal";
import { TouchableHighlight } from "react-native-gesture-handler";
import * as Location from "expo-location";

export default function ({ navigation }: { navigation: NavigationProp }) {
  const numberNotifications = 3;

  // Texto de busqueda
  const [search, setSearch] = useState("");

  // Modal del filtro
  const [modalVisible, setModalVisible] = useState(false);
  const [userLocation, setUserLocation] =
    useState<null | Location.LocationObjectCoords>(null);

  useEffect(() => {
    asignarUbicacion();
  }, []);

  const minPrice = 100;
  const maxPrice = 1340;

  // Filtros obtenidos
  const [filters, setFilters]: [f: filterResult, f: any] = useState({
    precioMin: minPrice,
    precioMax: maxPrice,
    dist: undefined,
    fechaMin: undefined,
    fechaMax: undefined,

    lugar: enumToArray(placeEnum),
    comodities: enumToArray(comoditiesEnum),
    musica: enumToArray(musicEnum),
  });

  const insets = useSafeAreaInsets();

  async function asignarUbicacion() {
    return requestLocation().then((r) => {
      setUserLocation(r.userLocation);
    });
  }

  async function handleSearch(filters: filterResult) {
    // Si se esta buscando por distancia verificar ubicacion
    const i = new Date();
    if (!!filters.dist) {
      await asignarUbicacion();
    }

    console.log(filters);
    setFilters(filters);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        onPress={Keyboard.dismiss}
        style={{
          flex: 1,
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          {/* Imagen de perfil */}
          <Pressable onPress={() => navigation.navigate("Perfil")}>
            <Image
              style={styles.profilePicture}
              source={{
                uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmlsZSUyMHBob3RvfGVufDB8fDB8fA%3D%3D&w=1000&q=80",
              }}
            />
          </Pressable>
          <Pressable onPress={() => navigation.navigate("Notifications")}>
            <FontAwesome5 name="bell" size={24} color="black" />

            {numberNotifications && (
              <View
                style={{
                  backgroundColor: "red",

                  borderRadius: 20,

                  position: "absolute",
                  right: -9,
                  top: -6,
                  width: 18,
                  height: 18,

                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 12 }}
                >
                  {numberNotifications}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Barra de busqueda */}
        <View
          style={{ flexDirection: "row", marginTop: 20, alignItems: "center" }}
        >
          <SearchBar
            setValue={(r) => {
              setSearch(r);
            }}
            value={search}
          />

          {/* Boton de filtros */}
          <TouchableHighlight
            underlayColor={rojoClaro}
            onPress={() => setModalVisible(true)}
            style={styles.filterButton}
          >
            <Ionicons name="filter" size={25} color="white" />
          </TouchableHighlight>
        </View>
      </Pressable>

      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <FiltersModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          minPrice={minPrice}
          maxPrice={maxPrice}
          prevFilters={filters}
          handleSearch={handleSearch}
        />
      </Modal>
      <View
        style={{
          position: "absolute",
          right: 60,
          backgroundColor: "red",
          bottom: insets.bottom + 40,
        }}
      >
        <Plus />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingVertical: 0,
  },

  profilePicture: {
    width: 45,
    height: 45,

    borderRadius: 30,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  filterButton: {
    marginLeft: 20,
    backgroundColor: rojoClaro,
    width: 45,
    height: 45,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
