import { Component } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { ToastController } from "@ionic/angular"
import { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
  standalone: false,
})
export class RegisterComponent {
  registerForm: FormGroup
  isLoading = false

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
  ) {
    this.registerForm = this.fb.group({
      nombre: ["", Validators.required],
      apellido: ["", Validators.required],
      telefono: ["", [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    })
  }

  async onSubmit() {
    if (this.registerForm.invalid) return

    const { email, password, nombre, apellido, telefono } = this.registerForm.value
    this.isLoading = true

    try {
      await this.authService.register(email, password, nombre, apellido, telefono)
      this.presentToast("Cuenta creada exitosamente", "success")
      this.router.navigate(["/auth/login"])
    } catch (error: any) {
      const errorMessage = this.getErrorMessage(error)
      this.presentToast(errorMessage, "danger")
    } finally {
      this.isLoading = false
    }
  }

  goToLogin() {
    this.router.navigate(["/auth/login"])
  }

  private getErrorMessage(error: any): string {
    const errorCode = error.code
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "Este correo ya está registrado"
      case "auth/invalid-email":
        return "El formato del correo es inválido"
      case "auth/weak-password":
        return "La contraseña es demasiado débil"
      default:
        return "Error al registrar: " + (error.message || "Intenta nuevamente")
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
