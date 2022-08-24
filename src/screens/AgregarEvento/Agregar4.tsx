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
  comoditiesEnum,
  enumToArray,
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

const musicList = enumToArray(musicEnum);
const comoditiesList = enumToArray(comoditiesEnum);
const lugarList = enumToArray(placeEnum);

const { height } = Dimensions.get("window");
export default function Agregar2({
  navigation,
}: {
  navigation: NavigationProp;
}) {
  // Enums del tipo de evento
  const [musica, setMusica] = useState<musicEnum>();
  const [comodities, setComodities] = useState<comoditiesEnum[]>([]);
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

  const { evento } = useEvento();

  function handleGuardar() {
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
    console.log({
      ...evento,
      musica,
      musOtra,
      tipoLugar: lugar,
      comodities,
      tosAceptance: aceptoTerminos,
    });

    /*
    {
  "boletos": Array [
    {
      "cantidad": 50,
      "descripcion": "",
      "precio": 400,
      "titulo": "Entrada normal",
    },
    {
      "cantidad": 100,
      "descripcion": "",
      "precio": 800,
      "titulo": "VIP",
    }],
    "comodities": Array [
      "ALBERCA",
    ],
    "detalles": "",
    "fechaFinal": 2022-08-27T10:00:00.000Z,
    "fechaInicial": 2022-08-27T03:00:00.000Z,
    "id": "43166d65-c327-48d7-b1a8-a17b1d79a026",
    "imagenes": Array [
      {
        "imagenPrincipal": false,
        "key": undefined,
        "uri": "file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540mateodelat%252FpartyUs/ImageManipulator/fb315a44-641f-4f71-a766-e5906ad15ef7.jpg",
      },
      {
        "imagenPrincipal": true,
        "key": "https://static.wikia.nocookie.net/zelda/images/8/80/Link_Defending_%28Soulcalibur_II%29.png/revision/latest?cb=20090726014102",     
        "uri": "https://static.wikia.nocookie.net/zelda/images/8/80/Link_Defending_%28Soulcalibur_II%29.png/revision/latest?cb=20090726014102",     
      },
    ],
    "musOtra": undefined,
    "musica": "POP",
    "tipoLugar": "INTERIOR",
    "titulo": "La buena peda",
    "tosAceptance": Object {
      "hora": 2022-08-22T01:28:29.123Z,
      "ip": "10.0.2.16",
    },
    "ubicacion": Object {
      "latitude": 21.363185383060518,
      "latitudeDelta": 3.236393788060422,
      "longitude": -104.39555022865532,
      "longitudeDelta": 2.000001221895232,
      "ubicacionNombre": "La Yesca, Nayarit, Mexico",
    },
  }
    */

    let count = 0;
    // Subir fotos a S3 y crear el evento en la base de datos
    evento.imagenes?.map((e) => {
      if (!e.key) {
        console.log("Subir imagen como: evento-" + evento.id + " | " + count);
      }

      count++;
    });

    return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    // navigation.navigate("Agregar3");
  }

  function handleAbrirTerminos() {
    Alert.alert(
      "Info",
      "Ve nuestros terminnos en la pagina oficial de partyUs"
    );
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
