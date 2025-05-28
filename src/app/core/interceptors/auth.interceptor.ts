import { Injectable } from "@angular/core"
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from "@angular/common/http"
import { Observable, from } from "rxjs"
import { switchMap, catchError } from "rxjs/operators"
import { Preferences } from "@capacitor/preferences"
import { getAuth } from "@angular/fire/auth"

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly API_URL = "https://ravishing-courtesy-production.up.railway.app"

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Solo interceptamos las solicitudes a la API externa
    if (request.url.includes(this.API_URL)) {
      console.log(`🔄 Interceptando solicitud a: ${request.url}`)

      return from(this.getExternalToken()).pipe(
        switchMap((token) => {
          if (token) {
            console.log(`🔑 Añadiendo token externo: ${token.substring(0, 10)}...`)

            // Importante: Usar 'Bearer ' antes del token
            const authReq = request.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`,
              },
            })
            return next.handle(authReq)
          }

          console.warn("⚠️ No se encontró token externo, enviando solicitud sin autenticación")
          return next.handle(request)
        }),
        catchError((error) => {
          console.error("❌ Error en el interceptor:", error)
          throw error
        }),
      )
    } else {
      // Para otras solicitudes, intentamos añadir el token de Firebase si está disponible
      const auth = getAuth()
      if (auth.currentUser) {
        return from(auth.currentUser.getIdToken()).pipe(
          switchMap((firebaseToken) => {
            console.log(`🔑 Añadiendo token de Firebase: ${firebaseToken.substring(0, 10)}...`)

            const authReq = request.clone({
              setHeaders: {
                Authorization: `Bearer ${firebaseToken}`,
              },
            })
            return next.handle(authReq)
          }),
          catchError((error) => {
            console.error("❌ Error al obtener token de Firebase:", error)
            return next.handle(request)
          }),
        )
      }
    }

    // Si no hay token o no es una solicitud a la API, pasamos la solicitud sin modificar
    return next.handle(request)
  }

  private async getExternalToken(): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key: "external_api_token" })
      return value
    } catch (error) {
      console.error("❌ Error al obtener el token externo:", error)
      return null
    }
  }
}
