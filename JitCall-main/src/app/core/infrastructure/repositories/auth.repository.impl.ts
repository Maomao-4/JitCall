import { Injectable } from "@angular/core"
import { Auth } from "@angular/fire/auth"
import { Firestore } from "@angular/fire/firestore"
import { AuthRepository } from "../../domain/repositories/auth.repository"
import { UserEntity } from "../../domain/entities/user.entity"
import { FirebaseAuthAdapter } from "../adapters/firebase-auth.adapter"

@Injectable({
  providedIn: "root",
})
export class AuthRepositoryImpl implements AuthRepository {
  private adapter: FirebaseAuthAdapter

  constructor(
    private auth: Auth,
    private firestore: Firestore,
  ) {
    this.adapter = new FirebaseAuthAdapter(auth, firestore)
  }

  async login(email: string, password: string): Promise<string> {
    return this.adapter.login(email, password)
  }

  async register(user: UserEntity, password: string): Promise<string> {
    return this.adapter.register(user, password)
  }

  async logout(): Promise<void> {
    return this.adapter.logout()
  }

  async getCurrentUser(): Promise<UserEntity | null> {
    return this.adapter.getCurrentUser()
  }

  getCurrentUserId(): string | null {
    return this.adapter.getCurrentUserId()
  }

  async saveFcmToken(uid: string, token: string): Promise<void> {
    return this.adapter.saveFcmToken(uid, token)
  }
}
