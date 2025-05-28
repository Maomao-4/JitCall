import { Injectable } from "@angular/core"
import { Auth } from "@angular/fire/auth"
import { Firestore } from "@angular/fire/firestore"
import { Observable } from "rxjs"
import { ContactRepository } from "../../domain/repositories/contact.repository"
import { ContactEntity, UserEntity } from "../../domain/entities/user.entity"
import { FirebaseContactAdapter } from "../adapters/firebase-contact.adapter"

@Injectable({
  providedIn: "root",
})
export class ContactRepositoryImpl implements ContactRepository {
  private adapter: FirebaseContactAdapter

  constructor(
    private auth: Auth,
    private firestore: Firestore,
  ) {
    this.adapter = new FirebaseContactAdapter(firestore, auth)
  }

  getContacts(): Observable<ContactEntity[]> {
    return this.adapter.getContacts()
  }

  async getContactById(uid: string): Promise<UserEntity | null> {
    return this.adapter.getContactById(uid)
  }

  async searchUserByPhone(telefono: string): Promise<{ uid: string; data: UserEntity } | null> {
    return this.adapter.searchUserByPhone(telefono)
  }

  async addContact(contacto: ContactEntity): Promise<void> {
    return this.adapter.addContact(contacto)
  }
}
