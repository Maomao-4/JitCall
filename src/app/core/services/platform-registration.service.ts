import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class PlatformRegistrationService {
  private readonly API_URL = "https://ravishing-courtesy-production.up.railway.app"

  constructor(private http: HttpClient) {}

  /**
   * Registra la aplicación en la plataforma externa
   * @param email Correo institucional
   * @param serviceAccountKey Archivo de configuración de Firebase Admin SDK
   */
  registerApp(email: string, serviceAccountKey: File): Observable<any> {
    const formData = new FormData()
    formData.append("email", email)
    formData.append("serviceAccountKey", serviceAccountKey)

    return this.http.post(`${this.API_URL}/register-app`, formData)
  }

  /**
   * Obtiene el historial de notificaciones enviadas
   */
  getNotificationHistory(): Observable<any> {
    return this.http.get(`${this.API_URL}/notification-history`)
  }

  /**
   * Verifica el estado del registro de la aplicación
   */
  checkRegistrationStatus(): Observable<any> {
    return this.http.get(`${this.API_URL}/registration-status`)
  }
}
