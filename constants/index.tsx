import * as Location from "expo-location";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";

import { Alert } from "react-native";
import { Auth, DataStore, Storage } from "aws-amplify";
import { Usuario } from "../src/models";

export const rojo = "#f01829";
export const rojoClaro = "#f34856";
export const azulClaro = "#577590";
export const azulOscuro = "#273440";
export const azulFondo = "#F4F6F8";
export const amarillo = "#ffbf5e";
("#ffbf5e");
("#000000");
("#f01829");
("#ffdddd");
("#ffffff");
("#cccccc");

export const colorFondo = "#fff";

export const msInHour = 3600000;
export const msInMinute = 60000;
export const msInDay = 86400000;

export function isUrl(str: string | null | undefined) {
  if (!str) {
    return false;
  }

  var regexp =
    /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  return regexp.test(str);
}
export const mapPlacesKey = "AIzaSyAMO0bWIDnoKqunvXjCJ65qgZdb5FBtf_s";

export function formatMoney(num?: number | null, hideCents?: boolean) {
  if (!num) {
    num = 0;
  }

  return (
    "$" +
    num?.toFixed(hideCents ? 0 : 2)?.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
  );
}

export const minEventPrice = 50;
export const maxEventPrice = 8000;

export async function fetchWithTimeout(url: string, timeout = 2000) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), timeout)
    ),
  ]) as Promise<Response>;
}

export const randomImageUri = () =>
  "https://picsum.photos/300/200?random=" + Math.floor(1000 * Math.random());

/**
 * Funcion que devuelve una cadena de texto a partir de una imagen
 * @param image Imagen en tipo base64
 * @returns String con el contenido del texto
 */
export async function callGoogleVisionAsync(
  image: string | ArrayBuffer | null
) {
  const API_KEY = "AIzaSyAa-sZqsOLy7kejQlVJ1T6xk5UWBq-4o4Y";
  const API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

  function generateBody(image: string | ArrayBuffer | null) {
    const body = {
      requests: [
        {
          image: {
            content: image,
          },
          features: [
            {
              type: "TEXT_DETECTION",
              maxResults: 1,
            },
          ],
        },
      ],
    };
    return body;
  }
  const body = generateBody(image);
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  const detectedText: string = result.responses[0].fullTextAnnotation.text;
  return detectedText ? JSON.stringify(detectedText) : "No hay texto";
}

export const formatDateShort = (msInicial: number, msFinal: number) => {
  const dateInicial = new Date(msInicial);

  var ddInicial = String(dateInicial.getDate());
  var mmInicial = String(dateInicial.getMonth());

  if (msFinal) {
    const dateFinal = new Date(msFinal);

    var ddFinal = String(dateFinal.getDate());
    var mmFinal = String(dateFinal.getMonth());

    // Si es de un solo dia se regresa un numero
    if (ddFinal === ddInicial && mmInicial === mmFinal) {
      return ddInicial + " " + meses[mmInicial as any];
    }

    // Si los meses son iguales se pone sin 2 veces un mes
    if (mmInicial === mmInicial) {
      return ddInicial + " - " + ddFinal + " " + meses[mmInicial as any];
    } else {
      return (
        ddInicial +
        " " +
        meses[mmInicial as any] +
        " - " +
        ddFinal +
        " " +
        meses[mmFinal as any]
      );
    }
  } else {
    return ddInicial + " " + meses[mmInicial as any];
  }
};

export const meses = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

