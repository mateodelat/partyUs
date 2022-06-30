import * as Location from "expo-location";
import * as FileSystem from "expo-file-system";

export const rojo = "#f01829";
export const rojoClaro = "#f34856";
export const azulClaro = "#3C887E";
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
export function normalizeString(s: string, toLower?: boolean) {
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

export enum comoditiesEnum {
  DJ = "DJ",
  ALBERCA = "ALBERCA",
  BARRALIBRE = "BARRA LIBRE",
  COMIDA = "COMIDA",
  SEGURIDAD = "SEGURIDAD",
}

export enum placeEnum {
  EXTERIOR = "EXTERIOR",
  INTERIOR = "INTERIOR",
}

export enum musicEnum {
  TECNO = "TECNO",
  PUNK = "PUNK",
  POP = "POP",
  RAP = "RAP",
  BANDA = "BANDA",
  REGGETON = "REGGETON",
}

export enum tipoDocumento {
  PASAPORTE = "PASAPORTE",
  INE = "INE",
}

/**
 * Toma un enum y devuelve lista en ese mismo tipo
 * @param enumme Enum a mapear
 * @returns T[...tipo]
 */
export function enumToArray<T>(enumme: T) {
  return Object.keys(enumme).map((name) => enumme[name as keyof typeof enumme]);
}

export function mayusFirstLetter(string: string | undefined) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

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

export function mesAString(mesN: number | undefined) {
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
 * Toma el tiempo en hora UTC
 * @param date milisegunos o fecha en hora UTC
 * @returns dd mmm aaaa
 */
export const formatDay = (date: number | Date | undefined | null) => {
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

  return dia + " " + mes + " " + year;
};
