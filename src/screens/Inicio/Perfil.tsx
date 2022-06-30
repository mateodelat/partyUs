import { StyleSheet, Switch, Text, View } from "react-native";
import React, { useState } from "react";
import useUser from "../../Hooks/useUser";

export default function Perfil() {
  const usuario = useUser().usuario;
  const setUsuario = useUser().setUsuario;

  return (
    <View>
      <Text>Usuario es organizador</Text>
      <Switch
        value={usuario.organizador}
        onChange={() => {
          setUsuario({
            ...usuario,
            organizador: !usuario.organizador,
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
