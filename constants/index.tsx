import * as Location from "expo-location";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import * as Device from "expo-device";

import { Alert, Linking, Platform } from "react-native";
import { API, Auth, DataStore, Storage } from "aws-amplify";
import { TipoNotificacion, Usuario } from "../src/models";

import awsmobile from "../src/aws-exports";
import { Notificacion } from "../src/models";
import {
  AndroidNotificationPriority,
  scheduleNotificationAsync,
} from "expo-notifications";

import { clabe } from "../src/components/ClabeValidator";
import { STRIPE_FILES_KEY, STRIPE_PUBLISHABLE_KEY } from "./keys";
import Stripe from "stripe";
import { logger } from "react-native-logs";
import { cardBrand_type } from "../types/stripe";

export const log = logger.createLogger().debug;

export const rojo = "#f01829";
export const rojoClaro = "#f34856";
export const azulClaro = "#577590";
export const azulOscuro = "#273440";
export const azulFondo = "#F4F6F8";
export const amarillo = "#ffbf5e";
export const verde = "#43ad89";

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

export function formatMoney(num?: number | null, showCents?: boolean) {
  if (!num) {
    num = 0;
  }

  return (
    "$ " +
    num?.toFixed(!showCents ? 0 : 2)?.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
  );
}
export const partyusPhone = "+5213312897347";
export const partyusEmail = "partyus_mx@outlook.com";

export async function sendNotifcationsAll({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion?: string;
}) {
  DataStore.query(Usuario).then((ls) => {
    ls.map((usr) => {
      sendNotifications({
        titulo,
        descripcion,
        tipo: TipoNotificacion.BIENVENIDA,
        usuarioID: usr.id,
        externalToken: usr.notificationToken,
        showAt: new Date().toISOString(),
      });
    });
  });
}

export async function sendAdminNotification({
  titulo,
  descripcion,
  sender,
  organizadorID,
  eventoID,
  reservaID,

  onlyPush,
}: {
  titulo: string;
  descripcion: string;
  sender: Usuario;

  onlyPush?: boolean;

  organizadorID?: string;
  eventoID?: string;
  reservaID?: string;
}) {
  const admins = await DataStore.query(Usuario, (usr) =>
    !reservaID
      ? usr.admin("eq", true)
      : usr.receiveNewReservations("eq", true).admin("eq", true)
  );

  descripcion = "@" + sender.nickname + ": " + descripcion;

  // Mandarle notificaciones a todos los admins
  admins.map((usr) => {
    const { notificationToken, owner, id } = usr;

    if (!onlyPush) {
      DataStore.save(
        new Notificacion({
          tipo: TipoNotificacion.ADMIN,

          titulo,
          descripcion,

          showAt: new Date().toISOString(),

          usuarioID: id,
          eventoID: eventoID,
          organizadorID: organizadorID,
          reservaID: reservaID,
        })
      );
    }

    sendPushNotification({
      title: titulo,
      descripcion,
      token: notificationToken,

      data: {
        eventoID: eventoID,
        organizadorID: organizadorID,
        reservaID: reservaID,
      },
    });
  });
}

export const minEventPrice = 10;
export const maxEventPrice = 7000;

export async function fetchWithTimeout(url: string, timeout = 2000) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), timeout)
    ),
  ]) as Promise<Response>;
}

export async function timer(time: number) {
  return new Promise<void>((res) => {
    setTimeout(() => {
      res();
    }, time);
  });
}

export const randomImageUri = () =>
  "https://picsum.photos/300/200?random=" + Math.floor(1000 * Math.random());

