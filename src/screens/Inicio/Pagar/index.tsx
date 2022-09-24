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
} from "../../../../constants";

import { BoletoType } from "../Boletos";
import { EventoType } from "../Home";
import { Boleto, Cupon } from "../../../models";

import Header from "../../../navigation/components/Header";
import uuid from "react-native-uuid";
import CardInput, { saveParams } from "../../../components/CardInput";

import OpenPay from "../../../components/OpenPay";
import useUser from "../../../Hooks/useUser";
import {
  address_type,
  cardType,
  chargeType,
  errorOpenPay,
  fee_type,
  transaction_type,
} from "../../../../types/openpay";
import handleCrearReserva from "./handleCrearReserva";
import base64 from "react-native-base64";

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
    boletos,
    total,
    imagenes,
    imagenPrincipalIDX,
    titulo,
    fechaInicial,
    fechaFinal,
    owner,
    descuento,
    id: eventoID,
    CreatorID,
  } = {
    CreatorID: "75f153ae-e945-42fa-9e4d-d724a76d7ff7",
    _deleted: null,
    _lastChangedAt: 1663131008188,
    _version: 1,
    boletos: [
      {
        _deleted: null,
        _lastChangedAt: 1663131008401,
        _version: 1,
        cantidad: 30,
        createdAt: "2022-09-14T04:50:08.378Z",
        descripcion: "",
        eventoID: "16dd8192-d26b-4be1-a5de-4e2825119e27",
        id: "0748dd21-67d2-43d7-a3f5-91b4d3c2d330",
        owner: "75f153ae-e945-42fa-9e4d-d724a76d7ff7",
        personasReservadas: null,
        precio: 1100,
        quantity: 2,
        titulo: "VIP",
        updatedAt: "2022-09-14T04:50:08.378Z",
      },
      {
        _deleted: null,
        _lastChangedAt: 1663131009276,
        _version: 1,
        cantidad: 50,
        createdAt: "2022-09-14T04:50:09.251Z",
        descripcion: "Este boleto es el ordinario",
        eventoID: "16dd8192-d26b-4be1-a5de-4e2825119e27",
        id: "a7c6204b-3fa0-4ca2-8b73-16cb8fbc8f09",
        owner: "75f153ae-e945-42fa-9e4d-d724a76d7ff7",
        personasReservadas: null,
        precio: 400,
        quantity: 1,
        titulo: "Normal",
        updatedAt: "2022-09-14T04:50:09.251Z",
      },
    ],
    comodities: ["ALBERCA", "COMIDA", "BARRALIBRE"],
    createdAt: "2022-09-14T04:50:08.163Z",
    descuento: undefined,
    detalles: "Detalles del evento",
    fechaFinal: 1664409600000,
    fechaInicial: 1664395200000,
    id: "16dd8192-d26b-4be1-a5de-4e2825119e27",
    imagenPrincipalIDX: 0,
    imagenes: [
      {
        key: "https://i.picsum.photos/id/501/1100/800.jpg?hmac=BtlHyta2RVst5tlIRxzEZmLZtiezcDHFOQ_6H4mwuQ8",
        uri: "https://i.picsum.photos/id/501/1100/800.jpg?hmac=BtlHyta2RVst5tlIRxzEZmLZtiezcDHFOQ_6H4mwuQ8",
      },
      {
        key: "https://i.picsum.photos/id/666/1100/800.jpg?hmac=vhtpFJqofWTGHrh7zjwqGtkvc91P6TixazoMV96OrBQ",
        uri: "https://i.picsum.photos/id/666/1100/800.jpg?hmac=vhtpFJqofWTGHrh7zjwqGtkvc91P6TixazoMV96OrBQ",
      },
      {
        key: "https://i.picsum.photos/id/944/1100/800.jpg?hmac=FdqdJp002a_tRH1ffS_LNZjs_7emSUARzubtk_nOeJE",
        uri: "https://i.picsum.photos/id/944/1100/800.jpg?hmac=FdqdJp002a_tRH1ffS_LNZjs_7emSUARzubtk_nOeJE",
      },
    ],
    musOtra: null,
    musica: "REGGETON",
    owner: {
      _deleted: null,
      _lastChangedAt: 1663130831913,
      _version: 2,
      admin: false,
      calificacion: null,
      createdAt: "2022-09-14T04:36:53.419Z",
      email: "mateodelat@gmail.com",
      fechaNacimiento: null,
      foto: "https://ui-avatars.com/api/?name=mateodelat&bold=true&background=ffbf5e&color=000&length=1",
      id: "75f153ae-e945-42fa-9e4d-d724a76d7ff7",
      idData: null,
      idKey: null,
      idUploaded: false,
      imagenFondo: null,
      materno: null,
      nickname: "mateodelat",
      nombre: null,
      notificationToken: null,
      numResenas: null,
      organizador: true,
      owner: "75f153ae-e945-42fa-9e4d-d724a76d7ff7",
      paterno: null,
      phoneCode: null,
      phoneNumber: null,
      updatedAt: "2022-09-14T04:47:11.868Z",
      verified: false,
    },
    personasMax: 80,
    personasReservadas: null,
    precioMax: 1100,
    precioMin: 400,
    tipoLugar: "INTERIOR",
    titulo: "Nuevo evento",
    tosAceptance: {
      hora: "2022-09-14T04:50:00.892Z",
      ip: "10.0.2.16",
    },
    total: 3000,
    ubicacion: {
      latitude: 37.42683509471589,
      latitudeDelta: 0.02135405936986956,
      longitude: -122.08070307970047,
      longitudeDelta: 0.015137381851673126,
      ubicacionId: "ChIJAAAAAAAAAAARPT9VG0oB3x0",
      ubicacionNombre: "Shoreline Amphitheatre",
    },
    updatedAt: "2022-09-14T04:50:08.163Z",
  } as any;

  const [modalVisible, setModalVisible] = useState(false);

  const [sesionId, setSesionId] = useState<string>();

  const { usuario } = useUser();

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

  const precioTotal = total;

  useEffect(() => {
    getUserSub().then(setSub);
    getUserCards();
    setReservaID(res);
    console.log("Nuevo codigo de reserva: " + res);
    setButtonLoading(false);
  }, []);

  ///////////////////////////////////////////////////////////////////
  /////////////////////////////FUNCIONES/////////////////////////////
  ///////////////////////////////////////////////////////////////////
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
    if (tipoPago === undefined) {
      Alert.alert("Error", "Agrega un metodo de pago para continuar");
      return;
    }
    let tarjetaID: undefined | string;
    if (tipoPago !== "EFECTIVO") {
      // Si el tipo de pago es un numero seleccionar la tarjeta de la lista
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

    try {
      setButtonLoading(true);

      const result = await handleCrearReserva({
        body: {
          tipoPago: tipoPago === "EFECTIVO" ? "EFECTIVO" : "TARJETA",
          boletos: boletos.map((e) => ({
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
        },
      });

      if (result.error) {
        throw new Error(result.error.description);
      }

      if (result.body.tipoPago === "EFECTIVO") {
        const { barcode_url, reference, limit } = result.body.voucher;
        const limitDate = new Date(limit);

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
      }

      console.log(result);
      setButtonLoading(false);
    } catch (error: any) {
      setButtonLoading(false);
      const msg = error.message
        ? error.message
        : error.description
        ? error.description
        : JSON.stringify(error);

      console.log(error);
      Alert.alert("Error", "Hubo un error guardando la reserva: " + msg);
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
      const tokenID = await fetchFromOpenpay({
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
            Alert.alert(
              "Error",
              "Hubo un error guardando la tarjeta: " + e.error.description
            );

            setTipoPago(undefined);

            setTarjetasGuardadas((ol) => {
              const idx = ol.findIndex((e) => e.tokenID === tokenID);
              console.log(idx);
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
      console.log(error);
    }

    setButtonLoading(false);
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

  return (
    <View style={styles.container}>
      <Header title={"Pagar"} style={{ paddingHorizontal: 5 }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Mostrar la aventura a pagar */}
        <View
          style={[
            styles.innerContainer,
            { flexDirection: "row", marginBottom: 0 },
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
              {owner?.verified ? (
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
                owner?.calificacion && (
                  <View style={{ ...styles.row, marginTop: 0, marginLeft: 10 }}>
                    <Entypo name="star" size={16} color="#F5BE18" />
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                      {owner.calificacion}
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
                <Text style={{ color: azulClaro }}>@{owner?.nickname}</Text>
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
                  : formatMoney(descuento.cantidadDescuento, true)}
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
            <Text style={{ ...styles.titulo, fontWeight: "bold" }}>Total</Text>
            <Text style={styles.precioTotal}>$ {Math.round(precioTotal)}</Text>
          </View>
        </View>

        {/* Metodos de pago */}
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
                    onPress={!editing ? (handleEditPayments as any) : undefined}
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
                            <Entypo name="check" size={30} color={rojoClaro} />
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
            marginTop: 0,
            padding: 20,
            marginRight: 20,
          }}
        >
          <Text style={styles.secureTxt}>
            Tus datos se envian de forma segura con encriptación punto a punto
            de 256 bits
          </Text>
          <AntDesign name="Safety" size={24} color={azulClaro} />
        </View>
      </ScrollView>
      <View style={{ flex: 1 }} />
      <View
        style={{
          padding: 20,
        }}
      >
        <Boton
          loading={buttonLoading}
          titulo={"Confirmar"}
          onPress={handleConfirm}
          color={rojoClaro}
        />
      </View>
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
      <OpenPay onCreateSesionID={setSesionId} isProductionMode={false} />
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
    overflow: "hidden",
    ...shadowMedia,
    margin: 20,
    marginBottom: 20,
    minHeight: 100,

    alignItems: "center",
  },

  modalContainer: {
    backgroundColor: "#fff",
  },

  imgAventura: {
    flex: 2,
    height: "100%",
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
    overflow: "hidden",
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
});
