import {
  Pressable,
  RefreshControl,
  ScrollView,
  Alert,
  StyleSheet,
  Text,
  View,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";

import { Reserva } from "../../../models";
import {
  azulClaro,
  azulFondo,
  getImageUrl,
  timer,
} from "../../../../constants";

import { DataStore } from "aws-amplify";
import { Evento } from "../../../models";
import { Usuario } from "../../../models";
import ElementoReserva from "./ElementoReserva";
import { listReservas } from "../../../graphql/queries";
import Loading from "../../../components/Loading";
import useUser from "../../../Hooks/useUser";

type ReservaType = Reserva & {
  expirado: boolean;
};

export function MisReservas({ navigation, route }) {
  // Si se pasa un id de reserva entonces manejarlo para pedir inicialmente solo esa reserva
  const paramsReservaID = route.params?.reservaID;
  const paramsEventoID = route.params?.eventoID;
  const efectivoCompletado = route.params?.efectivoCompletado;
  const { setBottomMessage } = useUser();
  let usuario = useUser().usuario;

  if (route.params?.usuario) {
    usuario = route.params.usuario;
  }

  useEffect(() => {
    setRefreshing(true);
    queryReservas(true, true).then(() => setRefreshing(false));

    return () => {
      setBottomMessage(undefined);
    };
    // onNextPage();
  }, []);

  const [selector, setSelector] = useState<1 | 3 | 2>(1);
  const [reservas, setReservas] = useState<ReservaType[]>([]);
  const [reservasAMostrar, setReservasAMostrar] = useState<ReservaType[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(0);

  // Integracion para pagination
  const [limitReached, setLimitReached] = useState(true);

  async function onRefresh() {
    setRefreshing(true);
    await queryReservas(true);
    setRefreshing(false);
  }

  async function onNextPage() {
    await queryReservas();
  }

  const hayPorPagar = !!reservas?.find(
    (e) => e.pagado === false && new Date().toISOString() < e.fechaExpiracionUTC
  );

  async function queryReservas(refresh?: boolean, firstRender?: boolean) {
    const sub = usuario.id;

    // Si se esta refrescando, actualizar toodas las rervas ya tenidas
    let res = await DataStore.query(
      Reserva,
      (e) => {
        if (firstRender && paramsReservaID) {
          return e.id("eq", paramsReservaID);
        }

        return e.usuarioID("eq", sub);
      },
      {
        // page: refresh ? 1 : page + 1,
        // limit: refresh ? reservas.length : 5,
        sort: (e) => e.createdAt("DESCENDING"),
      }
    ).then(async (r) => {
      if (firstRender && paramsReservaID) {
        // Si es el primer render y no devuelve reserva dar error
        if (!r.length) {
          Alert.alert("Error", "No existe la reserva");
          // Si la reserva aparece como pagada en seccion de pagos y el estado no se actualiza informar
        } else if (efectivoCompletado && !r[0].cancelado && !r[0].pagado) {
          Alert.alert(
            "Atencion",
            "Tu pago se recibio correctamente pero puede tardar unos minutos en actualizar tu boleto"
          );
        }
      }

      // Si hay reservas en r seguir aumentando
      if (r.length && !refresh) {
        setPage(page + 1);
      }

      // Si ya no hay reservas, poner el limit reached en true
      if (!r.length) {
        setLimitReached(true);
      }

      // Si tenemos eventoID, filtrar las reservas que coincidan con el evento
      if (paramsEventoID && firstRender) {
        r = r.filter((e) => e.eventoID === paramsEventoID);
        console.log("Filtrado");
      }

      let res = await Promise.all(
        r.map(async (e) => {
          let r = { ...e };
          const evento = await DataStore.query(Evento, e.eventoID);
          const expirado = e.pagado
            ? false
            : e.tipoPago === "EFECTIVO" &&
              !e.cancelado &&
              new Date().toISOString() > e.fechaExpiracionUTC;

          return {
            ...r,
            expirado,
            evento: {
              ...evento,

              imagenPrincipal: await getImageUrl(
                evento.imagenes[evento.imagenPrincipalIDX]
              ),
              creator: await DataStore.query(Usuario, evento.CreatorID),
            },
          };
        })
      );

      // Ordenar reservas de la siguiente manera:
      // 1) Primero por expiradas al final
      // 2) Despues por canceladas
      // 3) Luego por fecha del evento
      // 4) Si hay varias en un evento por fecha creadas

      res = res.sort((a, b) => {
        // Si expiro, mandarla al final
        if (a.expirado && !b.expirado) {
          return 1;
        }
        if (a.cancelado && !b.expirado) {
          return 1;
        }
        if (a.evento.fechaInicial > b.evento.fechaInicial) {
          return -1;
        }
        if (a.createdAt > b.createdAt) {
          return -1;
        }
      });

      // Si no se esta actualizando es porque fue una pagination
      if (!refresh) {
        setReservas((prev) => [...prev, ...res]);
        setReservasAMostrar((prev) => [...prev, ...res]);
      } else {
        setReservas([...res]);
        setReservasAMostrar([...res]);
      }
      return res;
    });

    handlePressSelector(selector, res);
  }

  function onPress(data: any) {
    navigation.navigate("DetalleEvento", {
      ...data.evento,
      reserva: {
        ...data,
        usuario: route.params?.usuario ? usuario : undefined,
        evento: null,
        eventoCancelado: () => setLocalCancelado(data.id),
      },
    });
  }
  function setLocalCancelado(id: string) {
    setReservas((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      console.log(idx);

      (prev[idx] as any).cancelado = true;
      (prev[idx] as any).cashBarcode = undefined;
      (prev[idx] as any).cashReference = undefined;
      (prev[idx] as any).fechaExpiracionUTC = undefined;
      (prev[idx] as any).cancelReason = "CANCELADOPORCLIENTE";
      (prev[idx] as any).canceledAt = new Date().toISOString();

      return [...prev];
    });
  }

  function handlePressSelector(selected: 1 | 2 | 3, res?: ReservaType[]) {
    // Modificar reservas a mostrar
    res = res ? res : reservas;

    const now = new Date();
    let filtered = [...res];

    if (hayPorPagar) {
      switch (selected) {
        case 2:
          filtered = reservas.filter(
            (res) =>
              res.pagado && !res.cancelado && !res.ingreso && !res.expirado
          ) as any;

          break;

        case 3:
          filtered = reservas.filter(
            (res) => !res.pagado && !res.cancelado && !res.ingreso
          ) as any;

          break;
      }
    } else {
      switch (selected) {
        case 2:
          filtered = reservas.filter((res) => {
            const date = new Date(res.evento.fechaFinal);

            return date > now && !res.expirado && !res.cancelado;
          }) as any;

          break;

        case 3:
          filtered = reservas.filter((res) => {
            const date = new Date(res.evento.fechaFinal);
            return date < now || res.expirado || res.cancelado;
          }) as any;

          break;
      }
    }
    if (selected === 1) filtered = reservas.length ? reservas : res;

    setReservasAMostrar(filtered);
    setSelector(selected);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.selector}>
        <Pressable
          onPress={() => handlePressSelector(1)}
          style={{
            ...styles.selectorPressable,
            backgroundColor: selector === 1 ? azulClaro : "transparent",
          }}
        >
          <Text
            style={{
              color: selector === 1 ? "#fff" : "#000",
            }}
          >
            Todas
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handlePressSelector(2)}
          style={{
            ...styles.selectorPressable,
            backgroundColor: selector === 2 ? azulClaro : "transparent",
          }}
        >
          <Text
            style={{
              color: selector === 2 ? "#fff" : "#000",
            }}
          >
            {!hayPorPagar ? "Proximas" : "Pagadas"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handlePressSelector(3)}
          style={{
            ...styles.selectorPressable,
            backgroundColor: selector === 3 ? azulClaro : "transparent",
          }}
        >
          <Text
            style={{
              color: selector === 3 ? "#fff" : "#000",
            }}
          >
            {!hayPorPagar ? "Pasadas" : "Por pagar"}
          </Text>
        </Pressable>
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        style={{
          padding: 20,
          paddingTop: 0,
        }}
        refreshControl={
          <RefreshControl
            onRefresh={onRefresh}
            refreshing={refreshing || reservas === undefined}
          />
        }
        data={reservasAMostrar}
        ListEmptyComponent={
          !refreshing && <Text style={styles.noHay}>No hay reservas</Text>
        }
        // onEndReached={() => onNextPage()}
        onEndReachedThreshold={0.2}
        ListFooterComponent={() =>
          limitReached ? (
            <View />
          ) : (
            <Loading indicator style={{ paddingBottom: 20 }} />
          )
        }
        renderItem={({ item }) => {
          return <ElementoReserva data={item} onPress={onPress} />;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  selector: {
    padding: 5,
    borderRadius: 10,
    backgroundColor: azulFondo,
    flexDirection: "row",
    margin: 20,
    marginTop: 10,
  },

  selectorPressable: {
    padding: 10,
    borderRadius: 10,

    flex: 1,
    alignItems: "center",
  },

  noHay: {
    fontWeight: "bold",
    marginLeft: 20,
  },
});
