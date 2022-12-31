import {
  Image,
  StyleSheet,
  RefreshControl,
  Alert,
  View,
  FlatList,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from "react-native";
import React, {
  Children,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import {
  azulClaro,
  azulFondo,
  clearDate,
  colorFondo,
  fetchFromAPI,
  fetchFromOpenpay,
  formatCuentaCLABE,
  formatDay,
  formatMoney,
  getCardIcon,
  mayusFirstLetter,
  msInDay,
  msInMinute,
  rojo,
  rojoClaro,
  sendAdminNotification,
  shadowBaja,
  shadowMedia,
  shadowMuyBaja,
  timer,
} from "../../../../constants";
import useUser from "../../../Hooks/useUser";
import Loading from "../../../components/Loading";

import { Feather } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { clabe } from "../../../components/ClabeValidator";

import Logo from "../../../components/Logo";
import CardInput, { saveParams } from "../../../components/CardInput";
import { logger } from "react-native-logs";
import ClabeInput, {
  saveParamsClabeInput,
} from "../../../components/ClabeInput";
import { DataStore } from "aws-amplify";
import { Usuario } from "../../../models";

type resource_type =
  | "charges"
  | "client"
  | "transactions"
  | "cards"
  | "bankaccount";

export default function ({ navigation, route }) {
  let { usuario } = useUser();

  // Si se paso un usuario, verlo
  usuario = route.params?.usuario ? route.params?.usuario : usuario;

  const { organizador } = usuario;
  const [customer, setCustomer] = useState<customer_type>();

  // Manejar cargos con pagination y refreshing
  const [charges, setCharges] = useState<chargeType[]>();

  const [refreshingCharges, setRefreshingCharges] = useState(true);
  const [limitChargesReached, setLimitChargesReached] = useState(true);

  //
  // Manejar transferencias con pagination
  const [transfers, setTransfers] = useState<transaction_type[]>();

  const [refreshingTransfers, setRefreshingTransfers] = useState(true);
  const [limitTransfersReached, setLimitTransfersReached] = useState(true);
  const [transfersOffset, setTransfersOffset] = useState(0);

  const [sesionId, setSesionId] = useState("");

  // Ver que esta seleciondo
  const [selected, setSelected] = useState<"charges" | "transfers">(
    organizador ? "transfers" : "charges"
  );

  // Opciones que se llenan cuando damos agregar tarjeta
  const [tarjetasGuardadas, setTarjetasGuardadas] = useState<cardType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [addingCard, setAddingCard] = useState(false);

  const LIMIT = 10;

  useEffect(() => {
    if (organizador) {
      // Si es organizador de pide inicialmente las transacciones
      fetchData({
        offset: 0,
        type: "transactions",
      });
    } else {
      // Pedir tarjetas guardadas
      fetchData({
        type: "cards",
      });

      // Si no es organizador pedir los cargos del cliente
      fetchData({
        offset: 0,
        type: "charges",
      });
    }
    // Pedir el cliente
    fetchData({
      type: "client",
    });
  }, []);

  let alertRetirosShown = false;

  //   async function fetchData({
  //     offset,
  //     type,
  //     addToData,
  //   }: {
  //     offset?: number;
  //     type: resource_type;
  //     addToData?: boolean;
  //   }) {
  //     // Detectar que tipo de operacion se esta solicitando
  //     try {
  //       console.log(type);
  //       switch (type) {
  //         case "charges":
  //           setRefreshingCharges(true);

  //           return await fetchFromAPI<chargeType[]>(
  //             `/payments/getClientCharges?id=${usuario.userPaymentID}&limit=${LIMIT}&offset=${offset}`,
  //             "GET"
  //           )
  //             // Poner limit reached
  //             .then(({ body }) => {
  //               let r = body;
  //               // Si se llego al limite ponerlo
  //               if (r?.length < LIMIT) {
  //                 setLimitChargesReached(true);
  //               } else {
  //                 setLimitChargesReached(false);
  //               }
  //               setRefreshingCharges(false);

  //               // Si hay que agregar a la anterior data (pagination)
  //               if (addToData) {
  //                 setCharges((prev) => [...prev, ...r]);
  //               } else {
  //                 setCharges(r);
  //               }
  //             });

  //         // Transaciones
  //         case "transactions":
  //           setRefreshingTransfers(true);
  //           return await fetchFromAPI<transaction_type[]>(
  //             `/payments/getClientTransfers?id=${usuario.userPaymentID}&limit=${LIMIT}&offset=${offset}`,
  //             "GET"
  //           )
  //             // Poner limit reached
  //             .then(({ body }) => {
  //               let r = body;
  //               if (r?.length < LIMIT) {
  //                 setLimitTransfersReached(true);
  //               } else {
  //                 setLimitTransfersReached(false);
  //               }
  //               if (addToData) {
  //                 setTransfersOffset([...transfers, ...r].length);
  //               } else {
  //                 setTransfersOffset(r.length);
  //               }

  //               // Filtrar por transacciones que no sean de cobro en la app o tipo cancelada
  //               r = r.filter((e) => {
  //                 const des = e.description;

  //                 const transferLabelIDX = des.search(/transfer>>>|retiro>>>/);

  //                 let tipo: "cash" | "card" | "cancel" | "retiro" = des.slice(
  //                   0,
  //                   transferLabelIDX
  //                 ) as any;

  //                 // Si es retiro
  //                 if (des.search(/retiro>>>/) > 0) {
  //                   tipo = "retiro";
  //                 }

  //                 // Si es una transferencia entre clientes y no es retiro eliminar
  //                 if (
  //                   tipo !== "cancel" &&
  //                   e.operation_type === "out" &&
  //                   des.search("retiro") < 0
  //                 ) {
  //                   console.log(
  //                     "Se elimino una transaccion de movimiento de dinero por cargo"
  //                   );
  //                   return false;
  //                 } else return true;
  //               });

  //               // Si hay que agregar a la anterior data (pagination)
  //               if (addToData) {
  //                 setTransfers((prev) => {
  //                   const arr = [...prev, ...r];

  //                   return arr;
  //                 });
  //               } else {
  //                 setTransfers(r);
  //               }

  //               setRefreshingTransfers(false);
  //             });

  //         // Pedir al cliente desde openpay
  //         case "client":
  //           return await fetchFromAPI<customer_type>(
  //             `/payments/clientInfo?id=${usuario.userPaymentID}`,
  //             "GET"
  //           ).then(({ body }) => {
  //             if (!!body?.balance && !alertRetirosShown) {
  //               alertRetirosShown = true;

  //               // Si el cliente tiene fondos mandar alerta de contactarnos para retiro de fondos, fue una cancelacion de evento
  //               if (!usuario.organizador) {
  //                 Alert.alert("Atencion", "Contactanos para retirar tus fondos");
  //               } else {
  //                 Alert.alert(
  //                   "Atencion",
  //                   "Ingresa tu cuenta bancaria para retirar los fondos"
  //                 );
  //               }
  //             }
  //             setCustomer(body);
  //           });

  //         case "cards":
  //           return await fetchFromAPI<cardType[]>({
  //             path:"/payments/card",
  //             type:"GET",
  // query:{
  //               customer_id: usuario.userPaymentID,
  //             }
  //           }).then(({ body }) => {
  //             if (body) {
  //               body = body.map((card) => {
  //                 return {
  //                   ...card,
  //                   icon: getCardIcon(card.brand),
  //                 };
  //               });

  //               setTarjetasGuardadas(body);
  //               return body;
  //             }
  //           });

  //         default:
  //           Alert.alert("Error", "No se recibio tipo para pedir los datos");
  //           return null;
  //       }
  //     } catch (error) {
  //       console.log(error);
  //       setRefreshingCharges(false);
  //       setRefreshingTransfers(false);

  //       Alert.alert(
  //         "Error," +
  //           (error.description ? error.description : JSON.stringify(error))
  //       );
  //     }
  //   }

  async function onRefresh(type: "charges" | "transactions") {
    // Pedir datos cargos/transferencias y datos del cliente

    await Promise.all([
      fetchData({
        offset: 0,
        type,
      }),
      fetchData({
        offset: 0,
        type: "client",
      }),
    ]);
  }

  async function onNextPage(type: "charges" | "transactions") {
    if (
      (limitChargesReached && type === "charges") ||
      (limitTransfersReached && type === "transactions")
    ) {
      return;
    }

    await fetchData({
      type,
      offset: type === "charges" ? charges?.length : transfersOffset,
      addToData: true,
    });
  }

  function handlePressCharge(item: chargeType) {
    if (item.status !== "expired" && item.error_message) {
      Alert.alert(
        "Error",
        "Ocurrio un error en la transaccion\n" + item.error_message
      );
    } else {
      let reservaIDX = item.order_id.search(/>>>/);

      if (reservaIDX < 0) {
        Alert.alert(
          "Error",
          "No se encontro reserva id asociada a la transaccion"
        );
        return;
      }
      const reservaID = item.order_id.slice(
        reservaIDX + 3,
        item.order_id.length
      );

      navigation.pop();
      navigation.navigate("MisReservas", {
        reservaID,
        efectivoCompletado:
          item.status === "completed" && item.method === "store",
      });
    }
  }

  function handlePressTransaction(reservaID: string) {
    navigation.pop();
    navigation.navigate("MisEventos", { reservaID });
  }

  async function handlePressSelector(type: "transfers" | "charges") {
    // Pedir info si no hay transacciones
    setSelected(type);

    if (type === "transfers" && !transfers) {
      await fetchData({
        offset: 0,
        type: "transactions",
      });
    }

    // Pedir info si no hay cargos
    if (type === "charges" && !charges) {
      await fetchData({
        offset: 0,
        type: "charges",
      });
    }
  }

  async function handleAddCard(r: saveParams) {
    try {
      setAddingCard(true);
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
      await fetchFromAPI<cardType>({
        path: "/payments/card",
        type: "POST",
        input,
      })
        .then((e) => {
          const r = e.body;
          setAddingCard(false);

          setTarjetasGuardadas([
            ...tarjetasGuardadas,
            {
              ...r,
              icon: getCardIcon(r.brand),
            },
          ]);
        })
        .catch((e) => {
          Alert.alert(
            "Error",
            "Hubo un error guardando la tarjeta: " + e.error.description
          );

          setTarjetasGuardadas((ol) => {
            const idx = ol.findIndex((e) => e.id === tokenID);
            if (idx >= 0) {
              ol.splice(idx, 1);
            }
            return [...ol];
          });
          return undefined;
        });
    } catch (error) {
      Alert.alert(
        "Error",
        "Hubo un error guardando tu tarjeta " + JSON.stringify(error)
      );
      setAddingCard(false);
    }
  }

  // async function handleRemoveCard(idx: number) {
  //   const tarjetaID = await tarjetasGuardadas[idx].id;
  //   setTarjetasGuardadas(() => {
  //     if (tarjetaID) {
  //       if (!usuario.userPaymentID) {
  //         console.log("No hay payment ID para ese usuario");
  //       } else {
  //         fetchFromAPI("/payments/card/" + tarjetaID, "DELETE", undefined, {
  //           customer_id: usuario.userPaymentID,
  //         }).catch((e) => {
  //           console.log(e);
  //           Alert.alert(
  //             "Error",
  //             "Error borrando tarjeta: " + e?.error?.description
  //           );
  //         });
  //       }
  //     } else {
  //       console.log("No hay tarjeta ID");
  //     }

  //     let neCards = [...tarjetasGuardadas];
  //     neCards.splice(idx, 1);
  //     return [...neCards];
  //   });
  // }

  // Estado de la app para ver si ya se mando la notificacion
  let adminRememberSent = false;

  function handleRetirar() {
    // Mandar notificaciones a los administradores cada que alguien quiere retirar

    // Mandar notificaciones solo si es mayor 1000 la cantidad en la cuenta que se debe
    if (customer?.balance > 1000 && !adminRememberSent) {
      adminRememberSent = true;

      sendAdminNotification({
        titulo: "Atencion",
        descripcion: " quiere retirar sus fondos",
        sender: usuario,
        organizadorID: usuario.id,
        onlyPush: true,
      });
    }

    Alert.alert(
      "Retiro de dinero",
      "Gracias por utilizar partyus, en seguida un asesor se  encargara de enviarte tus fondos. Cualquier problema contacta con soporte"
    );
  }

  return (
    <View style={styles.container}>
      {/* ///////////////////////////////////////////////////////// */}
      {/* /////////// Informacion bancaria del usuario //////////// */}
      {/* ///////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////// */}
      {/* /////////// Historial de cargos /////////////*/}
      {/* //////////////////////////////////////////// */}
      {selected === "charges" ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <HeaderComponent
              setAddingCard={setAddingCard}
              handleRetirar={handleRetirar}
              handleRemoveCard={handleRemoveCard}
              tarjetasGuardadas={tarjetasGuardadas}
              addingCard={addingCard}
              setModalVisible={setModalVisible}
              selector={selected}
              setSelected={handlePressSelector}
              balance={customer?.balance}
            />
          )}
          data={charges}
          onEndReached={() => onNextPage("charges")}
          onEndReachedThreshold={0.4}
          keyExtractor={(item) => item.id}
          ListFooterComponent={() =>
            limitChargesReached || charges === undefined ? (
              <View />
            ) : (
              <Loading indicator style={{ paddingBottom: 20 }} />
            )
          }
          refreshControl={
            <RefreshControl
              onRefresh={async () => {
                await onRefresh("charges");
              }}
              refreshing={refreshingCharges || charges === undefined}
            />
          }
          ListEmptyComponent={
            !refreshingCharges &&
            charges !== undefined && (
              <Text style={styles.noHay}>
                No se han realizado cobros con tarjeta o en efectivo
              </Text>
            )
          }
          renderItem={({ item, index }) => {
            const prev = charges[index - 1];

            // Agregarle el offset a la hora de creacion
            let itemDate = new Date(
              new Date(item.creation_date).getTime() +
                new Date().getTimezoneOffset() * msInMinute
            );

            let prevDate = new Date(
              new Date(
                new Date(
                  prev?.creation_date ? prev?.creation_date : ""
                ).getTime() +
                  new Date().getTimezoneOffset() * msInMinute
              )
            );
            let hoy = clearDate(new Date());
            // Sumarle ms in offset al item
            itemDate = clearDate(itemDate);
            prevDate = clearDate(prevDate);

            const anotherDay = itemDate.getTime() !== prevDate.getTime();

            const dateMessage =
              hoy.getTime() === itemDate.getTime()
                ? "Hoy"
                : hoy.getTime() - msInDay === itemDate.getTime()
                ? "Ayer"
                : formatDay(item.creation_date);
            if (
              item.error_message ===
                "Due date expired, transaction cancelled" ||
              (item.due_date < new Date().toISOString() &&
                item.status !== "completed")
            ) {
              item.status = "expired";
            }

            const title =
              item.status === "cancelled"
                ? "Cancelado"
                : item.status === "completed"
                ? "Completado"
                : item.status === "expired"
                ? "Expirado"
                : item.status === "in_progress"
                ? "Por pagar"
                : "No definida";

            return (
              <>
                {/* Si es hoy o ayer mostrar otro texto */}
                {(!index || anotherDay) && (
                  <Text style={styles.fecha}>{dateMessage}</Text>
                )}
                <Pressable
                  onPress={() => handlePressCharge(item)}
                  style={styles.elementContainer}
                >
                  <IconCharges item={item} />
                  {/* Texto */}
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text style={styles.paymentType}>
                      {title.toUpperCase()}
                    </Text>

                    <Text style={styles.description}>{item.description}</Text>
                  </View>

                  <Text style={styles.monney}>
                    {formatMoney(item.amount, true)}
                  </Text>
                </Pressable>
              </>
            );
          }}
        />
      ) : (
        ///////////////////////////////////////////////////////////
        ///////////// Historial de transferencias /////////////////
        ///////////////////////////////////////////////////////////

        <FlatList
          showsVerticalScrollIndicator={false}
          data={transfers}
          onEndReached={() => onNextPage("transactions")}
          onEndReachedThreshold={0.4}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <HeaderComponent
              setAddingCard={setAddingCard}
              handleRetirar={handleRetirar}
              handleRemoveCard={handleRemoveCard}
              tarjetasGuardadas={tarjetasGuardadas}
              addingCard={addingCard}
              setModalVisible={setModalVisible}
              selector={selected}
              setSelected={handlePressSelector}
              balance={customer?.balance}
            />
          )}
          ListFooterComponent={() =>
            limitTransfersReached || transfers === undefined ? (
              <View />
            ) : (
              <Loading indicator style={{ paddingBottom: 20 }} />
            )
          }
          refreshControl={
            <RefreshControl
              onRefresh={async () => {
                onRefresh("transactions");
              }}
              refreshing={refreshingTransfers || transfers === undefined}
            />
          }
          ListEmptyComponent={
            !refreshingTransfers &&
            transfers !== undefined && (
              <Text style={styles.noHay}>No hay transacciones</Text>
            )
          }
          renderItem={({ item, index }) => {
            // Seccion para ver que fecha poner //

            const prev = transfers[index - 1];
            let itemDate = new Date(
              new Date(item.creation_date).getTime() +
                new Date().getTimezoneOffset() * msInMinute
            );

            let prevDate = new Date(
              new Date(
                new Date(
                  prev?.creation_date ? prev?.creation_date : ""
                ).getTime() +
                  new Date().getTimezoneOffset() * msInMinute
              )
            );
            let hoy = clearDate(new Date());
            // Sumarle ms in offset al item
            itemDate = clearDate(itemDate);
            prevDate = clearDate(prevDate);

            const anotherDay = itemDate.getTime() !== prevDate.getTime();

            const dateMessage =
              hoy.getTime() === itemDate.getTime()
                ? "Hoy"
                : hoy.getTime() - msInDay === itemDate.getTime()
                ? "Ayer"
                : formatDay(item.creation_date);
            ///////////////////////////////////////////////
            ///////////////////////////////////////////////
            ///////////////////////////////////////////////

            // Extraer datos de la descripcion por error con transferencias //

            const des = item.description;

            const transferLabelIDX = des.search("transfer>>>");
            const descriptionLabelIDX = des.search("><");

            let tipo: "cash" | "card" | "cancel" | "retiro" = des.slice(
              0,
              transferLabelIDX
            ) as any;

            if (des.search("retiro>>>") > 0) {
              tipo = "retiro";
            }

            const reservaID = des.slice(
              transferLabelIDX + 11,
              descriptionLabelIDX
            );
            const description = des.slice(descriptionLabelIDX + 2, des.length);

            const title = tipo === "cancel" ? "Cancelado" : "Completado";

            let color = item.operation_type === "out" ? "black" : "green";

            ///////////////////////////////////////////////
            ///////////////////////////////////////////////
            ///////////////////////////////////////////////

            return (
              <>
                {/* Si es hoy o ayer mostrar otro texto */}
                {(!index || anotherDay) && (
                  <Text style={styles.fecha}>{dateMessage}</Text>
                )}
                <Pressable
                  onPress={() => handlePressTransaction(reservaID)}
                  style={styles.elementContainer}
                >
                  <IconTransfers tipo={tipo} />
                  {/* Texto */}
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text style={styles.paymentType}>
                      {title.toUpperCase()}
                    </Text>

                    <Text style={styles.description}>{description}</Text>
                  </View>

                  <Text style={{ ...styles.monney, color }}>
                    {formatMoney(item.amount, true)}
                  </Text>
                </Pressable>
              </>
            );
          }}
        />
      )}
      <Modal
        animationType={"none"}
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <CardInput
          comprasFuturasEnabled
          onAdd={handleAddCard}
          setModalVisible={setModalVisible}
        />
      </Modal>
      <OpenPay onCreateSesionID={setSesionId} />
    </View>
  );
}
function HeaderComponent({
  balance,

  setSelected,
  setModalVisible,
  selector,

  addingCard,
  setAddingCard,
  tarjetasGuardadas,

  handleRemoveCard,
  handleRetirar,
}: {
  balance?: number;

  setSelected: Dispatch<SetStateAction<"charges" | "transfers">>;
  setModalVisible: Dispatch<SetStateAction<boolean>>;
  addingCard: boolean;
  setAddingCard: Dispatch<SetStateAction<boolean>>;

  selector: "charges" | "transfers";

  tarjetasGuardadas: cardType[];
  handleRemoveCard: (idx: number) => void;
  handleRetirar: () => void;
}) {
  const { usuario, setUsuario } = useUser();

  const [modalBank, setModalBank] = useState(false);

  const { organizador } = usuario;

  const log = logger.createLogger();

  let cuentaBancaria;
  if (usuario.cuentaBancaria) {
    cuentaBancaria = clabe.validate(usuario.cuentaBancaria);
  }

  // Funcion para detectar si se quiere agreagar tarjeta o cuenta bancaria
  function handlePressAdd() {
    if (!organizador) {
      setModalVisible(true);
    } else {
      setModalBank(true);
    }
  }

  async function handleAddAccount(r: saveParamsClabeInput) {
    // Actualizar el usuario local y subir a datastore la cuenta clabe
    try {
      setAddingCard(true);
      const act = await DataStore.query(Usuario, usuario.id);
      await DataStore.save(
        Usuario.copyOf(act, (ne) => {
          ne.cuentaBancaria = r.clabe;
          ne.titularCuenta = r.titular;
        })
      );

      setUsuario({
        ...usuario,
        cuentaBancaria: r.clabe,
        titularCuenta: r.titular,
      });
    } catch (error) {
      Alert.alert("Error", "Hubo un error guardando la cuenta CLABE");
      log.error(error);
    } finally {
      setAddingCard(false);
    }
  }

  return (
    <View>
      <Text style={styles.balance}>{formatMoney(balance, true)}</Text>
      <Text
        style={{
          ...styles.detailsAmount,
          marginHorizontal: 20,
          textAlign: "center",
        }}
      >
        Disponible en tu cuenta de partyus{"\n"}
        {balance && organizador ? "" : "(usalo para pagar eventos)"}
      </Text>

      {/* Boton para info de depositos, solo activo para organizadores */}

      {organizador && (
        <TouchableOpacity onPress={handleRetirar}>
          <Text style={styles.button}>Retirar</Text>
        </TouchableOpacity>
      )}

      <View style={styles.tarjetasContainer}>
        {/* Headder de tarjetas guardadas */}

        {/* Presionar para agregar cuenta bancaria/tarjeta */}

        <TouchableOpacity
          disabled={addingCard || cuentaBancaria}
          onPress={handlePressAdd}
          style={{
            flexDirection: "row",
            marginTop: 0,
            marginHorizontal: 0,
            alignItems: "center",
          }}
        >
          {/* Texto de info */}
          <View style={{ flex: 1, paddingVertical: 10 }}>
            <Text style={styles.title}>
              {organizador ? "Cuenta bancaria" : "Tarjetas guardadas"}
            </Text>
            <Text style={{ ...styles.detailsAmount, margin: 0 }}>
              {organizador
                ? "Cuenta a enviar el dinero"
                : "Lista de tarjetas que guardaste"}
            </Text>
          </View>

          {/* Agregar nueva tarjeta */}
          {!organizador ||
            (!cuentaBancaria && (
              <View style={styles.addContainer}>
                {addingCard ? (
                  <ActivityIndicator size={"small"} color={"black"} />
                ) : (
                  <Entypo name="plus" size={30} color={"black"} />
                )}
              </View>
            ))}
        </TouchableOpacity>

        {/* Lista de tarjetas */}
        {!organizador
          ? tarjetasGuardadas?.map((tarjeta, idx) => {
              const {
                bank_name,
                card_number,
                expiration_month,
                expiration_year,
              } = tarjeta;

              return (
                <View style={styles.cardItemContainer} key={idx}>
                  <TouchableOpacity onPress={() => handleRemoveCard(idx)}>
                    <Entypo
                      style={{ padding: 10 }}
                      name="minus"
                      size={30}
                      color={rojo}
                    />
                  </TouchableOpacity>

                  <Image
                    style={styles.cardIcon}
                    source={
                      tarjeta.icon
                        ? tarjeta.icon
                        : require("../../../../assets/icons/stp_card_undefined.png")
                    }
                  />

                  {/* Datos de tarjeta */}
                  <View>
                    {/* Nombre del banco y numeros de tarjeta */}
                    <Text style={styles.cardInfoTxt}>
                      {mayusFirstLetter(bank_name)} {card_number?.toLowerCase()}
                    </Text>
                    <Text style={{ ...styles.detailsAmount, marginTop: 4 }}>
                      Expira el {expiration_month + "/" + expiration_year}
                    </Text>
                  </View>
                </View>
              );
            })
          : // Mostrar la cuenta bancaria si existe
            cuentaBancaria && (
              <TouchableOpacity
                onPress={handlePressAdd}
                style={{ ...styles.cardItemContainer, marginTop: 20 }}
              >
                <MaterialCommunityIcons name="bank" size={30} color="black" />

                {/* Datos de tarjeta */}
                <View style={{ marginLeft: 20 }}>
                  {/* Nombre del banco y numeros de tarjeta */}
                  <Text style={{ ...styles.cardInfoTxt }}>
                    {mayusFirstLetter(
                      clabe.validate(usuario.cuentaBancaria).bank
                    )}
                  </Text>
                  <Text
                    style={{
                      color: "#888",
                      paddingVertical: 2,
                      fontWeight: "bold",
                    }}
                  >
                    {usuario.titularCuenta}
                  </Text>
                  <Text>{formatCuentaCLABE(usuario.cuentaBancaria)}</Text>
                </View>
              </TouchableOpacity>
            )}
      </View>

      {/* Botones selectores de tipo de historial */}
      <View style={styles.selector}>
        <Pressable
          onPress={() => setSelected("transfers")}
          style={{
            ...styles.selectorPressable,
            backgroundColor:
              selector === "transfers" ? azulClaro : "transparent",
          }}
        >
          <Text
            style={{
              color: selector === "transfers" ? "#fff" : "#000",
            }}
          >
            Transacciones
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSelected("charges")}
          style={{
            ...styles.selectorPressable,
            backgroundColor: selector === "charges" ? azulClaro : "transparent",
          }}
        >
          <Text
            style={{
              color: selector === "charges" ? "#fff" : "#000",
            }}
          >
            Cargos
          </Text>
        </Pressable>
      </View>

      <Modal
        animationType={"none"}
        transparent={true}
        visible={modalBank}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <ClabeInput
          prevValues={{
            clabe: usuario.cuentaBancaria,
            titular: usuario.titularCuenta,
          }}
          onAdd={handleAddAccount}
          setModalVisible={setModalBank}
        />
      </Modal>
    </View>
  );
}

