import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";

export enum PlaceEnum {
  EXTERIOR = "EXTERIOR",
  INTERIOR = "INTERIOR"
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

type ReservaMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Usuario {
  readonly id: string;
  readonly nickname: string;
  readonly nombre?: string | null;
  readonly materno?: string | null;
  readonly paterno?: string | null;
  readonly email: string;
  readonly phoneNumber?: string | null;
  readonly phoneCode?: string | null;
  readonly organizador?: boolean | null;
  readonly admin?: boolean | null;
  readonly idUploaded?: boolean | null;
  readonly idData?: string | null;
  readonly fechaNacimiento?: string | null;
  readonly calificacion?: number | null;
  readonly numResenas?: number | null;
  readonly notificationToken?: string | null;
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
  readonly titulo: string;
  readonly detalles?: string | null;
  readonly ubicacion: string;
  readonly fechaInicial: string;
  readonly fechaFinal: string;
  readonly boletos: string[];
  readonly tosAceptance: string;
  readonly tipoLugar: PlaceEnum | keyof typeof PlaceEnum;
  readonly musica: MusicEnum | keyof typeof MusicEnum;
  readonly comodities?: (ComoditiesEnum | null)[] | keyof typeof ComoditiesEnum | null;
  readonly musOtra?: string | null;
  readonly CreatorID: string;
  readonly Creator?: Usuario | null;
  readonly Reservas?: Reserva[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Evento, EventoMetaData>);
  static copyOf(source: Evento, mutator: (draft: MutableModel<Evento, EventoMetaData>) => MutableModel<Evento, EventoMetaData> | void): Evento;
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
  readonly organizadorID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Reserva, ReservaMetaData>);
  static copyOf(source: Reserva, mutator: (draft: MutableModel<Reserva, ReservaMetaData>) => MutableModel<Reserva, ReservaMetaData> | void): Reserva;
}