export const getBase64FromUrl = async (url: string) => {
  function blobToBase64(blob: Blob) {
    return new Promise<string | ArrayBuffer | null>((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  let r = (await fetch(url).then(
    async (response) => await blobToBase64(await response.blob())
  )) as string | null;
  if (r) {
    r = r.replace(/^data:application\/octet-stream;base64,/, "");
  }
  return r;
};

/**
 * Funcion que toma un string y lo devuelve normalizado sin acentos y en mayusculas
 * @param s Cadena a transformar
 * @param toLower Pasar todo a minusculas
 * @returns Cadena sin acentos y en mayusculas
 */
export function normalizeString(
  s: string | null | undefined,
  toLower?: boolean
) {
  if (!s) {
    return "";
  }

  return s
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Funcion que toma una palabra y evalua si esta en un conjunto de palabras
 * @param word Palabra a buscar
 * @param value Cadena grande
 * @returns True/False si se encuentra toda la palabra en la cadena
 */
export function matchWholeWord(word: string, value: string) {
  word = normalizeString(word);

  // Agregar espacios en los saltos de linea
  value = value.replace(/\\n|\n|[<]{1,}/g, " ").toUpperCase();
  const r = new RegExp("\\b" + word + "\\b").test(value);
  return r;
}

export const monthsEN = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

export const monthsES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

/**
 * Funcion que toma un nombre, apellidos y fecha de nacimiento para generar un CURP
 * @param nom Nombre(s)
 * @param pat Apellido paterno
 * @param mat Apellido materno
 * @param fecha Fecha de nacimiento
 * @returns CURP con estado generico y sexo generico
 */
export function generarCurp(
  nom: string,
  pat: string,
  mat: string,
  fecha: string
) {
  var quitar, nombres, curp;

  nom = nom.toUpperCase();
  pat = pat.toUpperCase();
  mat = mat.toUpperCase();

  quitar = new RegExp(/^(DE |DEL |LO |LOS |LA |LAS )+/);
  nombres = new RegExp(/^(MARIA |JOSE )/);
  nom = nom.replace(quitar, "");
  nom = nom.replace(nombres, "");
  nom = nom.replace(quitar, "");
  pat = pat.replace(quitar, "");
  mat = mat.replace(quitar, "");
  if (mat == "") mat = "X";

  curp =
    pat.substring(0, 1) +
    buscaVocal(pat) +
    mat.substring(0, 1) +
    nom.substring(0, 2);
  curp = cambiaPalabra(curp);

  // Fecha de nacimiento
  curp +=
    fecha.substring(8, 10) + fecha.substring(3, 5) + fecha.substring(0, 2);

  curp += "X" /*Cualquier genero*/ + "XX"; //Cualquier estado

  curp += buscaConsonante(pat) + buscaConsonante(mat) + buscaConsonante(nom);
  curp += fecha.substring(6, 8) == "19" ? "0" : "A";
  curp += ultdig(curp);

  console.log(curp);

  return curp;

  function buscaVocal(str: string) {
    var vocales = "AEIOU";
    var i, c;
    for (i = 1; i < str.length; i++) {
      c = str.charAt(i);
      if (vocales.indexOf(c) >= 0) {
        return c;
      }
    }
    return "X";
  }

  function buscaConsonante(str: string) {
    var vocales = "AEIOU";
    var i, c;
    for (i = 1; i < str.length; i++) {
      c = str.charAt(i);
      if (vocales.indexOf(c) < 0) {
        return c;
      }
    }
    return "X";
  }

  function cambiaPalabra(str: string) {
    var pal1 = new RegExp(
      /BUEI|BUEY|CACA|CACO|CAGA|CAGO|CAKA|CAKO|COGE|COJA|COJE|COJI|COJO|CULO|FETO|GUEY/
    );
    var pal2 = new RegExp(
      /JOTO|KACA|KACO|KAGA|KAGO|KOGE|KOJO|KAKA|KULO|LOCA|LOCO|MAME|MAMO|MEAR|MEAS|MEON/
    );
    var pal3 = new RegExp(
      /MION|MOCO|MULA|PEDA|PEDO|PENE|PUTA|PUTO|QULO|RATA|RUIN/
    );
    var val;

    str = str.substring(0, 4);

    val = pal1.test(str) || pal2.test(str);
    val = pal3.test(str) || val;

    if (val) return str.substring(0, 1) + "X" + str.substring(2, 4);

    return str;
  }

  function tabla(i: string, x: number) {
    if (i >= "0" && i <= "9") return x - 48;
    else if (i >= "A" && i <= "N") return x - 55;
    else if (i >= "O" && i <= "Z") return x - 54;
    else return 0;
  }

  function ultdig(curp: string) {
    var i,
      c,
      dv = 0;
    //en este punto, la variable curp tiene todo excepto el ultimo digito verificador
    //ejemplo: JIRA0302024MVZMVNA
    for (i = 0; i < curp.length; i++) {
      c = tabla(curp.charAt(i), curp.charCodeAt(i));
      dv += c * (18 - i);
    }
    dv %= 10;
    return dv == 0 ? 0 : 10 - dv;
  }
}

export const redondear = (
  numero: number | null | undefined,
  entero?: number,
  tipo?: tipoRedondeo
) => {
  if (!entero) {
    entero = 1;
  }

  if (!numero) return 0;

  // Si no hay tipo redondear simple
  if (!tipo) {
    return Math.round(numero / entero) * entero;
  }

  switch (tipo) {
    case tipoRedondeo.ARRIBA:
      numero = Math.ceil(numero / entero) * entero;
      break;
    case tipoRedondeo.ABAJO:
      numero = Math.floor(numero / entero) * entero;
      break;

    default:
      numero = Math.round(numero / entero) * entero;
      break;
  }

  return numero;
};

export enum tipoRedondeo {
  ARRIBA = "ARRIBA",
  ABAJO = "ABAJO",
}

export const container = {
  backgroundColor: "#fff",
  flex: 1,
  padding: 30,
  paddingTop: 0,
};

export const shadowMarcada = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 11,
  },
  shadowOpacity: 0.57,
  shadowRadius: 15.19,

  elevation: 23,
};

export const shadowMedia = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.29,
  shadowRadius: 4.65,

  elevation: 7,
};

export const shadowBaja = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.23,
  shadowRadius: 2.62,

  elevation: 4,
};

