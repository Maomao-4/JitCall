import { Injectable } from '@angular/core';
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed,
} from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class PushService {
  async init() {
    const platform = Capacitor.getPlatform();

    if (platform !== 'android' && platform !== 'ios') {
      console.warn('📵 PushNotifications no está disponible en Web. Se omite registro.');
      return;
    }

    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') return;

    await PushNotifications.register();

    await LocalNotifications.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: 5,
    });

    PushNotifications.addListener('registration', (token: Token) => {
      console.log('📲 Token recibido:', token.value);
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: PushNotificationSchema) => {
        console.log('🔔 Notificación recibida (foreground):', notification);

        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 10000),
              title: notification.title ?? 'Notificación',
              body: notification.body ?? 'Has recibido una notificación',
              schedule: { at: new Date(Date.now() + 1000) },
              channelId: 'default',
            },
          ],
        });
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('📲 Notificación tocada:', notification);
      }
    );
  }

  async testLocalNotification() {
    await LocalNotifications.requestPermissions();

    await LocalNotifications.schedule({
      notifications: [
        {
          id: Math.floor(Math.random() * 10000),
          title: '🚀 Login exitoso',
          body: 'Tu sesión se inició correctamente.',
          schedule: { at: new Date(Date.now() + 1000) },
          channelId: 'default',
        },
      ],
    });
  }
}
