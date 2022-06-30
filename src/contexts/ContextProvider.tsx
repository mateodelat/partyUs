import { StyleSheet, Text, View } from "react-native";
import React, { Children, Component, useState } from "react";
import UserContext, { UserType } from "./UserContext";
import { PropsWithChildren } from "react";
import { ElementType } from "react";

export default function ({ children }: PropsWithChildren<any>) {
  const [usuario, setUsuario] = useState<UserType>({});

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

const styles = StyleSheet.create({});