export const shadowMuyBaja = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: 0.2,
  shadowRadius: 1.41,

  elevation: 2,
};

export const getUserSub = async () => {
  return (await Auth.currentAuthenticatedUser()
    .then((user) => {
      const sub = user?.attributes?.sub as string | undefined;

      return sub;
    })
    .catch((e) => {
      if (e !== "The user is not authenticated") {
        console.log(e);
      }
    })) as string | undefined;
};

let numberOfFetchs = 0;
export async function getImageUrl(data?: string | null) {
  if (data && !isUrl(data)) {
    numberOfFetchs += 1;
    // console.log({
    //   "fetchN°": numberOfFetchs,
    //   data
    // })
  }

  return data ? (isUrl(data) ? data : await Storage.get(data)) : null;
}

export const getBlob = async (uri: string | undefined) => {
  if (!uri) return;
  return (await fetch(uri))
    .blob()
    .then((response) => {
      console.log(
        JSON.parse(JSON.stringify(response))._data.size / 1000000,
        "mb"
      );
      return response;
    })
    .catch((e) => {
      console.log(e);
      Alert.alert("Error", "Error obteniendo el blob");
      return e;
    });
};

export enum tipoDocumento {
  PASAPORTE = "PASAPORTE",
  INE = "INE",
}

export const vibrar = (tipo?: VibrationType) => {
  switch (tipo) {
    case "light":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;

    case "medium":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;

    case "heavy":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;

    case "error":
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      break;

    case "sucess":
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;

    case "select":
      Haptics.selectionAsync();
      break;

    default:
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
  }
};

export enum VibrationType {
  light = "light",
  medium = "medium",
  heavy = "heavy",

  select = "select",
  error = "error",
  sucess = "sucess",
}

/**
 * Toma un enum y devuelve lista en ese mismo tipo
 * @param enumme Enum a mapear
 * @returns T[...tipo]
 */
export function enumToArray<T>(enumme: T) {
  return Object.keys(enumme as any).map(
    (name) => enumme[name as keyof typeof enumme]
  );
}

export function formatAMPM(
  dateInMs: number | Date | undefined | null,
  hideAMPM?: boolean
) {
  if (!dateInMs) return "-- : --";

  const date = new Date(dateInMs);
  var hours = date.getHours();
  var minutes: number | string = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;

  var strTime = hours + ":" + minutes;

  !hideAMPM ? (strTime += " " + ampm) : null;

  return strTime;
}

export function mayusFirstLetter(string: string | undefined | null) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export const distancia2Puntos = function (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  // Grados a radianes
  const rad = (x: number) => {
    return (x * Math.PI) / 180;
  };

  var R = 6378.137; //Radio de la tierra en km
  var dLat = rad(lat2 - lat1);
  var dLong = rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(lat1)) *
      Math.cos(rad(lat2)) *
      Math.sin(dLong / 2) *
      Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; //Retorna tres decimales
};

/**
 * Funcion que toma 2 listas y compara si todos los elementos de una existen en la otra
 * @param a lista 1
 * @param b lista 2
 * @returns boolean
 */
export function areListsEqual<T>(a: T[], b: T[]) {
  const biggest = a.length > b.length ? a : b;
  const smallest = a.length < b.length ? a : b;
  return biggest.map((e) => smallest.indexOf(e) >= 0).find((r) => !r) !== false;
}

export async function verifyUserLoggedIn() {
  const sub = await getUserSub();

  // Si ya esta loggeado entonces verificar que exista el usuario
  if (!!sub) {
    // Asignar al usuario el de Data
    const usr = await DataStore.query(Usuario, sub);

    if (!usr) {
      Alert.alert(
        "Error",
        "Ocurrio un error: el sub existe pero no hay usuario en DB"
      );
      return true;
    }
    return true;
  }

  // Si no esta loggeado el usuario
  return false;
}

/**
 * Promise que expirara tras determinado tiempo
 * @param millis Tiempo de expiracion
 * @param promise Promesa a realizar
 * @returns Rejecta la promesa si paso el tiempo o la resuelve si fue antes
 */
