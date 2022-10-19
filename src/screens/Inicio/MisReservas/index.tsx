import {
  Pressable,
  RefreshControl,
  ScrollView,
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
  getUserSub,
} from "../../../../constants";

import { DataStore } from "aws-amplify";
import { Evento } from "../../../models";
import { Usuario } from "../../../models";
import ElementoReserva from "./ElementoReserva";
import { listReservas } from "../../../graphql/queries";
import Loading from "../../../components/Loading";

type ReservaType = Reserva & {
  expirado: boolean;
};

export function MisReservas({ navigation }) {
  useEffect(() => {
    onRefresh();
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

  async function queryReservas(refresh?: boolean) {
    const sub = await getUserSub();

    // Si se esta refrescando, actualizar toodas las rervas ya tenidas
    const res = await DataStore.query(Reserva, (e) => e.usuarioID("eq", sub), {
      // page: refresh ? 1 : page + 1,
      // limit: refresh ? reservas.length : 5,
      sort: (e) => e.createdAt("DESCENDING"),
    }).then(async (r) => {
      // Si hay reservas en r seguir aumentando
      if (r.length && !refresh) {
        setPage(page + 1);
      }

      // Si ya no hay reservas, poner el limit reached en true
      if (!r.length) {
        setLimitReached(true);
      }

      const res = await Promise.all(
        r
          .filter((e: any) => !e._deleted)
          .map(async (e) => {
            const evento = await DataStore.query(Evento, e.eventoID);
            const expirado = e.pagado
              ? false
              : new Date().toISOString() > e.fechaExpiracionUTC;

            return {
              ...e,
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
          filtered = reservas.filter((res) => res.pagado) as any;

          break;

        case 3:
          filtered = reservas.filter((res) => !res.pagado) as any;

          break;
      }
    } else {
      switch (selected) {
        case 2:
          filtered = reservas.filter((res) => {
            const date = new Date(res.evento.fechaFinal);

            return date > now;
          }) as any;

          break;

        case 3:
          filtered = reservas.filter((res) => {
            const date = new Date(res.evento.fechaFinal);
            return date < now;
          }) as any;

          break;
      }
    }
    if (selected === 1) filtered = reservas.length ? reservas : res;

    // filtered?.sort(
    //   (a, b) =>
    //     ((a.expirado && !b.expirado) ||
    //       a.evento.fechaInicial < b.evento.fechaInicial ||
    //       a.createdAt < b.createdAt) as any
    // );

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
