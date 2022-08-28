import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import Boton from "../../components/Boton";

import {
  azulClaro,
  azulFondo,
  enumToArray,
  getBlob,
  getUserSub,
  mayusFirstLetter,
  musicEnum,
  placeEnum,
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
import { DataStore, Storage } from "aws-amplify";
import { ComoditiesEnum, Evento } from "../../models";
import { ImagenesType } from "./Agregar1";
import { boletoType } from "./Agregar3";

const musicList = enumToArray(musicEnum);
const comoditiesList = enumToArray(ComoditiesEnum);
const lugarList = enumToArray(placeEnum);

const { height } = Dimensions.get("window");
export default function Agregar2({
  navigation,
}: {
  navigation: NavigationProp;
}) {
  // Enums del tipo de evento
  const [musica, setMusica] = useState<musicEnum>();
  const [comodities, setComodities] = useState<ComoditiesEnum[]>([]);
  const [lugar, setLugar] = useState<placeEnum>();
  const [otraMusica, setOtraMusica] = useState("");
  const [loading, setLoading] = useState(false);

  const [aceptoTerminos, setAceptoTerminos] = useState<
    | {
        ip: string;
        hora: Date;
      }
    | false
  >(false);

  const [ip, setIp] = useState("");
  useEffect(() => {
    NetInfo.fetch().then((state: any) => {
      setIp(state?.details?.ipAddress);
    });
  });

  const { evento }: { evento: any } = useEvento();

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
    if (musica === musicEnum.OTRO) {
      // Verificar que este otra musica
      if (otraMusica.length === 0) {
        Alert.alert("Error", "Agrega el otro tipo de musica");
        return;
      }

      musOtra = otraMusica;
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
      let imagenes: ImagenesType[] = [];
      let count = 0;

      // Subir fotos a S3 y crear el evento en la base de datos
      let promises: any = [];

      evento.imagenes?.map((e: any) => {
        delete e.uri;
        if (!e.key) {
          const key = "evento-" + evento.id + "|" + count + ".jpg";
          getBlob(e?.uri).then((r) => {
            promises.push(Storage.put(key, r).then(console.log));
          });
          e.key = key;
        }

        imagenes.push(e as any);
        count++;
      });

      // Esperar a que se resuelvan todas las promesas
      await Promise.all(promises);

      DataStore.save(
        new Evento({
          ...evento,
          titulo: evento.titulo ? evento.titulo : "",

          ubicacion: JSON.stringify(evento.ubicacion),

          imagenes: imagenes.map((e) => JSON.stringify(e)),
          boletos: evento.boletos?.map((e: boletoType) => JSON.stringify(e)),

          fechaInicial: evento.fechaInicial.getTime(),
          fechaFinal: evento?.fechaFinal?.getTime()
            ? evento?.fechaFinal?.getTime()
            : 0,

          musica,
          musOtra,
          tipoLugar: lugar,
          comodities,
          tosAceptance: JSON.stringify(aceptoTerminos),

          CreatorID: "UsuarioID",
        })
      ).then(console.log);
      navigation.popToTop();
      navigation.navigate("Home");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Sucedio un error creando el evento");
    }
    setLoading(false);
  }

  function handleAbrirTerminos() {
    Alert.alert("Info", "Ve nuestros terminos en la pagina oficial de partyUs");
  }

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
        <View style={{ ...styles.filterContainer, marginTop: 0 }}>
          {/* Titulo */}
          <Text style={styles.tituloFiltro}>TIPO DE LUGAR</Text>
          <DropDownSelector
            items={lugarList}
            handleSelectItem={(r: any) => setLugar(r)}
            selectedItem={lugar}
          />
        </View>

        {/* Tipo de musica */}
        <View style={styles.filterContainer}>
          {/* Titulo */}
          <Text style={styles.tituloFiltro}>TIPO DE MUSICA</Text>
          <DropDownSelector
            items={musicList}
            handleSelectItem={(r: any) => setMusica(r)}
            selectedItem={musica}
          />
        </View>

        {/* Tipo otro */}
        {musica === musicEnum.OTRO && (
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
        <View
          style={{
            marginTop: 40,
          }}
        />
      </ScrollView>

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
        <View
          style={{
            width: 30.5,
          }}
        />
        <Text style={styles.textoTerminos}>
          Acepto{" "}
          <Text style={{ color: azulClaro }} onPress={handleAbrirTerminos}>
            terminos y condiciones
          </Text>
        </Text>
        <RadioButton checked={!!aceptoTerminos} />
      </Pressable>

      <Boton
        loading={loading}
        style={{ margin: 20 }}
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
  },

  textoTerminos: {
    flex: 1,
    marginRight: 10,
    fontSize: 16,
    textAlign: "center",
  },
});