export async function uploadImageToStripe({
  uri,
  purpose,
  name,
  getLink,
}: {
  uri: string;
  purpose: string;
  name: string;
  getLink?: boolean;
}) {
  const i = new Date();
  const data = new FormData();
  data.append("purpose", purpose);
  // Obtener link de stripe
  getLink && data.append("file_link_data[create]", "true");
  data.append("file", {
    name: name,
    type: "image/jpg",
    uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
  } as any);

  // Change file upload URL
  var url = "https://files.stripe.com/v1/files";

  let res = await fetch(url, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: "application/json",
      Authorization: "Bearer " + STRIPE_FILES_KEY,
    },
  });
  let responseJson = await res.json();

  if (!responseJson?.error) {
    let res = responseJson as Stripe.File;

    // Si se pidio el link, devolver link de la imagen
    res.url = res.links?.data.length ? res.links?.data[0].url : res.url;

    return res;
  } else {
    console.log(responseJson);
    throw new Error(responseJson);
  }
}

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

export const formatDateShort = (
  msInicial?: number | null | Date | string,
  msFinal?: number,
  UTC?: boolean
) => {
  if (!msInicial) return "dd mm";
  const dateInicial = new Date(msInicial);

  var ddInicial = String(dateInicial[UTC ? "getUTCDate" : "getDate"]());
  var mmInicial = String(dateInicial[UTC ? "getUTCMonth" : "getMonth"]());

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

/**
 * Moneda a utilizar en todas las operaciones con stripe
 */
export const currency = "mxn";

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

export async function graphqlRequest<T>({
  query,
  variables,
  authMode,
}: {
  query: string;
  variables?: object;
  authMode?:
    | "API_KEY"
    | "AWS_IAM"
    | "OPENID_CONNECT"
    | "AMAZON_COGNITO_USER_POOLS"
    | "AWS_LAMBDA";
}) {
  try {
    const a = (await (
      API.graphql({
        query,
        variables,
        authMode,
      }) as any
    ).then((r: any) => {
      return r.data;
    })) as Promise<T>;
    console.log("API graphql");
    return a;
  } catch (error) {
    console.log(error);
    Alert.alert("Error", "Hubo un error obteniendo datos: " + error.message);
  }
}

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

export function abrirTerminos() {
  AsyncAlert(
    "Abrir terminos",
    "Se te dirigira a un link externo, ¿quieres continuar?"
  ).then((r) => {
    if (!r) return;
    Linking.openURL("https://www.partyusmx.com/privacidad");
  });
}

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
/**
 * Funcion que manda una solictud a la api de stripe
 * @param type `POST`,`CREATE`,`DELETE`,`GET`,
 * @param path Ruta a enviar de stripe
 * @returns Cadena sin acentos y en mayusculas
 */
export async function fetchFromStripe<T>({
  path,
  type,
  input,
  secretKey,
}: {
  path: string;
  type: "POST" | "CREATE" | "DELETE" | "GET";
  input?: Object | undefined;
  secretKey?: string;
}) {
  const encodedData = new URLSearchParams();

  // Limpiar valores inexistentes
  input &&
    Object.keys(input).forEach((key) =>
      !input[key] ? delete input[key] : null
    );

  // Funcion que codifica objectos nesteados en tipo www-url-formencoded
  function nestedObjEncode(prevKey: string, nestedObj: Object) {
    if (!nestedObj) return;
    for (const [key, value] of Object.entries(nestedObj)) {
      const actualKey = `${prevKey ? prevKey : ""}[${key}]`;

      // Funcion recursiva si es objeto se llama con la key actual
      if (typeof value === "object") {
        nestedObjEncode(actualKey, value);
        // Si el valor es null o undefined, no ponerlo
      } else if (!value) return;
      else {
        encodedData.append(actualKey, value);
      }
    }
  }
  input && nestedObjEncode(null, input);

  const requestOptions = {
    method: type,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Bearer " + (secretKey ? secretKey : STRIPE_PUBLISHABLE_KEY),
      Accept: "application/json",
    },
    body: encodedData.toString(),
  };

  const url = "https://api.stripe.com";

  return fetch(url + path, requestOptions).then(async (res: any) => {
    res = await res.json();

    if (res.error) {
      throw new Error(res.error.message);
    }
    return res as T;
  });
}

