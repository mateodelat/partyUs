import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Entypo } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

import ElementoPersonas from "./ElementoPersonas";

import Boton from "../../../components/Boton";
import { NavigationProp } from "../../../shared/interfaces/navigation.interface";
import {
  fetchFromAPI,
  formatAMPM,
  formatDateShort,
  formatMoney,
  getCardIcon,
  getUserSub,
  precioConComision,
  rojo,
  shadowMedia,
  rojoClaro,
  azulClaro,
  AsyncAlert,
  vibrar,
  VibrationType,
  msInHour,
  abrirTerminos,
  sendNotifications,
  sendAdminNotification,
  fetchFromStripe,
  log,
  currency,
  msInDay,
  getWorkingDays,
} from "../../../../constants";

import { BoletoType } from "../Boletos";
import { EventoType } from "../Home";
import { Cupon, Usuario } from "../../../models";

import Header from "../../../navigation/components/Header";
import uuid from "react-native-uuid";
import { saveParams } from "../../../components/CardInput";

import useUser from "../../../Hooks/useUser";
import { DataStore } from "aws-amplify";
import { TipoNotificacion } from "../../../models";
import { Notificacion } from "../../../models";
import { notificacionesRecordatorio } from "../Notifications/functions";
import { TipoPago } from "../../../models";
import WebView from "react-native-webview";

