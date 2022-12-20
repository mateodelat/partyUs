import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { FontAwesome5 } from "@expo/vector-icons";

import ElementoPersonas from "./ElementoPersonas";

import Boton from "../../../components/Boton";
import { NavigationProp } from "../../../shared/interfaces/navigation.interface";
import {
  fetchFromAPI,
  fetchFromOpenpay,
  formatAMPM,
  formatDateShort,
  formatMoney,
  getCardIcon,
  getUserSub,
  msInDay,
  precioConComision,
  rojo,
  shadowMedia,
  rojoClaro,
  azulClaro,
  comisionApp,
  AsyncAlert,
  vibrar,
  VibrationType,
  msInHour,
  abrirTerminos,
  sendNotifications,
  sendAdminNotification,
} from "../../../../constants";

import { BoletoType } from "../Boletos";
import { EventoType } from "../Home";
import { Boleto, Cupon, Evento, Usuario } from "../../../models";

import Header from "../../../navigation/components/Header";
import uuid from "react-native-uuid";
import CardInput, { saveParams } from "../../../components/CardInput";

import OpenPay from "../../../components/OpenPay";
import useUser from "../../../Hooks/useUser";
import { cardType, chargeType } from "../../../../types/openpay";
import { DataStore } from "aws-amplify";
import { TipoNotificacion } from "../../../models";
import { Notificacion } from "../../../models";
import { notificacionesRecordatorio } from "../Notifications/functions";
import RadioButton from "../../../components/RadioButton";
import { TipoPago } from "../../../models";
import WebView from "react-native-webview";

