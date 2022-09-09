import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
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
  azulFondo,
  container,
  enumToArray,
  formatMoney,
  msInDay,
  precioConComision,
  redondear,
  rojo,
  rojoClaro,
} from "../../../../constants";

import { AntDesign } from "@expo/vector-icons";

import { DataStore } from "aws-amplify";

import { OpType } from "@aws-amplify/datastore";

import { Boleto, MusicEnum, PlaceEnum } from "../../../models";
import Boton from "../../../components/Boton";
import BoletoItem from "./BoletoItem";
import InputOnFocus from "../../../components/InputOnFocus";
import { Cupon } from "../../../models";
import Line from "../../../components/Line";
import { Evento } from "../../../models";

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
  route.params = {
    CreatorID: "04eba9f3-5ef3-4dd5-9f08-9777e7aaaa4f",
    boletos: [
      {
        cantidad: 50,
        createdAt: "2022-08-31T05:28:18.895Z",
        descripcion: "",
        eventoID: "f2dd5548-ab62-4ff0-aa5a-af7485efbed1",
        id: "06a90ee7-7e2d-4201-8371-a097dd30dfea",
        personasReservadas: null,
        precio: 750,
        titulo: "VIP",
        updatedAt: "2022-08-31T05:28:18.895Z",
      },
      {
        cantidad: 80,
        createdAt: "2022-08-31T05:28:17.152Z",
        descripcion: "",
        eventoID: "f2dd5548-ab62-4ff0-aa5a-af7485efbed1",
        id: "7843cd0e-db23-461a-9b4f-ea527a5dce2b",
        personasReservadas: null,
        precio: 100,
        titulo: "Entrada normal",
        updatedAt: "2022-08-31T05:28:17.152Z",
      },
    ],
    createdAt: "2022-08-31T05:28:16.983Z",
    detalles: null,
    fechaFinal: 1662786000000,
    fechaInicial: 1662753600000,
    id: "f2dd5548-ab62-4ff0-aa5a-af7485efbed1",
    imagenPrincipalIDX: 0,
    imagenes: [
      {
        key: "https://images.unsplash.com/photo-1495837174058-628aafc7d610?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=800&ixid=MnwxfDB8MXxyYW5kb218MHx8cGFydHl8fHx8fHwxNjYxOTIzNTkz&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1100",
        uri: "https://images.unsplash.com/photo-1495837174058-628aafc7d610?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=800&ixid=MnwxfDB8MXxyYW5kb218MHx8cGFydHl8fHx8fHwxNjYxOTIzNTkz&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1100",
      },
      {
        key: "https://images.unsplash.com/photo-1627020730793-2ccb5cd55e99?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=800&ixid=MnwxfDB8MXxyYW5kb218MHx8cGFydHl8fHx8fHwxNjYxOTIzNjAx&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1100",
        uri: "https://images.unsplash.com/photo-1627020730793-2ccb5cd55e99?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=800&ixid=MnwxfDB8MXxyYW5kb218MHx8cGFydHl8fHx8fHwxNjYxOTIzNjAx&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1100",
      },
      {
        key: "https://images.unsplash.com/photo-1623788452350-4c8596ff40bb?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=800&ixid=MnwxfDB8MXxyYW5kb218MHx8cGFydHl8fHx8fHwxNjYxOTIzNjA4&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1100",
        uri: "https://images.unsplash.com/photo-1623788452350-4c8596ff40bb?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=800&ixid=MnwxfDB8MXxyYW5kb218MHx8cGFydHl8fHx8fHwxNjYxOTIzNjA4&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1100",
      },
    ],
    musOtra: null,
    musica: "REGGETON",
    owner: {
      admin: false,
      calificacion: null,
      createdAt: "2022-08-29T01:29:04.989Z",
      email: "mateodelat@gmail.com",
      fechaNacimiento: "Thu Aug 29 2002 17:00:00 GMT-0700 (MST)",
      foto: "https://ui-avatars.com/api/?name=mateodleat&bold=true&background=000000&color=fff&length=1",
      id: "04eba9f3-5ef3-4dd5-9f08-9777e7aaaa4f",
      idKey: "usr-04eba9f3-5ef3-4dd5-9f08-9777e7aaaa4f|id.jpg",
      idUploaded: true,
      imagenFondo:
        "https://images.unsplash.com/photo-1606104255713-cd96d1f41c28?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=500&ixid=MnwxfDB8MXxyYW5kb218MHx8cGFydHl8fHx8fHwxNjYxNzM2NTQy&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=900",
      materno: "rahul",
      nickname: "mateodelat",
      nombre: "rahul",
      notificationToken: null,
      numResenas: null,
      organizador: true,
      paterno: "rahul",
      phoneCode: null,
      phoneNumber: null,
      updatedAt: "2022-08-31T19:08:35.056Z",
      verified: true,
    },
    personasMax: 130,
    personasReservadas: null,
    precioMax: 750,
    precioMin: 100,
    tipoLugar: "INTERIOR",
    titulo: "Summer fest 2022",
    tosAceptance: {
      hora: "2022-08-31T05:28:12.402Z",
      ip: "10.0.2.16",
    },
    ubicacion: {
      latitude: 43.67918571887254,
      latitudeDelta: 0.05067978754303226,
      longitude: -80.40836691856384,
      longitudeDelta: 0.04040110856294632,
      ubicacionId: "ChIJAAAAAAAAAAARiJVfJxIYXpE",
      ubicacionNombre: "Grand River Grooming",
    },
    updatedAt: "2022-08-31T05:28:16.983Z",
  } as any;

  const { id: eventID } = route.params;

  enum cuponEnum {
    "loading",
    "Disponible",
    "Invalido",
  }

  const [boletos, setBoletos] = useState<BoletoType[]>(route.params.boletos);
  const [descriptionShownIdx, setDescriptionShownIdx] = useState<number>();

  const [modalVisible, setModalVisible] = useState(false);

  const [cuponDescuento, setCuponDescuento] = useState("");
  const [cuponStatus, setCuponStatus] = useState<cuponEnum>();
  const [descuento, setDescuento] = useState<Cupon>();

  let subtotal = 0;
  let comision = 0;

  boletos.map((e) => {
    let { quantity } = e;
    quantity = quantity ? quantity : 0;

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
    setBoletos((pre) => {
      pre = pre.sort((a, b) => (a.precio < b.precio) as any);
      return pre;
    });

    const sub = DataStore.observe(Boleto, (fe) =>
      fe.eventoID("eq", eventID)
    ).subscribe(async (msg) => {
      const { titulo, id } = msg.element;
      let neBol = [...boletos];

      // Si se agrego tipo de boleto, agregarlo
      if (msg.opType === OpType.INSERT) {
        Alert.alert("Atencion", "Boleto " + titulo + " agregado");

        neBol = [...neBol, msg.element].sort(
          (a, b) => (a.precio < b.precio) as any
        );
      }
      // Boleto actualizado
      else if (msg.opType === OpType.UPDATE) {
        Alert.alert("Atencion", "Boleto " + titulo + " actualizado");

        neBol = neBol.map((e) => {
          if (e.id === id) {
            return msg.element;
          } else return e;
        });
      }
      // Boleto borrado
      else if (msg.opType === OpType.DELETE) {
        Alert.alert("Atencion", "Boleto " + titulo + " borrado");
      }

      setBoletos(neBol);
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  function handleContinuar() {
    // Verificar que los boletos sigan disponibles

    // console.log({ ...route.params, boletos, descuento, total });

    navigation.navigate("Pagar", {
      ...route.params,
      boletos,
      descuento,
      total,
    });
  }

  function handleBoletoChange(minus: boolean, cambio: number, idx: number) {
    setBoletos((prev) => {
      let cantidad = !!prev[idx].quantity ? (prev[idx].quantity as number) : 0;

      const max =
        prev[idx].cantidad -
        (prev[idx].personasReservadas
          ? (prev[idx].personasReservadas as number)
          : 0);

      if (minus) {
        cantidad - cambio < 0 ? (cambio = 0) : (cantidad -= cambio);
      } else {
        cantidad + cambio > max ? (cambio = max) : (cantidad += cambio);
      }

      cantidad = cambio === 0 && minus ? 0 : redondear(cantidad, cambio);

      prev[idx].quantity = cantidad;

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
        e
          .id("eq", cuponDescuento.toUpperCase())
          .vencimiento("gt", new Date().getTime())
          .restantes("gt", 0)
      ).then((r) => r[0]);

      // Si hay porcentaje de descuento, tomarlo primero
      if (cupon) {
        setDescuento(cupon);
        setCuponStatus(cuponEnum.Disponible);
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

  return (
    <View style={{ flex: 1 }}>
      <Header
        title={titulo}
        navigation={navigation}
        style={{ paddingHorizontal: 5 }}
      />

      <View style={styles.container}>
        <FlatList
          data={boletos}
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
              <Text style={styles.precio}>{formatMoney(subtotal)}</Text>
            </View>
            <View style={styles.priceStatement}>
              <Text style={styles.titulo}>Costos servicio(con IVA):</Text>
              <Text style={styles.precio}>{formatMoney(comision)}</Text>
            </View>
            {descuento && (
              <View style={styles.priceStatement}>
                <Text style={styles.titulo}>Descuento:</Text>
                <Text style={styles.precio}>
                  {descuento.porcentajeDescuento
                    ? descuento.porcentajeDescuento * 100 + "%"
                    : "-" + formatMoney(descuento.cantidadDescuento)}
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
              <Text style={styles.precio}>{formatMoney(total)}</Text>
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
