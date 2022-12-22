// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const TipoDocumento = {
  "PASAPORTE": "PASAPORTE",
  "INE": "INE"
};

const PlaceEnum = {
  "EXTERIOR": "EXTERIOR",
  "INTERIOR": "INTERIOR",
  "MIXTO": "MIXTO"
};

const MusicEnum = {
  "REGGAETON": "REGGAETON",
  "POP": "POP",
  "TECHNO": "TECHNO",
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

const TipoPago = {
  "EFECTIVO": "EFECTIVO",
  "TARJETA": "TARJETA"
};

const ReservaCancelReason = {
  "EVENTOCERRADO": "EVENTOCERRADO",
  "CANCELADOPORCLIENTE": "CANCELADOPORCLIENTE"
};

const TipoNotificacion = {
  "RESERVATARJETACREADA": "RESERVATARJETACREADA",
  "RESERVAEFECTIVOCREADA": "RESERVAEFECTIVOCREADA",
  "RESERVACANCELADA": "RESERVACANCELADA",
  "RESERVAEFECTIVOPAGADA": "RESERVAEFECTIVOPAGADA",
  "ADMIN": "ADMIN",
  "BIENVENIDA": "BIENVENIDA",
  "EVENTOCREADO": "EVENTOCREADO",
  "EVENTOACTUALIZACION": "EVENTOACTUALIZACION",
  "EVENTOCANCELADO": "EVENTOCANCELADO",
  "RESERVAENEVENTO": "RESERVAENEVENTO",
  "RECORDATORIOEVENTO": "RECORDATORIOEVENTO",
  "RECORDATORIOPAGO": "RECORDATORIOPAGO",
  "CALIFICAUSUARIO": "CALIFICAUSUARIO"
};

const { Usuario, Evento, Boleto, ReservasBoletos, Reserva, Retiro, Cupon, Notificacion } = initSchema(schema);

export {
  Usuario,
  Evento,
  Boleto,
  ReservasBoletos,
  Reserva,
  Retiro,
  Cupon,
  Notificacion,
  TipoDocumento,
  PlaceEnum,
  MusicEnum,
  ComoditiesEnum,
  TipoPago,
  ReservaCancelReason,
  TipoNotificacion
};