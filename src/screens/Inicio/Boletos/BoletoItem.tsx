import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { Boleto } from "../../../models";
import {
  formatMoney,
  mayusFirstLetter,
  precioConComision,
  rojo,
  rojoClaro,
  shadowBaja,
} from "../../../../constants";
import SimpleSelector from "../../../components/SimpleSelector";
import { BoletoType } from ".";

export default function ({
  item,
  handleChange,
  showDescripcion,
  handleShowDescripcion,
}: {
  item: BoletoType;
  handleChange: (minus: boolean, cambio: number) => void;

  showDescripcion: boolean;
  handleShowDescripcion: () => void;
}) {
  let { titulo, descripcion, cantidad, precio, personasReservadas, quantity } =
    item;

  // Precio incluyendo comision
  precio = precioConComision(precio);

  personasReservadas = personasReservadas ? personasReservadas : 0;

  // Calcular si hay menos de 15 personas disponibles
  const availablePlaces = cantidad ? cantidad - personasReservadas : 0;
  const infoTxt = (() => {
    if (availablePlaces === 1) {
      return "Ultimo disponible";
    }
    if (availablePlaces <= 15) {
      return "Quedan " + availablePlaces;
    } else {
      return "";
    }
  })();

  return (
    <Pressable onPress={handleShowDescripcion} style={styles.boletoContainer}>
      <View
        style={{
          justifyContent: "center",
          flex: 1,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.titulo} numberOfLines={1}>
            {titulo}
          </Text>
          {!!infoTxt && <Text style={styles.infoTxt}>{infoTxt}</Text>}
        </View>

        {!!descripcion ? (
          <Text
            style={styles.descripcion}
            numberOfLines={showDescripcion ? undefined : 1}
          >
            {mayusFirstLetter(descripcion)}
          </Text>
        ) : (
          <View style={{ marginBottom: 10 }} />
        )}

        {/* Precio y selector unidades */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <Text style={styles.monney}>{formatMoney(precio, true)}</Text>
          <Pressable>
            <SimpleSelector
              quantity={!!quantity ? quantity : 0}
              handleChange={handleChange}
              min={0}
              max={cantidad ? cantidad - personasReservadas : 0}
            />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boletoContainer: {
    flexDirection: "row",
    marginBottom: 20,
    margin: 20,
    padding: 20,
    flex: 1,

    backgroundColor: "#fff",
    ...shadowBaja,
  },

  infoTxt: {
    backgroundColor: rojoClaro + "30",
    padding: 5,
    paddingHorizontal: 12,
    borderRadius: 10,
    color: rojoClaro,
    fontWeight: "bold",
  },

  titulo: {
    fontSize: 16,
    flex: 1,
    fontWeight: "bold",
    color: rojo,
  },

  descripcion: {
    color: "#777",
    marginVertical: 10,
  },

  personsInfo: {
    color: "#fff",
    fontWeight: "bold",
  },

  footerContainer: {
    flexDirection: "row",
    marginTop: 10,
    flex: 1,
  },

  monney: {
    fontWeight: "bold",
    fontSize: 16,
    flex: 1,
  },
});
