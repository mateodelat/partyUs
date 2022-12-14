import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Linking,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import Boton from "../../components/Boton";

import {
  abrirTerminos,
  AsyncAlert,
  azulClaro,
  azulFondo,
  currency,
  enumToArray,
  fetchFromStripe,
  formatDiaMesCompleto,
  getBlob,
  getIpAddress,
  getUserSub,
  graphqlRequest,
  isUrl,
  mayusFirstLetter,
  precioConComision,
  sendAdminNotification,
  subirImagen,
  vibrar,
  VibrationType,
} from "../../../constants";

import { NavigationProp } from "../../shared/interfaces/navigation.interface";
import HeaderAgregar from "./Agregar1/HeaderAgregar";
import DropDownSelector from "../../components/DropDownSelector";
import InputOnFocus from "../../components/InputOnFocus";
import useEvento from "../../Hooks/useEvento";
import RadioButton from "../../components/RadioButton";
import NetInfo from "@react-native-community/netinfo";
import { API, DataStore, Storage } from "aws-amplify";
import {
  Boleto,
  ComoditiesEnum,
  Evento,
  MusicEnum,
  PlaceEnum,
} from "../../models";

import { createEvento } from "../../graphql/mutations";
import { Notificacion } from "../../models";
import { TipoNotificacion } from "../../models";
import { notificacionesRecordatorio } from "../Inicio/Notifications/functions";
import useUser from "../../Hooks/useUser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { logger } from "react-native-logs";
import { STRIPE_PRODUCTS_KEY } from "../../../constants/keys";
import Stripe from "stripe";

const musicList = enumToArray(MusicEnum);
const comoditiesList = enumToArray(ComoditiesEnum);
const lugarList = enumToArray(PlaceEnum);