export default function ({
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
  const boletos = route.params.boletos.filter((e: any) => e.quantity);

  const [modalVisible, setModalVisible] = useState(false);

  const [threeDsecure, setThreeDsecure] = useState("");
  const [sesionId, setSesionId] = useState<string>();

  const { setNewNotifications, usuario, setLoading } = useUser();

  // Opciones que se llenan cuando damos agregar tarjeta
  const [tarjetasGuardadas, setTarjetasGuardadas] = useState<cardType[]>([]);

  // Borrar metodos de pago
  const [editing, setEditing] = useState(false);

  const [tipoPago, setTipoPago] = useState<"EFECTIVO" | number>();

  const [termsAceptance, setTermsAceptance] = useState(false);

  // UI del boton
  const [buttonLoading, setButtonLoading] = useState(false);

  const [sub, setSub] = useState<string>();

  const res = uuid.v4() as string;
  // La pongo en estado para evitar que se cambie al actualizar
  const [reservaID, setReservaID] = useState(res);

  const precioTotal = total;

  useEffect(() => {
    getUserSub().then(setSub);
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
    if (usuario.userPaymentID) {
      fetchFromAPI<cardType[]>("/payments/card", "GET", undefined, {
        customer_id: usuario.userPaymentID,
      }).then(({ body }) => {
        if (body) {
          body = body.map((card) => {
            return {
              ...card,
              icon: getCardIcon(card.brand),
            };
          });

          setTarjetasGuardadas(body);
          return body;
        } else return [];
      });
    }
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
          "Esto generara un voucher para pagar el boleto en cualquiera de nuestras tiendas autorizadas. ¿Quieres continuar?"
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
      const result = (await fetchFromAPI("/createReserva", "POST", {
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
        device_session_id: sesionId,
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
        // Si el tipo de pago fue en efectivo, obtener la referencia y navegar a la pestaña pago
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
    try {
      setButtonLoading(true);
      setLoading(true);
      const tokenID = await fetchFromOpenpay<cardType>({
        path: "/tokens",
        type: "POST",
        input: {
          holder_name: r.name,
          card_number: r.number,
          expiration_year: r.expiry.year,
          expiration_month: r.expiry.month,
          cvv2: r.cvv,
        },
      }).then((r) => r.id);
      let cardID: Promise<string | undefined> | undefined;

      // Si pide que se guarde para compras futuras agregar al usuario
      if (r.saveCard) {
        if (!tokenID) {
          throw new Error("Falta el token ID");
        }
        if (!sesionId) {
          Alert.alert(
            "Error",
            "Hubo un error obteninendo el identificador de tu dispositivo"
          );
          throw new Error("Falta el id de sesion");
        }
        if (!usuario.userPaymentID) {
          Alert.alert("Error", "No se pudo guardar la tarjeta");
          throw new Error("Usuario no tiene un id de cliente");
        }

        const input = {
          token_id: tokenID,
          device_session_id: sesionId,
          customer_id: usuario.userPaymentID,
        };
        cardID = fetchFromAPI<cardType>("/payments/card", "POST", input)
          .then((e) => {
            const r = e.body?.id;
            return r;
          })
          .catch((e) => {
            console.log(e.error);
            Alert.alert(
              "Error",
              "Tarjeta no valida, hubo un error" + e.error.description
            );

            setTipoPago(undefined);

            setTarjetasGuardadas((ol) => {
              const idx = ol.findIndex((e) => e.tokenID === tokenID);
              if (idx >= 0) {
                ol.splice(idx, 1);
              }
              return [...ol];
            });
            return undefined;
          });
      }

      setTipoPago(
        tarjetasGuardadas.length !== 0 ? tarjetasGuardadas.length : 0
      );

      setTarjetasGuardadas([
        ...tarjetasGuardadas,
        {
          holder_name: r.name,
          card_number: r.number,
          brand: r.type,
          icon: r.icon,
          saveCard: !!r.saveCard,
          tokenID: tokenID as any,
          id: cardID,
        },
      ]);
    } catch (error: any) {
      setButtonLoading(false);
      setLoading(false);
      console.log(error);
    }

    setButtonLoading(false);
    setLoading(false);
  }

  async function handleRemovePayment(idx: number) {
    const tarjetaID = await tarjetasGuardadas[idx].id;
    setTarjetasGuardadas(() => {
      if (tarjetaID) {
        if (!usuario.userPaymentID) {
          console.log("No hay payment ID para ese usuario");
        } else {
          fetchFromAPI("/payments/card/" + tarjetaID, "DELETE", undefined, {
            customer_id: usuario.userPaymentID,
          }).catch((e) => {
            console.log(e);
            Alert.alert(
              "Error",
              "Error borrando tarjeta: " + e?.error?.description
            );
          });
        }
      } else {
        console.log("No hay tarjeta ID");
      }

      let neCards = [...tarjetasGuardadas];
      neCards.splice(idx, 1);
      return [...neCards];
    });
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
              style={styles.imgAventura}
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
              <Text style={styles.precioTotal}>{formatMoney(precioTotal)}</Text>
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
                        if (!tarjeta.card_number) {
                          return <View />;
                        }
                        const l = tarjeta.card_number.length;
                        let last4 = tarjeta.card_number.slice(l - 4, l);

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
                                      tarjeta.icon
                                        ? tarjeta.icon
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
                                  **** **** **** {last4.toUpperCase()}
                                </Text>
                                {tarjeta.holder_name && (
                                  <Text
                                    style={{
                                      ...styles.tarjetahabiente,
                                      color: tipoPago === idx ? "#777" : "#ddd",
                                    }}
                                  >
                                    {tarjeta.holder_name?.toUpperCase()}
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
                  <View style={{ ...styles.iconoIzquierda }}>
                    <FontAwesome5
                      name="money-bill-wave-alt"
                      size={24}
                      color={azulClaro}
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
                  Tus datos se envian de forma segura con encriptación punto a
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
      <Modal
        animationType={"none"}
        transparent={true}
        visible={!!threeDsecure}
        onRequestClose={() => {
          setThreeDsecure("");
        }}
      >
        <WebView
          onNavigationStateChange={(e) => {
            if (e.url.startsWith("https://www.partyusmx.com/")) {
              setThreeDsecure("");
              navigation.navigate("ExitoScreen", {
                txtExito: "Reserva creada",
                descripcion:
                  "Se ha creado tu reserva con exito. Puedes consultar tu qr en Perfil - Mis reservas",
                txtOnPress: "Ver boleto",
              });
            }
          }}
          source={{ uri: threeDsecure }}
          style={{
            flex: 1,
          }}
        />
      </Modal>
      <OpenPay onCreateSesionID={setSesionId} />
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

  imgAventura: {
    flex: 2,
    height: "100%",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
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
