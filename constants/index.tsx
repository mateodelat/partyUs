import * as Location from "expo-location";
import { PermissionResponse } from "expo-modules-core";

export const rojo = "#f01829";
export const rojoClaro = "#f34856";
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

export const redondear = (
  numero: number | null | undefined,
  entero: number,
  tipo?: tipoRedondeo
) => {
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
  MIXTO = "MIXTO",
}

export enum musicEnum {
  TECNO = "TECNO",
  PUNK = "PUNK",
  POP = "POP",
  RAP = "RAP",
  BANDA = "BANDA",
  REGGETON = "REGGETON",
}

/**
 * Toma un enum y devuelve lista en ese mismo tipo
 * @param enumme Enum a mapear
 * @returns T[...tipo]
 */

export function enumToArray<T>(enumme: T) {
  return Object.keys(enumme).map((name) => enumme[name as keyof typeof enumme]);
}

export function mayusFirstLetter(string: string) {
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
