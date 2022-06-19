import { StyleSheet, Text, View } from "react-native";
import React, { Children, Component, useState } from "react";
import UserContext from "./UserContext";
import { PropsWithChildren } from "react";
import { ElementType } from "react";

export default function ({ children }: PropsWithChildren<any>) {
  const [organizador, setOrganizador] = useState(false);

  return (
    <UserContext.Provider
      value={{
        organizador: organizador,
        setOrganizador,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

const styles = StyleSheet.create({});
