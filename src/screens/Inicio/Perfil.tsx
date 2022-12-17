import {
  ActivityIndicator,
  Keyboard,
  Image,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  Alert,
  View,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState, useEffect } from "react";
import useUser from "../../Hooks/useUser";
import Boton from "../../components/Boton";
import {
  AsyncAlert,
  azulClaro,
  azulFondo,
  getBlob,
  getImageUrl,
  getUserSub,
  isUrl,
  mayusFirstLetter,
  sendAdminNotification,
  shadowBaja,
  shadowMarcada,
  subirImagen,
  timer,
} from "../../../constants";
import HeaderModal from "../../components/HeaderModal";

import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

import { TouchableOpacity } from "react-native-gesture-handler";
import { Auth, DataStore, Storage } from "aws-amplify";
import ModalTipoImagen from "../../components/ModalTipoImagen";
import InputOnFocusV2 from "../../components/InputOnFocusV2";
import {
  Boleto,
  Evento,
  Notificacion,
  Reserva,
  ReservasBoletos,
  Usuario,
} from "../../models";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyProfile from "../../components/EmptyProfile";

export default function Perfil({ navigation }: { navigation: any }) {
  const usuario = useUser().usuario;
  const setUsuario = useUser().setUsuario;

  const setLoading = useUser().setLoading;

  const { nombre, paterno, materno, nickname, organizador } = usuario;

  const [fotoPerfil, setFotoPerfil] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [editedUser, setEditedUser] = useState<Usuario & { localUri?: string }>(
    usuario
  );

  useEffect(() => {
    getProfilePic();

    (async () => {
      const sub = await getUserSub();
      DataStore.query(Usuario, sub);
    })();
  }, []);

  async function getProfilePic() {
    setFotoPerfil(
      await getImageUrl(usuario.foto).then((r) => {
        return r;
      })
    );
  }

  function handleSignOut() {
    Auth.signOut();
    navigation.pop();
  }

  function handleEditProfile() {
    setModalVisible(true);
  }

  async function handleDoneEditing() {
    // Si se ha modificado
    setModalVisible(false);

    if (hasChanged()) {
      const { nombre, paterno, materno, foto, nickname } = editedUser;
      setLoading(true);
      await DataStore.save(
        Usuario.copyOf(await DataStore.query(Usuario, usuario.id), (ne) => {
          ne.nombre = nombre;
          ne.paterno = paterno;
          ne.materno = materno;
          ne.foto = foto;
          ne.nickname = nickname;
        })
      )
        .then(async (r) => {
          setFotoPerfil(
            await getImageUrl(foto).then((r) => {
              return r;
            })
          );
          setUsuario({
            ...r,
            foto: await getImageUrl(r.foto),
          });
          setEditedUser(r);
        })
        .catch((e) => {});
      setLoading(false);
      Alert.alert("Exito", "Perfil acualizado con exito");
    }
  }

  function hasChanged() {
    const { nombre, paterno, materno, localUri, nickname } = editedUser;

    const {
      nombre: nombreO,
      paterno: paternoO,
      materno: maternoO,
      nickname: nicknameO,
    } = usuario;

    // Si se ha modificado
    if (
      nombre !== nombreO ||
      paterno !== paternoO ||
      materno !== maternoO ||
      nickname !== nicknameO ||
      !!localUri
    ) {
      return true;
    }

    return false;
  }

  function handleCancel() {
    if (hasChanged()) {
      AsyncAlert(
        "Atencion",
        "Se perderan los cambios en la edicion. ¿Quieres continuar?"
      ).then((r) => {
        if (r) {
          setModalVisible(false);
        }
      });
    } else {
      setModalVisible(false);
    }
  }

  async function handleChangePicture(ne: any) {
    try {
      let url = ne.uri;
      let key: string;

      // Si no es link valido subir imagen a S3
      if (!isUrl(ne.uri)) {
        key = usuario.id + "-fotoPerfil.jpg";

        await subirImagen(key, url);
      }
      setEditedUser({
        ...editedUser,
        localUri: url,
        foto: key ? key : url,
      });
    } catch (e) {
      Alert.alert("Error", "Hubo un error subiendo la imagen: " + e.message);
    } finally {
      setImageModalVisible(false);
    }
  }

  async function handleDelete() {
    try {
      setLoading(true);

      await AsyncAlert(
        "Borrar cuenta",
        "Atencion, esto borrara todos tus datos de partyus. Una vez borrados no hay vuelta atras. ¿Quieres continuar?"
      ).then(async (r) => {
        if (!r) return;
        const sub = usuario.id;

        // Si el usuario es organizador y tiene eventos futuros darle error y mandar notificacion a admins (posible fraude)
        if (usuario.organizador) {
          const eventos = await DataStore.query(Evento, (e) =>
            e.CreatorID("eq", sub)
          );

          // Filtrar si hay eventos proximos en el usuario
          if (
            !!eventos.filter((e) => e.fechaFinal > new Date().getTime()).length
          ) {
            Alert.alert(
              "Atencion",
              "Tienes eventos proximos, no puedes borrar tu cuenta"
            );

            sendAdminNotification({
              titulo: "Alerta de fraude",
              sender: usuario,
              descripcion:
                "El organizador ha intentado borrar su cuenta con eventos proximos",
              organizadorID: sub,
            });
            setLoading(false);

            return;
          } else {
            // // De lo contrario borrar todos los eventos (que son pasados) y boletos asociados
            // await Promise.all(
            //   eventos.map((e) => {
            //     // Borrar sus boletos asciados al evento
            //     const boletos = DataStore.query(Notificacion, (e) =>
            //       e.organizadorID("eq", sub)
            //     );
            //     await DataStore.delete(Boleto);
            //     return DataStore.delete(Evento, e);
            //   })
            // );
          }
        }

        // Borrar usuario de datastore
        const usr = DataStore.query(Usuario, sub);

        // Borrar notificaciones
        const notificaciones = DataStore.query(Notificacion, (e) =>
          e.usuarioID("eq", sub)
        );

        // Borrar reservas
        const reservas = DataStore.query(Reserva, (e) =>
          e.usuarioID("eq", sub)
        );

        ////////////////////////////////////////////////////
        /////////////////SECION DE BORRADO//////////////////
        ////////////////////////////////////////////////////

        // Borrar el usuario
        const delUsr = DataStore.delete(await usr);

        // Borrar las notificaciones
        const delNot = Promise.all(
          (await notificaciones).map(async (not) => {
            // Borrar notificacion

            return DataStore.delete(not);
          })
        );

        // Borrar reservas y relacion boletos
        const delRes = Promise.all(
          (await reservas).map(async (res) => {
            // Borrar reserva boleto asociada
            const reservasBoletos = await DataStore.query(
              ReservasBoletos,
              (e) => e.reservaID("eq", res.id)
            );

            await Promise.all(
              reservasBoletos.map(async (rel) => {
                DataStore.delete(rel);
              })
            );

            // Borrar reserva asociada
            return DataStore.delete(res);
          })
        );

        // Esperar resolucion de todas funciones borradoras
        await delNot;
        await delRes;
        await delUsr;
        await Auth.deleteUser();

        setLoading(false);
        navigation.pop();
      });
    } catch (error) {
      setLoading(false);

      Alert.alert(
        "Error",
        "Hubo un error borrando los boletos: " + error.message
      );
    }
  }

  function handlePayments() {
    navigation.navigate("Saldo", { organizador });
  }

  function handleSoporte() {
    navigation.navigate("Soporte");
  }

  function handleNavigateAdmin() {
    navigation.navigate("AdminStack");
  }

  return (
    <View style={styles.container}>
      {/* Detalles de la foto y nombre del usuario */}

      <View style={{ flexDirection: "row" }}>
        {/* Foto perfil */}

        <View style={styles.fotoPerfil}>
          {!fotoPerfil ? (
            <EmptyProfile />
          ) : (
            <>
              <ActivityIndicator
                style={{
                  position: "absolute",
                }}
                size={"small"}
                color={"black"}
              />
              <Image
                style={{ height: "100%", width: "100%" }}
                source={{
                  uri: fotoPerfil,
                }}
              />
            </>
          )}
        </View>

        {/* Nombre y nickname del usuario */}
        <View style={styles.nameContainer}>
          <Text
            numberOfLines={2}
            style={{
              fontWeight: "800",
              fontSize: 18,
            }}
          >
            @{mayusFirstLetter(nickname)}
          </Text>

          <Text
            numberOfLines={2}
            style={{
              color: "#888",
              fontSize: 16,

              marginTop: 5,
            }}
          >
            {nombre}
            {paterno ? " " + paterno : ""}
            {materno ? " " + materno : ""}
          </Text>
        </View>
      </View>

      <Boton
        style={styles.botonContainer}
        textStyle={{ color: azulClaro }}
        titulo="Editar perfil"
        onPress={handleEditProfile}
      />

      <View style={{ flexDirection: "row" }}>
        <Boton
          style={{
            ...styles.botonContainer,
            flex: 1,
            marginRight: organizador ? 10 : 0,
            backgroundColor: "#fff",
            borderWidth: 0.4,
            borderColor: azulClaro,
          }}
          textStyle={{ color: azulClaro }}
          titulo="Mis boletos"
          onPress={() => navigation.navigate("MisReservas")}
        />
        {organizador && (
          <Boton
            style={{
              ...styles.botonContainer,
              flex: 1,
              marginLeft: 10,
              backgroundColor: "#fff",
              borderWidth: 0.4,
              borderColor: azulClaro,
            }}
            textStyle={{ color: azulClaro }}
            titulo="Eventos creados"
            onPress={() => navigation.navigate("MisEventos")}
          />
        )}
      </View>

      <View style={styles.textContainer}>
        {/* Favoritos */}
        {/* <TouchableOpacity
          style={{ ...styles.optionsTxtContainer, borderBottomWidth: 0 }}
        >
          <View style={{ width: 30, alignItems: "center" }}>
            <MaterialIcons name="favorite-border" size={24} color="black" />
          </View>
          <Text style={styles.optionsTxt}>Favoritos</Text>
          <MaterialIcons
            name={"keyboard-arrow-right"}
            size={35}
            color={"#555"}
          />
        </TouchableOpacity> */}

        {/* <View style={styles.spacing} /> */}

        {/* Cambiar contraseña */}
        {/* <TouchableOpacity style={styles.optionsTxtContainer}>
          <View
            style={{
              padding: 2,
              flexDirection: "row",
              borderWidth: 4,
              borderColor: "#555",
              borderRadius: 10,
              width: 30,
              justifyContent: "center",
            }}
          >
            {[...Array(3).keys()].map((e) => (
              <View
                key={e}
                style={{
                  backgroundColor: "#555",
                  borderRadius: 40,
                  width: 4,
                  height: 4,
                  marginRight: 1,
                }}
              />
            ))}
          </View>
          <Text style={styles.optionsTxt}>Cambiar contraseña</Text>
          <MaterialIcons
            name={"keyboard-arrow-right"}
            size={35}
            color={"#555"}
          />
        </TouchableOpacity> */}

        {/* Pagos */}
        <TouchableOpacity
          style={styles.optionsTxtContainer}
          onPress={handlePayments}
        >
          <View style={{ width: 30, alignItems: "center" }}>
            <Feather name="credit-card" size={24} color="black" />
          </View>

          <Text style={styles.optionsTxt}>Pagos</Text>
          <MaterialIcons
            name={"keyboard-arrow-right"}
            size={35}
            color={"#555"}
          />
        </TouchableOpacity>

        {/* Soporte */}
        <TouchableOpacity
          onPress={handleSoporte}
          style={{ ...styles.optionsTxtContainer, borderBottomWidth: 0 }}
        >
          <View style={{ width: 30, alignItems: "center" }}>
            <Ionicons name={"md-help-buoy-sharp"} size={24} color="black" />
          </View>

          <Text style={styles.optionsTxt}>Soporte</Text>
          <MaterialIcons
            name={"keyboard-arrow-right"}
            size={35}
            color={"#555"}
          />
        </TouchableOpacity>

        {/* Admin UI */}
        {usuario.admin && (
          <>
            <View style={styles.spacing} />

            <TouchableOpacity
              onPress={handleNavigateAdmin}
              style={{ ...styles.optionsTxtContainer, borderBottomWidth: 0 }}
            >
              <View style={{ width: 30, alignItems: "center" }}>
                <MaterialIcons
                  name="admin-panel-settings"
                  size={30}
                  color="black"
                />
              </View>

              <Text style={styles.optionsTxt}>Admin</Text>
              <MaterialIcons
                name={"keyboard-arrow-right"}
                size={35}
                color={"#555"}
              />
            </TouchableOpacity>
          </>
        )}

        <View style={{ flex: 1 }} />

        {/* Cerrar sesion */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            alignItems: "center",
            width: "100%",
            marginBottom: 10,
          }}
        >
          <Text style={{ ...styles.signOutTxt }}>Cerrar sesion</Text>
        </TouchableOpacity>

        {/* Borrar cuenta */}
        <TouchableOpacity
          onPress={handleDelete}
          style={{ alignItems: "center", width: "100%" }}
        >
          <Text
            style={{
              ...styles.signOutTxt,
              fontWeight: "normal",
              color: "#444",
              marginTop: 0,
            }}
          >
            Borrar cuenta
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={false}
        animationType={"slide"}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <Pressable
          onPress={() => {
            Keyboard.dismiss();
          }}
          style={styles.editarPerfil}
        >
          {/* Header */}
          <HeaderModal
            onPress={handleCancel}
            titulo={"Editar perfil"}
            noInsets
            textStyle={{
              color: "#000",
              fontWeight: "bold",
              fontSize: 18,
              paddingTop: 0,
            }}
            RightIcon={() => (
              <Pressable
                onPress={handleDoneEditing}
                style={{
                  position: "absolute",
                  right: 0,
                  top: 15,
                  padding: 10,
                }}
              >
                <Feather name="check" size={28} color={"#000"} />
              </Pressable>
            )}
            color={"#000"}
          />

          <View
            style={{ alignItems: "center", marginTop: 20, marginBottom: 20 }}
          >
            {/* Foto de perfil */}
            <Pressable
              onPress={() => {
                setImageModalVisible(true);
              }}
              style={{
                ...styles.fotoPerfil,
                width: 110,
                overflow: "visible",
              }}
            >
              <ActivityIndicator
                style={{
                  position: "absolute",
                }}
                size={"small"}
                color={"black"}
              />
              <Image
                style={{ width: "100%", height: "100%", borderRadius: 100 }}
                source={{
                  uri: editedUser.localUri ? editedUser.localUri : fotoPerfil,
                }}
              />

              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "#fff",
                  borderRadius: 30,
                  width: 40,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather style={{}} name="camera" size={24} color="black" />
              </View>
            </Pressable>
          </View>

          <InputOnFocusV2
            value={editedUser.nickname}
            style={{ ...styles.input, marginBottom: 20 }}
            titulo="Nickname"
            onChangeText={(r) => {
              setEditedUser({
                ...editedUser,
                nickname: r,
              });
            }}
          />

          <InputOnFocusV2
            value={editedUser.nombre}
            style={styles.input}
            titulo="Nombre"
            onChangeText={(r) => {
              setEditedUser({
                ...editedUser,
                nombre: r,
              });
            }}
          />

          <InputOnFocusV2
            value={editedUser.paterno}
            style={styles.input}
            titulo="Paterno"
            onChangeText={(r) => {
              setEditedUser({
                ...editedUser,
                paterno: r,
              });
            }}
          />

          <InputOnFocusV2
            value={editedUser.materno}
            style={styles.input}
            titulo="Materno"
            onChangeText={(r) => {
              setEditedUser({
                ...editedUser,
                materno: r,
              });
            }}
          />
        </Pressable>
        <Modal
          animationType="none"
          visible={imageModalVisible}
          transparent
          style={{
            zIndex: 2,
          }}
        >
          <ModalTipoImagen
            aspectRatio={[1, 1]}
            quality={0.3}
            setImage={handleChangePicture}
            setModalVisible={setImageModalVisible}
            cameraEnabled
            hideAleatorio
          />
        </Modal>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    marginTop: 25,
    marginHorizontal: 20,
  },

  fotoPerfil: {
    width: 80,
    aspectRatio: 1,

    borderRadius: 120,

    alignItems: "center",
    justifyContent: "center",

    overflow: "hidden",
  },

  spacing: {
    marginTop: 20,
  },

  editarPerfil: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
  },

  nameContainer: {
    flex: 1,
    paddingHorizontal: 20,

    justifyContent: "center",
  },

  botonContainer: {
    marginTop: 20,
    backgroundColor: "#EAEEF1",
    height: 40,
    borderRadius: 10,
  },

  optionsTxtContainer: {
    padding: 10,

    width: "100%",
    textAlign: "center",

    borderBottomWidth: 1,
    borderColor: "#EAEEF1",

    flexDirection: "row",
    alignItems: "center",
    minHeight: 55.6,
  },

  optionsTxt: {
    flex: 1,
    fontSize: 16,
    marginLeft: 20,
  },

  signOutTxt: {
    fontSize: 16,
    fontWeight: "bold",

    textAlign: "center",

    color: "red",
    padding: 20,
    paddingVertical: 10,

    marginTop: 20,
  },

  textContainer: {
    marginTop: 30,

    flex: 1,
    borderRadius: 20,
  },
});
