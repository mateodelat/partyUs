import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  Image,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { DataStore } from "aws-amplify";
import { Evento, Reserva, Usuario } from "../../../../models";
import { logger } from "react-native-logs";
import {
  azulClaro,
  formatMoney,
  getImageUrl,
  rojoClaro,
  shadowBaja,
} from "../../../../../constants";
import ElementoEvento from "../../../../components/ElementoEvento";
import ElementoEventoOrg from "./ElementoEventoOrg";
import Line from "../../../../components/Line";
import Header from "../../../../navigation/components/Header";

import { Feather } from "@expo/vector-icons";
import Boton from "../../../../components/Boton";
import { useSafeAreaInsets } from "react-native-safe-area-context";

var log = logger.createLogger();

export default function ({ navigation }) {
  const [data, setData] = useState<Usuario[]>();
  const [refreshing, setRefreshing] = useState(true);

  const [userOpened, setUserOpened] = useState<number>();

  const [selecting, setSelecting] = useState(false);
  const [reservasSeleccionadas, setReservasSeleccionadas] = useState<Reserva[]>(
    []
  );

  useEffect(() => {
    fetchReservas();
  }, []);

  async function fetchReservas() {
    try {
      await DataStore.query(Reserva, (re) =>
        re
          .or((e) =>
            // Primero pedir todas las reservas en la app pendientes o ya pagadas
            e
              .pagado("eq", true)
              .fechaExpiracionUTC("gt", new Date().toISOString())
          )

          // Que no hayan sido ya pagadas
          .or((e) =>
            e
              .transaccionAOrganizadorID("eq", null)

              // O no esta pagada o esta cancelado y pagado por cliente y por empresa
              .and((r) =>
                r
                  .cancelado("eq", true)
                  .pagado("eq", true)
                  .transaccionAOrganizadorID("ne", null)
              )
          )
      ).then(async (r) => {
        setRefreshing(false);
        let eventosSet = new Set<string>();
        let usuariosSet = new Set<string>();

        r.map((e) => {
          eventosSet.add(e.eventoID);
          usuariosSet.add(e.organizadorID);
        });

        let eventos = Promise.all(
          [...eventosSet].map(async (e) => {
            // Asociar todas las reservas a el evento
            const eve = await DataStore.query(Evento, e);

            // Filtrar por las reservas validas
            const Reservas = r
              .filter((res) => res.eventoID === e)
              .sort((a, b) => (b.createdAt <= a.createdAt) as any);

            let imagenes = [...eve.imagenes];
            imagenes[eve.imagenPrincipalIDX] = await getImageUrl(
              imagenes[eve.imagenPrincipalIDX]
            );

            return {
              ...eve,

              // Hacer la imagen del index en url correcta para imagen de fondo
              imagenes,
              Reservas,
            };
          })
        );

        // Pedir a los usuarios y ordenarle sus eventos respectivos
        let usuarios = await Promise.all(
          [...usuariosSet].map(async (e) => {
            // Pedir el usuario para el elemento actual
            const usr = await DataStore.query(Usuario, e);

            // Filtrar eventos en el usuario y obtener foto de perfil del usuario
            const foto = await getImageUrl(usr.foto);

            return {
              ...usr,
              foto,
              Eventos: (await eventos)
                .filter((e) => e.CreatorID == usr.id)
                .sort((a, b) => b.fechaInicial - a.fechaInicial),
            };
          })
        );

        setData(usuarios);
      });
    } catch (error) {
      Alert.alert(
        "Error",
        "Ocurrio un error obteniendo reservas: " + error.message
      );
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchReservas();
    setRefreshing(false);
  }

  function handlePressUser(index: number) {
    setUserOpened(userOpened === index ? undefined : index);
    setReservasSeleccionadas([]);
  }

  function handleContinuar() {
    // Si son de distintos usuarios marcar error

    const usuarioSet = new Set(
      reservasSeleccionadas.map((e) => e.organizadorID)
    );
    if (usuarioSet.size !== 1) {
      Alert.alert(
        "Error",
        "Solo se permite realizar el pago de un usuario a la vez"
      );
      return;
    }

    const reservasSet = new Set(reservasSeleccionadas.map((e) => e.id));
    if (usuarioSet.size !== 1) {
      Alert.alert(
        "Error",
        "Solo se permite realizar el pago de un usuario a la vez"
      );
      return;
    }

    const usuarioIDX = data.findIndex((e) => e.id === [...usuarioSet][0]);

    if (usuarioIDX < 0) {
      Alert.alert("Error", "El usuario dueño no se encontro, index (-1)");
      return;
    }

    let usuario = { ...data[usuarioIDX] };

    setData((prev) => {
      const Eventos = prev[usuarioIDX].Eventos.map((eve) => {
        return {
          ...eve,

          Reservas: eve.Reservas.filter((res) => {
            return !reservasSet.has(res.id);
          }),
        };
      });

      let ne = [...prev] as any;

      ne[usuarioIDX].Eventos = Eventos;

      return ne;
    });

    navigation.navigate("EnvioDinero", {
      reservas: [...reservasSeleccionadas],
      usuario,
    });
    setReservasSeleccionadas([]);
  }

  const { bottom } = useSafeAreaInsets();

  return (
    <View style={{ ...styles.container, paddingBottom: bottom }}>
      <Header
        title="Por pagar"
        RightIcon={() =>
          !selecting && (
            <Text
              onPress={() => setSelecting(true)}
              style={{
                position: "absolute",
                backgroundColor: "#fff",
                bottom: 2,
                padding: 5,
                right: 0,

                fontSize: 16,
                fontWeight: "bold",
                color: azulClaro,
              }}
            >
              Seleccionar
            </Text>
          )
        }
        LeftIcon={
          selecting
            ? () => (
                <Feather
                  onPress={() => {
                    setSelecting(false);
                    setReservasSeleccionadas([]);
                  }}
                  style={{
                    padding: 10,
                    position: "absolute",
                    left: 0,
                    bottom: -10,
                    zIndex: 1,
                  }}
                  name={"x"}
                  size={30}
                  color={"#000"}
                />
              )
            : undefined
        }
      />
      <FlatList
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
        }
        data={data}
        renderItem={({ item: usuario, index }) => {
          // Calcular la deuda total al organizador
          const porPagarle = usuario.Eventos?.reduce((partialSum, a) => {
            const deudaEvento = a.Reservas?.reduce((partialSum, a) => {
              if (!a.cancelado) {
                return partialSum + a.pagadoAlOrganizador;
              }

              // Si la reserva aparece como cancelada y ya fue pagada por nosotros
              if (!!a.transaccionAOrganizador) {
                Alert.alert(
                  "Atencion",
                  "Una reserva que ya enviamos el dinero al organizador fue cancelada"
                );
                return partialSum - a.pagadoAlOrganizador;
              }
              return partialSum;
            }, 0);

            return deudaEvento + partialSum;
          }, 0);

          const porPagarSeleccionado = reservasSeleccionadas.reduce(
            (partialSum, a) => {
              if (!a.cancelado) {
                return partialSum + a.pagadoAlOrganizador;
              }

              // Si la reserva aparece como cancelada y ya fue pagada por nosotros
              if (!!a.transaccionAOrganizador) {
                Alert.alert(
                  "Atencion",
                  "Una reserva que ya enviamos el dinero al organizador fue cancelada"
                );
                return partialSum - a.pagadoAlOrganizador;
              }
              return partialSum;
            },
            0
          );

          return (
            <Pressable
              onPress={() => {
                handlePressUser(index);
                setReservasSeleccionadas([]);
              }}
              style={styles.userContainer}
            >
              <View style={{ flexDirection: "row" }}>
                <View style={styles.userProfile}>
                  <ActivityIndicator
                    style={{ position: "absolute" }}
                    size={"small"}
                    color={"black"}
                  />

                  <Image
                    source={{ uri: usuario.foto }}
                    style={{ width: "100%", height: "100%", borderRadius: 50 }}
                  />
                </View>

                {/* Texto del usuario */}
                <View
                  style={{
                    justifyContent: "center",
                    flex: 1,
                    paddingRight: 10,
                  }}
                >
                  <Text style={styles.nombre}>
                    {usuario.nombre +
                      " " +
                      usuario.paterno +
                      " " +
                      usuario.materno}
                  </Text>
                  <Text style={styles.nickname}>
                    @{usuario.nickname?.toLowerCase()}
                  </Text>
                </View>

                {/* Informacion del usuario */}
                <Text
                  style={{
                    ...styles.monneyDueTxt,

                    minWidth: 70,
                    textAlign: "center",

                    backgroundColor: selecting ? rojoClaro : "#fff",
                    color: selecting ? "#fff" : "#000",
                  }}
                >
                  {formatMoney(selecting ? porPagarSeleccionado : porPagarle)}
                </Text>
              </View>

              {/* Eventos del usuario por pagarle */}
              {userOpened === index && (
                <View style={{ marginTop: 10 }}>
                  <Line style={{ marginBottom: 20 }} />

                  {usuario.Eventos?.map((evento, eveIDX) => {
                    return (
                      <ElementoEventoOrg
                        evento={evento}
                        key={evento.id}
                        setReservasSeleccionadas={setReservasSeleccionadas}
                        reservasSeleccionadas={reservasSeleccionadas}
                        selecting={selecting}
                        setSelecting={setSelecting}
                      />
                    );
                  })}
                </View>
              )}
            </Pressable>
          );
        }}
      />

      {/* Footer con detalle del pago y boton de continuar */}
      {!!reservasSeleccionadas.length && (
        <View style={{ backgroundColor: "#fff", padding: 20 }}>
          <Boton onPress={handleContinuar} titulo="Enviar dinero" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  nombre: {
    // fontSize: 16,
    fontWeight: "bold",
  },

  nickname: {
    color: "gray",
  },

  monneyDueTxt: {
    alignSelf: "center",
    padding: 5,
    paddingHorizontal: 10,
    fontWeight: "bold",

    borderRadius: 5,
  },

  userProfile: {
    width: 50,
    aspectRatio: 1,

    borderRadius: 50,

    borderWidth: 1,
    marginRight: 15,

    alignItems: "center",
    justifyContent: "center",
  },

  userContainer: {
    padding: 15,

    backgroundColor: "#fff",
    margin: 20,
    marginVertical: 7,
    ...shadowBaja,
  },
});
