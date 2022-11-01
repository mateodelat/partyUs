import {
  Alert,
  Animated,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
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
  getUserSub,
  precioConComision,
  timer,
  formatMoney,
  azulOscuro,
  AsyncAlert,
  fetchFromAPI,
  shadowBaja,
  shadowMuyBaja,
  formatDateShort,
  mayusFirstLetter,
} from "../../../../constants";
import { API, DataStore, Predicates, Storage } from "aws-amplify";
import { OpType } from "@aws-amplify/datastore";

import Line from "../../../components/Line";
import { MusicEnum, Reserva, Usuario } from "../../../models";
import Descripcion from "./Descripcion";

import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import ModalMap from "../../../components/ModalMap";
import ProgressCircle from "../../../components/ProgressCircle";
import EmptyProfile from "../../../components/EmptyProfile";
import Boton from "../../../components/Boton";
import { Evento } from "../../../models";
import { Boleto } from "../../../models";
import { ReservasBoletos } from "../../../models";
import Loading from "../../../components/Loading";
import useUser from "../../../Hooks/useUser";
import { Notificacion } from "../../../models";
import { TipoNotificacion } from "../../../models";

type ReservaType = Reserva & {
  status?: reservaStatus;
};

type reservaStatus = "INGRESADO" | "PAGADO" | "CANCELADO" | "POR PAGAR";

