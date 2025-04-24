import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { HttpClientModule } from "@angular/common/http"

import { AUTH_REPOSITORY, CONTACT_REPOSITORY, NOTIFICATION_REPOSITORY } from "./domain/tokens/injection-tokens"
import { AuthRepositoryImpl } from "./infrastructure/repositories/auth.repository.impl"
import { ContactRepositoryImpl } from "./infrastructure/repositories/contact.repository.impl"
import { NotificationRepositoryImpl } from "./infrastructure/repositories/notification.repository.impl"

@NgModule({
  declarations: [],
  imports: [CommonModule, HttpClientModule],
  providers: [
    { provide: AUTH_REPOSITORY, useClass: AuthRepositoryImpl },
    { provide: CONTACT_REPOSITORY, useClass: ContactRepositoryImpl },
    { provide: NOTIFICATION_REPOSITORY, useClass: NotificationRepositoryImpl },
  ],
})
export class CoreModule {}