import Stripe from "stripe";
import { cardBrand_type } from "../../../../types/stripe";
import CardInput from "../../../components/CardInput";
import RadioButton from "../../../components/RadioButton";
import Loading from "../../../components/Loading";
import HeaderModal from "../../../components/HeaderModal";
export default function Pagar({
  route,
  navigation,
}: {
  route: {
    params: EventoType & {
      total: number;

      // Verificar que lo que se calcula en la base de datos coincide con el de la nube
      comision: number;
      enviarACreador: number;

      boletos: BoletoType[];
      imagenes: {
        uri: string;
        key: string;
      }[];
      descuento?: Cupon;
    };
  };
  navigation: NavigationProp;
}) {
  const {
    total,
    imagenes,
    imagenPrincipalIDX,
    titulo,
    fechaInicial,
    enviarACreador,
    comision,

    comisionPercent,
    creator,
    descuento,
    id: eventoID,
    CreatorID,
  } = route.params;

  type cardType = Omit<Stripe.Card, "id"> & { id: Promise<string> };

  const boletos = route.params.boletos.filter((e: any) => e.quantity);

  const [modalVisible, setModalVisible] = useState(false);

  const [threedvisible, setThreedvisible] = useState(false);
  const [threedsecure, setThreedsecure] = useState<{
    uri?: string;
    redirectUrl?: string;
  }>({});

  const [paymentIntentID, setPaymentIntentID] = useState("");

  const [webViewLoading, setWebViewLoading] = useState(false);

  const { setNewNotifications, usuario, setLoading, setUsuario } = useUser();

  // Opciones que se llenan cuando damos agregar tarjeta
  const [tarjetasGuardadas, setTarjetasGuardadas] = useState<cardType[]>([]);

  // Borrar metodos de pago
  const [editing, setEditing] = useState(false);

  // Correo electronico para enviar recibo
  const [correoElectronicoEnabled, setCorreoElectronicoEnabled] =
    useState(false);

  const [tipoPago, setTipoPago] = useState<"EFECTIVO" | number>();

  // UI del boton
  const [buttonLoading, setButtonLoading] = useState(false);

  const [sub, setSub] = useState<string>();

  const res = uuid.v4() as string;
  // La pongo en estado para evitar que se cambie al actualizar
  const [reservaID, setReservaID] = useState(res);

  useEffect(() => {
    getUserSub().then(setSub);

    // Obtener tarjetas del cliente guardadas desde backend
    getUserCards();
    setReservaID(res);

    setButtonLoading(false);
    setLoading(false);
  }, []);

  ///////////////////////////////////////////////////////////////
  /////////////////////////FUNCIONES/////////////////////////////
  ///////////////////////////////////////////////////////////////

  async function notificacionesOrganizador(
    tipoPago: TipoPago,
    personasTotales: number
  ) {
    const organizador = await DataStore.query(Usuario, CreatorID);
    if (!organizador) {
      console.log(
        "Error",
        "No hay organizador para el evento, no se pudo obtener el token"
      );
    }

    // Mandarle las notificaciones a los administradores que tengan habilitadas las notificaciones de reservacion
    sendAdminNotification({
      titulo: "Nueva reserva",
      eventoID,
      sender: usuario,
      organizadorID: usuario.id,

      descripcion:
        " creo una nueva reserva en " +
        tipoPago.toLowerCase() +
        " del evento:" +
        titulo +
        " para " +
        personasTotales +
        " personas",
    });

    sendNotifications({
      titulo: "Nueva reserva",
      descripcion:
        (tipoPago === TipoPago.TARJETA
          ? "Has recibido un pago de reserva en "
          : "Tienes una nueva reserva en ") +
        titulo +
        " de " +
        usuario.nickname +
        " por " +
        personasTotales +
        " personas",

      tipo: TipoNotificacion.RESERVAENEVENTO,
      usuarioID: CreatorID,

      showAt: new Date().toISOString(),
      triggerTime: 0,

      eventoID: eventoID,
      organizadorID: CreatorID,
      reservaID: reservaID,

      externalToken: organizador.notificationToken,
    });
  }

  function getUserCards() {
    if (usuario.paymentClientID) {
      fetchFromAPI<Stripe.PaymentMethod[]>({
        path: "/payments/card/" + usuario.paymentClientID,
        type: "GET",
      })
        .then((r) => {
          if (r.error) {
            throw r;
          } else {
            //  Mapear atributos para transformar a tipo Stripe.Card solo con lo que lee el cliente
            const cards = r.body.map((e) => {
              const {
                id,
                billing_details: { name },
              } = e;

              const { brand, exp_year, exp_month, last4 } = e.card;

              return {
                id,
                brand,
                exp_month,
                exp_year,
                last4,
                name,
              } as any;
            });

            setTarjetasGuardadas(cards);
          }
        })
        .catch((e) => {
          log(e);
          Alert.alert(
            "Error",
            "Hubo un error obteniendo las tarjetas guardadas, puedes continuar sin problema"
          );
        });
    }
  }

  // Action tras darle click a agregar metodo de pago
  const handleAddPaymentMethod = async () => {
    setEditing(false);
    setModalVisible(true);
  };

  // Funcion para confirmar el pago 3d secure en cuanto el usuario confirma su payment intent en el webview
  async function handleConfirm3dSecure() {
    setButtonLoading(true);
    setLoading(true);

    try {
      // Confirmar el paymentIntent con todos los parametros a validar
      const result = await fetchFromAPI<Stripe.PaymentIntent>({
        path: "/reservas/confirmReserva/" + paymentIntentID,
        type: "GET",
      });

      log(result);

      setButtonLoading(false);
      setLoading(false);

      // Si se recibe error del confirmar pago
      if (result.error) {
        throw result.error;
      }

      Alert.alert("Exito", "La reserva se efectuo con exito!!");
    } catch (error) {
      setButtonLoading(false);
      setLoading(false);

      if (typeof error !== "string") {
        error = JSON.stringify(error);
      }

      log(error);

      if (
        (error as String).search(
          "The provided PaymentMethod has failed authentication"
        ) > -1
      ) {
        // Poner en español el mensaje de error mas comun
        error = "La verificacion de seguridad bancaria ha fallado";
      }

      setTipoPago(undefined);

      Alert.alert("Error", "Hubo un error confirmando tu pago: \n" + error);
      return;
    }

    // Mandar notificaciones de exitoso para tarjeta
    sendSucessNotifications();

    navigation.popToTop();
    navigation.navigate("ExitoScreen", {
      txtExito: "Reserva creada",
      descripcion:
        "Se ha creado tu reserva con exito. Puedes consultar tu qr en Perfil - Mis reservas",
      onPress: () => {
        navigation.popToTop();
        navigation.navigate("Perfil");
        navigation.navigate("MisReservas", { reservaID });
      },
      txtOnPress: "Ver boleto",
    });
  }

  // Fecha de expiracion pagos en efectivo
  // Calcular fecha de expiracion
  let limitDate = new Date();

  // Restarle 6 horas al UTC para estar en UTC-6 (Mexico central)
  limitDate.setTime(limitDate.getTime() - 6 * 3600 * 1000);

  // Poner la hora a las (23:59:59) de el dia de hoy en UTC-6
  limitDate.setUTCHours(23);
  limitDate.setUTCMinutes(59);
  limitDate.setUTCSeconds(59);
  limitDate.setUTCMilliseconds(999);

  const diasHabiles = 1;
  let efectivoDeny;

  // Si los dias laborales entre fecha limite y fecha inicial no es de 1 minimo dar error
  if (getWorkingDays(limitDate, new Date(fechaInicial)) < 1) {
    efectivoDeny = true;
  }

  // Sumarle 1 dia habil (Lo que tarda en procesarse pagos en oxxo)
  limitDate = new Date(limitDate.getTime() + msInDay * diasHabiles);

  // Fecha inicial tiene que ser mayor a la fecha limite de pago mas dias habiles
  efectivoDeny = limitDate.getTime() > fechaInicial;

  const personasTotales = boletos.reduce(
    (prev, a: any) => prev + a.quantity,
    0
  );

  const handleConfirm = async () => {
    let tarjetaID: undefined | string;
    if (total !== 0) {
      if (tipoPago === undefined) {
        Alert.alert("Error", "Agrega un metodo de pago para continuar");
        return;
      }
      if (tipoPago !== "EFECTIVO") {
        const tarjeta = tarjetasGuardadas[tipoPago];
        tarjetaID = await tarjeta.id;

        if (typeof tarjetaID !== "string") {
          Alert.alert("Error", "No se pudo obtener el id de la tarjeta");
          return;
        }
      }

      // Mensaje de confirmacion de pago en efectivo
      if (
        tipoPago === "EFECTIVO" &&
        !(await AsyncAlert(
          "Pago en efectivo",
          "Esto generara un voucher para pagar el boleto en un oxxo. ¿Quieres continuar?"
        ))
      )
        return;
    }

    // Si el propio organizador se quiere pagar en su evento
    if (
      sub === CreatorID &&
      !(await AsyncAlert(
        "Atencion",
        "Este es tu evento, quieres reservar aqui mismo?"
      ))
    ) {
      return;
    }
    setButtonLoading(true);
    setLoading(true);
    try {
      // Crear el payment intent en la nube
      const result = await fetchFromAPI<{
        success: boolean;
        paymentIntent?: Stripe.PaymentIntent;
      }>({
        path: "/reservas/createReserva",
        type: "POST",
        input: {
          boletos: boletos.map((e: any) => ({
            quantity: e.quantity,
            id: e.id,
          })),
          cuponID: descuento?.id ? descuento.id : undefined,
          eventoID,
          organizadorID: CreatorID,
          usuarioID: sub,
          reservaID: reservaID,
          // Se pone en efectivo o se tiene un descuento de 100 (total = 0)
          tipoPago:
            tipoPago === "EFECTIVO"
              ? TipoPago.EFECTIVO
              : total === 0
              ? TipoPago.EFECTIVO
              : TipoPago.TARJETA,
          receipt_email: correoElectronicoEnabled ? usuario.email : undefined,

          sourceID: tarjetaID,
          enviarACreador,
          comision,
          total,
        },
      });

      if (result.error) {
        throw result.error;
      }
      setButtonLoading(false);
      setLoading(false);

      // Si nos devuelve el objeto payment intent con redirect to url manejarlo, es 3d secure
      if (result.body?.paymentIntent?.next_action?.type === "redirect_to_url") {
        // Obtener ID de payment intent a asignar localmente para confirmarlo despues
        setPaymentIntentID(result.body.paymentIntent.id);

        // Hacer visible el modal de 3d secure
        setThreedvisible(true);

        // Actualizar estado local de 3d secure
        setThreedsecure({
          uri: result.body.paymentIntent.next_action?.redirect_to_url?.url,
          redirectUrl:
            result.body.paymentIntent.next_action?.redirect_to_url?.return_url,
        });

        return;

        // Si no estuvo completada la reserva y no tenemos redirect to url, dar error de inesperado
        // ( Pago no es con tarjeta, oxxo o 3d)
      } else if (!result?.body?.success) {
        log(result);
        Alert.alert(
          "Error",
          "Ocurrio un error inesperado, contactanos para solucionarlo"
        );
        return;
      }

      log(result);

      setButtonLoading(false);
      setLoading(false);

      // Si pedimos tipo pago con oxxo mostrar el voucher de pago en oxxo
      if (tipoPago === "EFECTIVO" && total !== 0) {
        // Si no se tiene el voucher de oxxo, dar error
        if (!result?.body?.paymentIntent?.next_action?.oxxo_display_details) {
          Alert.alert("Error", "No se obtuvo el voucher para pagar en oxxo");
        }

        const { number, expires_after: limit } =
          result.body.paymentIntent.next_action.oxxo_display_details;

        let limitDate = new Date(limit);

        // Agergar las 6 horas que se quitan en el servidor (Mexico central)
        limitDate.setTime(limitDate.getTime() + 6 * 3600 * 1000);

        vibrar(VibrationType.sucess);

        // Mandar notificaciones de exitoso
        sendSucessNotifications();

        navigation.popToTop();
        navigation.navigate("Perfil");
        navigation.navigate("MisReservas");
        // Si el tipo de pago fue en efectivo, obtener la referencia y navegar a la pestaña pago
        navigation.navigate("ReferenciaPago", {
          amount: total,
          titulo,
          codebar: {
            number,
          },
          limitDate: limitDate.getTime(),
        });
        Alert.alert(
          "Exito",
          "Tu reserva se creo con exito, tienes hasta las " +
            formatAMPM(limitDate) +
            " para pagar tu boleto y que sea valido"
        );

        return;
      }

      // Mandar notificaciones de exitoso para tarjeta
      sendSucessNotifications();

      navigation.popToTop();
      navigation.navigate("ExitoScreen", {
        txtExito: "Reserva creada",
        descripcion:
          "Se ha creado tu reserva con exito. Puedes consultar tu qr en Perfil - Mis reservas",
        onPress: () => {
          navigation.popToTop();
          navigation.navigate("Perfil");
          navigation.navigate("MisReservas", { reservaID });
        },
        txtOnPress: "Ver boleto",
      });
    } catch (error: any) {
      setButtonLoading(false);
      setLoading(false);

      if (typeof error !== "string") {
        error = JSON.stringify(error);
      }

      setTipoPago(undefined);

      Alert.alert("Error", "Hubo un error guardando la reserva: \n" + error);
    }
  };

  // Funcion para mandar todas las notificaciones de exito al cliente, organizadores y admins
  async function sendSucessNotifications() {
    // Notificacion de reserva exitosa
    DataStore.save(
      new Notificacion({
        tipo: TipoNotificacion.RESERVAEFECTIVOCREADA,
        titulo: "Reserva exitosa",
        descripcion:
          `Tu reserva en ${titulo}${
            personasTotales !== 1 ? " con " + personasTotales + " personas" : ""
          } se ha creado con exito. ` +
            tipoPago ===
          TipoPago.EFECTIVO
            ? `Realiza el pago antes del ${
                formatDateShort(limitDate) + " a las " + formatAMPM(limitDate)
              } para confirmar tu lugar.`
            : " Has click aqui para ver tu boleto de entrada",
        usuarioID: sub,

        showAt: new Date().toISOString(),

        reservaID,
        eventoID,
        organizadorID: CreatorID,
      })
    );

    // Mandarle la notificacion cuando vaya a expirar su reserva solo si es tipo pago efectivo
    tipoPago === TipoPago.EFECTIVO &&
      DataStore.save(
        new Notificacion({
          tipo: TipoNotificacion.RECORDATORIOPAGO,
          titulo: "Recordatorio pago",
          descripcion: `Atencion, la fecha limite de pago en efectivo para ${titulo} es en menos de 1 hora`,
          usuarioID: sub,

          showAt: new Date(limitDate.getTime() - msInHour).toISOString(),

          reservaID,
          eventoID,
          organizadorID: CreatorID,
        })
      );
    // Mandar notificaciones de recordatorio
    notificacionesRecordatorio({ evento: route.params, usuario });

    // Mandar notificaciones al organizador
    notificacionesOrganizador(
      tipoPago === "EFECTIVO" ? TipoPago.EFECTIVO : TipoPago.TARJETA,
      personasTotales
    );

    console.log("Nueva notificacion agregada al contador");
    setNewNotifications(
      (prev) => prev + (tipoPago === TipoPago.EFECTIVO ? 2 : 1)
    );
  }

  async function handleEditPayments() {
    setEditing(!editing);
    setTipoPago(undefined);
  }

  async function handleAddCard(r: saveParams) {
    setEditing(false);

    // Sacar el index a donde se agrega la tarjeta por si no es valida
    const idx = tarjetasGuardadas.length;

    try {
      setButtonLoading(true);

      // Guardar el codigo postal del usuario si no tiene y se envio codigo postal de la tarjeta
      if (!(usuario.direccion as any)?.postal_code && r.postalCode) {
        console.log(
          "El cliente no tiene codigo postal, agregando el de la tarjeta"
        );

        const direccion = {
          ...(usuario.direccion as Object),
          postal_code: r.postalCode,
        } as any;

        // Guardar en datastore
        const us = await DataStore.query(Usuario, usuario.id);
        DataStore.save(
          Usuario.copyOf(us, (mut) => {
            mut.direccion = direccion;
          })
        );

        // Guardar localmente
        setUsuario({
          ...usuario,
          direccion,
        });
      }

      setTipoPago(
        tarjetasGuardadas.length !== 0 ? tarjetasGuardadas.length : 0
      );
      const len = r.number.length;
      const last4 = r.number.slice(len - 4, len);

      // Si tenemos la direccion del usuario, ponerla en la tarjeta
      const { direccion } = usuario;

      // Obtener informacion de la direccion
      const state = (direccion as any)?.state
        ? (direccion as any)?.state
        : undefined;
      const city = (direccion as any)?.city
        ? (direccion as any)?.city
        : undefined;
      const line1 = (direccion as any)?.line1
        ? (direccion as any)?.line1
        : undefined;

      const numeroCompleto =
        usuario.phoneCode && usuario.phoneNumber
          ? usuario.phoneCode + usuario.phoneNumber
          : undefined;

      // Guardar el token de la tarjeta en stripe directo con la Publisable key
      const paymentMethodID = await fetchFromStripe<Stripe.Token>({
        path: "/v1/tokens",
        type: "POST",
        input: {
          card: {
            object: "card",

            name: r.name,
            number: r.number,
            exp_month: r.expiry.month,
            exp_year: r.expiry.year,
            cvc: r.cvv,
            address_zip: r.postalCode,
            address_state: state,
            address_line1: line1,
            address_city: city,
            address_country: "MX",

            currency,
          },
        } as Stripe.TokenCreateParams,
      })
        .then(async (c) => {
          const tokenID = c.id;

          // Guardar token como metodo de pago en stripe con la publishable key
          const paymentMethodID = await fetchFromStripe<Stripe.PaymentMethod>({
            path: "/v1/payment_methods",
            type: "POST",
            input: {
              type: "card",
              card: { token: tokenID },
              billing_details: {
                address: {
                  postal_code: r.postalCode,
                  state: state,
                  line1: line1,
                  city: city,
                  country: "MX",
                },
                email: usuario.email,
                name: r.name,
                phone: numeroCompleto,
              },
            } as Stripe.PaymentMethodCreateParams,
          }).then((r) => {
            return r.id;
          });

          // Attachear metodo de pago al cliente si se pone guardar para compras futuras sin esperar que se resuelva
          if (r.saveCard) {
            fetchFromAPI<Stripe.PaymentMethod>({
              path: "/payments/card",
              type: "POST",
              input: {
                customerID: usuario.paymentClientID,
                paymentMethodID,
              },
            }).catch((e) => {
              log(e);
              // Si el error viene de stripe, eliminarla
              Alert.alert("Error", "Error guardando tarjeta: " + e);

              // Borrar de la lista
              setTarjetasGuardadas((prev) => {
                let neCards = [...prev];

                neCards.splice(idx, 1);
                return neCards;
              });
            });
          }

          return paymentMethodID;
        })
        .catch((e) => {
          log(e);
          Alert.alert("Error", "Error guardando tarjeta: " + e);

          // Borrar de la lista
          setTarjetasGuardadas((prev) => {
            let neCards = [...prev];

            neCards.splice(idx, 1);
            return neCards;
          });
        });

      setButtonLoading(false);
      if (!paymentMethodID) {
        return;
      }

      setTarjetasGuardadas([
        ...tarjetasGuardadas,
        {
          id: paymentMethodID,
          name: r.name,
          last4,
          exp_month: r.expiry.month,
          exp_year: r.expiry.year,
          brand: r.type,
        } as any,
      ]);
    } catch (error: any) {
      setButtonLoading(false);
      Alert.alert(
        "Error",
        "Ocurrio un error guardando la tarjeta" +
          (error.message ? error.message : "")
      );
      console.log(error);
    }

    setButtonLoading(false);
  }

  async function handleRemovePayment(idx: number) {
    const card = tarjetasGuardadas[idx];
    const cardID = await card.id;
    try {
      setTarjetasGuardadas(() => {
        if (cardID) {
          if (!usuario.paymentClientID) {
            console.log("No hay payment ID para ese usuario");
            return;
          } else {
            fetchFromAPI({
              path: "/payments/card/" + cardID,
              type: "DELETE",
            }).catch((e) => {
              console.log(e);
              Alert.alert("Error", "Error borrando tarjeta");
            });
          }
        } else {
          console.log("No hay tarjeta ID");
        }

        let neCards = [...tarjetasGuardadas];
        neCards.splice(idx, 1);
        return [...neCards];
      });
    } catch (error) {
      log(error);
      Alert.alert("Error", "Ocurrio un error guardando la tarjeta");
      // Volver a poner la tarjeta en la lista
      setTarjetasGuardadas((prev) => {
        let neCards = [...prev];
        neCards.push(card);

        return neCards;
      });
    }
  }

  let { height, width } = Dimensions.get("screen");
  height = height > width ? height : width;

  return (
    <View style={styles.container}>
      <Header
        title={"Pagar"}
        style={{ paddingHorizontal: 5 }}
        showHelp={true}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            minHeight: height - 255,
          }}
        >
          {/* Mostrar la aventura a pagar */}
          <View
            style={[
              styles.innerContainer,

              {
                flexDirection: "row",
                marginBottom: 0,
              },
            ]}
          >
            <Image
              source={{
                uri: imagenes[imagenPrincipalIDX ? imagenPrincipalIDX : 0].uri,
              }}
              style={styles.imgLogo}
            />

            <View style={styles.adventureTextContainer}>
              <View style={{ ...styles.row, marginTop: 0 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 16,
                    flex: 1,
                  }}
                >
                  {titulo}
                </Text>
                {/* Calificacion guia */}
                {creator?.verified ? (
                  <Octicons
                    name="verified"
                    size={20}
                    color={rojoClaro}
                    onPress={() =>
                      Alert.alert(
                        "Verificado",
                        "El organizador de este evento esta verificado por partyUs"
                      )
                    }
                  />
                ) : (
                  creator?.calificacion && (
                    <View
                      style={{ ...styles.row, marginTop: 0, marginLeft: 10 }}
                    >
                      <Entypo name="star" size={16} color="#F5BE18" />
                      <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                        {creator.calificacion}
                      </Text>
                    </View>
                  )
                )}
              </View>

              {/* Descripcion fecha */}
              <Text style={{ fontSize: 12, marginTop: 10 }} numberOfLines={2}>
                {formatDateShort(fechaInicial) + " " + formatAMPM(fechaInicial)}
              </Text>

              <View style={styles.row}>
                {/* Guia */}
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ color: azulClaro }}>@{creator?.nickname}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.innerContainer, { padding: 15, paddingTop: 5 }]}>
            {boletos.map((e: BoletoType, index: number) => {
              const precioIndividualConComision = precioConComision(
                e.precio,
                comisionPercent
              );

              if (!e.quantity) return <View key={index} />;

              return (
                <View key={index}>
                  <ElementoPersonas
                    precio={precioIndividualConComision}
                    titulo={e.titulo ? e.titulo : ""}
                    cantidad={e.quantity ? e.quantity : 0}
                  />

                  <View style={styles.line} />
                </View>
              );
            })}

            {/* Descuentos */}
            {descuento && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 10,
                }}
              >
                <Text style={{ ...styles.titulo, fontWeight: "bold" }}>
                  Descuento
                </Text>
                <Text style={styles.precioTotal}>
                  {"-"}
                  {descuento.porcentajeDescuento
                    ? descuento.porcentajeDescuento * 100 + "%"
                    : formatMoney(descuento.cantidadDescuento)}
                </Text>
              </View>
            )}

            {/* Precio total*/}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 10,
              }}
            >
              <Text style={{ ...styles.titulo, fontWeight: "bold" }}>
                Total
              </Text>
              <Text style={styles.precioTotal}>{formatMoney(total)}</Text>
            </View>
          </View>

          {/* Metodos de pago */}
          {total || total > 0 ? (
            <>
              <View style={styles.paymentContainer}>
                {
                  // Si no hay tarjetas guardadas poner agregar tarjeta
                  !tarjetasGuardadas.length ? (
                    <>
                      <Pressable
                        onPress={() => {
                          setTipoPago(undefined);
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
                          TARJETA
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
                      <View style={styles.line} />
                    </>
                  ) : (
                    <View>
                      {/* Header con agregar tarjeta y configuracion pagos */}
                      <View
                        style={{
                          ...styles.row,
                        }}
                      >
                        <TouchableOpacity
                          disabled={editing}
                          onPress={
                            !editing ? (handleEditPayments as any) : undefined
                          }
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              color: azulClaro,
                              padding: 20,
                              paddingVertical: 10,
                              fontWeight: "bold",
                            }}
                          >
                            {editing ? "TARJETAS" : "EDITAR"}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={
                            editing
                              ? () => setEditing(false)
                              : handleAddPaymentMethod
                          }
                        >
                          {editing ? (
                            <Entypo
                              style={{
                                padding: 10,
                                paddingBottom: 6,
                                paddingRight: 18,
                              }}
                              name="check"
                              size={25}
                              color={azulClaro}
                            />
                          ) : (
                            <Entypo
                              style={{
                                marginRight: 15,
                              }}
                              name="plus"
                              size={30}
                              color={azulClaro}
                            />
                          )}
                        </TouchableOpacity>
                      </View>

                      {/* Mapeo de tarjetas guardadas */}
                      {tarjetasGuardadas.map((tarjeta, idx: number) => {
                        let { last4, brand, name, exp_month, exp_year } =
                          tarjeta;

                        exp_month = String(exp_month).padStart(2, "0") as any;

                        let exp_yearS = String(exp_year);
                        exp_yearS = exp_yearS.slice(
                          exp_yearS.length - 2,
                          exp_yearS.length
                        ) as any;

                        const icon = getCardIcon(brand as cardBrand_type);

                        return (
                          <View key={idx}>
                            <Pressable
                              onPress={() => {
                                !editing && setTipoPago(idx);
                              }}
                              style={styles.metodoDePago}
                            >
                              <View style={styles.iconoIzquierda}>
                                {editing ? (
                                  <Entypo
                                    style={{}}
                                    name="minus"
                                    size={30}
                                    color={rojo}
                                    onPress={() => handleRemovePayment(idx)}
                                  />
                                ) : (
                                  <Image
                                    style={{
                                      height: 30,
                                      resizeMode: "contain",
                                      width: 40,
                                    }}
                                    source={
                                      icon
                                        ? icon
                                        : require("../../../../assets/icons/stp_card_undefined.png")
                                    }
                                  />
                                )}
                              </View>

                              {/* Numero de la tarjeta y tarjetahabiente */}
                              <View style={{ flex: 1 }}>
                                <Text
                                  style={{
                                    ...styles.titulo,
                                    color: tipoPago === idx ? "#222" : "#aaa",
                                  }}
                                >
                                  **** **** **** {last4}
                                </Text>
                                {name ? (
                                  <Text
                                    style={{
                                      ...styles.tarjetahabiente,
                                      color: tipoPago === idx ? "#777" : "#ddd",
                                    }}
                                  >
                                    {name?.toUpperCase()} {exp_month}/
                                    {exp_yearS}
                                  </Text>
                                ) : (
                                  <Text
                                    style={{
                                      ...styles.tarjetahabiente,
                                      color: tipoPago === idx ? "#777" : "#ddd",
                                    }}
                                  >
                                    Expira el {exp_month}/{exp_yearS}
                                  </Text>
                                )}
                              </View>
                              <View
                                style={{
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: 30,
                                  height: 30,
                                }}
                              >
                                {tipoPago === idx && (
                                  <Entypo
                                    name="check"
                                    size={30}
                                    color={rojoClaro}
                                  />
                                )}
                              </View>
                            </Pressable>

                            <View
                              style={{
                                borderColor: "#aaa",
                                borderBottomWidth: 1,
                                marginHorizontal: 30,
                              }}
                            />
                          </View>
                        );
                      })}
                    </View>
                  )
                }

                <Pressable
                  onPress={() => {
                    // Si se niegan pagos en efectivo mostrar alerta
                    if (efectivoDeny) {
                      Alert.alert(
                        "Error",
                        "Para pagar en oxxo se necesitan 2 dias habiles para el procesamiento del pago. Puedes hacer tu reserva con tarjeta"
                      );
                      return;
                    }

                    setTipoPago("EFECTIVO");
                  }}
                  style={styles.metodoDePago}
                >
                  <View
                    style={{ ...styles.iconoIzquierda, overflow: "hidden" }}
                  >
                    <Image
                      style={{
                        height: 30,
                        resizeMode: "contain",
                        width: 40,
                        opacity: efectivoDeny ? 0.3 : 1,
                      }}
                      source={require("../../../../assets/IMG/Oxxo_Logo.png")}
                    />
                  </View>

                  <Text
                    style={{
                      ...styles.titulo,
                      color: tipoPago === "EFECTIVO" ? "#222" : "#aaa",
                    }}
                  >
                    EFECTIVO
                  </Text>
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      width: 30,
                      height: 30,
                    }}
                  >
                    {tipoPago === "EFECTIVO" && (
                      <Entypo name="check" size={30} color={rojoClaro} />
                    )}
                  </View>
                </Pressable>
              </View>

              {/* Terminos y condiciones */}
              <Text onPress={abrirTerminos} style={styles.textoTerminos}>
                Al continuar aceptas los{" "}
                <Text style={{ color: azulClaro }}>terminos y condiciones</Text>{" "}
                de partyus
              </Text>

              {/* Recibo por correo */}
              <Pressable
                onPress={() =>
                  setCorreoElectronicoEnabled(!correoElectronicoEnabled)
                }
                style={{
                  ...styles.row,
                  paddingHorizontal: 30,
                  paddingVertical: 10,
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    ...styles.titulo,
                    color: correoElectronicoEnabled ? azulClaro : "#aaa",
                  }}
                >
                  Recibo por correo
                </Text>

                <RadioButton checked={correoElectronicoEnabled} />
              </Pressable>
            </>
          ) : null}
        </View>
      </ScrollView>
      <View style={{ flex: 1 }} />

      <Boton
        loading={buttonLoading}
        titulo={"Confirmar"}
        onPress={handleConfirm}
        color={rojoClaro}
        style={{
          margin: 20,
        }}
      />

      {/* 3D secure en caso de tenerlo en el estado */}
      <Modal
        transparent={true}
        visible={!!threedvisible}
        onRequestClose={() => {
          setThreedvisible(false);
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
          }}
        >
          <HeaderModal
            noInsets
            titulo="Verificación bancaria"
            onPress={() => setThreedvisible(false)}
          />

          {threedsecure?.uri && (
            <WebView
              onLoad={() => setWebViewLoading(false)}
              renderLoading={() => <Loading indicator />}
              onLoadStart={() => setWebViewLoading(true)}
              source={{ uri: threedsecure.uri }}
              onNavigationStateChange={(e) => {
                // Si ya estamos en el url de redireccionamiento, cerrar el modal y poner estado en completed localmente
                if (e.url.search(threedsecure.redirectUrl) !== -1) {
                  // Cerrar el modal
                  setThreedvisible(false);

                  // Ir a confirm reserva
                  handleConfirm3dSecure();
                }
              }}
            />
          )}

          {/* Cargando el 3d secure */}
          {webViewLoading && (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                ...StyleSheet.absoluteFillObject,
              }}
            >
              <Loading indicator />
            </View>
          )}
        </View>
      </Modal>

      <Modal
        animationType={"none"}
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <CardInput onAdd={handleAddCard} setModalVisible={setModalVisible} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },

  innerContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 20,
    marginBottom: 20,
    minHeight: 100,
    ...shadowMedia,

    alignItems: "center",
  },

  modalContainer: {
    backgroundColor: "#fff",
  },

  imgLogo: {
    flex: 2,
    height: "100%",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    resizeMode: "contain",
  },

  adventureTextContainer: {
    padding: 10,
    paddingVertical: 15,
    paddingRight: 15,
    flex: 3,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    justifyContent: "space-between",
  },

  precioTotal: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 18,

    textAlign: "right",
    paddingRight: 10,
  },

  guiaIcon: {
    width: 20,
    height: 20,
    tintColor: "#0000009E",
  },

  line: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 5,
    backgroundColor: "lightgray",
  },

  metodoDePago: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
  },

  paymentContainer: {
    borderRadius: 10,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    marginTop: 20,

    ...shadowMedia,
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
  tarjetahabiente: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textoTerminos: {
    flex: 1,
    fontSize: 14,
    textAlign: "center",
    color: "#aaa",

    paddingHorizontal: 20,
    marginTop: 10,
  },
});
