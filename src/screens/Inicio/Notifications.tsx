import { StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { DataStore } from "aws-amplify";
import { Notificacion } from "../../models";

export default function () {
  useEffect(() => {
    DataStore.query(Notificacion).then(console.log);
  }, []);

  return (
    <View>
      <Text>Notificaciones</Text>
    </View>
  );
}

const styles = StyleSheet.create({});
