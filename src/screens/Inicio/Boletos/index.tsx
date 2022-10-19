import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { NavigationProp } from "../../../shared/interfaces/navigation.interface";
import { EventoType } from "../Home";
import Header from "../../../navigation/components/Header";
import {
  azulClaro,
  formatMoney,
  graphqlRequest,
  precioConComision,
  redondear,
  rojo,
  vibrar,
  VibrationType,
} from "../../../../constants";

import { AntDesign } from "@expo/vector-icons";

import { DataStore } from "aws-amplify";

import { OpType } from "@aws-amplify/datastore";

import { Boleto } from "../../../models";
import Boton from "../../../components/Boton";
import BoletoItem from "./BoletoItem";
import { Cupon } from "../../../models";
import { listBoletos } from "../../../graphql/queries";
import { ReservasBoletos } from "../../../models";
import { Reserva } from "../../../models";

export type BoletoType = Boleto & {
  quantity?: number;
};

export default function ({
  route,
  navigation,
}: {
  route: { params: EventoType };
  navigation: NavigationProp;
}) {
  const { id: eventID } = route.params;

  enum cuponEnum {
    "loading",
    "Disponible",
    "Invalido",
  }

  const [boletos, setBoletos] = useState<BoletoType[] | undefined>(
    route.params.boletos
  );
  const [descriptionShownIdx, setDescriptionShownIdx] = useState<number>();

  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [cuponDescuento, setCuponDescuento] = useState("");
  const [cuponStatus, setCuponStatus] = useState<cuponEnum>();
  const [descuento, setDescuento] = useState<Cupon>();

  let subtotal = 0;
  let comision = 0;

  boletos?.map((e) => {
    let { quantity } = e;
    quantity = quantity ? quantity : 0;

    if (!e.precio) return;

    subtotal += e.precio * quantity;
    comision += precioConComision(e.precio) * quantity - e.precio * quantity;
  });

  let total =
    subtotal +
    comision -
    (descuento?.cantidadDescuento
      ? descuento?.cantidadDescuento
      : descuento?.porcentajeDescuento
      ? descuento.porcentajeDescuento * (subtotal + comision)
      : 0);

  total = total < 0 ? 0 : total;

  // Agregar suscripcion para cambio de tipo de boletos
  useEffect(() => {
    onRefresh();
  }, []);

  function handleContinuar() {
    // Verificar que haya seleccionado boletos

    let existenBoletos = !!boletos?.find((e) => !!e.quantity);

    if (!existenBoletos) {
      Alert.alert("Error", "Agrega minimo un boleto");
      return;
    }
    navigation.navigate("Pagar", {
      ...route.params,
      boletos,
      descuento,
      total,
    });
  }

  function handleBoletoChange(minus: boolean, cambio: number, idx: number) {
    setBoletos((prev) => {
      const i = new Date();
      let cantidad = !!prev[idx].quantity ? (prev[idx].quantity as number) : 0;

      let max =
        (prev[idx].cantidad as any) -
        (prev[idx].personasReservadas
          ? (prev[idx].personasReservadas as number)
          : 0);

      if (minus) {
        cantidad - cambio < 0
          ? (cambio = 0)
          : (cantidad -= cambio) && vibrar(VibrationType.light);
      } else {
        cantidad + cambio > max
          ? (cambio = max)
          : (cantidad += cambio) && vibrar(VibrationType.light);
      }

      cantidad = cambio === 0 && minus ? 0 : redondear(cantidad, cambio);

      prev[idx] = {
        ...prev[idx],
        quantity: cantidad,
      };

      return [...prev];
    });
  }

  const titulo = route.params.titulo;

  async function verificarCupon() {
    // Si no hay cupon reiniciar errores
    if (!cuponDescuento) {
      setCuponStatus(undefined);
      setDescuento(undefined);
      return;
    }

    setCuponStatus(cuponEnum.loading);
    try {
      const cupon = await DataStore.query(Cupon, (e) =>
        e.id("eq", cuponDescuento.replace(/ /g, "").toUpperCase())
      ).then((r) => r[0]);
      // .vencimiento("gt", new Date().getTime())
      // .restantes("gt", 0)

      // Si hay porcentaje de descuento, tomarlo primero
      if (cupon) {
        if (cupon.vencimiento < new Date().getTime()) {
          Alert.alert("Error", "El cupon ya vencio");
          setCuponStatus(cuponEnum.Invalido);
          setDescuento(undefined);
          return;
        } else if (cupon.restantes < 0) {
          Alert.alert("Error", "No quedan cupones restantes");
          setCuponStatus(cuponEnum.Invalido);
          setDescuento(undefined);
          return;
        } else {
          setDescuento(cupon);

          setCuponStatus(cuponEnum.Disponible);
        }
      } else {
        setCuponStatus(cuponEnum.Invalido);
        setDescuento(undefined);
        Alert.alert("Error", "Cupon de descuento no valido");
      }
    } catch (error) {
      setCuponStatus(cuponEnum.Invalido);
      setDescuento(undefined);
      Alert.alert("Error", "Cupon de descuento no valido");

      console.log(error);
    }
  }

  async function onRefresh() {
    setRefreshing(true);

    // Pedir boletos del evento
    await DataStore.query(Boleto, (bol) => bol.eventoID("eq", eventID), {
      sort: (e) => e.precio("DESCENDING"),
    }).then(async (bols) => {
      // Poner reservas en boletos en 0 para calcularla de reservas validas
      bols = bols.map((e) => ({
        ...e,
        personasReservadas: 0,
      }));

      const i = new Date().getTime();
      // Pedir todas las reservas validas
      return await DataStore.query(Reserva, (r) =>
        r
          .eventoID("eq", eventID)
          .cancelado("ne", true)

          // Si esta pagado se ignora la fecha de expiracion
          .or((e) =>
            e
              .fechaExpiracionUTC("gt", new Date().toISOString())
              .pagado("eq", true)
          )
      ).then(async (r) => {
        let personasReservadas = 0;

        await Promise.all(
          r.map(async (e, idx) => {
            personasReservadas += e.cantidad;

            // Encontrar los boletos asociados a la reserva valida
            const reservadosEnBoleto = DataStore.query(ReservasBoletos, (rel) =>
              rel.reservaID("eq", e.id)
            ).then((rels) => {
              //
              // Mapear las relaciones reserva boleto asociadas a la reserva del evento
              rels.map((rel) => {
                //
                // Por cada relacion buscar el boleto asociado
                const boletoIDX = bols.findIndex(
                  (bol) => bol.id === rel.boletoID
                );

                const reservadosPrev = bols[boletoIDX].personasReservadas;

                // Acualizar valor de boletos
                (bols[boletoIDX] as any).personasReservadas =
                  reservadosPrev + rel.quantity;
              });
            });

            // Esperar todas las solicitudes
            await reservadosEnBoleto;
          })
        );
        setBoletos(bols);
      });
    });

    setRefreshing(false);
  }

  return (
    <View style={{ flex: 1 }}>
      <Header title={titulo} style={{ paddingHorizontal: 5 }} />

      <View style={styles.container}>
        <FlatList
          data={boletos}
          ListEmptyComponent={() => (
            <View
              style={{
                backgroundColor: "red",
              }}
            />
          )}
          refreshControl={
            <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
          }
          showsVerticalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item, index }) => {
            const showDescripcion = descriptionShownIdx === index;
            return (
              <BoletoItem
                item={item}
                showDescripcion={showDescripcion}
                handleShowDescripcion={() =>
                  setDescriptionShownIdx(showDescripcion ? undefined : index)
                }
                handleChange={(minus, cambio) =>
                  handleBoletoChange(minus, cambio, index)
                }
              />
            );
          }}
        />

        {/* Precio */}
        {!!subtotal && (
          <Pressable
            onPress={() => setModalVisible(true)}
            style={{ padding: 20 }}
          >
            {/* Cupon de descuento */}
            <Text>¿Tienes un cupon de descuento? Ponlo aqui 👇</Text>
            <View style={styles.cuponDescuento}>
              <TextInput
                value={cuponDescuento}
                onChangeText={setCuponDescuento}
                onEndEditing={verificarCupon}
                style={{ flex: 1 }}
              />

              {cuponStatus === cuponEnum.Disponible ||
              cuponStatus === cuponEnum.Invalido ? (
                <>
                  <Text
                    style={{
                      ...styles.cuponStatusTxt,
                      color:
                        cuponStatus === cuponEnum.Disponible ? azulClaro : rojo,
                    }}
                  >
                    {cuponStatus === cuponEnum.Disponible
                      ? "Disponible"
                      : "Invalido"}
                  </Text>

                  {cuponStatus === cuponEnum.Disponible ? (
                    <AntDesign name="checkcircle" size={17} color={azulClaro} />
                  ) : (
                    <AntDesign name="closecircle" size={17} color={rojo} />
                  )}
                </>
              ) : (
                cuponStatus === cuponEnum.loading && (
                  <ActivityIndicator size={"small"} color={azulClaro} />
                )
              )}
            </View>

            <View style={styles.priceStatement}>
              <Text style={styles.titulo}>Subtotal:</Text>
              <Text style={styles.precio}>{formatMoney(subtotal, true)}</Text>
            </View>
            <View style={styles.priceStatement}>
              <Text style={styles.titulo}>Costos servicio(con IVA):</Text>
              <Text style={styles.precio}>{formatMoney(comision, true)}</Text>
            </View>
            {descuento && (
              <View style={styles.priceStatement}>
                <Text style={styles.titulo}>Descuento:</Text>
                <Text style={styles.precio}>
                  {descuento.porcentajeDescuento
                    ? descuento.porcentajeDescuento * 100 + "%"
                    : "-" + formatMoney(descuento.cantidadDescuento, true)}
                </Text>
              </View>
            )}
            <View
              style={{
                width: "100%",
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: "#bbb",
                marginVertical: 10,
              }}
            />
            <View style={styles.priceStatement}>
              <Text style={styles.titulo}>Total:</Text>
              <Text style={styles.precio}>{formatMoney(total, true)}</Text>
            </View>
          </Pressable>
        )}

        <Boton
          titulo={"Pagar"}
          onPress={handleContinuar}
          style={{ margin: 20, marginTop: 0 }}
        />

        {/* Informacion de precios */}
        <Modal
          animationType={"none"}
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
          }}
        >
          <Pressable
            onPress={() => setModalVisible(false)}
            style={{ flex: 1, backgroundColor: "#00000099" }}
          />

          <View style={{ backgroundColor: "#00000099" }}>
            <View style={styles.modalContainer}>
              <Text style={styles.tituloModal}>
                Aprende mas de nuestros precios
              </Text>
              <View style={styles.line} />
              <Text style={styles.subTituloModal}>Costo de servicio</Text>
              <Text style={styles.descripcionModal}>
                Este costo de servicio le permite a Party us de cubrir el rango
                de operaciones para mantener la aplicacion y ofrecerte la mejor
                experiencia. El precio incluye IVA
              </Text>
              <Boton titulo="OK" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    width: "100%",
    height: 0.5,
    backgroundColor: "gray",
    marginVertical: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  cuponDescuento: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    paddingHorizontal: 10,

    borderColor: "lightgray",
    marginTop: 10,

    alignItems: "center",
    flexDirection: "row",
    marginBottom: 10,
  },

  cuponStatusTxt: {
    fontWeight: "bold",
    marginRight: 5,
    color: "#555",
  },

  priceStatement: {
    marginVertical: 10,
    flexDirection: "row",
  },

  titulo: {
    color: "#555",
    fontWeight: "bold",
    flex: 1,
  },
  precio: {
    fontWeight: "900",
  },

  tituloModal: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 10,
  },

  modalContainer: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: "#fff",
    padding: 20,
  },

  subTituloModal: {
    left: -10,
    fontWeight: "900",
    color: "#333",
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },

  descripcionModal: {
    color: "#000",
    marginBottom: 20,
  },
});
