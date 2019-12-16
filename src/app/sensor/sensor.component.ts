import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.css']
})
export class SensorComponent implements OnInit {

  max = 900;
  sectors = [{
  from: 600,
  to: 800,
  color: 'orange'
  }, {
  from: 800,
  to: 900,
  color: 'red'
}];
  unit = 'psi';

  constructor() {
  }

  ngOnInit() {
  }

}
