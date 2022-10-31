import { DataStore } from "aws-amplify";
import {
  AndroidNotificationPriority,
  getAllScheduledNotificationsAsync,
} from "expo-notifications";
import { msInDay, msInHour, sendNotifications } from "../../../../constants";
import { TipoNotificacion, Usuario } from "../../../models";
import { Evento, Notificacion } from "../../../models";

export async function notificacionesRecordatorio({
  evento,
  usuario,
  organizador,
}: {
  evento: Evento;
  usuario: Usuario;
  organizador?: boolean;
}) {
  const notificacionesEnEvento = !!(
    await getAllScheduledNotificationsAsync()
  ).find((e) => e.content?.data?.eventoID === evento.id);

  // Si ya se programaron notificaciones al evento no hacer nada
  if (notificacionesEnEvento && !organizador) {
    console.log(
      "No se mandan nuevas notificaciones pues ya hay programadas al evento"
    );
    return;
  }

  let finalDate = new Date(evento.fechaFinal);
  if (evento.fechaFinal) {
    // Poner fecha final al dia siguiente de que acabe a las 8
    if (finalDate.getHours() >= 8) {
      finalDate = new Date(finalDate.getTime() + msInDay * 2);
    }
    finalDate.setHours(8);
  }

  const remainingFor1Week = Math.round(
    (evento.fechaInicial - msInDay - new Date().getTime()) / 1000
  );
  const remainingFor1Day = Math.round(
    (evento.fechaInicial - msInDay - new Date().getTime()) / 1000
  );
  const remainingFor1Hour = Math.round(
    (evento.fechaInicial - msInHour - new Date().getTime()) / 1000
  );

  const remainingForNext2Days = Math.round(
    (finalDate?.getTime() - new Date().getTime()) / 1000
  );

  // Mandar notificaciones de falta una semana y a la hora del evento para escanear solo si es organizador
  if (organizador) {
    sendNotifications({
      titulo: "Evento en 1 semana",
      descripcion:
        "Tu evento en " +
        evento.titulo +
        " es en una semana. Realiza todos los preparativos necesarios.",

      tipo: TipoNotificacion.RECORDATORIOEVENTO,
      usuarioID: usuario.id,

      showAt: new Date(evento.fechaInicial - msInDay).toISOString(),
      triggerTime: remainingFor1Day,

      eventoID: evento.id,
      organizadorID: evento.CreatorID,
    });
  }

  // Si falta mas de una dia para la fecha enviar notificacion
  if (remainingFor1Day > 0) {
    sendNotifications({
      titulo: "Solo falta 1 dia!!",
      descripcion:
        "Tu evento en " +
        evento.titulo +
        (organizador
          ? " es mañana, asegurate de estar listo para recibir a los invitados."
          : " es mañana, revisa la hora de llegada y la ubicacion."),

      tipo: TipoNotificacion.RECORDATORIOEVENTO,
      usuarioID: usuario.id,

      showAt: new Date(evento.fechaInicial - msInDay).toISOString(),
      triggerTime: remainingFor1Day,

      eventoID: evento.id,
      organizadorID: evento.CreatorID,
    });
  }

  // Si falta mas de una dia para la fecha enviar notificacion
  if (remainingFor1Hour > 0) {
    sendNotifications({
      titulo: "Tu peda es en 1 hora",
      descripcion:
        "Tu fiesta en " +
        evento.titulo +
        " es en menos de una hora. Preparate!!",

      tipo: TipoNotificacion.RECORDATORIOEVENTO,
      usuarioID: usuario.id,

      showAt: new Date(evento.fechaInicial - msInDay).toISOString(),
      triggerTime: remainingFor1Day,

      eventoID: evento.id,
      organizadorID: evento.CreatorID,
    });
  }

  // Hora del evento mandar codigo QR
  sendNotifications({
    titulo: organizador ? "Esanea las entradas" : "Prepara tu codigo QR",
    descripcion:
      "Tu evento ha comenzado. " + organizador
        ? "Preparate para escanear las entradas y verifica que sea valida."
        : "Ten a la mano tu codigo QR pagado para ingresar",

    tipo: TipoNotificacion.RECORDATORIOEVENTO,
    usuarioID: usuario.id,

    showAt: new Date(evento.fechaInicial - msInDay).toISOString(),
    triggerTime: remainingFor1Day,

    eventoID: evento.id,
    organizadorID: evento.CreatorID,
  });

  //   Mandar notificacion a las 8 del dia siguiente si no son notificaciones de organizador
  !organizador &&
    sendNotifications({
      titulo: usuario.nickname + ", ayudanos a hacer de Partyus un lugar mejor",
      descripcion:
        "Calfica tu fiesta en " +
        evento.titulo +
        " para mejorar la calidad de esta",
      tipo: TipoNotificacion.CALIFICAUSUARIO,
      usuarioID: usuario.id,

      showAt: finalDate.toISOString(),
      triggerTime: remainingForNext2Days,

      eventoID: evento.id,
      organizadorID: evento.CreatorID,
    });
}
