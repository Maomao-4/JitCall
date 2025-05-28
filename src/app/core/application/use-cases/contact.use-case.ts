import { Inject, Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { ContactEntity, UserEntity } from "../../domain/entities/user.entity"
import { ContactRepository } from "../../domain/repositories/contact.repository"
import { AuthRepository } from "../../domain/repositories/auth.repository"
import { AUTH_REPOSITORY, CONTACT_REPOSITORY } from "../../domain/tokens/injection-tokens"

@Injectable({
  providedIn: "root",
})
export class ContactUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY) private contactRepository: ContactRepository,
    @Inject(AUTH_REPOSITORY) private authRepository: AuthRepository,
  ) {}

  getContacts(): Observable<ContactEntity[]> {
    return this.contactRepository.getContacts()
  }

  async getContactDataById(uid: string): Promise<UserEntity | null> {
    return this.contactRepository.getContactById(uid)
  }

  async searchUserByPhone(telefono: string): Promise<{ uid: string; data: UserEntity } | null> {
    return this.contactRepository.searchUserByPhone(telefono)
  }

  async addContact(contacto: ContactEntity): Promise<void> {
    return this.contactRepository.addContact(contacto)
  }

  getCurrentUserId(): string {
    const uid = this.authRepository.getCurrentUserId()
    if (!uid) throw new Error("Usuario no autenticado")
    return uid
  }
}