export async function fetchFromAPI<T>({
  path,
  type,
  input,
  query,
}: {
  path: string;
  type: "POST" | "CREATE" | "DELETE" | "GET";
  input?: Object | undefined;
  query?: { [key: string]: string };
}) {
  let myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let requestOptions: any = {
    method: type,
    headers: myHeaders,
  };

  if (input) {
    const raw = JSON.stringify(input);

    requestOptions = {
      ...requestOptions,
      body: raw,
    };
  }
  let url = awsmobile?.aws_cloud_logic_custom[0]?.endpoint + path;

  if (query) {
    url =
      url +
      "?" +
      Object.keys(query)
        .map((key) => {
          return `${key}=${encodeURIComponent(query[key] as string)}`;
        })
        .join("&");
  }

  return fetch(url, requestOptions).then(async (res) => {
    let json;
    try {
      json = await res.json();
    } catch (error) {
      log(res);
      json = res.body;
    }

    if (json.error) {
      throw json.error?.error ? json.error.error : json.error;
    }

    if (!res.ok)
      throw {
        error: json,
        body: null,
      };

    // Si hay body.data, formatearlo para que sea directo en body y evitar seccion de pagination
    if (json.body?.data) {
      json.body = json.body.data;
    }

    return json;
  }) as Promise<{
    error: null;
    body: T | null;
  }>;
}
export function validateRFC(rfc: string) {
  const regexp = new RegExp(
    /^([A-Z,Ñ,&]{3,4}([0-9]{2})(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[A-Z|\d]{3})$/
  );

  return regexp.exec(rfc);
}

export const isEmulator = !Device.isDevice;

export function normalizeCardType(tipo: string) {
  switch (tipo) {
    case "master-card":
      return "MasterCard";
    case "american-express":
      return "american_express";

    default:
      return tipo;
  }
}

export const getCardIcon = (type?: cardBrand_type | undefined) => {
  if (!type) {
    return require("../assets/icons/stp_card_undefined.png");
  }

  // Estandarizar tipo quitando espacios, mayusculas o guiones bajos
  type = type.toLowerCase().replace(/ |_|-/g, "") as any;
  // Estandarizar dinners
  if (type === ("dinners" as any)) type = "dinersclub";

  switch (type) {
    case "visa":
      return require("../assets/icons/stp_card_visa.png");

    case "mastercard":
      return require("../assets/icons/stp_card_mastercard.png");

    case "americanexpress":
      return require("../assets/icons/stp_card_amex.png");

    case "discover":
      return require("../assets/icons/stp_card_discover.png");
    case "jcb":
      return require("../assets/icons/stp_card_jcb.png");

    case "dinersclub":
      return require("../assets/icons/stp_card_diners.png");

    default:
      return require("../assets/icons/stp_card_undefined.png");
  }
};

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

  elevation: 4,
};

export const produccion = false;

export const shadowBaja = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 3,
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

  return data
    ? isUrl(data)
      ? data
      : await Storage.get(data).catch((e) => {
          console.log(e);
          Alert.alert(
            "Error",
            "Hubo un problema obteniendo la imagen" + e.message
          );
          return "";
        })
    : null;
}

