import { NgModule } from "@angular/core"
import { PreloadAllModules, RouterModule, type Routes } from "@angular/router"
import { AuthGuard } from "./core/guards/auth.guard"

const routes: Routes = [
  { path: "", redirectTo: "auth/login", pathMatch: "full" },
  { path: "auth", loadChildren: () => import("./features/auth/auth.module").then((m) => m.AuthModule) },
  {
    path: "home",
    loadChildren: () => import("./features/home/home.module").then((m) => m.HomeModule),
    canActivate: [AuthGuard],
  },
  {
    path: "settings",
    loadChildren: () => import("./features/settings/settings.module").then((m) => m.SettingsModule),
    canActivate: [AuthGuard],
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
