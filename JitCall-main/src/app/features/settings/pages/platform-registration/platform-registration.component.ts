import { Component, OnInit } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { ToastController } from "@ionic/angular"
import { PlatformRegistrationService } from "../../../../core/services/platform-registration.service"

@Component({
  selector: "app-platform-registration",
  templateUrl: "./platform-registration.component.html",
  styleUrls: ["./platform-registration.component.scss"],
  standalone: false,
})
export class PlatformRegistrationComponent implements OnInit {
  registrationForm: FormGroup
  selectedFile: File | null = null
  isLoading = false
  isRegistered = false
  notificationHistory: any[] = []

  constructor(
    private fb: FormBuilder,
    private platformRegistrationService: PlatformRegistrationService,
    private toastController: ToastController,
  ) {
    this.registrationForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    })
  }

  ngOnInit() {
    this.checkRegistrationStatus()
  }

  async checkRegistrationStatus() {
    try {
      const response = await this.platformRegistrationService.checkRegistrationStatus().toPromise()
      this.isRegistered = response.registered

      if (this.isRegistered) {
        this.loadNotificationHistory()
      }
    } catch (error) {
      console.error("Error al verificar estado de registro:", error)
    }
  }

  async loadNotificationHistory() {
    try {
      const response = await this.platformRegistrationService.getNotificationHistory().toPromise()
      this.notificationHistory = response.notifications || []
    } catch (error) {
      console.error("Error al cargar historial de notificaciones:", error)
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0]
    if (file) {
      this.selectedFile = file
    }
  }

  async onSubmit() {
    if (this.registrationForm.invalid || !this.selectedFile) {
      this.presentToast("Por favor completa todos los campos", "danger")
      return
    }

    this.isLoading = true

    try {
      const email = this.registrationForm.get("email")?.value
      await this.platformRegistrationService.registerApp(email, this.selectedFile).toPromise()

      this.presentToast("Aplicación registrada exitosamente", "success")
      this.isRegistered = true
      this.loadNotificationHistory()
    } catch (error) {
      console.error("Error al registrar aplicación:", error)
      this.presentToast("Error al registrar la aplicación", "danger")
    } finally {
      this.isLoading = false
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
