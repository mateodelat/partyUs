import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { DataStore } from "aws-amplify";
import { Boleto, ComoditiesEnum, Evento, Usuario } from "../../../models";
import useUser from "../../../Hooks/useUser";
import { getImageUrl } from "../../../../constants";
import ElementoMiEvento from "./ElementoMiEvento";
import { locationType } from "../../../components/ModalMap";
import { Reserva } from "../../../models";
import { ReservasBoletos } from "../../../models";

export type EventoType = Evento & {
  boletos: Boleto[];
  imagenes: {
    uri: string;
    key: string;
  }[];

  creator?: Usuario;
  commodities?: ComoditiesEnum[];
  ubicacion: locationType;

  status: eventStatus;
  recibido: number;
};

type eventStatus = "LLENO" | "PASADO" | "EN CURSO" | "ABIERTO";

export default function ({ route, navigation }: any) {
  const reservaID = route.params?.reservaID;
  const eventoID = route.params?.eventoID;

  const { usuario } = useUser();

  const [eventos, setEventos] = useState<EventoType[]>();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function handlePress(evento: EventoType) {
    navigation.navigate("DetalleEvento", { ...evento, organizador: true });
  }

  // Obtener los eventos del usuario
  async function fetchEvents(refreshing?: boolean) {
    let eventoANavegar: string = eventoID;

    // Fetch eventos
    const eve = await DataStore.query(
      Evento,
      (e) => e.CreatorID("eq", usuario.id),

      // Ordenar por fechas iniciales
      {
        sort: (e) => e.fechaInicial("DESCENDING"),
      }
    ).then(async (eve) => {
      return await Promise.all(
        eve.map(async (e) => {
          // Una vez tenemos el evento, pedir las imagenes de S3 en asyncrono
          const imagenes = Promise.all(
            e.imagenes.map(async (img) => ({
              uri: await getImageUrl(img),
              key: img,
            }))
          ) as any;

          // Pedir los boletos de forma asincrona
          const boletos = DataStore.query(Boleto, (bol) =>
            bol.eventoID("eq", e.id)
          );
          let recibido = 0;
          let personasReservadas = 0;

          // Pedir las personas reservadas de forma asincrona
          const Reservas = DataStore.query(Reserva, (res) =>
            res
              // Pedir reservas validas
              .eventoID("eq", e.id)
              .cancelado("ne", true)

              // Si esta pagado se ignora la fecha de expiracion
              .or((e) =>
                e
                  .fechaExpiracionUTC("gt", new Date().toISOString())
                  .pagado("eq", true)
              )
          ).then(async (r) => {
            const res = await Promise.all(
              r.map(async (re) => {
                let cantidad = 0;
                // Si la reserva ya fue pagada entonces agregar a dinero recibido
                if (re.pagado) {
                  recibido += re.pagadoAlOrganizador;
                }

                // Pedir las reservas boletos asociadas y mapear la cantidad reservada por cada una
                (
                  await DataStore.query(ReservasBoletos, (rel) =>
                    rel.reservaID("eq", re.id)
                  )
                ).map((e) => {
                  cantidad += e.quantity;
                  personasReservadas += e.quantity;
                });

                if (re.id === reservaID) {
                  eventoANavegar = e.id;
                }

                return re;
              })
            );
            return res;
          });

          // Detectar el estatus del evento
          const status: eventStatus =
            e.personasReservadas >= e.personasMax
              ? "LLENO"
              : e.fechaInicial > new Date().getTime() &&
                e.fechaFinal < new Date().getTime()
              ? "EN CURSO"
              : e.fechaFinal < new Date().getTime()
              ? "PASADO"
              : "ABIERTO";

          return {
            ...e,
            Reservas: await Reservas,
            imagenes: await imagenes,
            boletos: await boletos,
            creator: usuario,
            ubicacion: e.ubicacion as any,
            personasReservadas,
            recibido: recibido,
            status,
          };
        })
      );
    });

    if (!refreshing) {
      // Si hay evento a navegar, hay una reserva que coincide con el evento navegar a la misma
      if (eventoANavegar) {
        const e = eve.find((e) => e.id === eventoANavegar);
        navigation.navigate("DetalleEvento", { ...e, organizador: true });
      }
    }

    setEventos(eve);
  }

  function handleScan(evento: EventoType) {
    navigation.navigate("QRScanner", {
      eventoID: evento.id,
      tituloEvento: evento.titulo,
    });
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchEvents(true);
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <FlatList
        ListEmptyComponent={
          eventos !== undefined && (
            <Text style={styles.noHay}>No hay eventos</Text>
          )
        }
        refreshControl={
          <RefreshControl
            onRefresh={onRefresh}
            refreshing={refreshing || eventos === undefined}
          />
        }
        data={eventos}
        renderItem={({ item }) => {
          return (
            <ElementoMiEvento
              data={item}
              onPress={() => handlePress(item)}
              handleScan={handleScan}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  noHay: {
    fontWeight: "bold",
    margin: 20,
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
