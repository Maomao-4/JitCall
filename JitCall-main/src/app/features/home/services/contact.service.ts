import { collection, collectionData, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { getAuth } from 'firebase/auth';
import { getDocs, query, where, collection as fCollection } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  getContacts(): Observable<any[]> {
    const uid = this.auth.currentUser?.uid;
    const contactsRef = collection(this.firestore, `users/${uid}/contacts`);
    return collectionData(contactsRef, { idField: 'id' }) as Observable<any[]>;
  }

  async getContactDataById(uid: string): Promise<any | null> {
    const contactRef = doc(this.firestore, `users/${uid}`);
    const snapshot = await getDoc(contactRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  async searchUserByPhone(telefono: string): Promise<{ uid: string; data: any } | null> {
    const usersRef = fCollection(this.firestore, 'users');
    const q = query(usersRef, where('telefono', '==', telefono));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    return { uid: docSnap.id, data: docSnap.data() };
  }

  async addContact(contacto: any): Promise<void> {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('Usuario no autenticado');

    const contactRef = doc(this.firestore, `users/${uid}/contacts/${contacto.uid}`);
    await setDoc(contactRef, contacto);
  }

  getCurrentUserId(): string {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('Usuario no autenticado');
    return uid;
  }

}
