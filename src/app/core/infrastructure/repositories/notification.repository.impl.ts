import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { NotificationRepository } from "../../domain/repositories/notification.repository"
import { NotificationAdapter } from "../adapters/notification.adapter"

@Injectable({
  providedIn: "root",
})
export class NotificationRepositoryImpl implements NotificationRepository {
  private adapter: NotificationAdapter

  constructor(private http: HttpClient) {
    this.adapter = new NotificationAdapter(http)
  }

  async loginToExternalApi(): Promise<void> {
    return this.adapter.loginToExternalApi()
  }

  async sendNotification(
    fcmTokenDestino: string,
    userId: string,
    meetingId: string,
    userFrom: string,
    nombre: string,
  ): Promise<void> {
    return this.adapter.sendNotification(fcmTokenDestino, userId, meetingId, userFrom, nombre)
  }

  async initPushNotifications(): Promise<void> {
    return this.adapter.initPushNotifications()
  }

  async sendTestNotification(): Promise<void> {
    return this.adapter.sendTestNotification()
  }
}