export async function subirImagen(key: string, uri: string) {
  if (isUrl(uri)) {
    throw new Error("La imagen es una url no una ruta local");
  }
  await getBlob(uri).then((image) => {
    Storage.put(key, image);
  });
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

export function formatTelefono(input: string) {
  if (!input) return;

  // Strip all characters from the input except digits
  input = input.replace(/\D/g, "");

  // Trim the remaining input to ten characters, to preserve phone number format
  input = input.substring(0, 10);

  // Based upon the length of the string, we add formatting as necessary
  var size = input.length;
  if (size == 0) {
    input = input;
  } else if (size < 4) {
    input = input;
  } else if (size < 7) {
    input = input.substring(0, 3) + " " + input.substring(3, 6);
  } else {
    input =
      input.substring(0, 3) +
      " " +
      input.substring(3, 6) +
      " " +
      input.substring(6, 10);
  }
  return input;
}

export function validateClabe(input: string) {
  if (!input) return;

  // Strip all characters from the input except digits
  input = input.replace(/\D/g, "");
  // Trim the remaining input to eighteen characters
  input = input.substring(0, 18);

  const status = clabe.validate(input);

  return status;
}

export function formatCuentaCLABE(input: string) {
  if (!input) return;
  // Strip all characters from the input except digits
  input = input.replace(/\D/g, "");

  // Trim the remaining input to eighteen characters
  input = input.substring(0, 18);

  // Based upon the length of the string, we add formatting as necessary
  var size = input.length;
  if (size == 0) {
    input = input;
  } else if (size < 4) {
    input = input;
  } else if (size < 7) {
    input = input.substring(0, 3) + " " + input.substring(3, 6);
  } else if (size < 18) {
    input =
      input.substring(0, 3) +
      " " +
      input.substring(3, 6) +
      " " +
      input.substring(6, 17);
  } else {
    input =
      input.substring(0, 3) +
      " " +
      input.substring(3, 6) +
      " " +
      input.substring(6, 17) +
      " " +
      input.substring(17, 18);
  }
  return input;
}

export async function sendPushNotification(input: {
  title: String;
  descripcion: String;
  data?: Object;
  token: String;
}) {
  const { token, title, descripcion: body, data } = input;

  let message = {
    to: token,
    sound: "default",
    title,
    body,
    badge: 1,
    priority: "high",
    data,
  };

  if (!data) {
    delete message.data;
  }

  return await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  }).then((r) => {
    console.log("Push notification send to ", token);
  });
}

/**
 * Manda notificacion en aplicacion y al celular
 *
 * @returns void
 */

export async function sendNotifications({
  titulo,
  descripcion,

  tipo,

  showAt,
  triggerTime,

  eventoID,
  usuarioID,
  reservaID,
  organizadorID,

  externalToken,
}: {
  titulo: string;
  descripcion: string;

  tipo: TipoNotificacion;

  showAt?: string;
  triggerTime?: number;

  usuarioID: string;
  eventoID?: string;
  reservaID?: string;
  organizadorID?: string;

  externalToken?: string;
}) {
  showAt = showAt ? showAt : new Date().toISOString();
  triggerTime = triggerTime ? triggerTime : new Date().getTime() / 1000;

  const data = {
    eventoID,
    reservaID,
    organizadorID,
    tipo,
  };

  // Notificacion IN-APP
  return Promise.all([
    DataStore.save(
      new Notificacion({
        titulo,
        descripcion,

        tipo,
        showAt,

        usuarioID,

        eventoID,
        reservaID,
        organizadorID,
      })
    ),

    externalToken
      ? sendPushNotification({
          title: titulo,
          data,
          descripcion,
          token: externalToken,
        })
      : scheduleNotificationAsync({
          content: {
            title: titulo,
            body: descripcion,
            priority: AndroidNotificationPriority.HIGH,
            vibrate: [100],
            data,
          },
          trigger: {
            seconds: triggerTime,
          },
        }),
  ]);
}

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

