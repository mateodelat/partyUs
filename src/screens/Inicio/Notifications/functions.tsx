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
}: {
  evento: Evento;
  usuario: Usuario;
}) {
  const notificacionesEnEvento = !!(
    await getAllScheduledNotificationsAsync()
  ).find((e) => e.content?.data?.eventoID === evento.id);

  // Si ya se programaron notificaciones al evento no hacer nada
  if (notificacionesEnEvento) {
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

  const remainingFor1Day = Math.round(
    (evento.fechaInicial - msInDay - new Date().getTime()) / 1000
  );
  const remainingFor1Hour = Math.round(
    (evento.fechaInicial - msInHour - new Date().getTime()) / 1000
  );

  const remainingForNext2Days = Math.round(
    (finalDate?.getTime() - new Date().getTime()) / 1000
  );

  // Si falta mas de una dia para la fecha enviar notificacion
  if (remainingFor1Day > 0) {
    sendNotifications({
      titulo: "Solo falta 1 dia!!",
      descripcion:
        "Tu fiesta en " +
        evento.titulo +
        " es mañana, revisa la hora de llegada y la ubicacion",

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

  //   Mandar notificacion a las 8 del dia siguiente
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
