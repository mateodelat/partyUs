import { StyleSheet, Switch, Text, View } from "react-native";
import React, { useState } from "react";
import useUser from "../../Hooks/useUser";
import Boton from "../../components/Boton";
import { Auth } from "aws-amplify";

export default function Perfil() {
  const usuario = useUser().usuario;
  const setUsuario = useUser().setUsuario;

  return (
    <View>
      <Text>Usuario es organizador</Text>
      <Switch
        value={usuario.organizador as any}
        onChange={() => {
          setUsuario({
            ...usuario,
            organizador: !usuario.organizador,
          });
        }}
      />

      <Boton
        style={{ margin: 20 }}
        titulo="Cerrar sesion"
        onPress={() => Auth.signOut()}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
