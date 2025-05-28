import { Injectable } from "@angular/core"
import { Auth } from "@angular/fire/auth"
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
} from "@angular/fire/firestore"
import { Observable } from "rxjs"
import { ContactEntity, UserEntity } from "../../domain/entities/user.entity"
import { ContactRepository } from "../../domain/repositories/contact.repository"

@Injectable({
  providedIn: "root",
})
export class FirebaseContactAdapter implements ContactRepository {
  constructor(
    private firestore: Firestore,
    private auth: Auth,
  ) {}

  getContacts(): Observable<ContactEntity[]> {
    const uid = this.auth.currentUser?.uid
    if (!uid) throw new Error("Usuario no autenticado")

    const contactsRef = collection(this.firestore, `users/${uid}/contacts`)
    return collectionData(contactsRef, { idField: "id" }) as Observable<ContactEntity[]>
  }

  async getContactById(uid: string): Promise<UserEntity | null> {
    const contactRef = doc(this.firestore, `users/${uid}`)
    const snapshot = await getDoc(contactRef)
    return snapshot.exists() ? { ...(snapshot.data() as UserEntity), uid } : null
  }

  async searchUserByPhone(telefono: string): Promise<{ uid: string; data: UserEntity } | null> {
    const usersRef = collection(this.firestore, "users")
    const q = query(usersRef, where("telefono", "==", telefono))
    const snapshot = await getDocs(q)

    if (snapshot.empty) return null

    const docSnap = snapshot.docs[0]
    return {
      uid: docSnap.id,
      data: { ...(docSnap.data() as UserEntity), uid: docSnap.id },
    }
  }

  async addContact(contacto: ContactEntity): Promise<void> {
    const uid = this.auth.currentUser?.uid
    if (!uid) throw new Error("Usuario no autenticado")

    const contactRef = doc(this.firestore, `users/${uid}/contacts/${contacto.uid}`)
    await setDoc(contactRef, contacto)
  }
}
