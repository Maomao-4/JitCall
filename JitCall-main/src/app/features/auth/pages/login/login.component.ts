import { Component } from "@angular/core"
import { FormBuilder, type FormGroup, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { ToastController } from "@ionic/angular"
import { AuthService } from "../../services/auth.service"
import { NotificationService } from "src/app/core/services/notification.service"

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  standalone: false,
})
export class LoginComponent {
  loginForm: FormGroup
  isLoading = false

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private notificationService: NotificationService,
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    })
  }

  async onSubmit() {
    if (this.loginForm.invalid) return

    const { email, password } = this.loginForm.value
    this.isLoading = true

    try {
      await this.authService.login(email, password)
      await this.notificationService.getToken()
      this.router.navigate(["/home"])
    } catch (error: any) {
      const errorMessage = this.getErrorMessage(error)
      this.presentToast(errorMessage, "danger")
    } finally {
      this.isLoading = false
    }
  }

  goToRegister() {
    this.router.navigate(["/auth/register"])
  }

  private getErrorMessage(error: any): string {
    const errorCode = error.code
    switch (errorCode) {
      case "auth/user-not-found":
        return "No existe una cuenta con este correo electrónico"
      case "auth/wrong-password":
        return "Contraseña incorrecta"
      case "auth/invalid-credential":
        return "Credenciales inválidas"
      default:
        return "Error al iniciar sesión: " + (error.message || "Intenta nuevamente")
    }
  }

  private async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: "top",
    })
    await toast.present()
  }
}