export default function ({
  route,
  navigation,
}: {
  route: {
    params?: EventoType & {
      usuario?: Usuario;
      reserva?: Reserva & { eventoCancelado: () => void };
      organizador?: boolean;
    };
  };
  navigation: NavigationProp;
}) {
  const reserva = route.params?.reserva;

  const organizador = route.params?.organizador;
  const ingresado = route.params.reserva?.ingreso;

  if (reserva?.cancelado) {
    Alert.alert("Error", "La reserva ya fue cancelada");
    navigation.pop();
  }

  const [evento, setEvento] = useState({
    ...route.params,
    personasReservadas: 0,
  });

  // Variables para animaciones (Carrousel fotos y header transparencia)
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const insets = useSafeAreaInsets();
  const [top, setTop] = useState(insets.top);

  const [modalVisible, setModalVisible] = useState(false);

  const [following, setFollowing] = useState(false);

  let {
    titulo,
    imagenes,
    creator,
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
    ? titulo.length > 13
      ? titulo.slice(0, 13) + "..."
      : titulo
    : "Detalles evento";

  personasReservadas = personasReservadas ? personasReservadas : 0;

  const personasPercent =
    personasReservadas && personasMax
      ? (personasReservadas / personasMax) * 100
      : 1;

  const [fotoPerfil, setFotoPerfil] = useState(creator?.foto);

  const [usuariosReservados, setUsuariosReservados] = useState<
    Usuario[] | undefined
  >();
  const [reservas, setReservas] = useState<ReservaType[]>();

  function handleBack() {
    navigation.pop();
  }

  const [refreshing, setRefreshing] = useState(false);

  let { setLoading, usuario, setNewNotifications } = useUser();
  if (route.params.usuario) {
    usuario = route.params.usuario;
  }

  async function fetchReservas(boletos: Boleto[]) {
    // Pedir todas las reservas validas
    return await DataStore.query(Reserva, (r) =>
      r
        .eventoID("eq", evento.id)
        .cancelado("ne", true)

        // Si esta pagado se ignora la fecha de expiracion
        .or((e) =>
          e
            .fechaExpiracionUTC("gt", new Date().toISOString())
            .pagado("eq", true)
        )
    ).then(async (r: ReservaType[]) => {
      let usuarios = [];
      let personasReservadas = 0;

      const res = await Promise.all(
        r.map(async (e: ReservaType, idx) => {
          let usr: Promise<Usuario> | Usuario;
          let foto: Promise<string> | string;

          personasReservadas += e.cantidad;

          // Por cada reserva, si es de las primeras 5 o se abrio desde detalles evento pedir su foto y usuario asociado
          if (idx < 6 || organizador) {
            usr = await DataStore.query(Usuario, e.usuarioID);
            foto = await getImageUrl(usr.foto);
          }

          usuarios = [
            ...usuarios,
            {
              ...usr,
              foto,
            },
          ];
          return {
            ...e,
            usuario: {
              ...(await usr),
              foto: await foto,
            },
            status: e.ingreso
              ? "INGRESADO"
              : e.cancelado
              ? "CANCELADO"
              : e.pagado
              ? "PAGADO"
              : "POR PAGAR",
          };
        })
      );

      setEvento((prev) => ({
        ...prev,
        personasReservadas,
        boletos,
      }));

      setUsuariosReservados(usuarios);
      setReservas(res as any);
    });
  }

  function onRefresh() {
    setRefreshing(true);

    let boletos: Promise<Boleto[]>;

    DataStore.query(Evento, evento.id)
      .then(async (e) => {
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

        boletos = DataStore.query(Boleto, (bo) => bo.eventoID("eq", e.id), {
          sort: (e) => e.precio("DESCENDING"),
        });

        const creator = DataStore.query(
          Usuario,
          e.CreatorID ? e.CreatorID : ""
        );

        await Promise.all([creator, imagenes, boletos]);

        if (!creator) {
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
          creator: await creator,
        } as EventoType;
      })
      .then(async (r) => {
        setEvento({
          ...r,
          personasReservadas: 0,
        });
        await fetchReservas(await boletos);
        setRefreshing(false);
      });
  }

  useEffect(() => {
    setTop(insets.top);
    onRefresh();

    // Asignar una vigilancia a updates del evento para caso de lleno
    const sub = DataStore.observe(Evento, (fe) => fe.id("eq", id)).subscribe(
      async (msg) => {
        if (msg.opType === OpType.UPDATE || msg.opType === OpType.DELETE) {
          // setEvento(await fetchInfoEvento(msg.element));

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
    getImageUrl(creator?.foto).then(setFotoPerfil);

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

  async function handleCancelar() {
    try {
      await AsyncAlert(
        "Cancelar reserva",
        // Mensaje dependiendo si el usuario tiene dinero en la cuenta
        reserva.pagado === true
          ? "Al cancelar una reserva, se te devolvera el dinero a tu cuenta para que puedas reservar en otro evento. ¿Quieres continuar?"
          : "¿Seguro que quieres cancelar tu reserva?"
      ).then(async (r) => {
        if (!r) return;

        setLoading(true);
        const result = await fetchFromAPI("/cancelReserva", "POST", {
          reservaID: reserva.id,
          organizadorID: reserva.organizadorID,
          clientID: usuario.id,
        });
        setLoading(false);
        console.log(result);

        if (result?.error) {
          throw new Error(result as any);
        }

        Alert.alert("Exito", "Tu reserva se cancelo con exito");
        DataStore.save(
          new Notificacion({
            tipo: TipoNotificacion.RESERVACANCELADA,
            titulo: "Cancelacion exitosa",
            descripcion: reserva.pagado
              ? `Se cancelo tu reserva en ${
                  evento.titulo
                } con exito. Se te agrego ${formatMoney(
                  reserva.total
                )} a tu cuenta para eventos futuros`
              : `Se cancelo tu reserva en ${evento.titulo} con exito.`,

            usuarioID: await getUserSub(),

            showAt: new Date().toISOString(),

            reservaID: reserva.id,
            eventoID: evento.id,
            organizadorID: evento.CreatorID,
          })
        );
        // Cancelar el evento localente
        reserva.eventoCancelado();

        // Una nueva notificacion
        setNewNotifications((prev) => prev++);
        navigation.pop();
      });
    } catch (error) {
      console.log(error);
      error = error?.error ? error.error : error;
      setLoading(false);
      const msg = error.message
        ? error.message
        : error.description
        ? error.description
        : error;

      Alert.alert("Error", "Ocurrio un error cancelando tu reserva: \n" + msg);
    }
  }

  async function handleContinar() {
    // Si ya paso el evento mandar alerta
    if (evento.fechaFinal < new Date().getTime()) {
      Alert.alert("Error", "El evento ya ha pasado");
      return;
    }

    if (refreshing) {
      Alert.alert(
        "Espera",
        "Estamos obteniendo los datos, espera unos instantes"
      );
      return;
    }

    if (!(await getUserSub())) {
      navigation.navigate("LoginStack", {
        onLogin: () => {
          navigation.navigate("Boletos", evento);
        },
      });
    } else {
      navigation.navigate("Boletos", evento);
    }
  }

  function navigateScanner() {
    navigation.navigate("QRScanner", {
      eventoID: evento.id,
      tituloEvento: evento.titulo,
    });
  }

  function navigateTicketEntrada() {
    if (organizador) {
    } else if (reserva.pagado) {
      navigation.navigate("QRCode", {
        ...reserva,
        evento: {
          ...evento,
          imagenes: evento.imagenes.map((e: any) => e.uri),
        },
      });
    } else {
      navigation.navigate("ReferenciaPagoModal", {
        amount: reserva.total,
        titulo,
        codebar: {
          uri: reserva.cashBarcode,
          reference: reserva.cashReference,
        },
        limitDate: new Date(reserva.fechaExpiracionUTC).getTime(),
      });
    }
  }

  useEffect(() => {
    if (reserva?.id) {
      setBoletos("loading");
      DataStore.query(ReservasBoletos, (e) =>
        e.reservaID("eq", reserva.id)
      ).then(async (r) => {
        const res = await Promise.all(
          r.map(async (r) => {
            return {
              ...r,
              boleto: await DataStore.query(Boleto, r.boletoID),
            };
          })
        );
        setBoletos(res as any);
      });
    }
  }, []);

  const [boletos, setBoletos] = useState<
    (ReservasBoletos & { boleto: Boleto })[] | "loading"
  >();

  const showVerified = creator?.verified;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Animated.ScrollView
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
        }
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        style={{
          ...styles.container,
        }}
      >
        <Carrousel top={top} scrollX={scrollX} images={imagenes as any} />
        <View
          style={{
            ...styles.innerContainer,
            padding: 0,
          }}
        >
          {organizador && evento.fechaFinal > new Date().getTime() && (
            <TouchableOpacity
              onPress={navigateScanner}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 30,
                paddingBottom: 10,
              }}
            >
              <Text style={{ flex: 1, fontSize: 20, fontWeight: "bold" }}>
                Escanear reservas
              </Text>

              <MaterialCommunityIcons
                style={styles.qrCode}
                name="qrcode-scan"
                size={30}
                color="black"
              />
            </TouchableOpacity>
          )}
          <View
            style={{
              padding: 30,
              paddingTop: 0,
            }}
          >
            {/* Usuario */}
            {(!organizador || evento.fechaFinal < new Date().getTime()) && (
              <Pressable
                onPress={handleIrAPerfil}
                style={{ ...styles.row, paddingTop: 30 }}
              >
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
                          {creator?.calificacion === null
                            ? "n/a"
                            : creator?.calificacion}
                        </Text>
                        <FontAwesome
                          name={
                            creator?.calificacion === null ? "star-o" : "star"
                          }
                          size={10}
                          color="black"
                        />
                      </>
                    )}
                  </View>
                </View>

                <View style={{ justifyContent: "center", flex: 1 }}>
                  <Text style={styles.creado}>CREADO POR</Text>
                  <Text style={styles.nicknameTxt}>{creator?.nickname}</Text>
                </View>

                {/* Boton de seguir */}
                {reserva && !ingresado && (
                  <TouchableOpacity
                    onPress={navigateTicketEntrada}
                    style={styles.followUser}
                  >
                    <Ionicons
                      style={styles.qrCode}
                      name="md-qr-code"
                      size={16}
                      color="#0009"
                    />
                  </TouchableOpacity>
                )}
              </Pressable>
            )}

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
                  {getWeekDay(
                    new Date(fechaInicial ? fechaInicial : new Date())
                  ) +
                    " " +
                    formatDay(fechaInicial)}
                </Text>
                <Text style={styles.nicknameTxt}>
                  {formatAMPM(fechaInicial) +
                    " hasta " +
                    formatAMPM(fechaFinal)}
                </Text>
              </View>
            </View>

            {/* Fila de ubicacion */}
            <Pressable
              onPress={handleViewLocation}
              style={{ ...styles.row, marginTop: 30, marginBottom: 30 }}
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

            {/* Boletos en caso de venir de detalle de reserva */}
            {reserva ? (
              <TouchableOpacity
                disabled={ingresado}
                onPress={navigateTicketEntrada}
              >
                <Line style={{ marginTop: 10 }} />
                <Text style={styles.tipoPago}>{reserva.tipoPago}</Text>
                {boletos === "loading" ? (
                  <Loading indicator style={{ marginTop: 30 }} />
                ) : (
                  boletos?.map((e, idx) => {
                    return (
                      <View style={styles.boletoContainer} key={idx}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.subtitle}>Precio total</Text>
                          <Text style={{ ...styles.value, color: rojoClaro }}>
                            {formatMoney(
                              precioConComision(e.boleto.precio) * e.quantity
                            )}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.subtitle}>{e.boleto.titulo}</Text>
                          <View
                            style={{
                              justifyContent: "flex-end",
                              alignItems: "center",
                              marginRight: 0,
                              flexDirection: "row",
                            }}
                          >
                            <Text style={styles.value}>{e.quantity}</Text>
                            <Ionicons
                              style={{
                                marginLeft: 5,
                              }}
                              name="person"
                              size={20}
                              color="black"
                            />
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </TouchableOpacity>
            ) : (
              //  Usuarios reservados

              <View style={{ ...styles.row, marginTop: 30 }}>
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
                            +{usuariosReservados.length - 5}
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
            )}

            {/* Si es el organizador, enseñarle todas las reservas */}
            {organizador && (
              <View style={{ marginTop: 60 }}>
                <Text style={{ ...styles.tituloTxt, marginBottom: 20 }}>
                  Reservas
                </Text>
                {!organizador ? null : reservas === undefined ? (
                  <Loading indicator />
                ) : !reservas.length ? (
                  <Text>No hay reservas</Text>
                ) : (
                  reservas.map((res, idx) => {
                    return (
                      <View key={idx} style={styles.reservaContainer}>
                        {/* Foto de perfil del usuario */}
                        <Image
                          source={{ uri: res.usuario.foto }}
                          style={styles.imagenPerfilReserva}
                        />

                        {/* Detalles del evento */}
                        <View style={{ flex: 1 }}>
                          {/* Nickname */}
                          <Text style={{ fontWeight: "bold" }}>
                            @{res.usuario.nickname}
                          </Text>

                          {/* Fecha de ultima actualizacion de la reserva */}
                          <Text style={{ ...styles.lightTxt }}>
                            {formatDateShort(res.updatedAt) +
                              " a las " +
                              formatAMPM(res.updatedAt)}
                          </Text>
                          <Text style={styles.statusReserva}>{res.status}</Text>
                        </View>

                        {/* Precio y personas */}
                        <View
                          style={{
                            paddingVertical: 5,
                          }}
                        >
                          <Text style={{ fontWeight: "bold", flex: 1 }}>
                            {formatMoney(res.pagadoAlOrganizador)}
                          </Text>
                          <Text
                            style={{
                              textAlign: "right",
                            }}
                          >
                            <Ionicons
                              style={{ marginRight: 5 }}
                              name="person"
                              size={14}
                              color="black"
                            />
                            {" x" + res.cantidad}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}
          </View>
        </View>

        {!reserva && !organizador && (
          <Boton
            style={{ margin: 20, marginTop: 0 }}
            titulo={"Apuntarse"}
            onPress={handleContinar}
          />
        )}
        <View
          style={{
            height: insets.bottom,
          }}
        />
      </Animated.ScrollView>
      {reserva && (
        <TouchableOpacity
          disabled={ingresado}
          onPress={handleCancelar}
          style={{ alignItems: "center", padding: 20 }}
        >
          <Text style={{ fontSize: 18, color: rojoClaro, fontWeight: "900" }}>
            {ingresado ? "Ya ingresado" : "Cancelar"}
          </Text>
        </TouchableOpacity>
      )}
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

  imagenPerfilReserva: {
    width: 40,
    height: 40,

    borderRadius: 30,
    marginRight: 10,
  },

  statusReserva: {
    color: rojoClaro + "99",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 3,
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

  tipoPago: {
    fontSize: 16,
    fontWeight: "bold",
    position: "absolute",
    zIndex: 1,
    alignSelf: "center",

    top: -1,
    backgroundColor: "#fff",
    paddingHorizontal: 10,

    color: rojoClaro,
  },

  reservaContainer: {
    padding: 10,
    backgroundColor: "#fff",
    ...shadowMuyBaja,

    flexDirection: "row",

    alignItems: "center",
    marginBottom: 10,
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

  lightTxt: {
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

  qrCode: {
    color: rojo,
  },

  followUser: {
    backgroundColor: rojoClaro + "30",
    padding: 5,
    paddingHorizontal: 12,
    borderRadius: 10,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
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

  boletoContainer: {
    flexDirection: "row",
    marginTop: 20,
    paddingHorizontal: 20,
  },

  value: {
    fontSize: 16,
    fontWeight: "bold",
  },

  subtitle: {
    color: azulOscuro + "80",
    marginBottom: 3,
  },
});
