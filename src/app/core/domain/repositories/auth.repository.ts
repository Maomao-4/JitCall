import { UserEntity } from "../entities/user.entity"

export interface AuthRepository {
  login(email: string, password: string): Promise<string>
  register(user: UserEntity, password: string): Promise<string>
  logout(): Promise<void>
  getCurrentUser(): Promise<UserEntity | null>
  getCurrentUserId(): string | null
  saveFcmToken(uid: string, token: string): Promise<void>
}
