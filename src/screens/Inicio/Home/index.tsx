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
  randomImageUri,
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
import { locationType } from "../../../components/ModalMap";
import { boletoType } from "../../AgregarEvento/Agregar3";

export type EventoType = {
  imagenes?: { uri: string; key: string; imagenPrincipal?: boolean }[];

  titulo?: string;
  detalles?: string;

  // Se detecta localmente
  favoritos?: boolean;

  id?: string;

  ubicacion?: locationType;
  fechaInicial?: Date;
  fechaFinal?: Date;

  boletos?: boletoType[];

  tosAceptance?: {
    hora: Date;
    ip: string;
  };

  tipoLugar?: placeEnum;
  musica?: musicEnum;
  comodities?: comoditiesEnum[];

  musOtra?: string;
};

export default function ({ navigation }: { navigation: NavigationProp }) {
  const numberNotifications = 3;

  // Texto de busqueda
  const [search, setSearch] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  // Modal del filtro
  const [modalVisible, setModalVisible] = useState(false);
  const [userLocation, setUserLocation] =
    useState<null | Location.LocationObjectCoords>(null);

  const [fetchedEvents, setFetchedEvents] = useState<EventoType[]>([
    {
      boletos: [
        {
          cantidad: 50,
          descripcion: "",
          precio: 400,
          titulo: "Entrada normal",
        },
        {
          cantidad: 100,
          descripcion: "",
          precio: 800,
          titulo: "VIP",
        },
      ],
      comodities: [comoditiesEnum.ALBERCA],
      detalles: "",
      fechaFinal: new Date("2022-08-27T10:00:00.000Z"),
      fechaInicial: new Date("2022-08-27T03:00:00.000Z"),
      id: "43166d65-c327-48d7-b1a8-a17b1d79a026",
      imagenes: [
        {
          imagenPrincipal: false,
          key: "bla bla bla",
          uri: "file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540mateodelat%252FpartyUs/ImageManipulator/fb315a44-641f-4f71-a766-e5906ad15ef7.jpg",
        },
        {
          imagenPrincipal: true,
          key: "https://static.wikia.nocookie.net/zelda/images/8/80/Link_Defending_%28Soulcalibur_II%29.png/revision/latest?cb=20090726014102",
          uri: "https://static.wikia.nocookie.net/zelda/images/8/80/Link_Defending_%28Soulcalibur_II%29.png/revision/latest?cb=20090726014102",
        },
      ],
      musOtra: undefined,
      musica: musicEnum.POP,
      tipoLugar: placeEnum.EXTERIOR,
      titulo: "La buena peda",
      tosAceptance: {
        hora: new Date("2022-08-22T01:28:29.123Z"),
        ip: "10.0.2.16",
      },
      ubicacion: {
        latitude: 21.363185383060518,
        latitudeDelta: 3.236393788060422,
        longitude: -104.39555022865532,
        longitudeDelta: 2.000001221895232,
        ubicacionNombre: "La Yesca, Nayarit, Mexico",
      },
    },
  ]);

  const [eventosFiltrados, setEventosFiltrados] = useState<EventoType[] | []>(
    []
  );

  useEffect(() => {
    asignarUbicacion();
    // Eventos a eventos filtrados
    setEventosFiltrados(fetchedEvents);
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
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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
            <Pressable onPress={() => navigation.navigate("Perfil")}>
              <Image
                style={styles.profilePicture}
                source={{
                  uri: randomImageUri(),
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
            style={{
              flexDirection: "row",
              marginTop: 20,
              alignItems: "center",
            }}
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
