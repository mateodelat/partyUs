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

export enum TipoPago {
  EFECTIVO = "EFECTIVO",
  TARJETA = "TARJETA"
}

export enum ReservaCancelReason {
  EVENTOCERRADO = "EVENTOCERRADO",
  CANCELADOPORCLIENTE = "CANCELADOPORCLIENTE"
}

export enum TipoNotificacion {
  RESERVATARJETACREADA = "RESERVATARJETACREADA",
  RESERVAEFECTIVOCREADA = "RESERVAEFECTIVOCREADA",
  RESERVACANCELADA = "RESERVACANCELADA",
  RESERVAEFECTIVOPAGADA = "RESERVAEFECTIVOPAGADA",
  ADMIN = "ADMIN",
  BIENVENIDA = "BIENVENIDA",
  EVENTOCREADO = "EVENTOCREADO",
  EVENTOACTUALIZACION = "EVENTOACTUALIZACION",
  EVENTOCANCELADO = "EVENTOCANCELADO",
  RECORDATORIOEVENTO = "RECORDATORIOEVENTO",
  RECORDATORIOPAGO = "RECORDATORIOPAGO",
  CALIFICAUSUARIO = "CALIFICAUSUARIO"
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

type ReservasBoletosMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type ReservaMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type CuponMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type NotificacionMetaData = {
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
  readonly direccion?: string | null;
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
  readonly userPaymentID?: string | null;
  readonly verified?: boolean | null;
  readonly owner?: string | null;
  readonly Eventos?: (Evento | null)[] | null;
  readonly Reservas?: (Reserva | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Usuario, UsuarioMetaData>);
  static copyOf(source: Usuario, mutator: (draft: MutableModel<Usuario, UsuarioMetaData>) => MutableModel<Usuario, UsuarioMetaData> | void): Usuario;
}

export declare class Evento {
  readonly id: string;
  readonly imagenes?: (string | null)[] | null;
  readonly imagenPrincipalIDX?: number | null;
  readonly titulo?: string | null;
  readonly detalles?: string | null;
  readonly ubicacion?: string | null;
  readonly fechaInicial?: number | null;
  readonly fechaFinal?: number | null;
  readonly tosAceptance?: string | null;
  readonly tipoLugar?: PlaceEnum | keyof typeof PlaceEnum | null;
  readonly musica?: MusicEnum | keyof typeof MusicEnum | null;
  readonly comodities?: (ComoditiesEnum | null)[] | keyof typeof ComoditiesEnum | null;
  readonly musOtra?: string | null;
  readonly personasReservadas?: number | null;
  readonly personasMax?: number | null;
  readonly precioMin?: number | null;
  readonly precioMax?: number | null;
  readonly CreatorID?: string | null;
  readonly creator?: Usuario | null;
  readonly Boletos?: (Boleto | null)[] | null;
  readonly Reservas?: (Reserva | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Evento, EventoMetaData>);
  static copyOf(source: Evento, mutator: (draft: MutableModel<Evento, EventoMetaData>) => MutableModel<Evento, EventoMetaData> | void): Evento;
}

export declare class Boleto {
  readonly id: string;
  readonly titulo?: string | null;
  readonly descripcion?: string | null;
  readonly cantidad?: number | null;
  readonly personasReservadas?: number | null;
  readonly precio?: number | null;
  readonly eventoID?: string | null;
  readonly Reservas?: (ReservasBoletos | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Boleto, BoletoMetaData>);
  static copyOf(source: Boleto, mutator: (draft: MutableModel<Boleto, BoletoMetaData>) => MutableModel<Boleto, BoletoMetaData> | void): Boleto;
}

export declare class ReservasBoletos {
  readonly id: string;
  readonly boletoID?: string | null;
  readonly reservaID?: string | null;
  readonly reserva?: Reserva | null;
  readonly boleto?: Boleto | null;
  readonly quantity?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<ReservasBoletos, ReservasBoletosMetaData>);
  static copyOf(source: ReservasBoletos, mutator: (draft: MutableModel<ReservasBoletos, ReservasBoletosMetaData>) => MutableModel<ReservasBoletos, ReservasBoletosMetaData> | void): ReservasBoletos;
}

export declare class Reserva {
  readonly id: string;
  readonly total?: number | null;
  readonly comision?: number | null;
  readonly pagadoAlOrganizador?: number | null;
  readonly cantidad?: number | null;
  readonly pagado?: boolean | null;
  readonly paymentTime?: string | null;
  readonly tipoPago?: TipoPago | keyof typeof TipoPago | null;
  readonly pagoID?: string | null;
  readonly cashBarcode?: string | null;
  readonly ingreso?: boolean | null;
  readonly horaIngreso?: string | null;
  readonly cancelado?: boolean | null;
  readonly canceledAt?: string | null;
  readonly cancelReason?: ReservaCancelReason | keyof typeof ReservaCancelReason | null;
  readonly fechaExpiracionUTC?: string | null;
  readonly eventoID?: string | null;
  readonly evento?: Evento | null;
  readonly usuarioID?: string | null;
  readonly usuario?: Usuario | null;
  readonly cuponID?: string | null;
  readonly cupon?: Cupon | null;
  readonly Boletos?: (ReservasBoletos | null)[] | null;
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

export declare class Notificacion {
  readonly id: string;
  readonly tipo: TipoNotificacion | keyof typeof TipoNotificacion;
  readonly titulo: string;
  readonly descripcion?: string | null;
  readonly usuarioID: string;
  readonly leido?: boolean | null;
  readonly showAt?: string | null;
  readonly reservaID?: string | null;
  readonly eventoID?: string | null;
  readonly organizadorID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Notificacion, NotificacionMetaData>);
  static copyOf(source: Notificacion, mutator: (draft: MutableModel<Notificacion, NotificacionMetaData>) => MutableModel<Notificacion, NotificacionMetaData> | void): Notificacion;
}