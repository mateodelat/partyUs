import { ModelInit, MutableModel } from "@aws-amplify/datastore";

export enum PlaceEnum {
  EXTERIOR = "EXTERIOR",
  INTERIOR = "INTERIOR",
  MIXTO = "MIXTO"
}

export enum MusicEnum {
  REGGETON = "REGGETON",
  POP = "POP",
  TECNO = "TECNO",
  RAP = "RAP",
  BANDA = "BANDA",
  ROCK = "ROCK",
  OTRO = "OTRO"
}

export enum ComoditiesEnum {
  DJ = "DJ",
  ALBERCA = "ALBERCA",
  BARRALIBRE = "BARRALIBRE",
  COMIDA = "COMIDA",
  SEGURIDAD = "SEGURIDAD"
}

export enum ReservaCancelReason {
  EVENTOCERRADO = "EVENTOCERRADO",
  CANCELADOPORCLIENTE = "CANCELADOPORCLIENTE"
}

type UsuarioMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type EventoMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type BoletoMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type ReservaMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type CuponMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Usuario {
  readonly id: string;
  readonly nickname?: string | null;
  readonly nombre?: string | null;
  readonly materno?: string | null;
  readonly paterno?: string | null;
  readonly email?: string | null;
  readonly foto?: string | null;
  readonly imagenFondo?: string | null;
  readonly phoneNumber?: string | null;
  readonly phoneCode?: string | null;
  readonly organizador?: boolean | null;
  readonly admin?: boolean | null;
  readonly idUploaded?: boolean | null;
  readonly idData?: string | null;
  readonly idKey?: string | null;
  readonly fechaNacimiento?: string | null;
  readonly calificacion?: number | null;
  readonly numResenas?: number | null;
  readonly notificationToken?: string | null;
  readonly verified?: boolean | null;
  readonly Eventos?: (Evento | null)[] | null;
  readonly Reservas?: (Reserva | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Usuario, UsuarioMetaData>);
  static copyOf(source: Usuario, mutator: (draft: MutableModel<Usuario, UsuarioMetaData>) => MutableModel<Usuario, UsuarioMetaData> | void): Usuario;
}

export declare class Evento {
  readonly id: string;
  readonly imagenes: string[];
  readonly imagenPrincipalIDX: number;
  readonly titulo: string;
  readonly detalles?: string | null;
  readonly ubicacion: string;
  readonly fechaInicial: number;
  readonly fechaFinal: number;
  readonly tosAceptance: string;
  readonly tipoLugar: PlaceEnum | keyof typeof PlaceEnum;
  readonly musica: MusicEnum | keyof typeof MusicEnum;
  readonly comodities?: ComoditiesEnum[] | keyof typeof ComoditiesEnum | null;
  readonly musOtra?: string | null;
  readonly personasReservadas?: number | null;
  readonly personasMax?: number | null;
  readonly precioMin: number;
  readonly precioMax: number;
  readonly CreatorID: string;
  readonly Boletos?: Boleto[] | null;
  readonly Reservas?: (Reserva | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Evento, EventoMetaData>);
  static copyOf(source: Evento, mutator: (draft: MutableModel<Evento, EventoMetaData>) => MutableModel<Evento, EventoMetaData> | void): Evento;
}

export declare class Boleto {
  readonly id: string;
  readonly titulo: string;
  readonly descripcion?: string | null;
  readonly cantidad: number;
  readonly personasReservadas?: number | null;
  readonly precio: number;
  readonly eventoID: string;
  readonly Reservas?: (Reserva | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Boleto, BoletoMetaData>);
  static copyOf(source: Boleto, mutator: (draft: MutableModel<Boleto, BoletoMetaData>) => MutableModel<Boleto, BoletoMetaData> | void): Boleto;
}

export declare class Reserva {
  readonly id: string;
  readonly total: number;
  readonly precioIndividual: number;
  readonly comision: number;
  readonly pagadoAlOrganizador: number;
  readonly tituloBoleto: string;
  readonly descripcionBoleto?: string | null;
  readonly cantidad: number;
  readonly pagoID?: string | null;
  readonly ingreso?: boolean | null;
  readonly horaIngreso?: string | null;
  readonly cancelado?: boolean | null;
  readonly canceledAt?: string | null;
  readonly cancelReason?: ReservaCancelReason | keyof typeof ReservaCancelReason | null;
  readonly eventoID: string;
  readonly usuarioID: string;
  readonly boletoID: string;
  readonly cuponID: string;
  readonly organizadorID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Reserva, ReservaMetaData>);
  static copyOf(source: Reserva, mutator: (draft: MutableModel<Reserva, ReservaMetaData>) => MutableModel<Reserva, ReservaMetaData> | void): Reserva;
}

export declare class Cupon {
  readonly id: string;
  readonly restantes: number;
  readonly vencimiento: number;
  readonly porcentajeDescuento?: number | null;
  readonly cantidadDescuento?: number | null;
  readonly Reservas?: Reserva[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Cupon, CuponMetaData>);
  static copyOf(source: Cupon, mutator: (draft: MutableModel<Cupon, CuponMetaData>) => MutableModel<Cupon, CuponMetaData> | void): Cupon;
}