const iconWidth = 45;

function IconTransfers({
  tipo,
}: {
  tipo: "cash" | "card" | "cancel" | "retiro";
}) {
  switch (tipo) {
    case "cancel":
      return (
        <View style={styles.iconContainer}>
          <Entypo name="cross" size={30} color={rojoClaro} />
        </View>
      );

    case "cash":
    case "card":
      return (
        <View style={styles.iconContainer}>
          {tipo === "card" ? (
            <Feather name="credit-card" size={24} color="black" />
          ) : (
            <FontAwesome5 name="money-bill-alt" size={24} color="black" />
          )}
          <Entypo
            style={{ ...styles.absoluteIcon, padding: 2 }}
            name="check"
            size={20}
            color={azulClaro}
          />
        </View>
      );
    case "retiro":
      return (
        <View style={styles.iconContainer}>
          <FontAwesome5 name="hand-holding-usd" size={20} color={"#000"} />
        </View>
      );
    default:
      return (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: iconWidth,

            marginRight: 10,
          }}
        >
          <Logo size={30} />
        </View>
      );
  }
}

function IconCharges({ item }: { item: chargeType }) {
  switch (item.status) {
    case "expired":
      return (
        <View style={styles.iconContainer}>
          <Feather name="clock" size={30} color={"black"} />
          <Feather
            style={styles.absoluteIcon}
            name="alert-circle"
            size={20}
            color={"orange"}
          />
        </View>
      );

    case "in_progress":
      return (
        <View style={styles.iconContainer}>
          <Feather name="clock" size={30} color={"black"} />
        </View>
      );

    case "cancelled":
    case "failed":
      if (item.method === "card") {
        return (
          <View style={styles.iconContainer}>
            <Feather name="credit-card" size={24} color="black" />
            <Entypo
              style={styles.absoluteIcon}
              name="cross"
              size={20}
              color={rojoClaro}
            />
          </View>
        );
      } else
        return (
          <View style={styles.iconContainer}>
            <Entypo name="cross" size={30} color={rojoClaro} />
          </View>
        );

    case "completed":
      return (
        <View style={styles.iconContainer}>
          {item.method === "card" ? (
            <Feather name="credit-card" size={24} color="black" />
          ) : (
            <FontAwesome5 name="money-bill-alt" size={24} color="black" />
          )}
          <Entypo
            style={{ ...styles.absoluteIcon, padding: 2 }}
            name="check"
            size={20}
            color={azulClaro}
          />
        </View>
      );
    default:
      return <Logo size={45} />;
  }
}

