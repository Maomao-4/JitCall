export interface NotificationRepository {
  loginToExternalApi(): Promise<void>
  sendNotification(
    fcmTokenDestino: string,
    userId: string,
    meetingId: string,
    userFrom: string,
    nombre: string,
  ): Promise<void>
  initPushNotifications(): Promise<void>
  sendTestNotification(): Promise<void>
}
