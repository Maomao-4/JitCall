import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { IonicModule } from "@ionic/angular"
import { ReactiveFormsModule } from "@angular/forms"
import { SettingsRoutingModule } from "./settings-routing.module"
import { PlatformRegistrationComponent } from "./pages/platform-registration/platform-registration.component"

@NgModule({
  declarations: [PlatformRegistrationComponent],
  imports: [CommonModule, IonicModule, ReactiveFormsModule, SettingsRoutingModule],
})
export class SettingsModule {}