const { height } = Dimensions.get("window");
export default function Agregar2({
  navigation,
}: {
  navigation: NavigationProp;
}) {
  const log = logger.createLogger();

  const { evento, setEvento } = useEvento();

  const { usuario } = useUser();

  // Enums del tipo de evento
  const [musica, setMusica] = useState<MusicEnum | undefined>(
    evento.musica ? (evento.musica as MusicEnum) : undefined
  );
  const [comodities, setComodities] = useState<ComoditiesEnum[]>(
    evento.comodities ? (evento.comodities as ComoditiesEnum[]) : []
  );
  const [lugar, setLugar] = useState<PlaceEnum | undefined>(
    evento.tipoLugar ? (evento.tipoLugar as PlaceEnum) : undefined
  );
  const [otraMusica, setOtraMusica] = useState(
    evento.musOtra ? evento.musOtra : ""
  );
  const [loading, setLoading] = useState(false);

  const [aceptoTerminos, setAceptoTerminos] = useState<
    | {
        ip: string;
        hora: Date;
      }
    | false
  >(evento.tosAceptance ? (evento.tosAceptance as any) : false);

  const [ip, setIp] = useState("8.8.8.8");
  useEffect(() => {
    (async () => {
      setIp(await getIpAddress());
    })();
  });

  async function handleGuardar() {
    // Verificaciones
    if (!lugar) {
      Alert.alert("Error", "Agrega el tipo de lugar de tu evento");
      return;
    }

    if (!musica) {
      Alert.alert(
        "Error",
        "Agrega el tipo de musica que va a haber en tu evento"
      );
      return;
    }

    if (!aceptoTerminos) {
      Alert.alert(
        "Atencion",
        "Debes aceptar los terminos y condiciones de partyUs para hacer un evento"
      );
      return;
    }

    let musOtra: undefined | string;
    if (musica === MusicEnum.OTRO) {
      // Verificar que este otra musica
      if (otraMusica.length === 0) {
        Alert.alert("Error", "Agrega el otro tipo de musica");
        return;
      }

      musOtra = otraMusica;
    }

    setEvento({
      ...evento,

      tosAceptance: aceptoTerminos as any,
      musOtra,
      comodities,
      tipoLugar: lugar,
      musica,
    });

    if (
      !(await AsyncAlert(
        "Atencion",
        "Una vez puesta la ubicacion y fecha no se puden cambiar."
      ))
    ) {
      return;
    }

    // Verificacion final
    if (
      !evento.imagenes ||
      !evento.fechaInicial ||
      !evento.fechaInicial ||
      !evento.titulo ||
      !evento.ubicacion ||
      !evento.id
    ) {
      Alert.alert(
        "Error",
        "Hubo un error, falta algun dato de las pantallas anteriores"
      );
      return;
    }

    setLoading(true);

    try {
      let imagenes: string[] = [];
      let count = 0;
      let imagenPrincipalIDX: number = 0;

      // Objeto de promesas de todas las operaciones
      let promises: any = [];

      // Tenemos que esperar a que se resuelva productID para poder crear los precios
      let stripePromises: {
        productID?: Promise<string>;
        prices?: Promise<any>[];
      } = {
        productID: undefined,
        prices: [],
      };

      const sub = await getUserSub();
      if (!sub) {
        Alert.alert("Error", "Usuario no autenticado");
        throw new Error(
          "No se encontro el sub del usuario al crear el evento (No esta autenticado)"
        );
      }
      let personasMax = evento.boletos.reduce(
        (prev, bol) => prev + bol.cantidad,
        0
      );

      // Crear el producto con los datos del evento
      stripePromises.productID = fetchFromStripe<Stripe.Product>({
        path: "/v1/products",
        type: "POST",
        input: {
          name: evento.titulo,
          unit_label: "boleto",
          statement_descriptor: evento.titulo,
          type: "service",
          description: evento.detalles?.slice(0, 50),
          metadata: {
            cantidad: personasMax,
            creatorID: usuario.id,
            eventoID: evento.id,
          },

          images: [await evento.stripeFileImagenPrincipal],
        } as Stripe.ProductCreateParams,
        secretKey: STRIPE_PRODUCTS_KEY,
      }).then((r) => {
        return r.id;
      });

      let precioMin: number = 0;
      let precioMax: number = 0;

      evento.boletos.map(async (value: Boleto) => {
        precioMin = !precioMin
          ? value.precio
          : value.precio < precioMin
          ? value.precio
          : precioMin;
        precioMax = !precioMax
          ? value.precio
          : value.precio > precioMax
          ? value.precio
          : precioMax;

        // Crear los precios de stripe y guardar el nuevo boleto

        stripePromises.prices.push(
          fetchFromStripe<Stripe.Price>({
            path: "/v1/prices",
            type: "POST",
            input: {
              billing_scheme: "per_unit",
              nickname: value.titulo,
              product: await stripePromises.productID,
              currency,
              unit_amount_decimal: String(
                precioConComision(value.precio) * 100
              ),
              metadata: {
                cantidad: value.cantidad,
                precioConComision: precioConComision(value.precio),
                precioSinComision: value.precio,
              },
            } as Stripe.PriceCreateParams,
            secretKey: STRIPE_PRODUCTS_KEY,
          }).then((r) => {
            return r.id;
          })
        );

        // Agegar a las promesas globales por si hay un error
        promises.push(
          DataStore.save(
            new Boleto({
              cantidad: value.cantidad,
              eventoID: evento.id,
              precio: value.precio,
              titulo: value.titulo,
              descripcion: value.descripcion,
            })
          )
        );
      });

      evento.imagenes?.map((e: any, idx: number) => {
        let url: string;

        if (!isUrl(e.uri)) {
          const key = "evento-" + evento.id + "|" + count + ".jpg";
          getBlob(e?.uri).then((r) => {
            promises.push(subirImagen(key, r));
          });
          url = key;
          count++;
        } else {
          url = e.uri;
        }

        if (e.imagenPrincipal) {
          imagenPrincipalIDX = idx;
        }

        imagenes.push(url);
      });

      // Mandar notificacion al guia de nueva reserva
      promises.push(
        DataStore.save(
          new Notificacion({
            tipo: TipoNotificacion.EVENTOCREADO,
            titulo: "Nuevo evento",
            descripcion: `Tu evento ${
              evento.titulo
            } para el ${formatDiaMesCompleto(
              evento.fechaInicial
            )} se ha creado con exito.`,
            usuarioID: sub,

            showAt: new Date().toISOString(),

            eventoID: evento.id,
            organizadorID: sub,
          })
        )
      );

      // Crear evento con id personalizado para coincidir con los boletos y manejar las imagenes con precision
      const eventoAEnviar = {
        id: evento.id,
        titulo: evento.titulo ? evento.titulo : "",

        ubicacion: JSON.stringify(evento.ubicacion),

        imagenes,
        imagenPrincipalIDX,

        fechaInicial: (evento.fechaInicial as any).getTime(),
        fechaFinal: (evento.fechaFinal as any).getTime()
          ? (evento.fechaFinal as any).getTime()
          : 0,

        personasMax,

        precioMin,
        precioMax,

        detalles: evento.detalles,

        musica,
        musOtra,
        tipoLugar: lugar,
        comodities,
        tosAceptance: JSON.stringify(aceptoTerminos),

        paymentProductID: await stripePromises.productID,

        CreatorID: sub,
      } as Evento;

      // Enviar notificaciones de recordatorio evento al organizador
      notificacionesRecordatorio({
        evento: eventoAEnviar,
        usuario,
        organizador: true,
      });

      await graphqlRequest({
        query: createEvento,
        variables: { input: eventoAEnviar },
      });

      // Esperar a que se resuelvan todas las promesas de upload de imagenes y stripe prices
      await Promise.all(promises);
      await Promise.all([
        stripePromises.productID,
        Promise.all(stripePromises?.prices),
      ]);

      setLoading(false);

      // Notificar a los administradores de la app de nuevo evento
      sendAdminNotification({
        titulo: "Nuevo evento creado",
        eventoID: evento.id,
        sender: usuario,
        organizadorID: usuario.id,

        descripcion:
          " creo un nuevo evento " +
          evento.titulo +
          " para " +
          personasMax +
          " personas",
      });

      navigation.popToTop();
      navigation.navigate("ExitoScreen", {
        txtExito: "Evento creado",
        descripcion:
          "Se ha creado tu evento con exito. En breve aparecera en los servidores de partyus",
      });
    } catch (error) {
      setLoading(false);

      if (error) {
        log.debug(error);
        Alert.alert(
          "Error",
          "Sucedio un error creando el evento: " +
            (error?.message ? error.message : "")
        );
      }
    }
  }

  const { bottom } = useSafeAreaInsets();

  return (
    <Pressable
      style={{
        backgroundColor: "#fff",
        flex: 1,
        minHeight: height,
      }}
    >
      {/* Header con barra de nivel */}
      <HeaderAgregar step={4} />

      {/* Contenedor interno con padding */}
      <ScrollView
        style={{
          padding: 20,
          flex: 1,
        }}
      >
        {/* Tipo de lugar */}
        <View style={{ ...styles.filterContainer, marginTop: 0, zIndex: 2 }}>
          {/* Titulo */}
          <Text style={styles.tituloFiltro}>TIPO DE LUGAR</Text>
          <DropDownSelector
            items={lugarList}
            handleSelectItem={(r: any) => setLugar(r)}
            selectedItem={lugar}
          />
        </View>

        {/* Tipo de musica */}
        <View style={{ ...styles.filterContainer, zIndex: 1 }}>
          {/* Titulo */}
          <Text style={styles.tituloFiltro}>TIPO DE MUSICA</Text>
          <DropDownSelector
            items={musicList}
            handleSelectItem={(r: any) => setMusica(r)}
            selectedItem={musica}
          />
        </View>

        {/* Tipo otro */}
        {musica === MusicEnum.OTRO && (
          <InputOnFocus
            style={{ marginTop: 5, marginBottom: 5 }}
            textStyle={{
              fontSize: 18,
              color: azulClaro + "dd",
              paddingLeft: 10,
            }}
            onChangeText={setOtraMusica}
            value={otraMusica}
          />
        )}

        {/* Comodities */}
        <Pressable style={styles.filterContainer}>
          {/* Titulo */}
          <Text style={styles.tituloFiltro}>COMODITIES</Text>

          <View style={styles.enumsContainer}>
            {comoditiesList.map((e, idx) => {
              const selected = comodities.find((r) => r === e);
              function onPress() {
                const idx = comodities.findIndex((r) => r === e);

                let ne = [...comodities];
                // Si no existe el elemento agregarlo
                if (idx < 0) {
                  ne.push(e);
                } else {
                  ne.splice(idx, 1);
                }

                setComodities(ne);
              }

              return (
                <Pressable
                  key={e}
                  onPress={onPress}
                  style={{
                    ...styles.botonEnum,
                    backgroundColor: selected ? azulClaro : azulFondo,
                  }}
                >
                  <Text
                    style={{
                      ...styles.enumTxt,
                      color: selected ? "#fff" : "#888",
                    }}
                  >
                    {mayusFirstLetter(e)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            if (aceptoTerminos) {
              setAceptoTerminos(false);
            } else {
              setAceptoTerminos({
                ip,
                hora: new Date(),
              });
            }
            vibrar(VibrationType.medium);
          }}
          style={styles.termsContainer}
        >
          <Text style={styles.textoTerminos}>
            Acepto{" "}
            <Text style={{ color: azulClaro }} onPress={abrirTerminos}>
              terminos y condiciones
            </Text>
          </Text>
          <RadioButton checked={!!aceptoTerminos} />
        </Pressable>
      </ScrollView>

      <Boton
        loading={loading}
        style={{ margin: 20, marginBottom: bottom ? bottom : 20 }}
        titulo="Continuar"
        onPress={handleGuardar}
        color={azulClaro}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dateButton: {
    padding: 10,
    paddingLeft: 20,
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },

  textDateContainer: {
    marginLeft: 10,
    marginRight: 10,
    flex: 1,
  },

  tituloDate: {
    color: "#888",
  },
  dateText: {
    color: azulClaro,
    fontWeight: "bold",
  },
  enumsContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
  },

  tituloFiltro: {
    color: "#888",
  },

  filterContainer: {
    marginTop: 30,
  },

  enumTxt: {
    color: "#fff",
    fontWeight: "600",
  },

  botonEnum: {
    padding: 10,
    paddingHorizontal: 20,
    marginRight: 20,
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: azulClaro,
  },

  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 80,
    padding: 20,
    marginBottom: 10,
  },

  textoTerminos: {
    flex: 1,
    marginRight: 10,
    fontSize: 16,
    textAlign: "center",
  },
});
