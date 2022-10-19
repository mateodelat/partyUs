import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatMoney } from "../../../../constants";

export default ({
  cantidad,
  precio,

  titulo,
}: {
  cantidad: number;
  precio: number;
  titulo: string;
}) => {
  return (
    <View style={{ ...styles.container }}>
      {/* Titulos */}
      <View style={{ width: "50%" }}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.descripcion}>{`($ ${Math.round(
          precio
        )}/persona)`}</Text>
      </View>

      {!cantidad ? (
        <Text style={styles.cantidad}>x{cantidad}</Text>
      ) : (
        <Text style={styles.cantidad}>x{cantidad}</Text>
      )}

      {cantidad ? (
        <Text style={styles.precio}>
          {formatMoney(Math.round(precio) * cantidad)}
        </Text>
      ) : (
        <Text style={styles.precio}>-</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 10,
  },

  titulo: {
    fontSize: 18,
    color: "#444",
    // fontWeight: 'bold',
  },

  descripcion: {
    fontSize: 14,
    color: "#aaa",
  },

  cantidad: {
    width: 40,
    fontSize: 18,
    flex: 1,
    color: "#444",
  },

  precio: {
    color: "#444",
    flex: 1,
    textAlign: "right",
    fontSize: 18,
  },
});
