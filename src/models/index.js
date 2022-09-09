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

const { Usuario, Evento, Boleto, Reserva, Cupon } = initSchema(schema);

export {
  Usuario,
  Evento,
  Boleto,
  Reserva,
  Cupon,
  PlaceEnum,
  MusicEnum,
  ComoditiesEnum,
  ReservaCancelReason
};