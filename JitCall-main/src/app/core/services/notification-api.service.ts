import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { Preferences } from "@capacitor/preferences"

@Injectable({
  providedIn: "root",
})
export class NotificationApiService {
  private readonly apiUrl = "https://ravishing-courtesy-production.up.railway.app"

  // Credenciales fijas (tu cuenta autorizada para enviar notificaciones)
  private externalApiEmail = "yanisca.herrerafranco@unicolombo.edu.co"
  private externalApiPassword = "maomao123"

  constructor(private http: HttpClient) {}

  /**
   * Inicia sesión en la API externa y guarda el token de acceso.
   */
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

  /**
   * Envía una notificación push a través de la API externa.
   */
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
}
