import { Inject, Injectable } from "@angular/core"
import { Capacitor } from "@capacitor/core"
import { UserEntity } from "../../domain/entities/user.entity"
import { AuthRepository } from "../../domain/repositories/auth.repository"
import { NotificationRepository } from "../../domain/repositories/notification.repository"
import { AUTH_REPOSITORY, NOTIFICATION_REPOSITORY } from "../../domain/tokens/injection-tokens"

@Injectable({
  providedIn: "root",
})
export class AuthUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private authRepository: AuthRepository,
    @Inject(NOTIFICATION_REPOSITORY) private notificationRepository: NotificationRepository,
  ) {}

  async login(email: string, password: string): Promise<void> {
    try {
      console.log("🔄 Iniciando sesión en Firebase...")
      await this.authRepository.login(email, password)

      console.log("🔄 Iniciando sesión en API externa...")
      await this.notificationRepository.loginToExternalApi()

      // Solo inicializamos notificaciones si estamos en web
      if (Capacitor.getPlatform() === "web") {
        try {
          console.log("🔄 Inicializando notificaciones web...")
          await this.notificationRepository.initPushNotifications()
          await this.notificationRepository.sendTestNotification()
        } catch (error) {
          console.warn("⚠️ No se pudieron inicializar las notificaciones:", error)
          // Continuamos con la aplicación aunque fallen las notificaciones
        }
      } else {
        console.log("🔄 Inicializando notificaciones nativas...")
        await this.notificationRepository.initPushNotifications()
      }

      console.log("✅ Inicio de sesión completado con éxito")
    } catch (error) {
      console.error("❌ Error en el proceso de inicio de sesión:", error)
      throw error
    }
  }

  async register(email: string, password: string, nombre: string, apellido: string, telefono: string): Promise<void> {
    try {
      console.log("🔄 Registrando usuario en Firebase...")
      const user: UserEntity = {
        nombre,
        apellido,
        telefono,
        email,
      }

      await this.authRepository.register(user, password)

      console.log("🔄 Iniciando sesión en API externa...")
      await this.notificationRepository.loginToExternalApi()

      console.log("✅ Registro completado con éxito")
    } catch (error) {
      console.error("❌ Error en el proceso de registro:", error)
      throw error
    }
  }

  async logout(): Promise<void> {
    await this.authRepository.logout()
  }

  getCurrentUserId(): string | null {
    return this.authRepository.getCurrentUserId()
  }
}
