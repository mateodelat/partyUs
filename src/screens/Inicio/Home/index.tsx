import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  enumToArray,
  placeEnum,
  musicEnum,
  requestLocation,
  rojoClaro,
  randomImageUri,
  getUserSub,
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
import ElementoEvento from "../../../components/ElementoEvento";

import { DataStore } from "aws-amplify";
import { ComoditiesEnum, Evento } from "../../../models";
import useUser from "../../../Hooks/useUser";
import EmptyProfile from "../../../components/EmptyProfile";

export type EventoType = Evento & {
  favoritos: boolean;
  imagenes: { uri: string; imagenPrincipal: string; key: string }[];
  numPersonas: number;
};

export default function ({ navigation }: { navigation: NavigationProp }) {
  const numberNotifications = 3;

  const { usuario } = useUser();

  // Texto de busqueda
  const [search, setSearch] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  // Modal del filtro
  const [modalVisible, setModalVisible] = useState(false);
  const [userLocation, setUserLocation] =
    useState<null | Location.LocationObjectCoords>(null);

  const [fetchedEvents, setFetchedEvents] = useState<EventoType[] | []>([]);

  const [eventosFiltrados, setEventosFiltrados] = useState<EventoType[] | []>(
    []
  );

  async function fetchEvents() {
    let eventos: EventoType[] = (await DataStore.query(Evento)) as any;

    setEventosFiltrados(eventos);

    console.log(eventos);

    eventos = eventos.map((e) => {
      e.imagenes = e.imagenes.map((r) => {
        const s = JSON.parse(r) as any;

        console.log(s);

        return s;
      });

      return e;
    });

    // Borrar filtros
    clearFilters();
  }

  useEffect(() => {
    asignarUbicacion();

    fetchEvents();
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
    comodities: enumToArray(ComoditiesEnum),
    musica: enumToArray(musicEnum),
  });

  function clearFilters() {
    setFilters({
      precioMin: minPrice,
      precioMax: maxPrice,
      dist: undefined,
      fechaMin: undefined,
      fechaMax: undefined,

      lugar: enumToArray(placeEnum),
      comodities: enumToArray(ComoditiesEnum),
      musica: enumToArray(musicEnum),
    });
  }

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

  // Funcion que cambia estado en un evento filtrado y en evento normal
  function updateEvent(newEvent: EventoType) {
    // Pasar nuevo evento por el filtro
    const filtradoIdx = eventosFiltrados.findIndex((e) => e.id === newEvent.id);
    const fetchedIdx = fetchedEvents.findIndex((e) => e.id === newEvent.id);

    if (filtradoIdx !== -1) {
      let nuevosEventos = [...eventosFiltrados];
      nuevosEventos[filtradoIdx] = newEvent;

      setEventosFiltrados([...nuevosEventos]);
    }
    if (fetchedIdx !== -1) {
      let nuevosEventos = [...eventosFiltrados];
      nuevosEventos[fetchedIdx] = newEvent;

      setFetchedEvents([...nuevosEventos]);
    } else {
      Alert.alert("Error", "Favor de reportarlo a los desarrolladores");
      return;
    }
  }

  function handlePressItem(id?: string) {
    const evento = eventosFiltrados.find((i) => i.id === id);
    if (!evento) return;

    navigation.navigate("DetalleEvento", {
      ...evento,
    });
  }

  function handleLike(id?: string) {
    const e = fetchedEvents.find((e) => e.id === id);
    if (!e) return;

    updateEvent({
      ...e,
      favoritos: !e.favoritos,
    });
  }

  function onRefresh() {
    setRefreshing(true);
    fetchEvents();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }

  async function handleProfile() {
    // Verificar que este loggeado
    if (!(await getUserSub())) {
      navigation.navigate("LoginStack");
      return;
    } else {
      navigation.navigate("Perfil");
    }
  }

  async function handleNotifications() {
    // Verificar que este loggeado
    if (!(await getUserSub())) {
      navigation.navigate("LoginStack");
      return;
    } else {
      navigation.navigate("Notifications");
    }
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
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
        >
          <View style={styles.header}>
            {/* Imagen de perfil */}
            <Pressable onPress={handleProfile}>
              {usuario.foto ? (
                <Image
                  style={styles.profilePicture}
                  source={{
                    uri: usuario.foto,
                  }}
                />
              ) : (
                <EmptyProfile />
              )}
            </Pressable>
            <Pressable onPress={handleNotifications}>
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
            style={{
              flexDirection: "row",
              marginTop: 20,
              alignItems: "center",
            }}
          >
            <SearchBar
              setValue={(r) => {
                setSearch(r);

                console.log("Buscar " + r);
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
        </View>

        <FlatList
          refreshControl={
            <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
          }
          showsVerticalScrollIndicator={false}
          keyExtractor={(_, idx) => idx.toString()}
          data={eventosFiltrados}
          renderItem={({ item, index }) => {
            if (!item) return <View />;
            return (
              <ElementoEvento
                handleLike={() => handleLike(item.id)}
                data={item}
                onPress={() => handlePressItem(item.id)}
              />
            );
          }}
        />
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