const styles = StyleSheet.create({
  cardItemContainer: {
    paddingLeft: 0,

    borderRadius: 20,
    marginBottom: 30,

    flexDirection: "row",

    alignItems: "center",
  },
  cardIcon: {
    height: 40,
    resizeMode: "contain",
    width: 80,
    alignSelf: "center",
  },
  cardInfoTxt: {
    fontWeight: "bold",
  },

  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  tarjetasContainer: {
    marginVertical: 40,
    marginTop: 20,

    marginHorizontal: 20,
  },
  elementContainer: {
    padding: 10,
    margin: 10,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    flexDirection: "row",

    ...shadowMuyBaja,
  },

  addContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    aspectRatio: 1,
  },

  title: {
    fontSize: 16,

    fontWeight: "bold",
  },
  noHay: {
    fontWeight: "bold",
    margin: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    color: "gray",
    fontSize: 12,
  },

  paymentType: {
    fontWeight: "bold",
    color: azulClaro,
    marginBottom: 5,
  },

  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: iconWidth,
    aspectRatio: 1,
    overflow: "hidden",
    marginRight: 10,
  },
  detailsAmount: {
    color: "gray",
    marginTop: 10,
  },

  absoluteIcon: {
    position: "absolute",
    backgroundColor: "#fff",

    borderRadius: 20,
    right: 0,
    bottom: 0,
  },

  balance: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 40,
  },

  button: {
    marginTop: 20,
    borderWidth: 0.4,
    borderColor: azulClaro,

    padding: 10,
    borderRadius: 10,
    margin: 20,

    color: azulClaro,
    fontWeight: "bold",

    textAlign: "center",
  },

  monney: {
    fontWeight: "900",
    fontSize: 14,
    marginHorizontal: 10,
  },
  fecha: {
    fontWeight: "bold",
    marginBottom: 0,
    marginTop: 20,
    fontSize: 14,
    marginLeft: 20,
  },

  selector: {
    padding: 5,
    borderRadius: 10,
    backgroundColor: azulFondo,
    flexDirection: "row",
    margin: 20,
    marginVertical: 0,
  },

  selectorPressable: {
    padding: 10,
    borderRadius: 10,

    flex: 1,
    alignItems: "center",
  },
});
