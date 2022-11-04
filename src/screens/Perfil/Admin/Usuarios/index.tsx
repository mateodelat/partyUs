import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  Image,
  View,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import Header from "../../../../navigation/components/Header";

import { Feather } from "@expo/vector-icons";
import { Usuario } from "../../../../models";
import { Auth, DataStore, Predicates } from "aws-amplify";
import { getImageUrl, rojoClaro, shadowBaja } from "../../../../../constants";
import Line from "../../../../components/Line";
import Switch from "../../../../components/Switch";

export default function ({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [userOpened, setUserOpened] = useState<number>();

  function handleOpenFilters() {
    setModalVisible(!modalVisible);
    Alert.alert("Proximamente...", "Agregar filtros de usuarios");
  }

  useEffect(() => {
    fetchUsersWithFilter().then(async (r) => {
      // Asignar primeramente
      setUsuarios(r);

      // Luego agregarle la foto si es de S3
      const neUsuarios = await Promise.all(
        r.map(async (usr) => {
          const foto = await getImageUrl(usr.foto);
          return {
            ...usr,
            foto,
          };
        })
      );
    });
  }, []);

  async function fetchUsersWithFilter() {
    return DataStore.query(Usuario, Predicates.ALL, {
      sort: (a) => a.organizador("DESCENDING"),
    }).then((r) => {
      return Promise.all(
        r.map(async (usr) => {
          return { ...usr, foto: await getImageUrl(usr.foto) };
        })
      );
    });
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchUsersWithFilter().then(setUsuarios);
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <Header
        title="Usuarios"
        RightIcon={() => (
          <Feather
            onPress={handleOpenFilters}
            style={styles.filterIcon}
            name="filter"
            size={24}
            color="black"
          />
        )}
      />
      <FlatList
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
        }
        data={usuarios}
        renderItem={({ item, index }) => {
          const status = item.organizador ? "ORGANIZADOR" : "CLIENTE";

          function handleSetAdmin() {
            setUsuarios((prev) => {
              prev[index] = {
                ...item,
                admin: !item.admin,
              };
              return [...prev];
            });

            // Cambiar el usuario para que sea admin
            DataStore.query(Usuario, item.id).then((usr) => {
              DataStore.save(
                Usuario.copyOf(usr, (ne) => {
                  ne.admin = !usr.admin;
                })
              );
            });
            Alert.alert("Admin", "Usuario se hizo admin con exito");
          }

          function handleSetNotificacionReserva() {
            setUsuarios((prev) => {
              prev[index] = {
                ...item,
                receiveNewReservations: !item.receiveNewReservations,
              };
              return [...prev];
            });

            // Cambiar el usuario para que sea admin
            DataStore.query(Usuario, item.id).then((usr) => {
              DataStore.save(
                Usuario.copyOf(usr, (ne) => {
                  ne.receiveNewReservations = !usr.receiveNewReservations;
                })
              );
            });
            Alert.alert(
              "Notificaciones",
              "Notificaciones de reserva actualizadas con exito"
            );
          }

          function handleSetOrganizador() {
            if (!item.organizador) {
              Alert.alert(
                "Organizador",
                "No se puede hacer al usuario organizador, el debe iniciar el proceso."
              );

              return;
            }

            setUsuarios((prev) => {
              prev[index] = {
                ...item,
                organizador: !item.organizador,
              };
              return [...prev];
            });

            // Cambiar el usuario para que sea admin
            DataStore.query(Usuario, item.id).then((usr) => {
              DataStore.save(
                Usuario.copyOf(usr, (ne) => {
                  ne.organizador = !usr.organizador;
                })
              );
            });
          }

          function handleVerSaldo() {
            navigation.navigate("Saldo", {
              usuario: item,
              organizador: item.organizador,
            });
          }

          function handleVerReservas() {
            navigation.navigate("MisReservas", {
              usuario: item,
            });
          }

          function handleVerEventos() {
            navigation.navigate("MisEventos", {
              usuario: item,
            });
          }

          return (
            <Pressable
              onPress={() => {
                setUserOpened(userOpened === index ? undefined : index);
              }}
              style={styles.userContainer}
            >
              <View style={{ flexDirection: "row" }}>
                <View style={styles.userProfile}>
                  <ActivityIndicator
                    style={{ position: "absolute" }}
                    size={"small"}
                    color={"black"}
                  />

                  <Image
                    source={{ uri: item.foto }}
                    style={{ width: "100%", height: "100%", borderRadius: 50 }}
                  />
                </View>

                {/* Texto del usuario */}
                <View style={{ justifyContent: "center", flex: 1 }}>
                  <Text style={styles.nickname}>{item.nickname}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                </View>

                {/* Informacion del usuario */}
                <Text
                  style={{
                    ...styles.statusTxt,
                    color: status === "ORGANIZADOR" ? rojoClaro : "black",
                    backgroundColor:
                      status === "ORGANIZADOR"
                        ? rojoClaro + "20"
                        : "transparent",
                  }}
                >
                  {status}
                </Text>
              </View>

              {/* Ver detalles del usuario si se hizo click */}
              {userOpened === index ? (
                <>
                  <Line />
                  <TouchableOpacity onPress={handleVerReservas}>
                    <Text style={styles.pressTxt}>Ver reservas</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleVerEventos}>
                    <Text style={styles.pressTxt}>Ver eventos</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleVerSaldo}>
                    <Text style={styles.pressTxt}>Saldo</Text>
                  </TouchableOpacity>

                  <Switch
                    style={{ padding: 0, paddingVertical: 5 }}
                    text="Organizador"
                    enabled={item.organizador}
                    setEnabled={() => handleSetOrganizador()}
                  />
                  <Switch
                    style={{ padding: 0, paddingVertical: 5 }}
                    text="Administrador"
                    enabled={item.admin}
                    setEnabled={() => handleSetAdmin()}
                  />

                  {item.admin && (
                    <Switch
                      style={{ padding: 0, paddingVertical: 5 }}
                      text="Notificacion de nuevas reservas"
                      enabled={item.receiveNewReservations}
                      setEnabled={() => handleSetNotificacionReserva()}
                    />
                  )}
                </>
              ) : null}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#Fff",
  },

  nickname: {
    fontSize: 16,
  },
  pressTxt: {
    color: rojoClaro,
    paddingVertical: 10,
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },

  filterIcon: {
    position: "absolute",
    right: 0,
    top: 0,
    padding: 10,
  },

  email: {
    color: "gray",
  },

  statusTxt: {
    alignSelf: "center",
    padding: 5,
    paddingHorizontal: 10,
    fontWeight: "bold",

    borderRadius: 5,
  },

  userProfile: {
    width: 50,
    aspectRatio: 1,

    borderRadius: 50,

    borderWidth: 1,
    marginRight: 15,

    alignItems: "center",
    justifyContent: "center",
  },

  userContainer: {
    padding: 15,

    backgroundColor: "#fff",
    margin: 20,
    marginVertical: 7,
    ...shadowBaja,
  },
});
