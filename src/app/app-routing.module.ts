import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AppComponent } from "./app.component";
import { MapComponent } from "./map/map.component";

import { PopKomComponent } from "./pop-kom/pop-kom.component";

const routes: Routes = [{ path: "", component: AppComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
