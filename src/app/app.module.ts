import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { MapComponent, CommDialog, ReportDialog } from "./map/map.component";
import { MapboComponent } from "./mapbo/mapbo.component";

import { HttpClientModule } from "@angular/common/http";

import { MatDialogModule } from "@angular/material/dialog";

import { DialogContentExampleDialog } from "./pop-kom/pop-kom.component";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatCardModule } from "@angular/material/card";
import { MatSliderModule } from "@angular/material/slider";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatGridListModule } from "@angular/material/grid-list";
import { PopKomComponent } from "./pop-kom/pop-kom.component";
import { MatTreeModule } from "@angular/material/tree";

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    MapboComponent,
    DialogContentExampleDialog,
    PopKomComponent,
    CommDialog,
    ReportDialog
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSliderModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatGridListModule,
    MatTreeModule,
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [DialogContentExampleDialog, CommDialog, ReportDialog]
})
export class AppModule {}
