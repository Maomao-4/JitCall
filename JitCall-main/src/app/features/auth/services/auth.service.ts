import { Injectable } from "@angular/core"
import { AuthUseCase } from "../../../core/application/use-cases/auth.use-case"
import { UserEntity } from "src/app/core/domain/entities/user.entity"
import { Inject } from "@angular/core"
import { AUTH_REPOSITORY } from "src/app/core/domain/tokens/injection-tokens"
import { AuthRepository } from "src/app/core/domain/repositories/auth.repository"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(
    private authUseCase: AuthUseCase,
    @Inject(AUTH_REPOSITORY) private authRepository: AuthRepository
  ) {}

  async login(email: string, password: string): Promise<void> {
    return this.authUseCase.login(email, password)
  }

  async register(email: string, password: string, nombre: string, apellido: string, telefono: string): Promise<void> {
    return this.authUseCase.register(email, password, nombre, apellido, telefono)
  }

  async logout(): Promise<void> {
    return this.authUseCase.logout()
  }

  async getCurrentUser(): Promise<UserEntity | null> {
    return this.authRepository.getCurrentUser()
  }
}
