import { StyleSheet, Switch, Text, View } from "react-native";
import React, { useState } from "react";
import useUser from "../../Hooks/useUser";

export default function Perfil() {
  const { organizador, setOrganizador } = useUser();

  return (
    <View>
      <Text>Usuario es organizador</Text>
      <Switch
        value={organizador}
        onChange={() => {
          setOrganizador(!organizador);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