export function promiseWithTimeout<T>(millis: number, promise: Promise<T>) {
  const timeout = new Promise<T>((resolve, reject) =>
    setTimeout(() => reject(`Solicitud expirada tras ${millis} ms.`), millis)
  );
  return Promise.race([promise, timeout]);
}

export type requestLocationResponse = {
  userLocation: Location.LocationObjectCoords | null;
  permission: boolean;
};

/**
 * Pide permiso para acceder a la ubicacion y de tenerlo entonces pide la ubicacion aproximada del usuario
 * @returns Una promesa que tiene un objeto del tipo [requestLocationResponse](#) o
 * `null` si no esta disponible o no se obtuvieron permisos
 */
export async function requestLocation() {
  return verificarUbicacion().then(async (r) => {
    const permission = r;
    let loc: Location.LocationObjectCoords | Location.LocationObject | null =
      null;
    if (r) {
      loc = await Location.getLastKnownPositionAsync();
      if (loc) {
        loc = loc.coords;
      }
    }
    return {
      userLocation: loc,
      permission,
    };
  });
}

export const verificarUbicacion = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    return false;
  }
};

export function mesAString(mesN: number | undefined | null) {
  if (typeof mesN !== "number") return null;

  switch (mesN) {
    case 0:
      return "ene";
    case 1:
      return "feb";
    case 2:
      return "mar";
    case 3:
      return "abr";
    case 4:
      return "may";
    case 5:
      return "jun";
    case 6:
      return "jul";
    case 7:
      return "ago";
    case 8:
      return "sep";
    case 9:
      return "oct";
    case 10:
      return "nov";
    case 11:
      return "dic";

    default:
      return "N/V";
      break;
  }
}

/**
 * Toma un tiempo y devuelve resultado con el puro valor de dias, meses y años
 * @param date milisegunos o fecha en hora UTC
 * @returns fecha con horas,segundos, minutos y milisegundos en 0 UTC
 */
export function clearDate(date: Date | number) {
  date = new Date(date);
  date.setUTCHours(0);
  date.setUTCMinutes(0);
  date.setUTCSeconds(0);
  date.setUTCMilliseconds(0);
  return date;
}

/**
 * Toma una fecha y devuelve cadena formateada con meses ej: 30 de agosto
 * @param ms milisegundos o fecha
 * @returns fecha en string con el dia y el mes (dd de mmmmmmm)
 */
export const formatDiaMesCompleto = (ms: Date | undefined) => {
  if (!ms) return "-";

  const fecha = new Date(ms);

  const mes = fecha.getMonth();
  const dia = fecha.getDate();
  let sMes;

  switch (mes) {
    case 0:
      sMes = "ENERO";
      break;
    case 1:
      sMes = "FEBRERO";
      break;
    case 2:
      sMes = "MARZO";
      break;
    case 3:
      sMes = "ABRIL";
      break;
    case 4:
      sMes = "MAYO";
      break;
    case 5:
      sMes = "JUNIO";
      break;
    case 6:
      sMes = "JULIO";
      break;
    case 7:
      sMes = "AGOSTO";
      break;
    case 8:
      sMes = "SEPTIEMBRE";
      break;
    case 9:
      sMes = "OCTUBRE";
      break;
    case 10:
      sMes = "NOVIEMBRE";
      break;
    case 11:
      sMes = "DICIEMBRE";
      break;

    default:
      break;
  }

  return dia + " de " + mayusFirstLetter(sMes);
};

export const defaultLocation = {
  latitude: 21.76227198730249,
  longitude: -104.03593288734555,
  latitudeDelta: 32.71611359157346,
  longitudeDelta: 60.73143247514963,
};

// Buscar un lugar por su place id o por su geometria
export async function googleMapsSearchPlace(place_id: string) {
  let url = `https://maps.googleapis.com/maps/api/place/details/json?fields=geometry,url,name&placeid=${place_id}&key=${mapPlacesKey}`;

  return await fetch(url).then((r) => {
    return r.json().then((r) => {
      r = r.result;
      const { lat: latitude, lng: longitude } = r.geometry.location;
      const latitudeDelta = Math.abs(
        r.geometry.viewport.northeast.lat - r.geometry.viewport.southwest.lat
      );
      const longitudeDelta = Math.abs(
        r.geometry.viewport.northeast.lng - r.geometry.viewport.southwest.lng
      );

      return {
        ubicacionLink: r.url,
        ubicacionNombre: r.name,
        ubicacionId: place_id,

        latitude,
        longitude,
        latitudeDelta,
        longitudeDelta,
      };
    });
  });
}
export const AsyncAlert = async (title: string, body: string) =>
  new Promise<boolean>((resolve, reject) => {
    Alert.alert(title, body, [
      {
        text: "CANCELAR",
        onPress: () => {
          reject(false);
        },
      },
      {
        text: "OK",
        onPress: () => {
          resolve(true);
        },
      },
    ]);
  }).catch((e) => e);

