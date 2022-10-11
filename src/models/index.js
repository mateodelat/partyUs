// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const PlaceEnum = {
  "EXTERIOR": "EXTERIOR",
  "INTERIOR": "INTERIOR",
  "MIXTO": "MIXTO"
};

const MusicEnum = {
  "REGGETON": "REGGETON",
  "POP": "POP",
  "TECNO": "TECNO",
  "RAP": "RAP",
  "BANDA": "BANDA",
  "ROCK": "ROCK",
  "OTRO": "OTRO"
};

const ComoditiesEnum = {
  "DJ": "DJ",
  "ALBERCA": "ALBERCA",
  "BARRALIBRE": "BARRALIBRE",
  "COMIDA": "COMIDA",
  "SEGURIDAD": "SEGURIDAD"
};

const ReservaCancelReason = {
  "EVENTOCERRADO": "EVENTOCERRADO",
  "CANCELADOPORCLIENTE": "CANCELADOPORCLIENTE"
};

const TipoNotificacion = {
  "RESERVACREADA": "RESERVACREADA",
  "RESERVACANCELADA": "RESERVACANCELADA",
  "AGREGAREVENTOS": "AGREGAREVENTOS",
  "ADMIN": "ADMIN",
  "BIENVENIDA": "BIENVENIDA",
  "EVENTOCREADO": "EVENTOCREADO",
  "EVENTOACTUALIZACION": "EVENTOACTUALIZACION",
  "EVENTOCANCELADA": "EVENTOCANCELADA",
  "RECORDATORIOEVENTO": "RECORDATORIOEVENTO",
  "CALIFICAUSUARIO": "CALIFICAUSUARIO"
};

const { Usuario, Evento, Boleto, ReservasBoletos, Reserva, Cupon, Notificacion } = initSchema(schema);

export {
  Usuario,
  Evento,
  Boleto,
  ReservasBoletos,
  Reserva,
  Cupon,
  Notificacion,
  PlaceEnum,
  MusicEnum,
  ComoditiesEnum,
  ReservaCancelReason,
  TipoNotificacion
};