import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent, ReportDialog } from './map/map.component';
import { MapboComponent } from './mapbo/mapbo.component';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule, MatCardModule, MatSliderModule, MatToolbarModule, MatButtonModule, MatGridListModule, MatNavList, MatListModule } from '@angular/material';
import { DialogContentExampleDialog } from './pop-kom/pop-kom.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PopKomComponent } from './pop-kom/pop-kom.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatSidenavModule } from '@angular/material';
import { ChatComponent } from './chat/chat.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    MapboComponent,
    DialogContentExampleDialog,
    PopKomComponent,
    ReportDialog,
    ChatComponent
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
    MatDialogModule,
    MatSidenavModule,
    MatFormFieldModule,
    FlexLayoutModule,
    MatListModule,
    MatIconModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [DialogContentExampleDialog, ChatComponent, ReportDialog]
})
export class AppModule {}
