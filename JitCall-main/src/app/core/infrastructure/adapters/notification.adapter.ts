import { Injectable } from "@angular/core"
import { HttpErrorResponse } from "@angular/common/http"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Preferences } from "@capacitor/preferences"
import { LocalNotifications } from "@capacitor/local-notifications"
import { Capacitor } from "@capacitor/core"
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed,
} from "@capacitor/push-notifications"
import { getAuth } from "@angular/fire/auth"
import { doc, getFirestore, setDoc } from "@angular/fire/firestore"

@Injectable()
export class NotificationAdapter {
  private readonly apiUrl = "https://ravishing-courtesy-production.up.railway.app"
  private externalApiEmail = "duvan.mesalizcano@unicolombo.edu.co"
  private externalApiPassword = "Pass123456"

  constructor(private http: HttpClient) {}

  async loginToExternalApi(): Promise<void> {
    try {
      console.log("🔄 Iniciando sesión en API externa...")

      const response = await this.http
        .post<{ data: { access_token: string } }>(`${this.apiUrl}/user/login`, {
          email: this.externalApiEmail,
          password: this.externalApiPassword,
        })
        .toPromise()

      if (!response || !response.data || !response.data.access_token) {
        throw new Error("Respuesta inválida del servidor")
      }

      const token = response.data.access_token
      await Preferences.set({ key: "external_api_token", value: token })

      console.log("🔐 Token externo guardado correctamente:", token.substring(0, 10) + "...")
    } catch (err) {
      console.error("❌ Error al iniciar sesión en la API externa", err)
      throw err // Propagamos el error para que el caso de uso lo maneje
    }
  }

  async sendNotification(
    fcmTokenDestino: string,
    userId: string,
    meetingId: string,
    userFrom: string,
    nombre: string,
  ): Promise<void> {
    try {
      console.log("🔄 Preparando envío de notificación...")

      const tokenData = await Preferences.get({ key: "external_api_token" })
      let token = tokenData.value

      if (!token) {
        console.log("⚠️ Token no encontrado, iniciando sesión de nuevo...")
        await this.loginToExternalApi()
        const newTokenData = await Preferences.get({ key: "external_api_token" })
        token = newTokenData.value
      }

      if (!token) {
        throw new Error("No se pudo obtener un token de autenticación válido")
      }

      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      })

      if (!fcmTokenDestino || fcmTokenDestino.trim() === "") {
        throw new Error("Token FCM de destino inválido")
      }

      const body = {
        token: fcmTokenDestino,
        notification: {
          title: "Llamada entrante",
          body: `${nombre} te está llamando`,
        },
        android: {
          priority: "high",
          data: {
            userId,
            meetingId,
            type: "incoming_call",
            name: nombre,
            userFrom,
          },
        },
      }

      console.log("📤 Enviando notificación con datos:", JSON.stringify(body, null, 2))

      const response = await this.http
        .post(`${this.apiUrl}/notifications`, body, { headers })
        .toPromise()

      console.log("✅ Notificación enviada correctamente:", response)
    } catch (error: any) {
      console.error("❌ Error al enviar notificación:")
      if (error.status) {
        console.error(`🛑 Código de estado: ${error.status}`)
      }
      if (error.error) {
        try {
          const errorDetails = typeof error.error === "string"
            ? JSON.parse(error.error)
            : error.error
          console.error("📦 Detalles del error:", JSON.stringify(errorDetails, null, 2))
        } catch (parseErr) {
          console.error("📦 Error sin parsear:", error.error)
        }
      } else {
        console.error("⚠️ Error desconocido:", error)
      }

      throw error
    }
  }

  async initPushNotifications(): Promise<void> {
    // Verificamos si estamos en web
    if (Capacitor.getPlatform() === "web") {
      console.log("📱 Ejecutando en web - usando notificaciones locales")
      this.initWebNotifications()
    } else {
      console.log("📱 Ejecutando en dispositivo nativo - inicializando FCM")
      this.initNativeNotifications()
    }
  }

  private async initWebNotifications(): Promise<void> {
    try {
      // Solicitar permisos para notificaciones locales
      await LocalNotifications.requestPermissions()

      // Crear un canal de notificaciones por defecto
      await LocalNotifications.createChannel({
        id: "default",
        name: "Default Channel",
        importance: 5,
      })

      console.log("📱 Notificaciones web inicializadas correctamente")
    } catch (error) {
      console.warn("⚠️ No se pudieron inicializar las notificaciones locales:", error)
    }
  }

  private async initNativeNotifications(): Promise<void> {
    try {
      // Solicitar permisos para notificaciones push
      const result = await PushNotifications.requestPermissions()

      if (result.receive === "granted") {
        // Registrar el dispositivo para recibir notificaciones
        await PushNotifications.register()

        // Configurar listeners para eventos de notificaciones
        PushNotifications.addListener("registration", (token: Token) => {
          console.log("Token FCM recibido:", token.value)
          this.saveFcmToken(token.value)
        })

        PushNotifications.addListener("pushNotificationReceived", (notification: PushNotificationSchema) => {
          console.log("Notificación recibida:", notification)
          this.handleIncomingNotification(notification)
        })

        PushNotifications.addListener("pushNotificationActionPerformed", (action: ActionPerformed) => {
          console.log("Acción realizada en notificación:", action)
          this.handleNotificationAction(action)
        })

        console.log("✅ Notificaciones nativas inicializadas correctamente")
      } else {
        console.warn("⚠️ Permisos de notificaciones denegados")
      }
    } catch (error) {
      console.error("❌ Error al inicializar notificaciones nativas:", error)
    }
  }

  private async saveFcmToken(token: string): Promise<void> {
    const auth = getAuth()
    const firestore = getFirestore()

    if (auth.currentUser) {
      const uid = auth.currentUser.uid
      try {
        await setDoc(
          doc(firestore, `users/${uid}`),
          {
            fcmToken: token,
          },
          { merge: true },
        )
        console.log("✅ Token FCM guardado en Firestore")
      } catch (error) {
        console.error("❌ Error al guardar token FCM:", error)
      }
    } else {
      console.warn("⚠️ No hay usuario autenticado para guardar el token FCM")
    }
  }

  private async handleIncomingNotification(notification: PushNotificationSchema): Promise<void> {
    // Verificar si es una llamada entrante
    if (notification.data && notification.data.type === "incoming_call") {
      // Mostrar notificación local para asegurar que el usuario la vea
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 10000),
            title: notification.title || "Llamada entrante",
            body: notification.body || "Tienes una llamada entrante",
            extra: notification.data,
            ongoing: true,
            actionTypeId: "INCOMING_CALL",
            schedule: { at: new Date(Date.now()) },
          },
        ],
      })
    }
  }

  private async handleNotificationAction(action: ActionPerformed): Promise<void> {
    const data = action.notification.data

    if (data && data.type === "incoming_call") {
      // Aquí podríamos abrir directamente la pantalla de llamada
      // o emitir un evento para que otros componentes respondan
      console.log("Acción en llamada entrante:", data)
    }
  }

  async sendTestNotification(): Promise<void> {
    if (Capacitor.getPlatform() === "web") {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 10000),
              title: "🚀 Login exitoso",
              body: "Tu sesión se inició correctamente.",
              schedule: { at: new Date(Date.now() + 1000) },
              channelId: "default",
            },
          ],
        })
        console.log("✅ Notificación de prueba enviada")
      } catch (error) {
        console.warn("⚠️ No se pudo enviar la notificación de prueba:", error)
      }
    }
  }
}
