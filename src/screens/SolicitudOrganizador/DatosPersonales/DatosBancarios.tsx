import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import HeaderSolicitud from "../components/HeaderSolicitud";
import AnimatedInput from "../../../components/AnimatedInput";
import Boton from "../../../components/Boton";
import {
  azulClaro,
  formatCuentaCLABE,
  isEmulator,
  produccion,
  shadowMedia,
  validateClabe,
  validateRFC,
} from "../../../../constants";
import { useNavigation } from "@react-navigation/native";
import useUser from "../../../Hooks/useUser";

import { AntDesign } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

import CardInput, { saveParams } from "../../../components/CardInput";
import CardElement from "../../../components/CardElement";
import stripeAccountOperations from "../../../../constants/stripeAccountOperations";
import { logger } from "react-native-logs";
import { DataStore } from "aws-amplify";
import { Usuario } from "../../../models";

export default function ({ route }: { route: any }) {
  // Notas, por ahora tenemos una opcion de pagar con tarjeta pero no se permite por los instant payouts
  const log = logger.createLogger();

  const navigation = useNavigation<any>();
  const { usuario, setUsuario, setLoading } = useUser();

  const [modalVisible, setModalVisible] = useState(false);
  let { cuentaBancaria: c, titularCuenta: tit, rfc: prevRfc } = usuario;

  const [ip, setIp] = useState("8.8.8.8");
  let prevDireccion =
    usuario.direccion && typeof usuario.direccion === "object"
      ? usuario.direccion
      : undefined;

  // Si estamos en desarrollo poner cuenta de prueba
  if (!produccion) {
    prevDireccion = prevDireccion
      ? prevDireccion
      : ({
          city: "Guadalajara",
          line1: "Patria",
          postal_code: "43020",
          state: "Jalisco",
        } as any);

    prevRfc = prevRfc ? prevRfc : "XAXX010101000";
    tit = tit ? tit : "NOMBRE PRUEBA";
    c = c ? c : "000000001234567897";
  }

  const [cuentaBancaria, setCuentaBancaria] = useState(
    c ? formatCuentaCLABE(c) : ""
  );

  const [accountType, setAccountType] = useState<"card" | "bank_account">(
    "bank_account"
  );

  const [clabeData, setClabeData] = useState(validateClabe(c));

  const [rfc, setRfc] = useState(prevRfc);
  const [direccion, setDireccion] = useState<{
    // Address
    city?: string;
    country?: string;
    line1?: string;
    postal_code?: string;
    state?: string;
  }>(prevDireccion);
  const [showFiscalData, setShowFiscalData] = useState(false);

  const [card, setCard] = useState<saveParams>();

  useEffect(() => {
    // Pedir la ip para aceptar terminos y condiciones
    (async () =>
      setIp(
        await fetch("https://api.ipify.org?format=json").then((r) =>
          r.json().then((r) => {
            return r.ip;
          })
        )
      ))();
  }, []);

  const nombreCompleto =
    route.params.nombre +
    " " +
    route.params.paterno +
    " " +
    route.params.materno;
  const [titularCuenta, setTitularCuenta] = useState(tit ? tit : "");

  const [error, setError] = useState("");

  async function handleSaveInfo() {
    // Crear un usuario local para agregarle todo
    const localUsr = {
      ...usuario,
      ...route.params,
    };

    // Detectar el tipo de pago
    if (accountType === "card") {
      if (!card) {
        Alert.alert("Error", "Agrega tu tarjeta para poder mandarte el dinero");
        return;
      }
    } else {
      if (!cuentaBancaria) {
        Alert.alert("Error", "Agrega tu CLABE para continuar");
        return;
      }

      // Verificar que la cuenta sea valida
      const stat = validateClabe(cuentaBancaria);
      if (stat.error) {
        setError(stat.message);
        return;
      }

      if (!titularCuenta) {
        Alert.alert("Error", "Agrega al titular de la cuenta");
        return;
      }
    }

    // Validar datos
    if (!localUsr.fechaNacimiento) {
      Alert.alert("Error", "No se encontro fecha de nacimiento");
      return;
    }

    // Si hay rfc, validarlo

    if (rfc && !validateRFC(rfc)) {
      Alert.alert("Error", "El RFC no es valido, vuelve a intentarlo");
      return;
    }

    // Quitar espacios
    let clabe = cuentaBancaria?.replace(/\D/g, "");

    // Fecha de aceptancia terminos
    const date = Math.round((new Date().getTime() - 1) / 1000);

    // Sacar la fecha de nacimiento en dia mes año
    const fechaNac = new Date(localUsr.fechaNacimiento);

    const day = fechaNac.getUTCDate();
    // Agregar 1 pues es 0 index based
    const month = fechaNac.getUTCMonth() + 1;
    const year = fechaNac.getUTCFullYear();
    let paymentAccountID = localUsr.paymentAccountID;
    const status: "update" | "create" = paymentAccountID ? "update" : "create";

    setLoading(true);
    try {
      // Si no hay cuenta en el usuario se crea
      if (status === "create") {
        paymentAccountID = await stripeAccountOperations(
          {
            email: localUsr.email,
            accountType,
            bank_account: {
              accountNumber: clabe,
              accountHolderName: titularCuenta,
            },
            card: {
              number: card?.number,
              cvc: card?.cvv,
              exp_month: card?.expiry.month,
              exp_year: card?.expiry.year,
            },

            phone: localUsr.phoneCode + localUsr.phoneNumber?.replace(/ /g, ""),

            first_name: localUsr.nombre,
            paterno: localUsr.paterno,
            materno: localUsr.materno,

            userSub: localUsr.id,

            // Fecha nacimiento persona / representante legal
            day,
            month,
            year,

            // Direccion del representante/empresa o personal
            city: direccion?.city,
            country: "MX",
            line1: direccion?.line1,
            postal_code: direccion?.postal_code,
            state: direccion?.state,

            // IP y fecha de terminos y condiciones
            date,
            ip,

            rfc,
          },
          "create"
        ).then(async (r) => {
          log.debug(r.body);

          return r.body.id;
        });
      } else {
        console.log("El localUsr tiene ID de stripe, actualizando...");

        // Actualizar datos actualizados en el perfil en stripe
        paymentAccountID = await stripeAccountOperations(
          {
            accountID: paymentAccountID,
            email: localUsr.email,
            accountType,
            bank_account: {
              accountNumber: clabe,
              accountHolderName: titularCuenta,
            },
            card: {
              number: card?.number,
              cvc: card?.cvv,
              exp_month: card?.expiry.month,
              exp_year: card?.expiry.year,
            },

            phone: localUsr.phoneCode + localUsr.phoneNumber?.replace(/ /g, ""),

            first_name: localUsr.nombre,
            paterno: localUsr.paterno,
            materno: localUsr.materno,

            userSub: usuario.id,

            // Fecha nacimiento persona / representante legal
            day,
            month,
            year,

            // Direccion del representante/empresa o personal
            city: direccion?.city,
            country: "MX",
            line1: direccion?.line1,
            postal_code: direccion?.postal_code,
            state: direccion?.state,

            // IP y fecha de terminos y condiciones
            date,
            ip,

            rfc,
          },
          "update"
        ).then(async (r) => {
          return r.body.id;
        });
      }

      const r = await DataStore.query(Usuario, usuario.id);
      // Actualizar datos agregados en base de datos
      await DataStore.save(
        Usuario.copyOf(r, (ne) => {
          ne.cuentaBancaria = clabe;
          ne.paymentAccountID = paymentAccountID;
        })
      );

      // Actualizar el usuario localmente para guardar datos que hayan puesto
      setUsuario({
        ...usuario,
        ...route.params,
        cuentaBancaria: clabe,
        titularCuenta: titularCuenta.toUpperCase(),

        rfc,
        direccion,
        paymentAccountID,
      });
      Alert.alert("Atencion", "La cuenta bancaria se guardo con exito.");
      setLoading(false);

      navigation.navigate("SolicitudOrganizador");
    } catch (error) {
      setLoading(false);
      log.debug(error);

      error = error.message
        ? error.message
        : error?.error
        ? error.error
        : error;

      Alert.alert("Error", "Ocurrio un error: " + error);
    }
  }

  const bankCity = clabeData?.city ? clabeData?.city : "";
  const bankName = clabeData?.bank ? clabeData?.bank : "";

  function handleAddCard(params: saveParams) {
    setCard(params);
    setModalVisible(false);
  }

  function validateBankAccount() {
    const cuentaSinEspacios = cuentaBancaria.replace(/ /g, "");
    // Verificar que la cuenta sea valida
    const stat = validateClabe(cuentaSinEspacios);
    if (stat.error) {
      setError(stat.message);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
      }}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <HeaderSolicitud
          titulo="¿Como te enviamos el dinero?"
          subTitulo="Agrega tu cuenta CLABE (Clave Bancaria Estandarizada) de 18 digitos para poder enviarte todo lo que recaudes "
        />

        {/* Seleccionar entre cuenta CLABE o tarjeta para payouts */}
        {/* <TopBarSelector
          data={[
            {
              title: "CLABE",
              onPress: async () => {
                setShowFiscalData(false);
                setAccountType("bank_account");
                setCard(undefined);
              },
            },
            {
              title: "Tarjeta",
              onPress: async () => {
                setShowFiscalData(false);
                setAccountType("card");
                setCuentaBancaria(undefined);
                setClabeData(validateClabe(""));
              },
            },
          ]}
        /> */}

        {accountType === "bank_account" ? (
          <>
            {/* CLABE */}
            <AnimatedInput
              styleContent={{
                marginTop: 40,
              }}
              keyboardType="decimal-pad"
              valid={!error}
              errorText={error}
              onFocus={() => setError("")}
              placeholder="CLABE"
              value={cuentaBancaria}
              onSubmitEditing={validateBankAccount}
              onChangeText={(r) => {
                const cuentaSinEspacios = r.replace(/ /g, "");

                if (cuentaSinEspacios.length >= 18) {
                  // Validar clabe y marcar error en caso de haberlo
                  // Verificar que la cuenta sea validaca
                  const stat = validateClabe(cuentaSinEspacios);
                  if (stat.error && stat.error !== "Invalid bank code: 000") {
                    setError(stat.message);
                  }
                } else {
                  setError("");
                }

                setCuentaBancaria(formatCuentaCLABE(r));
                setClabeData(validateClabe(r));
              }}
            />
            {bankName && !error && (
              <Text style={styles.bankTxt}>{bankName + " " + bankCity}</Text>
            )}
            <AnimatedInput
              style={{ marginBottom: 30 }}
              autoCapitalize={"characters"}
              placeholder="Titular de la cuenta"
              value={titularCuenta}
              onChangeText={setTitularCuenta}
            />
          </>
        ) : (
          <View>
            {/* Boton para agregar la tarjeta */}
            {!card?.number ? (
              <Pressable
                onPress={() => {
                  setModalVisible(true);
                }}
                style={styles.metodoDePago}
              >
                <View style={{ ...styles.iconoIzquierda }}>
                  <AntDesign name="creditcard" size={30} color="#aaa" />
                </View>

                <Text
                  style={{
                    ...styles.titulo,
                    color: "#aaa",
                  }}
                >
                  AGREGAR
                </Text>
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                  }}
                >
                  <Entypo name="plus" size={30} color={"#aaa"} />
                </View>
              </Pressable>
            ) : (
              <CardElement
                style={{
                  marginTop: 20,
                }}
                tarjeta={card}
                selected
                onPress={() => {
                  setModalVisible(true);
                }}
              />
            )}
          </View>
        )}

        <Pressable
          onPress={() => setShowFiscalData(!showFiscalData)}
          style={{
            ...styles.fiscalContainer,
            marginHorizontal: accountType === "bank_account" ? 0 : 10,
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.fiscalTxt}>Informacion fiscal</Text>
            <MaterialIcons
              name={
                ("keyboard-arrow-" + (showFiscalData ? "up" : "down")) as any
              }
              size={35}
              color={"#000"}
            />
          </View>
          {/* Contenido de text inputs */}
          {showFiscalData && (
            <View style={{ marginBottom: 20 }}>
              <AnimatedInput
                placeholder="Direccion (calle y numero)"
                value={direccion?.line1}
                onChangeText={(r: string) => {
                  setDireccion({
                    ...direccion,
                    line1: r,
                  });
                }}
              />

              <AnimatedInput
                placeholder="Codigo postal"
                keyboardType="numeric"
                value={direccion?.postal_code}
                onChangeText={(r: string) => {
                  setDireccion({
                    ...direccion,
                    postal_code: r,
                  });
                }}
              />

              <AnimatedInput
                style={{ marginTop: 0 }}
                placeholder="Ciudad"
                value={direccion?.city}
                onChangeText={(r: string) => {
                  setDireccion({
                    ...direccion,
                    city: r,
                  });
                }}
              />

              <AnimatedInput
                placeholder="Estado"
                value={direccion?.state}
                onChangeText={(r: string) => {
                  setDireccion({
                    ...direccion,
                    state: r,
                  });
                }}
              />

              <AnimatedInput
                placeholder="RFC"
                value={rfc}
                onChangeText={setRfc}
              />
            </View>
          )}
        </Pressable>
      </ScrollView>
      <Boton
        style={{
          backgroundColor: azulClaro,
          margin: 20,
        }}
        titulo="Guardar informacion"
        onPress={handleSaveInfo}
      />

      {modalVisible && (
        <Modal
          animationType={"none"}
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            console.log("Request close");
            setModalVisible(false);
          }}
        >
          <CardInput
            comprasFuturasDisabled
            onAdd={handleAddCard}
            setModalVisible={setModalVisible}
            prevCard={
              card
                ? card
                : {
                    name: nombreCompleto,
                  }
            }
          />
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    flex: 1,
  },
  bankTxt: {
    color: azulClaro,
    fontSize: 16,
    marginTop: 0,
    marginBottom: 10,
    top: -10,
  },

  inputContainer: {
    marginBottom: 20,
  },

  metodoDePago: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    padding: 10,
    paddingVertical: 15,
    backgroundColor: "#fff",
    ...shadowMedia,
    marginHorizontal: 5,
    marginBottom: 20,
  },

  iconoIzquierda: {
    width: 55,
    alignItems: "center",
    marginRight: 20,
  },

  titulo: {
    fontSize: 18,
    color: "#AAA",
    fontWeight: "bold",
    flex: 1,
  },

  tituloInput: {
    marginTop: 40,
    marginBottom: 20,
    fontSize: 20,
    fontWeight: "bold",
  },

  fiscalContainer: {
    padding: 0,
    margin: 10,
    backgroundColor: "#fff",
    marginTop: 40,
  },

  fiscalTxt: { fontSize: 16, flex: 1 },
});