export function getWorkingDays(startDate: Date, endDate: Date) {
  const start = new Date(startDate);
  // Crea una lista de días festivos para México
  const mxHolidays = [
    // Domingo 1 de enero: Año Nuevo
    { day: 1, month: 1 },

    // Lunes 6 de febrero: Día de la Constitución Mexicana, primer puente de 2023
    { day: 6, month: 2 },

    // Lunes 20 de marzo: Natalicio de Benito Juárez, segundo puente de 2023
    { day: 20, month: 3 },

    // Lunes 1 de mayo: Día Internacional de los Trabajadores, tercer puente de 2023
    { day: 1, month: 5 },

    // Sábado 16 de septiembre: Día de la Independencia de México.
    { day: 16, month: 9 },

    // Lunes 20 de noviembre: Aniversario de la Revolución Mexicana, cuarto puente de 2023
    { day: 20, month: 11 },

    // Lunes 25 de diciembre: Navidad, último puente del año
    { day: 25, month: 12 },
  ];

  let workingDays = -1;

  // Itera a través de cada día entre las dos fechas
  for (let date = start; date < endDate; date.setDate(date.getDate() + 1)) {
    // Verifica si el día es hábil o no es sabado o domingo y no es feriado
    if (
      date.getDay() !== 0 &&
      date.getDay() !== 6 &&
      !mxHolidays.some(
        (holiday) =>
          holiday.month === date.getMonth() + 1 &&
          holiday.day === date.getDate()
      )
    ) {
      workingDays++;
    }
  }

  return workingDays;
}

export function openWhatsapp(number: string) {
  return AsyncAlert("Abrir whatsapp", "Se te dirigira a whatsapp").then((r) => {
    if (!r) return;
    Linking.openURL(
      "whatsapp://send?text=Hola, tengo un problema con partyus: &phone=" +
        number
    ).catch((e) => {
      Alert.alert("Error", "Es probable que no tengas whatsapp instalado");
    });
  });
}

export function openEmail(email: string) {
  AsyncAlert(
    "Enviar correo",
    "Se abrira la aplicacion de correos. ¿Quieres continuar?"
  ).then((r) => {
    if (!r) return;
    Linking.openURL("mailto: " + email + "?subject=SOPORTE PARTYUS").catch(
      (e) => {
        Alert.alert("Error", "Es probable que no tengas whatsapp instalado");
      }
    );
  });
}

export function formatAMPM(
  dateInMs: number | Date | undefined | null | string,
  hideAMPM?: boolean,
  UTC?: boolean
) {
  if (!dateInMs) return "-- : --";

  const date = new Date(dateInMs);

  var hours = date[UTC ? "getUTCHours" : "getHours"]();
  var minutes: number | string = date[UTC ? "getUTCMinutes" : "getMinutes"]();
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
export const formatDiaMesCompleto = (
  ms: Date | undefined | number | string
) => {
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
        text: "Cancelar",
        onPress: () => {
          reject(false);
        },
      },
      {
        text: "Ok",
        onPress: () => {
          resolve(true);
        },
      },
    ]);
  }).catch((e) => e);

export function precioConComision(
  inicial: number | undefined | null,
  comision: undefined | number
) {
  if (!inicial) return 0;

  // En caso de recibir comision exclusiva del evento ponerla
  comision = comision === 0 || !!comision ? comision : comisionApp;

  // Redondeo al 5 de arriba
  return redondear(
    Math.round(inicial * (1 + comision)),
    5,
    tipoRedondeo.ARRIBA
  );
}

export const getWeekDay = (d: Date | undefined | number) => {
  if (!d) return "";
  d = new Date(d);

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

export function getIpAddress() {
  return fetch("https://api.ipify.org?format=json").then((r) =>
    r.json().then((r) => {
      return r.ip as string;
    })
  );
}

/**
 * Toma el tiempo en hora UTC
 * @param date milisegunos o fecha en hora UTC
 * @returns dd mmm aaaa
 */
export const formatDay = (
  date: number | Date | undefined | null | string,
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

  let camResult: ImagePicker.ImagePickerResult;

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

  if (camResult.canceled === true) {
    return false;
  } else {
    // Comprimir la imagen
    return await ImageManipulator.manipulateAsync(
      camResult.assets[0].uri,
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

  let pickerResult: ImagePicker.ImagePickerResult;
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

  if (pickerResult.canceled === true) {
    return false;
  } else {
    // Si se le paso un modificador a la calidad se comprime la imagen

    if (!!quality && quality > 0 && quality < 1) {
      return await ImageManipulator.manipulateAsync(
        pickerResult.assets[0].uri,
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
