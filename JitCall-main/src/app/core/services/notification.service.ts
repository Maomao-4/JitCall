import { Injectable } from '@angular/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { AuthService } from 'src/app/features/auth/services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) { }

  getToken() {
    // Primero registrar
    PushNotifications.register();
  
    // Luego escuchar el evento de registro
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Token recibido:', token.value);
      alert('Token recibido: ' + token.value);
  
      try {
        const currentUser = await this.authService.getCurrentUser();
        if (!currentUser) {
          console.error('No hay usuario autenticado.');
          alert('No hay usuario autenticado.');
          return;
        }
  
        const uid = currentUser.uid; // Asegúrate de que este campo sea el ID del usuario (puede llamarse diferente, según tu `UserEntity`)
        if (!uid) {
          throw new Error('User ID is undefined.');
        }
        const userRef = doc(this.firestore, 'users', uid);
  
        await setDoc(userRef, { token: token.value }, { merge: true });
        console.log('Token guardado en Firestore');
        alert('Token guardado en Firestore');
  
      } catch (error) {
        console.error('Error al obtener el usuario o guardar el token:', error);
        alert('Error al obtener el usuario o guardar el token: ' + error);
      }
    });
  
    PushNotifications.addListener('registrationError', (err) => {
      console.error('Error al registrar para notificaciones:', err);
      alert('Error al registrar para notificaciones: ' + JSON.stringify(err));
    });
  }
}
