import {
  ActivityIndicator,
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
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  enumToArray,
  requestLocation,
  rojoClaro,
  getUserSub,
  precioConComision,
  msInDay,
  distancia2Puntos,
  redondear,
  tipoRedondeo,
  normalizeString,
  mayusFirstLetter,
  getImageUrl,
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

import { API, DataStore, Predicates, Storage } from "aws-amplify";
import {
  ComoditiesEnum,
  Evento,
  MusicEnum,
  PlaceEnum,
  Usuario,
} from "../../../models";
import useUser from "../../../Hooks/useUser";
import EmptyProfile from "../../../components/EmptyProfile";
import { Boleto } from "../../../models";
import { locationType } from "../../../components/ModalMap";
import { StatusBar } from "expo-status-bar";

export type EventoType = Evento & {
  favoritos?: boolean;
  boletos: Boleto[];
  imagenes: { key: string; uri: string }[] | string[];
  owner?: Usuario;
  comodities?: ComoditiesEnum[];
  ubicacion: locationType;
};

export default function ({ navigation }: { navigation: NavigationProp }) {
  const numberNotifications = 3;

  const { usuario } = useUser();

  const [minPrice, setMinPrice] = useState<number>();
  const [maxPrice, setMaxPrice] = useState<number>();

  // Texto de busqueda
  const [search, setSearch] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  // Modal del filtro
  const [modalVisible, setModalVisible] = useState(false);
  const [userLocation, setUserLocation] =
    useState<null | Location.LocationObjectCoords>(null);

  const [loading, setLoading] = useState(false);

  const [fetchedEvents, setFetchedEvents] = useState<EventoType[] | []>([]);

  const [eventosFiltrados, setEventosFiltrados] = useState<EventoType[] | []>(
    []
  );

  async function fetchEvents(events?: Evento[], checkVerified?: boolean) {
    setLoading(true);
    let eventos: EventoType[] = events
      ? events
      : ((await DataStore.query(Evento, Predicates.ALL, {
          sort: (e) => e.fechaInicial("ASCENDING").titulo("ASCENDING"),
          // limit: 7,
        })) as any);

    let precioMin: number | undefined;
    let precioMax: number | undefined;

    eventos = await Promise.all(
      eventos.map(async (e) => {
        const imagenes = Promise.all(
          e.imagenes.map(async (r: any) => {
            // Ver si es llave de s3
            let key = r;

            return {
              key,
              uri: await getImageUrl(r),
            };
          })
        );

        const boletos = DataStore.query(
          Boleto,
          (bo) => bo.eventoID("eq", e.id),
          { sort: (e) => e.precio("DESCENDING") }
        ).then((boletos) => {
          boletos.map((bo) => {
            const precio = precioConComision(bo.precio);

            precioMin = !precioMin
              ? precio
              : precioMin > precio
              ? precio
              : precioMin;

            precioMax = !precioMax
              ? precio
              : precioMax < precio
              ? precio
              : precioMax;
          });
          return boletos;
        });

        const owner = DataStore.query(Usuario, e.CreatorID ? e.CreatorID : "");

        await Promise.all([owner, imagenes, boletos]);

        if (!owner) {
          throw new Error(
            "Error obteniendo el usuario creador en el inicio del evento " +
              e.id +
              " con id de creador " +
              e.CreatorID
          );
        }

        return {
          ...e,
          imagenes: (await imagenes) as any,
          boletos: await boletos,
          owner: await owner,
        };
      })
    );

    if (precioMin && precioMax && !events) {
      setMinPrice(redondear(precioMin, 50, tipoRedondeo.ABAJO));
      setMaxPrice(redondear(precioMax, 50, tipoRedondeo.ARRIBA));
    }

    // Si se pasan eventos (checar si son solo verificados)
    if (events && checkVerified) {
      eventos = eventos.filter((e) => e.owner?.verified);
    }

    setEventosFiltrados(eventos);
    setFetchedEvents(eventos);

    // Borrar filtros
    !events && clearFilters();
    setLoading(false);
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filtros obtenidos
  const [filters, setFilters]: [
    f: filterResult,
    f: Dispatch<SetStateAction<any>>
  ] = useState({
    precioMin: minPrice,
    precioMax: maxPrice,
    dist: undefined,
    fechaMin: undefined,
    fechaMax: undefined,

    lugar: enumToArray(PlaceEnum),
    comodities: [] as ComoditiesEnum[],
    musica: enumToArray(MusicEnum),

    verified: false,
  });

  function clearFilters() {
    setFilters({
      precioMin: minPrice,
      precioMax: maxPrice,
      dist: undefined,
      fechaMin: undefined,
      fechaMax: undefined,

      verified: false,

      lugar: enumToArray(PlaceEnum),
      comodities: [],
      musica: enumToArray(MusicEnum),
    });
  }

  const insets = useSafeAreaInsets();

  async function asignarUbicacion() {
    return requestLocation().then((r) => {
      setUserLocation(r.userLocation as any);
      return r;
    });
  }

  async function handleSearch(filters: filterResult) {
    // Si se esta buscando por distancia verificar ubicacion
    let ubicacion: {
      userLocation: Location.LocationObjectCoords | null;
      permission: boolean;
    } = { userLocation: userLocation, permission: userLocation ? true : false };

    // Si hay distancia y no hay ubicacion en el estado asignarla
    if (!!filters.dist && !userLocation) {
      await asignarUbicacion().then((r) => {
        ubicacion = r as any;
      });
    }
    const {
      comodities,
      musica,
      fechaMax,
      fechaMin,
      dist,
      lugar: tipoLugar,
      verified,
    } = filters;

    let { precioMax, precioMin } = filters;

    const valueMax = 10000000;
    // Si el precio maximo es igual al precio max del estado, es un comodin, entonces buscar todo tipo
    precioMax = precioMax === maxPrice ? valueMax : precioMax;
    precioMin = precioMin === minPrice ? 0 : precioMin;

    const i = new Date();
    const eventos = (await DataStore.query(Evento, (e) =>
      search
        ? e
            // Musica
            .or((e) =>
              e
                .musica("contains", musica[0])
                .musica("contains", musica[1])
                .musica("contains", musica[2])
                .musica("contains", musica[3])
                .musica("contains", musica[4])
                .musica("contains", musica[5])
                .musica("contains", musica[6])
            )
            // Tipo del lugar
            .or((e) =>
              e
                .tipoLugar("contains", tipoLugar[0])
                .tipoLugar("contains", tipoLugar[1])
                .tipoLugar("contains", tipoLugar[2])
            )

            // Por texto de busqueda solo en titulo y descripcion
            .or((e) =>
              e
                .detalles("contains", normalizeString(search))
                .titulo("contains", normalizeString(search))

                .detalles("contains", normalizeString(search).toLowerCase())
                .titulo("contains", normalizeString(search).toLowerCase())

                .detalles("contains", mayusFirstLetter(search))
                .titulo("contains", mayusFirstLetter(search))

                .detalles("contains", search)
                .titulo("contains", search)
            )

            // Por fechas
            .fechaInicial(
              "gt",
              // Si no hay fecha inicial poner la fecha de hoy minima
              fechaMin ? fechaMin.getTime() : new Date().getTime()
            )
            .fechaFinal(
              "lt",
              fechaMax
                ? fechaMax.getTime()
                : // Si no hay fecha max la fecha de hoy en 5 años
                  new Date().getTime() + msInDay * 365 * 5
            )

            // Rango precios
            // Si el precio minimo o el maximo se encuentra en el rango input
            .precioMin("le", precioMax ? precioMax : valueMax)
            .precioMax("ge", precioMin ? precioMin : 0)
        : e
            // Musica
            .or((e) =>
              e
                .musica("contains", musica[0])
                .musica("contains", musica[1])
                .musica("contains", musica[2])
                .musica("contains", musica[3])
                .musica("contains", musica[4])
                .musica("contains", musica[5])
                .musica("contains", musica[6])
            )
            // Tipo del lugar
            .or((e) =>
              e
                .tipoLugar("contains", tipoLugar[0])
                .tipoLugar("contains", tipoLugar[1])
                .tipoLugar("contains", tipoLugar[2])
            )

            // Por fechas
            .fechaInicial(
              "gt",
              // Si no hay fecha inicial poner la fecha de hoy minima
              fechaMin ? fechaMin.getTime() : new Date().getTime()
            )
            .fechaFinal(
              "lt",
              fechaMax
                ? fechaMax.getTime()
                : // Si no hay fecha max la fecha de hoy en 5 años
                  new Date().getTime() + msInDay * 365 * 5
            )

            // Rango precios
            // Si el precio minimo o el maximo se encuentra en el rango input
            .precioMin("le", precioMax ? precioMax : valueMax)
            .precioMax("ge", precioMin ? precioMin : 0)
    ).then((r) => {
      // Filtrar por distancia y comodities
      r = r.filter((e) => {
        let ubicacionValida = true;
        let comoditiesValidos = true;

        // Verificar la distancia si existe
        if (!!dist) {
          const { latitude, longitude } =
            e.ubicacion as unknown as locationType;
          // Si el usuario agrego distancia y tiene activada la ubicacion
          if (!ubicacion.permission) {
            Alert.alert(
              "Error",
              "No se pueden buscar eventos cercanos, no esta activada la ubicacion"
            );
          } else {
            const { latitude: userLat, longitude: userLong } =
              ubicacion.userLocation as unknown as Location.LocationObjectCoords;

            // Filtrar por distancia
            ubicacionValida =
              dist >= distancia2Puntos(latitude, longitude, userLat, userLong)
                ? true
                : false;
          }
        }
        // Si tenemos comodities, verificarlos
        if (comodities.length !== 0) {
          // Mapear comodities que quiere el usuario
          comodities.map((com) => {
            // Si el evento no lo tiene se descarta
            if (!e.comodities?.includes(com)) {
              comoditiesValidos = false;
            }
          });
        }

        return ubicacionValida && comoditiesValidos;
      });
      return r;
    })) as Evento[];

    console.log(new Date().getTime() - i.getTime());

    fetchEvents(eventos, verified);
    setFilters(filters);
  }

  // Funcion que cambia estado en un evento filtrado y en evento normal
  function updateEvent(newEvent: EventoType) {
    // Pasar nuevo evento por el filtro
    const filtradoIdx = eventosFiltrados.findIndex(
      (e: any) => e.id === newEvent.id
    );
    const fetchedIdx = fetchedEvents.findIndex(
      (e: any) => e.id === newEvent.id
    );

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
    const evento = eventosFiltrados.find((i: any) => i.id === id);
    if (!evento) return;

    navigation.navigate("DetalleEvento", {
      ...evento,
    });
  }

  function handleLike(id?: string) {
    const e = fetchedEvents.find((e: any) => e.id === id);
    if (!e) return;

    updateEvent({
      ...e,
      favoritos: !e.favoritos,
    });
  }

  async function onRefresh() {
    setRefreshing(true);

    // Obtener eventos por filtro
    await handleSearch(filters);

    setRefreshing(false);
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
      <StatusBar translucent={true} />
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
              setValue={(txt) => {
                setSearch(txt);
                const s = normalizeString(txt.toString());

                if (!txt) {
                  setEventosFiltrados(fetchedEvents);
                }

                // Buscar por titulo y descripcion localmente
                setEventosFiltrados((ne) => {
                  return fetchedEvents.filter((ev) => {
                    let { titulo, owner, detalles } = ev;
                    titulo = normalizeString(titulo);
                    detalles = normalizeString(detalles);
                    const username = normalizeString(owner?.nickname);
                    return (
                      titulo.includes(s) ||
                      detalles.includes(s) ||
                      username.includes(s)
                    );
                  });
                });
              }}
              onEndEditing={() => {
                handleSearch(filters);
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
            <RefreshControl
              onRefresh={onRefresh}
              refreshing={refreshing && !loading}
            />
          }
          showsVerticalScrollIndicator={false}
          keyExtractor={(_, idx) => idx.toString()}
          data={eventosFiltrados}
          ListEmptyComponent={
            loading ? (
              <View style={{ flex: 1 }}>
                <ActivityIndicator size={"large"} color={"black"} />
              </View>
            ) : (
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 20,
                  marginBottom: 5,
                  textAlign: "center",
                }}
              >
                No hay eventos
              </Text>
            )
          }
          renderItem={({ item, index }) => {
            if (!item) return <View />;
            return (
              <ElementoEvento
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
