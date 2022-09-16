import React, { useEffect, useState } from "react";
import UserContext from "./UserContext";
import { PropsWithChildren } from "react";
import { Usuario } from "../models";
import { API, DataStore, Hub } from "aws-amplify";
import { getUserSub, verifyUserLoggedIn } from "../../constants";

// Obtener el usuario recien loggeado
const getUsuario = /* GraphQL */ `
  query GetUsuario($id: ID!) {
    getUsuario(id: $id) {
      id
      nickname
      nombre
      materno
      paterno
      email
      foto
      imagenFondo
      phoneNumber
      phoneCode
      organizador
      admin
      idUploaded
      idData
      idKey
      fechaNacimiento
      calificacion
      numResenas
      notificationToken
      verified
    }
  }
`;

export default function ({ children }: PropsWithChildren<any>) {
  const defultUSR = {
    id: "guest",
    nickname: "guest",
    email: "guest",
  };

  const [usuario, setUsuario] = useState<Usuario>(defultUSR);

  async function fetchUsuario(sub: string, api?: boolean) {
    if (api) {
      setUsuario(
        await (
          API.graphql({
            query: getUsuario,
            variables: { id: sub },
          }) as any
        ).then((r: any) => {
          r = r.data.getUsuario;

          console.log(r);

          return r;
        })
      );
    } else {
      DataStore.query(Usuario, sub).then((r) => {
        if (!r) {
          throw new Error(
            "Error, no hay usuario en la base de datos con el id: " +
              r +
              " para asignar al use context"
          );
        }

        console.log("Usuario obtenido de database");
        setUsuario(r);
      });
    }
  }

  const [registrado, setRegistrado] = useState(false);

  // Escuchar actualizaciones a auth para asignar al usuario local
  useEffect(() => {
    // Si hay sub obtener el usuario
    getUserSub().then((r) => {
      if (!r) return;
      fetchUsuario(r);
    });

    const r = Hub.listen("auth", (data) => {
      const { event } = data.payload;

      const username = data.payload?.data?.username;

      switch (event) {
        case "signIn":
          if (!username) {
            throw new Error(
              "No hay nombre de usuario cuando inicia sesion en context provider"
            );
          }

          fetchUsuario(username, registrado);
          break;

        case "signOut":
          // Borrar usuario default
          setUsuario(defultUSR);

          // cancelAllScheduledNotificationsAsync();
          // Bugsnag.setUser("", "", "");
          break;

        case "signUp":
          setRegistrado(true);
          break;

        default:
          break;
      }
    });
    return () => {
      Hub.remove("auth", () => null);
      r();
    };
  }, []);

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