export function precioConComision(inicial: number | undefined | null) {
  if (!inicial) return 0;
  return redondear(inicial * (1 + comisionApp), 10, tipoRedondeo.ARRIBA);
}

export const getWeekDay = (d: Date | undefined) => {
  if (!d) return "";
  const week = d.getDay();

  let r = "";
  switch (week) {
    case 1:
      r = "LUNES";
      break;

    case 2:
      r = "MARTES";
      break;

    case 3:
      r = "MIERCOLES";
      break;

    case 4:
      r = "JUEVES";
      break;

    case 5:
      r = "VIERNES";
      break;

    case 6:
      r = "SABADO";
      break;

    case 0:
      r = "DOMINGO";
      break;

    default:
      r = "BLA BLA";
  }

  return mayusFirstLetter(r);
};

export const comisionApp = 0.15;

/**
 * Toma el tiempo en hora UTC
 * @param date milisegunos o fecha en hora UTC
 * @returns dd mmm aaaa
 */
export const formatDay = (
  date: number | Date | undefined | null,
  noYear?: boolean
) => {
  if (!date) {
    return "--";
  }

  const fecha = new Date(date);

  let mes: number | string = fecha.getMonth();
  let dia = fecha.getDate();
  let year = fecha.getFullYear();

  switch (mes) {
    case 0:
      mes = "ene";
      break;
    case 1:
      mes = "feb";
      break;
    case 2:
      mes = "mar";
      break;
    case 3:
      mes = "abr";
      break;
    case 4:
      mes = "may";
      break;
    case 5:
      mes = "jun";
      break;
    case 6:
      mes = "jul";
      break;
    case 7:
      mes = "ago";
      break;
    case 8:
      mes = "sep";
      break;
    case 9:
      mes = "oct";
      break;
    case 10:
      mes = "nov";
      break;
    case 11:
      mes = "dic";
      break;

    default:
      break;
  }

  return dia + " " + mes + (!noYear ? " " + year : "");
};

export const openCameraPickerAsync = async (
  aspect: [number, number],
  quality: number
) => {
  // Poner en los limites
  quality = quality < 0 || quality > 1 ? 1 : quality;
  let permissionResult = await ImagePicker.requestCameraPermissionsAsync();

  if (permissionResult.granted === false) {
    Alert.alert(
      "Error",
      "Los permisos para acceder a la camara son requeridos para seleccionar imagen"
    );
    await ImagePicker.requestCameraPermissionsAsync();
    return false;
  }

  let camResult;

  // Si se le paso un aspect ratio, respetarlo
  if (aspect) {
    camResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      allowsMultipleSelection: false,
      aspect,
    });
  } else {
    camResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      allowsMultipleSelection: false,
    });
  }

  if (camResult.cancelled === true) {
    return false;
  } else {
    // Comprimir la imagen
    camResult = await ImageManipulator.manipulateAsync(
      camResult.uri,
      [
        {
          resize: {
            width: 1000,
          },
        },
      ],
      { compress: quality }
    );

    return camResult;
  }
};

export const openImagePickerAsync = async (
  denyVideos: boolean,
  quality?: number,
  aspect?: [number, number]
) => {
  await ImagePicker.requestMediaLibraryPermissionsAsync();
  let permissionResult = await ImagePicker.getMediaLibraryPermissionsAsync();

  if (permissionResult.granted === false) {
    Alert.alert(
      "Los permisos para acceder al carrete son requeridos para seleccionar imagen"
    );
    await ImagePicker.requestMediaLibraryPermissionsAsync();
    return false;
  }

  let pickerResult;
  if (aspect) {
    pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: denyVideos
        ? ImagePicker.MediaTypeOptions.Images
        : ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect,
    });
  } else {
    pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: denyVideos
        ? ImagePicker.MediaTypeOptions.Images
        : ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
    });
  }

  if (pickerResult.cancelled === true) {
    return false;
  } else {
    // Si se le paso un modificador a la calidad se comprime la imagen

    if (!!quality && quality > 0 && quality < 1) {
      pickerResult = await ImageManipulator.manipulateAsync(
        pickerResult.uri,
        [
          {
            resize: {
              width: 1000,
            },
          },
        ],
        { compress: quality }
      );
    }

    return pickerResult;
  }
};
