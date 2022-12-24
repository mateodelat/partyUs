import { ModelInit, MutableModel } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncCollection, AsyncItem } from "@aws-amplify/datastore";

export enum TipoDocumento {
  PASAPORTE = "PASAPORTE",
  INE = "INE"
}

export enum PlaceEnum {
  EXTERIOR = "EXTERIOR",
  INTERIOR = "INTERIOR",
  MIXTO = "MIXTO"
}

export enum MusicEnum {
  REGGAETON = "REGGAETON",
  POP = "POP",
  TECHNO = "TECHNO",
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
  RESERVAENEVENTO = "RESERVAENEVENTO",
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

type RetiroMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type CuponMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type NotificacionMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type EagerUsuario = {
  readonly id: string;
  readonly nickname?: string | null;
  readonly nombre?: string | null;
  readonly materno?: string | null;
  readonly paterno?: string | null;
  readonly email?: string | null;
  readonly foto?: string | null;
  readonly cuentaBancaria?: string | null;
  readonly titularCuenta?: string | null;
  readonly receiveNewReservations?: boolean | null;
  readonly rfc?: string | null;
  readonly imagenFondo?: string | null;
  readonly direccion?: string | null;
  readonly phoneNumber?: string | null;
  readonly phoneCode?: string | null;
  readonly organizador?: boolean | null;
  readonly admin?: boolean | null;
  readonly idUploaded?: boolean | null;
  readonly idData?: string | null;
  readonly idFrontKey?: string | null;
  readonly idBackKey?: string | null;
  readonly tipoDocumento?: TipoDocumento | keyof typeof TipoDocumento | null;
  readonly fechaNacimiento?: string | null;
  readonly calificacion?: number | null;
  readonly numResenas?: number | null;
  readonly notificationToken?: string | null;
  readonly paymentClientID?: string | null;
  readonly paymentAccountID?: string | null;
  readonly verified?: boolean | null;
  readonly owner?: string | null;
  readonly Eventos?: (Evento | null)[] | null;
  readonly Reservas?: (Reserva | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUsuario = {
  readonly id: string;
  readonly nickname?: string | null;
  readonly nombre?: string | null;
  readonly materno?: string | null;
  readonly paterno?: string | null;
  readonly email?: string | null;
  readonly foto?: string | null;
  readonly cuentaBancaria?: string | null;
  readonly titularCuenta?: string | null;
  readonly receiveNewReservations?: boolean | null;
  readonly rfc?: string | null;
  readonly imagenFondo?: string | null;
  readonly direccion?: string | null;
  readonly phoneNumber?: string | null;
  readonly phoneCode?: string | null;
  readonly organizador?: boolean | null;
  readonly admin?: boolean | null;
  readonly idUploaded?: boolean | null;
  readonly idData?: string | null;
  readonly idFrontKey?: string | null;
  readonly idBackKey?: string | null;
  readonly tipoDocumento?: TipoDocumento | keyof typeof TipoDocumento | null;
  readonly fechaNacimiento?: string | null;
  readonly calificacion?: number | null;
  readonly numResenas?: number | null;
  readonly notificationToken?: string | null;
  readonly paymentClientID?: string | null;
  readonly paymentAccountID?: string | null;
  readonly verified?: boolean | null;
  readonly owner?: string | null;
  readonly Eventos: AsyncCollection<Evento>;
  readonly Reservas: AsyncCollection<Reserva>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Usuario = LazyLoading extends LazyLoadingDisabled ? EagerUsuario : LazyUsuario

export declare const Usuario: (new (init: ModelInit<Usuario, UsuarioMetaData>) => Usuario) & {
  copyOf(source: Usuario, mutator: (draft: MutableModel<Usuario, UsuarioMetaData>) => MutableModel<Usuario, UsuarioMetaData> | void): Usuario;
}

type EagerEvento = {
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
  readonly paymentProductID?: string | null;
  readonly CreatorID?: string | null;
  readonly creator?: Usuario | null;
  readonly Boletos?: (Boleto | null)[] | null;
  readonly Reservas?: (Reserva | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyEvento = {
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
  readonly paymentProductID?: string | null;
  readonly CreatorID?: string | null;
  readonly creator: AsyncItem<Usuario | undefined>;
  readonly Boletos: AsyncCollection<Boleto>;
  readonly Reservas: AsyncCollection<Reserva>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Evento = LazyLoading extends LazyLoadingDisabled ? EagerEvento : LazyEvento

export declare const Evento: (new (init: ModelInit<Evento, EventoMetaData>) => Evento) & {
  copyOf(source: Evento, mutator: (draft: MutableModel<Evento, EventoMetaData>) => MutableModel<Evento, EventoMetaData> | void): Evento;
}

type EagerBoleto = {
  readonly id: string;
  readonly titulo?: string | null;
  readonly descripcion?: string | null;
  readonly cantidad?: number | null;
  readonly personasReservadas?: number | null;
  readonly precio?: number | null;
  readonly paymentPriceID?: string | null;
  readonly eventoID?: string | null;
  readonly Reservas?: (ReservasBoletos | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyBoleto = {
  readonly id: string;
  readonly titulo?: string | null;
  readonly descripcion?: string | null;
  readonly cantidad?: number | null;
  readonly personasReservadas?: number | null;
  readonly precio?: number | null;
  readonly paymentPriceID?: string | null;
  readonly eventoID?: string | null;
  readonly Reservas: AsyncCollection<ReservasBoletos>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Boleto = LazyLoading extends LazyLoadingDisabled ? EagerBoleto : LazyBoleto

export declare const Boleto: (new (init: ModelInit<Boleto, BoletoMetaData>) => Boleto) & {
  copyOf(source: Boleto, mutator: (draft: MutableModel<Boleto, BoletoMetaData>) => MutableModel<Boleto, BoletoMetaData> | void): Boleto;
}

type EagerReservasBoletos = {
  readonly id: string;
  readonly boletoID?: string | null;
  readonly reservaID?: string | null;
  readonly reserva?: Reserva | null;
  readonly boleto?: Boleto | null;
  readonly quantity?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyReservasBoletos = {
  readonly id: string;
  readonly boletoID?: string | null;
  readonly reservaID?: string | null;
  readonly reserva: AsyncItem<Reserva | undefined>;
  readonly boleto: AsyncItem<Boleto | undefined>;
  readonly quantity?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ReservasBoletos = LazyLoading extends LazyLoadingDisabled ? EagerReservasBoletos : LazyReservasBoletos

export declare const ReservasBoletos: (new (init: ModelInit<ReservasBoletos, ReservasBoletosMetaData>) => ReservasBoletos) & {
  copyOf(source: ReservasBoletos, mutator: (draft: MutableModel<ReservasBoletos, ReservasBoletosMetaData>) => MutableModel<ReservasBoletos, ReservasBoletosMetaData> | void): ReservasBoletos;
}

type EagerReserva = {
  readonly id: string;
  readonly total?: number | null;
  readonly comision?: number | null;
  readonly pagadoAlOrganizador?: number | null;
  readonly cantidad?: number | null;
  readonly pagado?: boolean | null;
  readonly paymentTime?: string | null;
  readonly transaccionAOrganizadorID?: string | null;
  readonly transaccionAOrganizador?: Retiro | null;
  readonly tipoPago?: TipoPago | keyof typeof TipoPago | null;
  readonly chargeID?: string | null;
  readonly transactionID?: string | null;
  readonly feeID?: string | null;
  readonly cashBarcode?: string | null;
  readonly cashReference?: string | null;
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
}

type LazyReserva = {
  readonly id: string;
  readonly total?: number | null;
  readonly comision?: number | null;
  readonly pagadoAlOrganizador?: number | null;
  readonly cantidad?: number | null;
  readonly pagado?: boolean | null;
  readonly paymentTime?: string | null;
  readonly transaccionAOrganizadorID?: string | null;
  readonly transaccionAOrganizador: AsyncItem<Retiro | undefined>;
  readonly tipoPago?: TipoPago | keyof typeof TipoPago | null;
  readonly chargeID?: string | null;
  readonly transactionID?: string | null;
  readonly feeID?: string | null;
  readonly cashBarcode?: string | null;
  readonly cashReference?: string | null;
  readonly ingreso?: boolean | null;
  readonly horaIngreso?: string | null;
  readonly cancelado?: boolean | null;
  readonly canceledAt?: string | null;
  readonly cancelReason?: ReservaCancelReason | keyof typeof ReservaCancelReason | null;
  readonly fechaExpiracionUTC?: string | null;
  readonly eventoID?: string | null;
  readonly evento: AsyncItem<Evento | undefined>;
  readonly usuarioID?: string | null;
  readonly usuario: AsyncItem<Usuario | undefined>;
  readonly cuponID?: string | null;
  readonly cupon: AsyncItem<Cupon | undefined>;
  readonly Boletos: AsyncCollection<ReservasBoletos>;
  readonly organizadorID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Reserva = LazyLoading extends LazyLoadingDisabled ? EagerReserva : LazyReserva

export declare const Reserva: (new (init: ModelInit<Reserva, ReservaMetaData>) => Reserva) & {
  copyOf(source: Reserva, mutator: (draft: MutableModel<Reserva, ReservaMetaData>) => MutableModel<Reserva, ReservaMetaData> | void): Reserva;
}

type EagerRetiro = {
  readonly id: string;
  readonly organizadorID: string;
  readonly amount: number;
  readonly adminID: string;
  readonly feeID?: string | null;
  readonly transferID?: string | null;
  readonly mensaje?: string | null;
  readonly Reservas?: (Reserva | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyRetiro = {
  readonly id: string;
  readonly organizadorID: string;
  readonly amount: number;
  readonly adminID: string;
  readonly feeID?: string | null;
  readonly transferID?: string | null;
  readonly mensaje?: string | null;
  readonly Reservas: AsyncCollection<Reserva>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Retiro = LazyLoading extends LazyLoadingDisabled ? EagerRetiro : LazyRetiro

export declare const Retiro: (new (init: ModelInit<Retiro, RetiroMetaData>) => Retiro) & {
  copyOf(source: Retiro, mutator: (draft: MutableModel<Retiro, RetiroMetaData>) => MutableModel<Retiro, RetiroMetaData> | void): Retiro;
}

type EagerCupon = {
  readonly id: string;
  readonly restantes: number;
  readonly vencimiento: number;
  readonly porcentajeDescuento?: number | null;
  readonly cantidadDescuento?: number | null;
  readonly Reservas?: Reserva[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyCupon = {
  readonly id: string;
  readonly restantes: number;
  readonly vencimiento: number;
  readonly porcentajeDescuento?: number | null;
  readonly cantidadDescuento?: number | null;
  readonly Reservas: AsyncCollection<Reserva>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Cupon = LazyLoading extends LazyLoadingDisabled ? EagerCupon : LazyCupon

export declare const Cupon: (new (init: ModelInit<Cupon, CuponMetaData>) => Cupon) & {
  copyOf(source: Cupon, mutator: (draft: MutableModel<Cupon, CuponMetaData>) => MutableModel<Cupon, CuponMetaData> | void): Cupon;
}

type EagerNotificacion = {
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
}

type LazyNotificacion = {
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
}

export declare type Notificacion = LazyLoading extends LazyLoadingDisabled ? EagerNotificacion : LazyNotificacion

export declare const Notificacion: (new (init: ModelInit<Notificacion, NotificacionMetaData>) => Notificacion) & {
  copyOf(source: Notificacion, mutator: (draft: MutableModel<Notificacion, NotificacionMetaData>) => MutableModel<Notificacion, NotificacionMetaData> | void): Notificacion;
}