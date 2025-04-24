import { NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { IonicModule } from "@ionic/angular"
import { AppComponent } from "./app.component"
import { AppRoutingModule } from "./app-routing.module"
import { environment } from "../environments/environment"
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http"
import { SharedModule } from "./shared/shared.module"
import { CoreModule } from "./core/core.module"
import { AuthInterceptor } from "./core/interceptors/auth.interceptor"

import { provideFirebaseApp, initializeApp } from "@angular/fire/app"
import { provideAuth, getAuth } from "@angular/fire/auth"
import { provideFirestore, getFirestore } from "@angular/fire/firestore"
import { HomeModule } from "./features/home/home.module"

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      mode: "md", // Usar Material Design en todas las plataformas
      backButtonText: "",
    }),
    AppRoutingModule,
    HomeModule,
    HttpClientModule,
    SharedModule,
    CoreModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
