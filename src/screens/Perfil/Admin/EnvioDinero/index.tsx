import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Alert,
  Pressable,
  TouchableOpacity,
  Modal,
  Linking,
} from "react-native";
import React, { useState } from "react";
import { Reserva, Retiro, Usuario } from "../../../../models";
import { logger } from "react-native-logs";
import {
  AsyncAlert,
  azulClaro,
  azulFondo,
  fetchFromAPI,
  formatCuentaCLABE,
  formatMoney,
  produccion,
  rojoClaro,
  sendPushNotification,
  shadowBaja,
} from "../../../../../constants";
import Line from "../../../../components/Line";
import OptionsModal from "../../../../components/OptionsModal";

import { FontAwesome } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";

import * as Clipboard from "expo-clipboard";
import Toast from "react-native-simple-toast";
import InputOnFocus from "../../../../components/InputOnFocus";
import Boton from "../../../../components/Boton";
import useUser from "../../../../Hooks/useUser";
import { DataStore } from "aws-amplify";

const log = logger.createLogger();

export default function ({
  route,
  navigation,
}: {
  route: {
    params: {
      reservas: Reserva[];
      usuario: Usuario;
    };
  };
  navigation: any;
}) {
  const { usuario, reservas } = route.params;
  const { usuario: adminUser, setLoading } = useUser();

  const [modalVisible, setModalVisible] = useState(false);

  const [message, setMessage] = useState("");
  const [openPayRetiros, setOpenPayRetiros] = useState(
    produccion ? "aiwllaqa0jrg8x8spwlo" : "ax93fexqn2xq3nrewk1j"
  );

  const [showCuentaOpenpay, setShowCuentaOpenpay] = useState(false);

  const [efectivo, setEfectivo] = useState(false);

  const porPagar = reservas.reduce((partialSum, a) => {
    if (!a.cancelado) {
      return partialSum + a.pagadoAlOrganizador;
    }

    // Si la reserva aparece como cancelada y ya fue pagada por nosotros
    if (!!a.transaccionAOrganizador) {
      Alert.alert(
        "Atencion",
        "Una reserva que ya enviamos el dinero al organizador fue cancelada"
      );
      return partialSum - a.pagadoAlOrganizador;
    }
    return partialSum;
  }, 0);

  let clabeCopiada = false;
  let nombreCopiado = false;

  async function handleCopy(field: "CLABE" | "Nombre") {
    let mensaje = "";

    if (field === "CLABE") {
      mensaje =
        "Cuenta CLABE " +
        (clabeCopiada ? " ya copiada anteriormente" : "copiada con exito");
      !clabeCopiada && Clipboard.setStringAsync(usuario.cuentaBancaria);

      nombreCopiado = false;
      clabeCopiada = true;
    } else {
      mensaje =
        "Titular de la cuenta " +
        (nombreCopiado ? " ya copiado anteriormente" : "copiado con exito");

      !nombreCopiado && Clipboard.setStringAsync(usuario.titularCuenta);

      clabeCopiada = false;
      nombreCopiado = true;
    }

    Toast.show(mensaje, Toast.LONG);
  }

  function handleContacto(tipo: "whatsapp" | "email" | "telefono") {
    const telefono = ("" + usuario.phoneCode + usuario.phoneNumber)
      .replace("+", "")
      .replace(" ", "");

    switch (tipo) {
      case "whatsapp":
        if (!usuario.phoneNumber) {
          Alert.alert(
            "Error",
            "Atencion el usuario no tiene telefono guardado"
          );
          return;
        }

        AsyncAlert(
          "Abrir whatsapp",
          "Se te dirigira a whatsapp para comunicarte con el organizador"
        ).then((r) => {
          if (!r) return;
          Linking.openURL(
            "whatsapp://send?text=Hola, tengo un problema con partyus: &phone=" +
              telefono
          ).catch((e) => {
            Alert.alert(
              "Error",
              "Es probable que no tengas whatsapp instalado"
            );
          });
        });

        break;

      case "email":
        AsyncAlert(
          "Enviar correo",
          "Se abrira un correo nuevo al organizador"
        ).then((r) => {
          if (!r) return;
          Linking.openURL("mailto: " + usuario.email).catch((e) => {
            Alert.alert(
              "Error",
              "Es probable que no tengas plataforma de correos instalada"
            );
          });
        });

        break;

      case "telefono":
        if (!usuario.phoneNumber) {
          Alert.alert(
            "Error",
            "Atencion el usuario no tiene telefono guardado"
          );
          return;
        }

        AsyncAlert(
          "Llamar",
          "Se te dirigira a una nueva llamada al soporte de partyus"
        ).then((r) => {
          if (!r) return;
          Linking.openURL("tel:" + telefono).catch((e) => {
            Alert.alert("Error", "Hubo un problema con la llamada" + e.message);
          });
        });

        break;

      default:
        break;
    }
  }

  async function handleConfirmar() {
    await AsyncAlert(
      "Atencion",
      "Asegurate de realizarle el pago al organizador por " +
        formatMoney(porPagar) +
        (!efectivo ? " a su cuenta" : " en efectivo")
    )
      .then(async (r) => {
        if (!r) return;
        setLoading(true);

        const transferInput = {
          source_id: usuario.userPaymentID,
          target_id: openPayRetiros,
          amount: porPagar,
          description: (
            (efectivo ? "cash" : "card") +
            "retiro>>>" +
            reservas[0].id +
            "><" +
            (efectivo
              ? "Pago de " + reservas.length + " reserva(s) en efectivo"
              : "Envio de fondos de " +
                reservas.length +
                " reserva(s) a su cuenta CLABE: " +
                formatCuentaCLABE(usuario.cuentaBancaria)) +
            (message ? "\n" + message : "")
          ).slice(0, 249),
          order_id: (efectivo ? "cash" : "card") + "retiro>>>" + reservas[0].id,
        };

        // Cobrar la comision de cuenta retiros
        const feeInput = {
          source_id: openPayRetiros,
          amount: porPagar,
          description: (
            adminUser.nickname +
            ": " +
            (efectivo
              ? "Pago de " + reservas.length + " reserva(s) en efectivo"
              : "Envio de fondos de " +
                reservas.length +
                " reserva(s) a cuenta CLABE: " +
                formatCuentaCLABE(usuario.cuentaBancaria)) +
            (message ? "\n" + message : "")
          ).slice(0, 249),
          order_id:
            "fee" + (efectivo ? "cash" : "card") + "retiro>>>" + reservas[0].id,
        };

        // Crear transaccion entre el cliente y la cuenta de retiros
        const transferID = await fetchFromAPI<any>(
          "/payments/transfer",
          "POST",
          transferInput
        )
          .then((r) => {
            return r.body.id;
          })
          .catch((e) => {
            console.log(e);
            Alert.alert(
              "Error",
              "Hubo un error realizando el retiro de dinero del cliente: " +
                e?.error?.description
            );
          });
        const feeID = await fetchFromAPI<any>("/payments/fee", "POST", feeInput)
          .then((r) => {
            return r.body.id;
          })

          .catch((e) => {
            console.log(e);
            Alert.alert(
              "Error",
              "Hubo un error realizando el cobro de comision en cuenta de retiros (no hay tanto problema): " +
                e?.error?.description
            );
          });

        log.debug({
          feeID,
          transferID,
        });

        // Crear el retiro y obtener su ID para asociarlo a las reservas
        const retiroID = await DataStore.save(
          new Retiro({
            adminID: adminUser.id,
            amount: porPagar,
            organizadorID: usuario.id,
            mensaje: message,

            feeID,
            transferID,
          })
        ).then((r) => r.id);

        // Actualizar estado a pagadas en las reservas
        await Promise.all(
          reservas.map(async (res) => {
            const neRes = await DataStore.query(Reserva, res.id);
            return DataStore.save(
              Reserva.copyOf(neRes, (ne) => {
                ne.transaccionAOrganizadorID = retiroID;
              })
            );
          })
        );

        navigation.pop();
        navigation.navigate("ExitoScreen", {
          onPress: () => navigation.pop(),
          txtOnPress: "Volver",

          txtExito: "Retiro exitoso",
          descripcion:
            "Retiro de fondos guardado. !No te olvides de entregar el dinero " +
            (efectivo ? " en efectivo" : " por transferencia"),
        });

        // Mandar notificacion push al cliente
        sendPushNotification({
          title: "Fondos recibidos",
          token: usuario.notificationToken,
          descripcion:
            "Se te han enviado " +
            formatMoney(porPagar) +
            (efectivo ? " en efectivo" : " a tu cuenta bancaria"),
        });

        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Contenedor del usuario */}
        <View style={styles.usuarioContainer}>
          <View style={{ flexDirection: "row" }}>
            <Image source={{ uri: usuario.foto }} style={styles.fotoUsuario} />
            <View
              style={{
                marginLeft: 15,
                justifyContent: "center",
                flex: 1,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>
                {usuario.nombre + " " + usuario.paterno + " " + usuario.materno}
              </Text>
              <Text style={{ color: "#444" }}>@{usuario.nickname}</Text>
            </View>

            {/* Informacion del por pagar */}
            <Text
              style={{
                ...styles.monneyDueTxt,

                minWidth: 70,
                textAlign: "center",

                backgroundColor: rojoClaro,
                color: "#fff",
              }}
            >
              {formatMoney(porPagar)}
            </Text>
          </View>

          <Line style={{ marginTop: 15 }} />

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              alignItems: "center",
              width: "100%",
            }}
          >
            <Text style={styles.contactoTxt}>Contacto</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("JSONVisualizer", usuario)}
            style={{
              alignItems: "center",
              width: "100%",
            }}
          >
            <Text style={styles.contactoTxt}>Ver informacion comlpeta</Text>
          </TouchableOpacity>
        </View>

        {/* Tipo de pago */}
        <View style={styles.selector}>
          <Pressable
            onPress={() => setEfectivo(false)}
            style={{
              ...styles.selectorPressable,
              backgroundColor: !efectivo ? azulClaro : "transparent",
            }}
          >
            <Text
              style={{
                color: !efectivo ? "#fff" : "#000",
              }}
            >
              Transferencia
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setEfectivo(true)}
            style={{
              ...styles.selectorPressable,
              backgroundColor: efectivo ? azulClaro : "transparent",
            }}
          >
            <Text
              style={{
                color: efectivo ? "#fff" : "#000",
              }}
            >
              Efectivo
            </Text>
          </Pressable>
        </View>

        {!efectivo && (
          <>
            {/* Informacion de la cuenta CLABE */}
            <Text
              style={{
                ...styles.texto,
                color: "#333",
                fontWeight: "bold",
                marginLeft: 20,
              }}
            >
              Cuenta CLABE
            </Text>
            <TouchableOpacity
              onPress={() => handleCopy("CLABE")}
              style={styles.cuentaContainer}
            >
              <Text style={styles.textContainer}>
                {formatCuentaCLABE(usuario.cuentaBancaria)}
              </Text>
              <Feather
                name="copy"
                size={20}
                color="gray"
                style={{ padding: 5 }}
              />
            </TouchableOpacity>

            {/* Informacion del titular de la cuenta */}
            <Text
              style={{
                ...styles.texto,
                color: "#333",
                fontWeight: "bold",
                marginLeft: 20,
                marginTop: 30,
              }}
            >
              Titular de la cuenta
            </Text>
            <TouchableOpacity
              onPress={() => handleCopy("Nombre")}
              style={{ ...styles.cuentaContainer, marginBottom: 30 }}
            >
              <Text style={styles.textContainer}>{usuario.titularCuenta}</Text>
              <Feather
                name="copy"
                size={20}
                color="gray"
                style={{ padding: 5 }}
              />
            </TouchableOpacity>
          </>
        )}

        {/* Informacion del titular de la cuenta */}
        <Text
          style={{
            ...styles.texto,
            color: "#333",
            fontWeight: "bold",
            marginLeft: 20,
          }}
        >
          Mensaje (opcional)
        </Text>
        <InputOnFocus
          returnKeyType={"default"}
          multiline={true}
          style={{ marginTop: 5, marginBottom: 5 }}
          numberOfLines={3}
          textAlignVertical={"top"}
          textStyle={{
            fontSize: 14,
            color: "#333",
            marginHorizontal: 20,
            padding: 5,
            borderRadius: 5,
            paddingLeft: 10,
            paddingTop: 10,
          }}
          onChangeText={setMessage}
          value={message}
        />

        {/* Informacion de la cuenta de retiros */}
        <Pressable onPress={() => setShowCuentaOpenpay(!showCuentaOpenpay)}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 20,
              paddingHorizontal: 20,
            }}
          >
            <Text
              style={{
                ...styles.texto,
                color: "#333",
                fontWeight: "bold",
                flex: 1,
              }}
            >
              Cuenta openpay de retiros
            </Text>
            <MaterialIcons
              name={
                ("keyboard-arrow-" +
                  (!showCuentaOpenpay ? "down" : "up")) as any
              }
              size={35}
              color={"#000"}
            />
          </View>
          {!!showCuentaOpenpay && (
            <InputOnFocus
              returnKeyType={"default"}
              style={{ marginTop: 5, marginBottom: 5 }}
              textAlignVertical={"top"}
              textStyle={{
                fontSize: 14,
                color: "#333",
                marginHorizontal: 20,
                padding: 5,
                borderRadius: 5,
                paddingLeft: 10,
                paddingTop: 10,
              }}
              onChangeText={setOpenPayRetiros}
              value={openPayRetiros}
            />
          )}
        </Pressable>
      </ScrollView>

      <Boton
        titulo="Confirmar"
        onPress={handleConfirmar}
        style={{
          margin: 20,
        }}
      />

      <Modal
        animationType={"none"}
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <OptionsModal
          setModalVisible={setModalVisible}
          titulo={"Contacto"}
          data={[
            {
              icon: () => (
                <FontAwesome name="whatsapp" size={24} color="black" />
              ),

              onPress: () => handleContacto("whatsapp"),
              titulo: "Whatsapp",
            },
            {
              icon: () => <Feather name="phone-call" size={24} color="black" />,

              onPress: () => handleContacto("telefono"),
              titulo: "Llamada",
            },
            {
              icon: () => <Entypo name="mail" size={24} color="black" />,

              onPress: () => handleContacto("email"),
              titulo: "Email",
            },
          ]}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  selector: {
    padding: 5,
    borderRadius: 10,
    backgroundColor: azulFondo,
    flexDirection: "row",
    margin: 20,
    marginTop: 10,
    marginBottom: 30,
  },
  selectorPressable: {
    padding: 10,
    borderRadius: 10,

    flex: 1,
    alignItems: "center",
  },

  usuarioContainer: {
    ...shadowBaja,
    backgroundColor: "#fff",
    padding: 10,
    margin: 20,
    marginBottom: 20,
  },

  textContainer: {
    flex: 1,

    padding: 5,
    paddingTop: 10,

    backgroundColor: "#fff",

    paddingLeft: 15,
    borderRadius: 5,
  },

  fotoUsuario: {
    borderRadius: 30,

    width: 50,
    aspectRatio: 1,
  },

  cuentaContainer: {
    marginHorizontal: 20,
    flexDirection: "row",

    borderWidth: 0.5,
    borderRadius: 5,

    alignItems: "center",

    borderColor: azulClaro,
  },

  contactoTxt: {
    color: rojoClaro,
    fontWeight: "bold",
    paddingVertical: 10,
  },

  monneyDueTxt: {
    alignSelf: "center",
    padding: 5,
    paddingHorizontal: 10,
    fontWeight: "bold",

    borderRadius: 5,
  },

  texto: {
    color: "#888",
    marginBottom: 5,
    backgroundColor: "#fff",
    paddingHorizontal: 2,
    fontSize: 13,
    fontWeight: "400",
  },
});
