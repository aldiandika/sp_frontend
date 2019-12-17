import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { MapboComponent } from './mapbo/mapbo.component';
import { HttpClientModule } from '@angular/common/http';
// tslint:disable-next-line:max-line-length
import { MatDialogModule, MatCardModule, MatSliderModule, MatToolbarModule, MatButtonModule, MatGridListModule, MatListModule, MatInputModule, MatSelectModule, MatButton } from '@angular/material';
import { DialogContentExampleDialog } from './pop-kom/pop-kom.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PopKomComponent } from './pop-kom/pop-kom.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatSidenavModule } from '@angular/material';
import { ChatComponent } from './chat/chat.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReportComponent } from './report/report.component';
import { Ng2GaugeModule } from 'ng2-gauge';
import { SensorComponent } from './sensor/sensor.component';
import {MatRadioModule} from '@angular/material/radio';
import { VideoComponent } from './video/video.component';
import { CommandComponent } from './command/command.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    MapboComponent,
    DialogContentExampleDialog,
    PopKomComponent,
    ChatComponent,
    ReportComponent,
    SensorComponent,
    VideoComponent,
    CommandComponent
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
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    Ng2GaugeModule,
    MatRadioModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [DialogContentExampleDialog, ChatComponent, ReportComponent, SensorComponent, VideoComponent, CommandComponent ]
})
export class AppModule {}
