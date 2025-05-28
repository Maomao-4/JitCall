import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Preferences } from "@capacitor/preferences"
import { LocalNotifications } from "@capacitor/local-notifications"
import { Capacitor } from "@capacitor/core"

@Injectable()
export class WebNotificationAdapter {
  private readonly apiUrl = "https://ravishing-courtesy-production.up.railway.app"
  private externalApiEmail = "duvan.mesalizcano@unicolombo.edu.co"
  private externalApiPassword = "Pass123456"

  constructor(private http: HttpClient) {}

  async loginToExternalApi(): Promise<void> {
    try {
      const response = await this.http
        .post<{ data: { access_token: string } }>(`${this.apiUrl}/user/login`, {
          email: this.externalApiEmail,
          password: this.externalApiPassword,
        })
        .toPromise()

      const token = response?.data?.access_token || ""
      await Preferences.set({ key: "external_api_token", value: token })

      console.log("🔐 Token externo guardado correctamente")
    } catch (err) {
      console.error("❌ Error al iniciar sesión en la API externa", err)
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
      const tokenData = await Preferences.get({ key: "external_api_token" })
      const token = tokenData.value

      if (!token) {
        throw new Error("Token externo no encontrado")
      }

      const headers = new HttpHeaders({
        Authorization: `${token}`,
        "Content-Type": "application/json",
      })

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

      await this.http.post(`${this.apiUrl}/notifications`, body, { headers }).toPromise()
      console.log("✅ Notificación enviada correctamente")
    } catch (error) {
      console.error("❌ Error al enviar la notificación", error)
    }
  }

  async initPushNotifications(): Promise<void> {
    // Verificamos si estamos en web
    if (Capacitor.getPlatform() === "web") {
      console.log("📱 Ejecutando en web - usando notificaciones locales")

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
    } else {
      console.warn("⚠️ No estamos en web, pero este adaptador es solo para web")
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
