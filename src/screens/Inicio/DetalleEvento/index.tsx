import {
  Alert,
  Animated,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { EventoType } from "../Home";
import { NavigationProp } from "../../../shared/interfaces/navigation.interface";
import Carrousel from "./Carrousel";
import HeaderDetalleEvento from "../../../components/HeaderDetalleEvento";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  azulClaro,
  azulFondo,
  enumToArray,
  formatAMPM,
  formatDay,
  getImageUrl,
  getWeekDay,
  vibrar,
  rojo,
  rojoClaro,
  shadowMedia,
  verifyUserLoggedIn,
  getUserSub,
} from "../../../../constants";
import { DataStore, Predicates, Storage } from "aws-amplify";
import { OpType } from "@aws-amplify/datastore";

import Line from "../../../components/Line";
import { MusicEnum, Usuario } from "../../../models";
import Descripcion from "./Descripcion";

import { Feather } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";

import ModalMap from "../../../components/ModalMap";
import ProgressCircle from "../../../components/ProgressCircle";
import { ComoditiesEnum } from "../../../models";
import EmptyProfile from "../../../components/EmptyProfile";
import Boton from "../../../components/Boton";
import { Evento } from "../../../models";
import { Boleto } from "../../../models";

export default function ({
  route,
  navigation,
}: {
  route: { params: EventoType };
  navigation: NavigationProp;
}) {
  // route.params = {
  //   CreatorID: "04eba9f3-5ef3-4dd5-9f08-9777e7aaaa4f",
  //   boletos: [
  //     {
  //       cantidad: 50,
  //       createdAt: "2022-08-31T05:28:18.895Z",
  //       descripcion: "",
  //       eventoID: "f2dd5548-ab62-4ff0-aa5a-af7485efbed1",
  //       id: "06a90ee7-7e2d-4201-8371-a097dd30dfea",
  //       personasReservadas: null,
  //       precio: 750,
  //       titulo: "VIP",
  //       updatedAt: "2022-08-31T05:28:18.895Z",
  //     },
  //     {
  //       cantidad: 80,
  //       createdAt: "2022-08-31T05:28:17.152Z",
  //       descripcion: "",
  //       eventoID: "f2dd5548-ab62-4ff0-aa5a-af7485efbed1",
  //       id: "7843cd0e-db23-461a-9b4f-ea527a5dce2b",
  //       personasReservadas: null,
  //       precio: 100,
  //       titulo: "Entrada normal",
  //       updatedAt: "2022-08-31T05:28:17.152Z",
  //     },
  //   ],
  //   comodities: enumToArray(ComoditiesEnum),
  //   createdAt: "2022-08-31T05:28:16.983Z",
  //   detalles: null,
  //   fechaFinal: 1662786000000,
  //   fechaInicial: 1662753600000,
  //   id: "f2dd5548-ab62-4ff0-aa5a-af7485efbed1",
  //   imagenPrincipalIDX: 0,
  //   imagenes: [
  //     {
  //       key: "https://images.unsplash.com/photo-1495837174058-628aafc7d610?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=800&ixid=MnwxfDB8MXxyYW5kb218MHx8cGFydHl8fHx8fHwxNjYxOTIzNTkz&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1100",
  //       uri: "https://images.unsplash.com/photo-1495837174058-628aafc7d610?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=800&ixid=MnwxfDB8MXxyYW5kb218MHx8cGFydHl8fHx8fHwxNjYxOTIzNTkz&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1100",
  //     },
  //     {
  //       key: "https://images.unsplash.com/photo-1627020730793-2ccb5cd55e99?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=800&ixid=MnwxfDB8MXxyYW5kb218MHx8cGFydHl8fHx8fHwxNjYxOTIzNjAx&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1100",
  //       uri: "https://images.unsplash.com/photo-1627020730793-2ccb5cd55e99?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=800&ixid=MnwxfDB8MXxyYW5kb218MHx8cGFydHl8fHx8fHwxNjYxOTIzNjAx&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1100",
  //     },
  //     {
  //       key: "https://images.unsplash.com/photo-1623788452350-4c8596ff40bb?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=800&ixid=MnwxfDB8MXxyYW5kb218MHx8cGFydHl8fHx8fHwxNjYxOTIzNjA4&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1100",
  //       uri: "https://images.unsplash.com/photo-1623788452350-4c8596ff40bb?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=800&ixid=MnwxfDB8MXxyYW5kb218MHx8cGFydHl8fHx8fHwxNjYxOTIzNjA4&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1100",
  //     },
  //   ],
  //   musOtra: null,
  //   musica: "REGGETON",
  //   owner: {
  //     admin: false,
  //     calificacion: null,
  //     createdAt: "2022-08-29T01:29:04.989Z",
  //     email: "mateodelat@gmail.com",
  //     fechaNacimiento: "Thu Aug 29 2002 17:00:00 GMT-0700 (MST)",
  //     foto: "https://ui-avatars.com/api/?name=mateodleat&bold=true&background=000000&color=fff&length=1",
  //     id: "04eba9f3-5ef3-4dd5-9f08-9777e7aaaa4f",
  //     idKey: "usr-04eba9f3-5ef3-4dd5-9f08-9777e7aaaa4f|id.jpg",
  //     idUploaded: true,
  //     imagenFondo:
  //       "https://images.unsplash.com/photo-1606104255713-cd96d1f41c28?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=500&ixid=MnwxfDB8MXxyYW5kb218MHx8cGFydHl8fHx8fHwxNjYxNzM2NTQy&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=900",
  //     materno: "rahul",
  //     nickname: "mateodelat",
  //     nombre: "rahul",
  //     notificationToken: null,
  //     numResenas: null,
  //     organizador: true,
  //     paterno: "rahul",
  //     phoneCode: null,
  //     phoneNumber: null,
  //     updatedAt: "2022-08-31T19:08:35.056Z",
  //     verified: true,
  //   },
  //   personasMax: 130,
  //   personasReservadas: null,
  //   precioMax: 750,
  //   precioMin: 100,
  //   tipoLugar: "INTERIOR",
  //   titulo: "Summer fest 2022",
  //   tosAceptance: {
  //     hora: "2022-08-31T05:28:12.402Z",
  //     ip: "10.0.2.16",
  //   },
  //   ubicacion: {
  //     latitude: 43.67918571887254,
  //     latitudeDelta: 0.05067978754303226,
  //     longitude: -80.40836691856384,
  //     longitudeDelta: 0.04040110856294632,
  //     ubicacionId: "ChIJAAAAAAAAAAARiJVfJxIYXpE",
  //     ubicacionNombre: "Grand River Grooming",
  //   },
  //   updatedAt: "2022-08-31T05:28:16.983Z",
  // } as any;

  const [evento, setEvento] = useState(route.params);

  let {
    titulo,
    imagenes,
    owner,
    comodities,
    musica,
    musOtra,
    detalles,
    fechaFinal,
    fechaInicial,
    personasMax,
    ubicacion,

    personasReservadas,

    id,
  } = evento;

  titulo = titulo
    ? titulo.length > 10
      ? titulo.slice(0, 10) + "..."
      : titulo
    : "Detalles evento";

  personasReservadas = personasReservadas ? personasReservadas : 0;

  const personasPercent =
    personasReservadas && personasMax
      ? (personasReservadas / personasMax) * 100
      : 1;

  // Variables para animaciones (Carrousel fotos y header transparencia)
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const insets = useSafeAreaInsets();
  const [top, setTop] = useState(insets.top);

  const [modalVisible, setModalVisible] = useState(false);

  const [following, setFollowing] = useState(false);

  const [fotoPerfil, setFotoPerfil] = useState(owner?.foto);

  const [usuariosReservados, setUsuariosReservados] = useState<
    Usuario[] | undefined
  >();

  function handleBack() {
    navigation.pop();
  }

  async function fetchInfoEvento(e: Evento) {
    const imagenes = Promise.all(
      e.imagenes.map(async (r: string) => {
        // Ver si es llave de s3
        let key = r;

        return {
          key,
          uri: await getImageUrl(r),
        };
      })
    );

    const boletos = DataStore.query(Boleto, (bo) => bo.eventoID("eq", e.id));

    const owner = DataStore.query(Usuario, e.CreatorID);

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
    } as EventoType;
  }

  useEffect(() => {
    setTop(insets.top);

    // Asignar una vigilancia a updates del evento para caso de lleno
    const sub = DataStore.observe(Evento, (fe) => fe.id("eq", id)).subscribe(
      async (msg) => {
        if (msg.opType === OpType.UPDATE || msg.opType === OpType.DELETE) {
          setEvento(await fetchInfoEvento(msg.element));

          console.log("Fecha actualizada");

          const { fechaInicial: neInicial, fechaFinal: neFinal } = msg.element;

          // Si la fecha ha cambiado mandar alerta
          if (neFinal !== fechaFinal || neInicial !== fechaInicial) {
            Alert.alert(
              "Alerta",
              "La fecha inicial o final han cambiado, revisalo",
              [
                {
                  text: "VER",
                  onPress: () => {
                    navigation.navigate("DetalleEvento", evento);
                  },
                },
              ],
              {
                cancelable: false,
              }
            );
          }
        }
      }
    );

    // Si la foto de perfil no es url pedirla de S3
    getImageUrl(owner?.foto).then(setFotoPerfil);

    // Pedir las fotos de perfil de los primeros 5 usuarios

    DataStore.query(Usuario, Predicates.ALL, {
      limit: 6,
    }).then(async (r) => {
      r = await Promise.all(
        r.map(async (e) => {
          const foto = await getImageUrl(e.foto);

          return {
            ...e,
            foto,
          };
        })
      );
      r = [...r];

      setUsuariosReservados(r);
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  function handleIrAPerfil() {
    Alert.alert("", "Navegar a detalle de perfil");
  }

  function handleViewLocation() {
    setModalVisible(true);
  }

  function handleFollow() {
    vibrar();

    setFollowing(!following);
  }

  async function handleContinar() {
    if (!(await getUserSub())) {
      navigation.navigate("LoginStack");
    } else {
      navigation.navigate("Boletos", evento);
    }
  }

  const showVerified = owner?.verified;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        style={{
          ...styles.container,
        }}
      >
        <Carrousel scrollX={scrollX} images={imagenes as any} />
        <View style={styles.innerContainer}>
          {/* Usuario */}
          <Pressable onPress={handleIrAPerfil} style={styles.row}>
            {/* Foto de perfil */}
            <View style={styles.fotoPerfil}>
              <Image
                source={{ uri: fotoPerfil ? fotoPerfil : "" }}
                style={{ flex: 1, borderRadius: 25 }}
              />

              {/* Icono calififcacion */}
              <View
                style={{
                  ...styles.calificacion,
                  width: showVerified ? 30 : 40,
                  top: showVerified ? -5 : -10,
                  right: showVerified ? undefined : -10,
                  left: showVerified ? -5 : undefined,
                }}
              >
                {showVerified ? (
                  <FontAwesome name="check" size={18} color={azulClaro} />
                ) : (
                  <>
                    <Text>
                      {owner?.calificacion === null
                        ? "n/a"
                        : owner?.calificacion}
                    </Text>
                    <FontAwesome
                      name={owner?.calificacion === null ? "star-o" : "star"}
                      size={10}
                      color="black"
                    />
                  </>
                )}
              </View>
            </View>

            <View style={{ justifyContent: "center", flex: 1 }}>
              <Text style={styles.creado}>CREADO POR</Text>
              <Text style={styles.nicknameTxt}>{owner?.nickname}</Text>
            </View>

            {/* Boton de seguir */}
            <Pressable onPress={handleFollow} style={styles.followUser}>
              <Text style={styles.seguirTxt}>
                {following ? "Siguiendo" : "+ Seguir"}
              </Text>
            </Pressable>
          </Pressable>

          <Line
            style={{ marginHorizontal: 0, marginTop: 20, marginBottom: 20 }}
          />

          <View style={{ marginBottom: 20 }}>
            {/* Lista info */}
            <FlatList
              data={comodities}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                return (
                  <View style={styles.comodities}>
                    <Text style={{ color: "#555", fontWeight: "bold" }}>
                      {item}
                    </Text>
                  </View>
                );
              }}
            />
          </View>

          {/* Titulo del evento */}
          <Text style={styles.tituloTxt}>{route.params.titulo}</Text>

          {detalles ? (
            <Descripcion descripcion={detalles} />
          ) : (
            <View style={{ marginTop: 30 }} />
          )}

          {/* Fila de fecha */}
          <View style={styles.row}>
            {/* Icono del calendario */}
            <View style={styles.iconContainer}>
              <Feather name="calendar" size={30} color={rojoClaro} />
            </View>

            {/* Texto */}
            <View style={styles.txtContainer}>
              <Text style={styles.creado}>
                {getWeekDay(new Date(fechaInicial)) +
                  " " +
                  formatDay(fechaInicial)}
              </Text>
              <Text style={styles.nicknameTxt}>
                {formatAMPM(fechaInicial) + " hasta " + formatAMPM(fechaFinal)}
              </Text>
            </View>
          </View>

          {/* Fila de ubicacion */}
          <Pressable
            onPress={handleViewLocation}
            style={{ ...styles.row, marginTop: 30, marginBottom: 60 }}
          >
            {/* Icono del calendario */}
            <View style={styles.iconContainer}>
              <Feather name="map" size={30} color={rojoClaro} />
            </View>

            {/* Texto */}
            <View style={styles.txtContainer}>
              <Text style={styles.creado}>Ver direccion</Text>
              <Text style={styles.nicknameTxt}>
                {ubicacion.ubicacionNombre}
              </Text>
            </View>
          </Pressable>

          {/* Usuarios registrados */}
          <View style={styles.row}>
            <ProgressCircle
              percent={personasPercent}
              radius={40}
              borderWidth={5}
              color={rojoClaro}
              shadowColor={azulFondo}
              bgColor="#fff"
            >
              <Text style={{ fontSize: 16 }} numberOfLines={1}>
                <Text style={{ fontWeight: "500", fontSize: 16 }}>
                  {personasReservadas}
                </Text>
                /{personasMax}
              </Text>
            </ProgressCircle>

            <View style={{ marginRight: 20 }} />

            {/* Fotos de perfil */}
            {(usuariosReservados
              ? usuariosReservados
              : [...Array(6).keys()]
            ).map((e: number | Usuario, i: number) => {
              const left = -20 * i;

              const hayMas = i === 6;

              if (typeof e === "number") {
                return (
                  <View
                    key={i}
                    style={{
                      ...styles.imagenPerfilContainer,
                      left,
                    }}
                  ></View>
                );
              }

              // Si es mayor que 6 devolver null
              if (i > 6) return <View key={i}></View>;

              return (
                <View
                  key={i}
                  style={{
                    ...styles.imagenPerfilContainer,
                    left,
                    backgroundColor: hayMas ? rojoClaro : "transparent",
                  }}
                >
                  {hayMas ? (
                    <View
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "900",
                          fontSize: 12,
                        }}
                      >
                        +{personasReservadas ? personasReservadas - 5 : 0}
                      </Text>
                    </View>
                  ) : e.foto ? (
                    <Image style={{ flex: 1 }} source={{ uri: e.foto }} />
                  ) : (
                    <EmptyProfile size={30} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <Boton
          style={{ margin: 20 }}
          titulo={"Apuntarse"}
          onPress={handleContinar}
        />
      </Animated.ScrollView>

      <ModalMap
        selectedPlace={ubicacion}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        titulo={ubicacion.ubicacionNombre}
      />
      <HeaderDetalleEvento
        paddingTop={top}
        scrollY={scrollY}
        titulo={titulo}
        handleBack={handleBack}
        height={300}
        IconRight={() => (
          <View style={styles.musicContainer}>
            <Text style={{ color: rojo, fontWeight: "bold" }}>
              {musica === MusicEnum.OTRO ? musOtra : musica}
            </Text>
          </View>
        )}
      />

      {modalVisible && (
        <View
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#fff",
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  imagenPerfilContainer: {
    borderRadius: 30,

    width: 40,
    aspectRatio: 1,
    borderWidth: 4,

    borderColor: "#fff",

    overflow: "hidden",
  },

  comodities: {
    backgroundColor: azulFondo,
    padding: 10,
    borderRadius: 10,

    marginRight: 10,
  },

  calificacion: {
    position: "absolute",
    right: -10,
    top: -10,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",

    aspectRatio: 1,
    backgroundColor: "white",
    width: 40,

    ...shadowMedia,
  },

  innerContainer: {
    backgroundColor: "#fff",
    width: "100%",
    top: -30,

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    paddingBottom: 0,
  },

  iconContainer: {
    width: 60,
    height: 60,

    borderRadius: 20,

    backgroundColor: rojoClaro + "30",

    alignItems: "center",
    justifyContent: "center",
  },

  creado: {
    fontWeight: "500",
    fontSize: 18,
  },

  nicknameTxt: {
    fontSize: 16,
    marginTop: 2,
    color: "#0005",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  fotoPerfil: {
    width: 70,
    height: 70,
    marginRight: 30,
  },

  seguirTxt: {
    color: rojo,
  },

  followUser: {
    backgroundColor: rojoClaro + "30",
    padding: 5,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  tituloTxt: {
    fontSize: 18,
    fontWeight: "600",
  },

  musicContainer: {
    marginRight: 10,
    padding: 5,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
  },

  txtContainer: {
    marginLeft: 20,
    paddingLeft: 20,
    borderLeftWidth: 0.5,
  },
});
