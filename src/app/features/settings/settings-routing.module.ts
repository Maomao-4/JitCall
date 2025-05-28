import { NgModule } from "@angular/core"
import { RouterModule, type Routes } from "@angular/router"
import { PlatformRegistrationComponent } from "./pages/platform-registration/platform-registration.component"
import { AuthGuard } from "src/app/core/guards/auth.guard"

const routes: Routes = [
  {
    path: "platform-registration",
    component: PlatformRegistrationComponent,
    canActivate: [AuthGuard],
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
