import { Observable } from "rxjs"
import { ContactEntity, UserEntity } from "../entities/user.entity"

export interface ContactRepository {
  getContacts(): Observable<ContactEntity[]>
  getContactById(uid: string): Promise<UserEntity | null>
  searchUserByPhone(telefono: string): Promise<{ uid: string; data: UserEntity } | null>
  addContact(contacto: ContactEntity): Promise<void>
}
