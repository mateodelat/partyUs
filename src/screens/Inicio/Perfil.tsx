import { StyleSheet, Switch, Text, View } from "react-native";
import React, { useState } from "react";
import useUser from "../../Hooks/useUser";
import Boton from "../../components/Boton";
import { Auth, DataStore, Predicates } from "aws-amplify";
import { AsyncAlert } from "../../../constants";
import { Evento } from "../../models";
import { Boleto } from "../../models";
import { Reserva } from "../../models";

export default function Perfil({ navigation }: any) {
  const usuario = useUser().usuario;
  const setUsuario = useUser().setUsuario;

  function handleSignOut() {
    Auth.signOut();
    navigation.pop();
  }

  function borrarDatos() {
    AsyncAlert(
      "Atencion",
      "Esto borrara todos los eventos, boletos, reservas y demas informacion de la app quieres continuar?"
    ).then(() => {
      DataStore.delete(Evento, Predicates.ALL);
      DataStore.delete(Boleto, Predicates.ALL);
      DataStore.delete(Reserva, Predicates.ALL);
    });
  }

  return (
    <View>
      {/* <Switch
        value={usuario.organizador as any}
        onChange={() => {
          setUsuario({
            ...usuario,
            organizador: !usuario.organizador,
          });
        }}
      /> */}

      <Boton
        style={{ margin: 20 }}
        titulo="Borrar datos"
        onPress={borrarDatos}
      />
      <Boton
        style={{ margin: 20 }}
        titulo="Cerrar sesion"
        onPress={handleSignOut}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
