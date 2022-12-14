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
  View,
} from "react-native";

import { Entypo } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

import ElementoPersonas from "./ElementoPersonas";

import NetInfo from "@react-native-community/netinfo";

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
  mayusFirstLetter,
  currency,
  getIpAddress,
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
import StripeRN, {
  CardField,
  useConfirmSetupIntent,
} from "@stripe/stripe-react-native";
import { cardBrand_type } from "../../../../types/stripe";
import ModalBottom from "../../../components/ModalBottom";
import SecureCardInput from "../../../components/CardInput/SecureCardInput";
import {
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY,
} from "../../../../constants/keys";
import createPaymentIntent from "./createPaymentIntent";
import CardInput from "../../../components/CardInput";
export default function Pagar({
  route,
  navigation,
}: {
  route: {
    params: EventoType & {
      total: number;
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
  route.params = {
    id: "a26592f0-5ea5-4853-ba70-0c88c1475f20",
    imagenPrincipalIDX: 0,
    titulo: "adsfa",
    detalles: "asdf",
    ubicacion: {
      ubicacionNombre: " Hall, Hall",
      longitudeDelta: 2,
      latitudeDelta: 2,
      latitude: 41.67858017474236,
      longitude: -100.72023656219244,
    },
    fechaInicial: 1689973200000,
    fechaFinal: 1689976800000,
    tosAceptance: {
      hora: "2022-12-22T09:28:50.741Z",
    },
    tipoLugar: "INTERIOR",
    musica: "POP",
    comodities: ["SEGURIDAD", "BARRALIBRE", "COMIDA"],
    musOtra: null,
    personasMax: 100,
    precioMin: 50,
    precioMax: 400,
    paymentProductID: "prod_N1oj2JotnTBFbf",
    CreatorID: "fe905dc2-97d2-4531-b018-fcd02aa534b8",
    createdAt: "2022-12-22T09:29:49.770Z",
    updatedAt: "2022-12-22T09:29:49.770Z",
    _version: 1,
    _lastChangedAt: 1671701389796,
    _deleted: null,
    imagenes: [
      {
        key: "https://images.unsplash.com/photo-1543168256-8133cc8e3ee4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=800&ixid=MnwxfDB8MXxyYW5kb218MHx8cGFydHl8fHx8fHwxNjcxNzAxMjg1&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1100",
        uri: "https://images.unsplash.com/photo-1543168256-8133cc8e3ee4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=800&ixid=MnwxfDB8MXxyYW5kb218MHx8cGFydHl8fHx8fHwxNjcxNzAxMjg1&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1100",
      },
      {
        key: "https://images.unsplash.com/photo-1543168256-8133cc8e3ee4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=800&ixid=MnwxfDB8MXxyYW5kb218MHx8cGFydHl8fHx8fHwxNjcxNzAxMjg1&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1100",
        uri: "https://images.unsplash.com/photo-1543168256-8133cc8e3ee4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=800&ixid=MnwxfDB8MXxyYW5kb218MHx8cGFydHl8fHx8fHwxNjcxNzAxMjg1&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1100",
      },
    ],
    creator: {
      id: "fe905dc2-97d2-4531-b018-fcd02aa534b8",
      nickname: "mateodelat",
      nombre: "Velazquez",
      materno: "Margarita",
      paterno: "Gomez",
      email: "mateodelat@gmail.com",
      foto: "https://ui-avatars.com/api/?name=mateodelat&bold=true&background=fff&color=000&length=1",
      cuentaBancaria: "000000001234567897",
      titularCuenta: "NOMBRE PRUEBA",
      receiveNewReservations: false,
      rfc: "XAXX010101000",
      imagenFondo: null,
      direccion: {
        postal_code: "45500",
      },
      phoneNumber: "3344443343",
      phoneCode: "+52",
      organizador: true,
      admin: false,
      idUploaded: true,
      idData: {
        detectedText:
          '"222222\nppppp\nMEXICA\nM??XICO\nINSTITUTO NACIONAL ELECTORAL\nCREDENCIAL PARA VOTAR\nNOMBRE\nGOMEZ\nVELAZQUEZ\nMARGARITA\nDOMICILIO\nINE\nC PITAGORAS 1253 INT. 4\nCOL. MORELOS 04800\nCUAJIMALPA DE MORELOS, D.F.\nCLAVE DE ELECTOR GMVLMR8007501M100\nGOVM800705MCLMLR01 A??O DE REGISTRO 2008 02\nESTADO 09 MUNICIPIO 004 SECCI??N 0747\nLOCALIDAD\nMISI??N 2014 VIGENCIA 2024"',
        tipoDocumento: "INE",
        uri: "https://cdn.forbes.com.mx/2019/06/INE.jpg",
        curp: "GOVM800705MCLMLR01",
      },
      idFrontKey: "usr-fe905dc2-97d2-4531-b018-fcd02aa534b8|id-front.jpg",
      idBackKey: "usr-fe905dc2-97d2-4531-b018-fcd02aa534b8|id-back.jpg",
      tipoDocumento: "INE",
      fechaNacimiento: "2003-12-21T00:00:00.000Z",
      calificacion: null,
      numResenas: null,
      notificationToken: null,
      paymentClientID: "cus_N1l9LTBaAXHNjg",
      paymentAccountID: "acct_1MHinBID9ekhSFzj",
      verified: false,
      owner: "fe905dc2-97d2-4531-b018-fcd02aa534b8",
      createdAt: "2022-12-22T05:47:53.254Z",
      updatedAt: "2022-12-22T20:59:17.925Z",
      _version: 8,
      _lastChangedAt: 1671742757970,
      _deleted: null,
    },
    personasReservadas: 0,
    boletos: [
      {
        id: "6c68e5f7-fb6c-4b66-8e2d-961b27953e3e",
        titulo: "VIP",
        descripcion: "Boleto VIP",
        cantidad: 50,
        precio: 400,
        paymentPriceID: null,
        eventoID: "a26592f0-5ea5-4853-ba70-0c88c1475f20",
        createdAt: "2022-12-22T09:29:50.601Z",
        updatedAt: "2022-12-22T09:29:50.601Z",
        owner: "fe905dc2-97d2-4531-b018-fcd02aa534b8",
        _version: 1,
        _lastChangedAt: 1671701390631,
        _deleted: null,
        personasReservadas: 0,
      },
      {
        id: "c40da731-4cc2-4772-bd2d-d3214f070f05",
        titulo: "VIP",
        descripcion: "Boleto VIP",
        cantidad: 50,
        precio: 400,
        paymentPriceID: null,
        eventoID: "a26592f0-5ea5-4853-ba70-0c88c1475f20",
        createdAt: "2022-12-22T09:30:42.018Z",
        updatedAt: "2022-12-22T09:30:42.018Z",
        owner: "fe905dc2-97d2-4531-b018-fcd02aa534b8",
        _version: 1,
        _lastChangedAt: 1671701442044,
        _deleted: null,
        personasReservadas: 0,
        quantity: 1,
      },
      {
        id: "fb5ced93-0684-4007-a44d-ccf35fa969e1",
        titulo: "Entrada normal",
        descripcion: "dESCRIPCION del boleto noraml",
        cantidad: 50,
        precio: 50,
        paymentPriceID: null,
        eventoID: "a26592f0-5ea5-4853-ba70-0c88c1475f20",
        createdAt: "2022-12-22T09:29:50.317Z",
        updatedAt: "2022-12-22T09:29:50.317Z",
        owner: "fe905dc2-97d2-4531-b018-fcd02aa534b8",
        _version: 1,
        _lastChangedAt: 1671701390351,
        _deleted: null,
        personasReservadas: 0,
      },
      {
        id: "5992138a-39b3-49f7-8d25-d65fb4ba7309",
        titulo: "Entrada normal",
        descripcion: "dESCRIPCION del boleto noraml",
        cantidad: 50,
        precio: 50,
        paymentPriceID: null,
        eventoID: "a26592f0-5ea5-4853-ba70-0c88c1475f20",
        createdAt: "2022-12-22T09:30:41.555Z",
        updatedAt: "2022-12-22T09:30:41.555Z",
        owner: "fe905dc2-97d2-4531-b018-fcd02aa534b8",
        _version: 1,
        _lastChangedAt: 1671701441583,
        _deleted: null,
        personasReservadas: 0,
      },
    ],
    total: 460,
  } as any;

  const {
    total,
    imagenes,
    imagenPrincipalIDX,
    titulo,
    fechaInicial,
    fechaFinal,
    creator,
    descuento,
    id: eventoID,
    CreatorID,
  } = route.params;

  type cardType = Omit<Stripe.Card, "id"> & { id: Promise<string> };

  const boletos = route.params.boletos.filter((e: any) => e.quantity);

  const [modalVisible, setModalVisible] = useState(false);

  const [clientSecret, setClientSecret] = useState<string>("");

  const { setNewNotifications, usuario, setLoading, setUsuario } = useUser();

  // Opciones que se llenan cuando damos agregar tarjeta
  const [tarjetasGuardadas, setTarjetasGuardadas] = useState<cardType[]>([]);

  // Borrar metodos de pago
  const [editing, setEditing] = useState(false);

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

    // Crear payment intent
    getClientSecret();

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
            "Hubo un error obteniendo las tarjetas guardadas del cliente"
          );
        });
    }
  }

  function getClientSecret() {
    // Recibimos eventoID, reservaID (para guardar en metadata) y descuento en caso de haber para poner el precio del PI

    // fetchFromStripe<Stripe.PaymentIntent>({
    //   path: "/payments/createPaymentIntent",
    //   type: "GET",
    //   secretKey: STRIPE_SECRET_KEY,
    //   input: {},
    // })
    //   .then((r) => {
    //     log(r);
    //   })
    //   .catch(log);

    // log(createPaymentIntent(

    // ))

    return;
    fetchFromStripe<Stripe.PaymentIntent>({
      path: "/payments/createPaymentIntent",
      type: "GET",
      secretKey: STRIPE_SECRET_KEY,
      input: {},
    })
      .then((r) => {
        log(r);
      })
      .catch(log);
  }

  // Action tras darle click a agregar metodo de pago
  const handleAddPaymentMethod = async () => {
    setEditing(false);
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    const personasTotales = boletos
      .map((e: any) => e.quantity)
      .reduce((prev, a) => prev + a);

    let tarjetaID: undefined | string;
    if (total !== 0) {
      if (tipoPago === undefined) {
        Alert.alert("Error", "Agrega un metodo de pago para continuar");
        return;
      }
      if (tipoPago !== "EFECTIVO") {
        // Si el tipo de pago es un numero seleccionar la tarjeta de la lista
        setButtonLoading(true);
        setLoading(true);

        const tarjeta = tarjetasGuardadas[tipoPago];
        tarjetaID = await tarjeta.id;

        if (tarjeta.tokenID) {
          tarjetaID = tarjeta.tokenID;
        }

        if (!tarjeta.tokenID && !tarjeta.allows_charges) {
          Alert.alert(
            "Error",
            "No se permiten cargos en esa tarjeta, agrega otra"
          );
          return;
        }
      }

      if (
        tipoPago === "EFECTIVO" &&
        !(await AsyncAlert(
          "Pago en efectivo",
          "Esto generara un voucher para pagar el boleto en cualquiera de nuestras tiendas autorizadas. ??Quieres continuar?"
        ))
      )
        return;
    }
    setButtonLoading(true);
    setLoading(true);
    try {
      // const { userPaymentID: customer_id } = await DataStore.query(
      //   Usuario,
      //   sub
      // );

      // if (tipoPago !== "EFECTIVO") {
      //   const result = await fetchFromOpenpay<chargeType>({
      //     path: "/customers/" + customer_id + "/charges",
      //     type: "POST",
      //     secretKey: "",
      //     input: {
      //       device_session_id: sesionId,
      //       source_id: tarjetaID,
      //       method: "card",
      //       amount: total,
      //       currency: "MXN",

      //       use_3d_secure: true,
      //       redirect_url: "https://www.partyusmx.com/",
      //     },
      //   });

      //   setButtonLoading(false);
      //   setLoading(false);

      //   if (result?.payment_method.url) {
      //     setThreeDsecure(result.payment_method.url);
      //   }
      //   return;
      // } else {
      const result = (await fetchFromAPI({
        path: "/createReserva",
        type: "POST",
        input: {
          tipoPago:
            tipoPago === "EFECTIVO"
              ? "EFECTIVO"
              : total === 0
              ? "EFECTIVO"
              : "TARJETA",
          boletos: boletos.map((e: any) => ({
            quantity: e.quantity,
            id: e.id,
          })),
          cuponID: descuento?.id ? descuento.id : undefined,
          eventoID,
          organizadorID: CreatorID,
          usuarioID: sub,
          reservaID: reservaID,
          sourceID: tarjetaID,
          total,
        },
      })) as any;

      if (!result) {
        throw new Error("No se recibio ningun resultado");
      }

      if (result?.error || (tipoPago === "EFECTIVO" && !result?.voucher)) {
        throw new Error(
          result ? result : "No se recibio voucher para pago en efectivo"
        );
      }

      setButtonLoading(false);
      setLoading(false);

      if (result.tipoPago === "EFECTIVO" && total !== 0) {
        const { barcode_url, reference, limitDate: limit } = result.voucher;
        const limitDate = new Date(limit);
        vibrar(VibrationType.sucess);

        // Notificacion de reserva exitosa
        DataStore.save(
          new Notificacion({
            tipo: TipoNotificacion.RESERVAEFECTIVOCREADA,
            titulo: "Reserva exitosa",
            descripcion: `Tu reserva en ${titulo}${
              personasTotales !== 1
                ? " con " + personasTotales + " personas"
                : ""
            } se ha creado con exito. Realiza el pago antes del ${
              formatDateShort(limitDate) + " a las " + formatAMPM(limitDate)
            } para confirmar tu lugar.`,
            usuarioID: sub,

            showAt: new Date().toISOString(),

            reservaID,
            eventoID,
            organizadorID: CreatorID,
          })
        );

        // Mandarle la notificacion al organizador de reserva creada
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

        notificacionesOrganizador(TipoPago.EFECTIVO, personasTotales);

        navigation.popToTop();
        // Si el tipo de pago fue en efectivo, obtener la referencia y navegar a la pesta??a pago
        navigation.navigate("ReferenciaPago", {
          amount: total,
          titulo,
          codebar: {
            uri: barcode_url,
            number: reference,
          },
          limitDate: limitDate.getTime(),
        });
      } else if (result.tipoPago === "TARJETA" || total === 0) {
        // Notificacion de reserva exitosa
        DataStore.save(
          new Notificacion({
            tipo: TipoNotificacion.RESERVATARJETACREADA,
            titulo: "Reserva exitosa",
            descripcion: `Tu reserva en ${titulo}${
              personasTotales !== 1
                ? " con " + personasTotales + " personas"
                : ""
            } se ha creado con exito. Has click aqui para ver tu boleto de entrada`,
            usuarioID: sub,

            showAt: new Date().toISOString(),

            reservaID,
            eventoID,
            organizadorID: CreatorID,
          })
        );
        // Mandar notificaciones de recordatorio
        notificacionesRecordatorio({ evento: route.params, usuario });

        // Mandarle la notificacion al organizador de evento pagado
        notificacionesOrganizador(TipoPago.TARJETA, personasTotales);

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
      } else {
        throw new Error("No se encontro tipo de pago del resultado");
      }
      console.log("Nueva notificacion insertada al contador");

      setNewNotifications((prev) => prev++);
    } catch (error: any) {
      error = error?.error ? error.error : error;
      setButtonLoading(false);
      setLoading(false);
      const msg = error.message
        ? error.message
        : error.description
        ? error.description
        : error;

      setTipoPago(undefined);

      Alert.alert("Error", "Hubo un error guardando la reserva: \n" + msg);
    }
  };

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
      setLoading(true);

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
      const paymentMethodID = fetchFromStripe<Stripe.Token>({
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
      setLoading(false);
      if (!paymentMethodID) {
        return;
      }

      setTarjetasGuardadas([
        ...tarjetasGuardadas,
        {
          id: paymentMethodID,
          name: r.name,
          last4,
          brand: r.type,
        } as any,
      ]);
    } catch (error: any) {
      setButtonLoading(false);
      setLoading(false);
      Alert.alert(
        "Error",
        "Ocurrio un error guardando la tarjeta" +
          (error.message ? error.message : "")
      );
      console.log(error);
    }

    setButtonLoading(false);
    setLoading(false);
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
              const precioIndividualConComision = precioConComision(e.precio);

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
                        <Text
                          style={{
                            fontSize: 16,
                            color: azulClaro,
                            padding: 20,
                            paddingVertical: 10,
                            fontWeight: "bold",
                          }}
                          onPress={
                            !editing ? (handleEditPayments as any) : undefined
                          }
                        >
                          {editing ? "TARJETAS" : "EDITAR"}
                        </Text>

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
                            onPress={() => setEditing(false)}
                          />
                        ) : (
                          <Entypo
                            style={{
                              marginRight: 15,
                            }}
                            name="plus"
                            size={30}
                            color={azulClaro}
                            onPress={handleAddPaymentMethod}
                          />
                        )}
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
                                    {name?.toUpperCase()}
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
                    setTipoPago("EFECTIVO");
                  }}
                  style={styles.metodoDePago}
                >
                  <View
                    style={{ ...styles.iconoIzquierda, overflow: "hidden" }}
                  >
                    <Image
                      style={{ height: 30, resizeMode: "contain", width: 40 }}
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

              {/* Pago seguro */}
              <View
                style={{
                  ...styles.row,
                  padding: 20,
                  flex: 1,
                  alignItems: "flex-end",
                }}
              >
                <Text style={styles.secureTxt}>
                  Tus datos se envian de forma segura con encriptaci??n punto a
                  punto de 256 bits
                </Text>
                <AntDesign name="Safety" size={24} color={azulClaro} />
              </View>
              <Text onPress={abrirTerminos} style={styles.textoTerminos}>
                Al continuar aceptas los{" "}
                <Text style={{ color: azulClaro }}>terminos y condiciones</Text>{" "}
                de partyus
              </Text>
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

  secureTxt: {
    marginLeft: 20,
    color: "#777",
    textAlign: "center",
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
    fontSize: 10,
    textAlign: "center",
    paddingVertical: 10,
  },
});
