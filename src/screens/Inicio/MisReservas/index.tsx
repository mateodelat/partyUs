import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
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

type ReservaType = Reserva & {
  expirado: boolean;
};

export function MisReservas() {
  useEffect(() => {
    onRefresh();
  }, []);

  const [selector, setSelector] = useState<1 | 3 | 2>(1);
  const [reservas, setReservas] = useState<ReservaType[]>();
  const [reservasAMostrar, setReservasAMostrar] = useState<ReservaType[]>();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await queryReservas(true);
    setRefreshing(false);
  }

  const hayPorPagar = !!reservas?.find(
    (e) => e.pagado === false && new Date().toISOString() < e.fechaExpiracionUTC
  );

  async function queryReservas(first?: boolean) {
    const sub = await getUserSub();

    const res = await DataStore.query(Reserva, (e) =>
      e.usuarioID("eq", sub)
    ).then(async (r) => {
      let res = await Promise.all(
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

      res = res.sort((a, b) => {
        if (a.pagado && !b.pagado) return 1;
      });

      setReservas(res);
      setReservasAMostrar(res);
      return res;
    });

    !first && handlePressSelector(selector, res);
  }

  function handlePressSelector(selected: 1 | 2 | 3, res?: ReservaType[]) {
    // Modificar reservas a mostrar

    const now = new Date();
    let filtered = res?.map((e) => {
      return e;
    });

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
    if (selected === 1) filtered = reservas;

    filtered?.sort(
      (a, b) =>
        ((a.expirado && !b.expirado) ||
          a.evento.fechaInicial < b.evento.fechaInicial ||
          a.createdAt < b.createdAt) as any
    );

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

      <ScrollView
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
      >
        {!reservasAMostrar ? (
          <View />
        ) : reservasAMostrar.length === 0 ? (
          <Text style={styles.noHay}>No hay reservas</Text>
        ) : (
          reservasAMostrar.map((e, idx) => {
            return <ElementoReserva data={e} key={idx} />;
          })
        )}
      </ScrollView>
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
