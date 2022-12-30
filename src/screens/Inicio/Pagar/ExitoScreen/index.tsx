import React, { useEffect } from "react";
import { Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { azulClaro, vibrar, VibrationType } from "../../../../../constants";

export default function ExitoScreen({ navigation, route }) {
  useEffect(() => {
    vibrar(VibrationType.sucess);
  }, []);

  let descripcion = route.params?.descripcion;
  let txtExito = route.params?.txtExito;
  let onPress = route.params?.onPress;
  let txtOnPress = route.params?.txtOnPress;

  txtExito = txtExito ? txtExito : "Pago exitoso";
  onPress = onPress ? onPress : () => navigation.popToTop();
  txtOnPress = txtOnPress ? txtOnPress : "Volver al inicio";

  return (
    <View style={styles.container}>
      <Image
        source={require("./components/imgExitoso.png")}
        style={{
          width: 185,
          height: 150,
        }}
      />
      <Text
        style={{
          ...styles.titulo,
          fontWeight: descripcion ? "bold" : "normal",
        }}
      >
        {txtExito}
      </Text>
      {descripcion && <Text style={styles.descripcion}>{descripcion}</Text>}

      <TouchableOpacity
        onPress={() => onPress()}
        style={styles.buttonContainer}
      >
        <Text style={styles.buttonTxt}>{txtOnPress}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    height: 60,
    backgroundColor: azulClaro,
    position: "absolute",
    top: 0,
    width: "100%",
  },

  titulo: {
    fontSize: 16,
    marginTop: 10,
    marginHorizontal: 20,
    textAlign: "center",
  },

  descripcion: {
    fontSize: 16,
    marginTop: 5,
    marginHorizontal: 20,
    textAlign: "center",
  },

  buttonContainer: {
    marginTop: 40,

    width: "40%",
    padding: 20,
    borderRadius: 10,
    backgroundColor: azulClaro,

    alignItems: "center",
    justifyContent: "center",
  },

  buttonTxt: {
    color: "#fff",
    fontSize: 16,
  },
});
