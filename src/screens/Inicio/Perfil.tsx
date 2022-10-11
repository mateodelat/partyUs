import {
  ActivityIndicator,
  ScrollView,
  Image,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  Alert,
  View,
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
  isUrl,
  mayusFirstLetter,
  shadowBaja,
  shadowMarcada,
  subirImagen,
  timer,
} from "../../../constants";
import HeaderModal from "../../components/HeaderModal";

import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";

import { TouchableOpacity } from "react-native-gesture-handler";
import { Auth, DataStore, Storage } from "aws-amplify";
import ModalTipoImagen from "../../components/ModalTipoImagen";
import InputOnFocusV2 from "../../components/InputOnFocusV2";
import { Usuario } from "../../models";

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
          setFotoPerfil(foto);
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

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {/* Detalles de la foto y nombre del usuario */}

      <View style={{ flexDirection: "row" }}>
        {/* Foto perfil */}

        <View style={styles.fotoPerfil}>
          {!fotoPerfil ? (
            <ActivityIndicator size={"small"} color={"#000"} />
          ) : (
            <Image
              style={{ height: "100%", width: "100%" }}
              source={{
                uri: fotoPerfil,
              }}
            />
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
          onPress={() => Alert.alert("Ir a mis boletos")}
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
            onPress={handleEditProfile}
          />
        )}
      </View>

      <View style={styles.textContainer}>
        {/* Favoritos */}
        <TouchableOpacity
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
        </TouchableOpacity>

        <View style={styles.spacing} />

        {/* Cambiar contraseña */}
        <TouchableOpacity style={styles.optionsTxtContainer}>
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
        </TouchableOpacity>

        {/* Notificaciones */}
        <TouchableOpacity
          style={{ ...styles.optionsTxtContainer, borderBottomWidth: 0 }}
        >
          <View style={{ width: 30, alignItems: "center" }}>
            <FontAwesome5 name="bell" size={24} color="black" />
          </View>

          <Text style={styles.optionsTxt}>Notificaciones</Text>
          <MaterialIcons
            name={"keyboard-arrow-right"}
            size={35}
            color={"#555"}
          />
        </TouchableOpacity>

        <View style={styles.spacing} />

        {/* Pagos */}
        <TouchableOpacity style={styles.optionsTxtContainer}>
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
          style={{ ...styles.optionsTxtContainer, borderBottomWidth: 0 }}
        >
          <View style={{ width: 30, alignItems: "center" }}>
            <FontAwesome5 name="bell" size={24} color="black" />
          </View>

          <Text style={styles.optionsTxt}>Soporte</Text>
          <MaterialIcons
            name={"keyboard-arrow-right"}
            size={35}
            color={"#555"}
          />
        </TouchableOpacity>

        {/* Cerrar sesion */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={{ alignItems: "center" }}
        >
          <Text style={styles.signOutTxt}>Cerrar sesion</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={false}
        animationType={"slide"}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.editarPerfil}>
          {/* Header */}
          <HeaderModal
            onPress={handleCancel}
            titulo={"Editar perfil"}
            textStyle={{
              color: "#000",
              fontWeight: "bold",
              fontSize: 18,
            }}
            RightIcon={() => (
              <Pressable
                onPress={handleDoneEditing}
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
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
              onPress={() => setImageModalVisible(true)}
              style={{ ...styles.fotoPerfil, width: 110, overflow: "visible" }}
            >
              <Image
                style={{ width: "100%", height: "100%", borderRadius: 100 }}
                source={{
                  uri: editedUser.localUri ? editedUser.localUri : fotoPerfil,
                }}
              />
              <Feather
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "#fff",
                  borderRadius: 200,
                  width: 40,
                  height: 40,
                  textAlign: "center",
                  textAlignVertical: "center",
                }}
                name="camera"
                size={24}
                color="black"
              />
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
        </View>
      </Modal>

      <Modal animationType="none" visible={imageModalVisible} transparent>
        <ModalTipoImagen
          aspectRatio={[1, 1]}
          setImage={handleChangePicture}
          setModalVisible={setImageModalVisible}
          cameraEnabled
          hideAleatorio
        />
      </Modal>
    </ScrollView>
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
    flex: 1,

    color: "red",
    padding: 20,
    paddingVertical: 10,

    marginTop: 20,
  },

  textContainer: {
    marginTop: 30,

    borderRadius: 20,
  },
});
