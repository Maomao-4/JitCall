import { Inject, Injectable } from "@angular/core"
import { v4 as uuidv4 } from "uuid"
import { Capacitor } from "@capacitor/core"
import { ContactEntity } from "../../domain/entities/user.entity"
import { AuthRepository } from "../../domain/repositories/auth.repository"
import { NotificationRepository } from "../../domain/repositories/notification.repository"
import { AUTH_REPOSITORY, NOTIFICATION_REPOSITORY } from "../../domain/tokens/injection-tokens"

@Injectable({
  providedIn: "root",
})
export class CallUseCase {
  private readonly JITSI_SERVER = "https://jitsi1.geeksec.de/";

  constructor(
    @Inject(AUTH_REPOSITORY) private authRepository: AuthRepository,
    @Inject(NOTIFICATION_REPOSITORY) private notificationRepository: NotificationRepository,
  ) {}

  async initiateCall(contact: ContactEntity): Promise<string | null> {
    try {
      // Generar un ID único para la llamada usando UUID
      const meetingId = uuidv4()
      console.log(`🆔 ID de reunión generado: ${meetingId}`)

      const currentUser = await this.authRepository.getCurrentUser()

      if (!currentUser) {
        console.error("❌ Usuario no autenticado")
        throw new Error("Usuario no autenticado")
      }

      const userFrom = currentUser.uid!
      const nombre = `${currentUser.nombre} ${currentUser.apellido}`

      console.log(`👤 Llamada de: ${nombre} (${userFrom})`)

      const fcmTokenDestino = contact.fcmToken
      const userId = contact.uid

      if (userFrom === userId) {
        console.warn("🚫 No puedes llamarte a ti mismo.")
        return null
      }

      if (!fcmTokenDestino) {
        console.warn("⚠️ El contacto no tiene token FCM. Usando flujo alternativo para web.")
        // Para web, podemos simular la llamada directamente
        return meetingId
      }

      // Intentar enviar la notificación
      try {
        console.log(`📤 Enviando notificación a: ${contact.nombre} (${userId})`)
        await this.notificationRepository.sendNotification(fcmTokenDestino, userId, meetingId, userFrom, nombre)
        console.log("📞 Notificación enviada correctamente")
      } catch (error) {
        console.error("❌ Error al enviar notificación:", error)

        // A pesar del error, continuamos con la llamada en web
        if (Capacitor.getPlatform() === "web") {
          console.log("⚠️ Continuando con flujo alternativo para web a pesar del error")
          return meetingId
        } else {
          throw error
        }
      }

      return meetingId
    } catch (error) {
      console.error("❌ Error al iniciar llamada:", error)
      throw error
    }
  }

  getJitsiMeetUrl(meetingId: string): string {
    return `${this.JITSI_SERVER}${meetingId}`
  }

  async joinJitsiMeeting(meetingId: string): Promise<void> {
    if (Capacitor.getPlatform() === "web") {
      // En web, simplemente abrimos la URL
      window.open(this.getJitsiMeetUrl(meetingId), "_self")
    } else {
      // En dispositivos nativos, usaríamos el SDK de Jitsi
      // Aquí solo simulamos para la demo
      console.log("Uniendo a la reunión de Jitsi:", meetingId)
    }
  }
}
