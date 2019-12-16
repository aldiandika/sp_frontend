import { Component } from '@angular/core';

import {MatDialog, MatDialogConfig} from '@angular/material';

@Component({
  selector: 'app-pop-kom',
  templateUrl: './pop-kom.component.html',
  styleUrls: ['./pop-kom.component.css']
})
export class PopKomComponent {
  constructor(public dialog: MatDialog) {}

  openDialog() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    this.dialog.open(DialogContentExampleDialog, dialogConfig);
  }
}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: 'dialog-content-example-dialog.html'
})
export class DialogContentExampleDialog {}
