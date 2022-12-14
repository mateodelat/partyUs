import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
  formatAMPM,
  formatDateShort,
  rojoClaro,
} from "../../../../../constants";

import { Evento, Reserva, Usuario } from "../../../../models";
import ReservaItem from "../../../Inicio/DetalleEvento/ReservaItem";
import { logger } from "react-native-logs";

const log = logger.createLogger();

export default function ({
  evento,

  reservasSeleccionadas,
  setReservasSeleccionadas,

  selecting,
  setSelecting,
}: {
  evento: Evento;

  reservasSeleccionadas: Reserva[];
  setReservasSeleccionadas: Dispatch<SetStateAction<Reserva[]>>;

  selecting: boolean;
  setSelecting: Dispatch<SetStateAction<boolean>>;
}) {
  const imagenPrincipal = evento.imagenes[
    evento.imagenPrincipalIDX ? evento.imagenPrincipalIDX : 0
  ] as any;

  const [showDetails, setShowDetails] = useState(false);

  function onPressEvento() {
    // Si presiona mientras estamos seleccionando
    if (selecting) {
      // Si ya estan todos seleccionados, quitarlos y cerrarlo
      if (
        reservasSeleccionadas.filter((e) => e.eventoID === evento.id).length ===
        evento.Reservas.length
      ) {
        setReservasSeleccionadas((prev) => {
          const next = [...prev.filter((e) => e.eventoID !== evento.id)];
          // Si era el ultimo evento que se selecciono, quitar modo selecting
          if (!next.length) {
            setSelecting(false);
          }

          return next;
        });

        setShowDetails(false);
      } else {
        // De lo contrario, abrirlo y seleccionar todos
        setReservasSeleccionadas((prev) => {
          let next = [...prev];

          const reservasAgregar = [...evento.Reservas];
          next = [...new Set([...prev, ...reservasAgregar])];

          return next;
        });

        setShowDetails(true);
      }
    } else {
      setShowDetails(!showDetails);
    }
  }

  function handleLongPressEvento() {
    setSelecting(true);
    setShowDetails(true);

    // Si no hay nada seleccionado, hacerlo a todas las reservas del mismo
    if (!reservasSeleccionadas.length) {
      setReservasSeleccionadas((prev) => {
        const next = [
          ...evento.Reservas.filter((e) => e.eventoID === evento.id),
        ];

        return next;
      });
    }
  }

  return (
    <Pressable
      onPress={onPressEvento}
      style={styles.container}
      onLongPress={handleLongPressEvento}
    >
      <View style={{ flexDirection: "row", flex: 1 }}>
        {/* Imagen principal */}
        <Image
          style={styles.image}
          source={{
            uri: imagenPrincipal
              ? imagenPrincipal
              : "https://static3.mujerhoy.com/www/multimedia/202203/17/media/cortadas/apertura-party-kjgF-U1601347275536ie-624x624@MujerHoy.jpeg",
          }}
        />

        {/* Textos de titulo y creador */}
        <View style={styles.textContainer}>
          <Text style={styles.titulo}>
            {evento.titulo ? evento.titulo : "Evento"}
          </Text>
          <Text style={styles.statusTxt}>
            {formatDateShort(evento.fechaInicial) +
              " a las " +
              formatAMPM(evento.fechaInicial)}
          </Text>
        </View>
      </View>

      {showDetails && (
        <View style={styles.reservasContainer}>
          {evento.Reservas.map((res, resIDX) => {
            function onPressReserva() {
              setReservasSeleccionadas((prev) => {
                let ne = [...prev];

                const existsIDX = prev.findIndex((e) => e.id === res.id);

                //  Si no existe agregarla
                if (existsIDX < 0) {
                  ne.push(res);
                } else {
                  ne.splice(existsIDX, 1);
                }

                // Si es la ultima reserva seleccionada en el evento, cerrarlo
                if (!ne.find((e) => e.eventoID === evento.id)) {
                  setShowDetails(false);
                }

                // Si es la ultima reserva seleccionada, cerrar todo
                if (!ne.length) {
                  setSelecting(false);
                }

                return ne;
              });
            }

            return (
              // Seleccionar tras longpress
              <View
                key={res.id}
                style={{
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                {/* Bolita de seleccion */}

                <ReservaItem
                  style={{ paddingLeft: selecting ? 40 : 10, marginBottom: 0 }}
                  reserva={res}
                  onLongPress={() => {
                    setSelecting(true);
                    setReservasSeleccionadas([res]);
                  }}
                  onPress={selecting ? onPressReserva : undefined}
                />

                {selecting && (
                  <View
                    style={{
                      left: 15,

                      width: 20,
                      aspectRatio: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      position: "absolute",
                      borderRadius: 20,
                      backgroundColor: "#fff",
                      borderColor: rojoClaro,
                      borderWidth: 3,
                    }}
                  >
                    {!!reservasSeleccionadas.find((e) => e.id == res.id) && (
                      <View
                        style={{
                          backgroundColor: rojoClaro,
                          width: 9,
                          height: 9,
                          borderRadius: 20,
                        }}
                      />
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    paddingBottom: 20,
  },
  statusTxt: {
    color: rojoClaro + "99",
    fontWeight: "bold",
  },

  image: {
    width: 50,
    aspectRatio: 1,
    borderRadius: 10,

    marginRight: 20,
  },

  titulo: {
    fontWeight: "bold",
    fontSize: 16,
  },

  textContainer: {
    justifyContent: "center",
    flex: 1,
  },

  reservasContainer: {
    paddingVertical: 20,
  },
});
