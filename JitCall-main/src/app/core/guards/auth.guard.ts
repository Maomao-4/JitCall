import { Inject, Injectable } from "@angular/core"
import { CanActivate, Router } from "@angular/router"
import { Observable } from "rxjs"
import { AuthRepository } from "../domain/repositories/auth.repository"
import { AUTH_REPOSITORY } from "../domain/tokens/injection-tokens"

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(AUTH_REPOSITORY) private authRepository: AuthRepository,
    private router: Router,
  ) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise(async (resolve) => {
      const user = await this.authRepository.getCurrentUser()
      if (user) {
        resolve(true)
      } else {
        this.router.navigate(["/auth/login"])
        resolve(false)
      }
    })
  }
}
