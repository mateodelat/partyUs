import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import UserContext from "./UserContext";
import { PropsWithChildren } from "react";
import { getUserSub } from "../../constants";
import { DataStore } from "aws-amplify";
import { Usuario } from "../models";
import { useNavigation } from "@react-navigation/native";

export default function ({ children }: PropsWithChildren<any>) {
  const [usuario, setUsuario] = useState<Usuario>({
    id: "guest",
    nickname: "guest",
    email: "guest",
  });

  return (
    <UserContext.Provider
      value={{
        usuario,
        setUsuario,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
