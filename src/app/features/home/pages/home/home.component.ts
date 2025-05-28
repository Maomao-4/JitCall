import { Component, type OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { LoadingController, ModalController, ToastController } from "@ionic/angular"
import { ContactService } from "../../services/contact.service"
import { AuthService } from "../../../auth/services/auth.service"
import { IncomingCallComponent } from "src/app/shared/components/incoming-call/Incoming-call.component"
import { CallService } from "../../../call/services/call.service"
import { ContactEntity } from "src/app/core/domain/entities/user.entity"
import { Capacitor } from "@capacitor/core"

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  standalone: false,
})
export class HomeComponent implements OnInit {
  contacts: ContactEntity[] = []
  filteredContacts: ContactEntity[] = []
  isLoading = false
  searchTerm = ""
  userName = "Usuario"

  constructor(
    private contactService: ContactService,
    private authService: AuthService,
    private callService: CallService,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadContacts()
    this.loadUserName()
  }

  async loadUserName() {
    try {
      const user = await this.authService.getCurrentUser()
      if (user && user.nombre) {
        this.userName = user.nombre
      }
    } catch (error) {
      console.error("Error al cargar nombre de usuario:", error)
    }
  }

  loadContacts() {
    this.contactService.getContacts().subscribe(async (contacts) => {
      const updatedContacts = await Promise.all(
        contacts.map(async (contact) => {
          const userData = await this.contactService.getContactDataById(contact.uid)
          return { ...contact, ...userData }
        }),
      )

      this.contacts = updatedContacts
      this.filteredContacts = [...this.contacts]
    })
  }

  filterContacts() {
    if (!this.searchTerm) {
      this.filteredContacts = [...this.contacts]
      return
    }

    const term = this.searchTerm.toLowerCase()
    this.filteredContacts = this.contacts.filter(
      (contact) =>
        contact.nombre.toLowerCase().includes(term) ||
        contact.apellido.toLowerCase().includes(term) ||
        contact.telefono.toLowerCase().includes(term),
    )
  }

  getInitials(firstName: string, lastName: string): string {
    return (firstName ? firstName.charAt(0).toUpperCase() : "") + (lastName ? lastName.charAt(0).toUpperCase() : "")
  }

  goToAddContact() {
    this.router.navigate(["/home/add-contact"])
  }

  async logout() {
    await this.authService.logout()
    this.router.navigate(["/auth/login"])
  }

  async onCall(contact: ContactEntity) {
    this.isLoading = true

    try {
      // Verificar si el contacto tiene un token FCM válido
      if (!contact.fcmToken && Capacitor.getPlatform() !== "web") {
        this.presentToast(
          "Este contacto no tiene un token de notificaciones válido. No podrá recibir la llamada.",
          "warning",
        )
      }

      console.log(`📞 Iniciando llamada a: ${contact.nombre} ${contact.apellido}`)

      const meetingId = await this.callService.initiateCall(contact)

      if (meetingId) {
        console.log(`✅ Llamada iniciada con ID: ${meetingId}`)

        // Para web, simulamos una llamada entrante
        if (Capacitor.getPlatform() === "web") {
          const modal = await this.modalController.create({
            component: IncomingCallComponent,
            componentProps: {
              userFrom: contact.uid,
              name: `${contact.nombre} ${contact.apellido}`,
              meetingId,
            },
            backdropDismiss: false,
            cssClass: "incoming-call-modal",
          })

          await modal.present()

          const { data } = await modal.onDidDismiss()

          // Si el usuario aceptó la llamada, abrimos Jitsi
          if (data && data.accepted) {
            await this.callService.joinJitsiMeeting(meetingId)
          }
        } else {
          // En dispositivos nativos, la notificación push manejará la llamada
          this.presentToast(`Llamando a ${contact.nombre}...`, "success")
        }
      } else {
        this.presentToast("No se pudo iniciar la llamada", "danger")
      }
    } catch (error) {
      console.error("❌ Error al iniciar llamada:", error)

      let errorMessage = "Error al iniciar la llamada"

      if (error instanceof Error && error.message) {
        errorMessage = error.message
      }

      // Si estás esperando un HttpErrorResponse, usa esto
      if (typeof error === "object" && error !== null && "status" in error) {
        const err = error as any
        if (err.status === 500) {
          errorMessage = "Error en el servidor de notificaciones. Intenta más tarde."
        }
      }

      this.presentToast(errorMessage, "danger")
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

  goToSettings() {
    this.router.navigate(["/settings/platform-registration"])
  }
}
