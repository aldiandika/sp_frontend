import { CommandComponent } from './../command/command.component';
import { ReportComponent } from './../report/report.component';
import { Component, OnInit } from '@angular/core';
import Echo from 'laravel-echo';
import * as Pusher from 'pusher-js';

import OlMap from 'ol/Map';
import OlXYZ from 'ol/source/XYZ';
import OlTileLayer from 'ol/layer/Tile';
import OlView from 'ol/View';
import 'ol/ol.css';
import Feature from 'ol/Feature';
import Geolocation from 'ol/Geolocation';
import Point from 'ol/geom/Point';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { fromLonLat, toLonLat } from "ol/proj";
import { LineString } from 'ol/geom';

import Overlay from "ol/Overlay";
import { toStringHDMS } from 'ol/coordinate';

import { Icon } from 'ol/style';
import { Polygon } from 'ol/geom';

import { HttpClient } from '@angular/common/http';

import { MatDialog, MatDialogConfig, MAT_RIPPLE_GLOBAL_OPTIONS } from '@angular/material';
import { ChatComponent } from '../chat/chat.component';
import { SensorComponent } from '../sensor/sensor.component';
import { interval } from 'rxjs';
import { transformAll } from '@angular/compiler/src/render3/r3_ast';
import { VideoComponent } from '../video/video.component';

const PUSHER_API_KEY = "6f4176ccff502d8ce53b";
const PUSHER_CLUSTER = "ap1";

declare var google: any;
var latitude = -6.9380338;
var longitude = 107.7558287;

var latitudeCC = -6.9381055;
var longitudeCC = 107.7579487;

var geolocation;
var data: any;
var map: OlMap;
var view: OlView;

let lastLat = -6.9380338;
let lastLon = 107.7558287;

let realLat;
let realLong;

var nDevice: any;
var nId: any;

var polySweep: any;
var indSweep: any;

//State untuk menu
// 0 = home
// 1 = data korban
// 2 = sweeper mode
var state = 0;

var stateSweep = false;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  source: OlXYZ;
  layer: OlTileLayer;

  vectorSource: any;
  vectorLayer: any;

  lineSource: any;
  lineLayer: any;

  bpSource: any;
  bpLayer: any;

  usvSource: any;
  usvLayer: any;

  uavSource: any;
  uavLayer: any;

  bcSource: any;
  bcLayer: any;

  victimSource: any;
  victimLayer: any;

  polySource: any;
  polyLayer: any;

  polySource2: any;
  polyLayer2: any;

  polySource3: any;
  polyLayer3: any;

  polySource4: any;
  polyLayer4: any;

  dataMap: any;

  marker: any;
  lineCoordinates = [];

  response: any;
  constructor(private http: HttpClient, public dialog: MatDialog) { }

  // constructor() {}

  ngOnInit() {
    document.getElementById('popup').style.visibility = "hidden";
    // this.GeoLocMap(latitude, longitude);

    this.stayUpdate();
    this.getDataNlaunch();
    console.log("yes");

    // this.launchMap();

    // Testing
    // this.getDataNlaunch();
    // interval(1000).subscribe(x => {
    //   // console.log("hello");
    //   this.testing();
    // });
    //END of Testing
  }

  // function to open CHAT dialog
  openDialog(): void {
    const dialogRef = this.dialog.open(ChatComponent, {
      // minHeight: 'calc(100vh - 90px)',
      // height: 'auto',
      // width: '100%',
      height: '70%',
      width: '70%',
    });

  }

  // function to open Report dialog
  openReportDialog() {
    const dialogRef = this.dialog.open(ReportComponent, {
      width: '70%',
      panelClass: 'myapp-no-padding-top-dialog'
    });
  }

  openSensorDialog() {
    const dialogRef = this.dialog.open(SensorComponent, {
      panelClass: 'myapp-no-padding-dialog'
    });
  }

  openVideoDialog() {
    const dialogRef = this.dialog.open(VideoComponent, {
      panelClass: 'myapp-no-padding-dialog'
    });
  }

  openCommandDialog() {
    const dialogRef = this.dialog.open(CommandComponent, {
      height: '80%',
      width: '70%',
      panelClass: 'myapp-no-padding-dialog'
    });
  }

  // Function to get data from database and launch map
  getDataNlaunch() {
    // const url = "http://192.168.1.150:8000/api/tracklast";
    const url = "http://localhost:8000/api/tracklast";
    // const url = "http://10.10.40.87:8000/api/tracklast";
    this.http.get(url).subscribe(res => {
      data = res;
      latitude = data.t_lat;
      longitude = data.t_lon;
      // console.log(latitude);
      // console.log(longitude);

      this.launchMap();
    });
  }
  // Function to launch map
  launchMap() {
    this.source = new OlXYZ({
      // url: "http://tile.osm.org/{z}/{x}/{y}.png"
      // attributionsCollapsible: false,
      url:
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    });

    this.layer = new OlTileLayer({
      source: this.source,
    });

    view = new OlView({
      center: fromLonLat([longitudeCC, latitudeCC]),
      zoom: 17,
      maxzoom: 19
    });

    //Fitur untuk CC
    var positionFeature = new Feature({
      geometry: new Point(fromLonLat([longitudeCC, latitudeCC]))
    });

    positionFeature.setStyle(
      new Style({
        image: new Icon({
          src: '/assets/marker-asset/CC-Marker.png',
          scale: 0.15,
          anchor: [0.5, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction'
        })
      })
    );
    // End of Fitur untuk CC

    // Fitur untuk Line
    const route = new Feature();
    const coordinates = [[longitude, latitude], [longitude, latitude]];
    console.log(coordinates);
    const geometry = new LineString(coordinates);
    geometry.transform('EPSG:4326', 'EPSG:3857'); // Transform to your map projection
    route.setGeometry(geometry);
    // End of Fitur untuk Line

    // Source dan layer untuk line
    this.lineSource = new VectorSource({
      features: [route]
    });

    this.lineLayer = new VectorLayer({
      source: this.lineSource
    });
    // End of source dan layer untuk line

    // Source dan layer untuk Backpack
    this.bpSource = new VectorSource({});

    this.bpLayer = new VectorLayer({
      source: this.bpSource
    });
    //End of source dan layer untuk Backpack

    //Source dan layer untuk USV
    this.usvSource = new VectorSource({});

    this.usvLayer = new VectorLayer({
      source: this.usvSource
    });
    //End of source dan layer untuk USV

    //Source dan layer untuk UAV
    this.uavSource = new VectorSource({});

    this.uavLayer = new VectorLayer({
      source: this.uavSource
    });
    //End of source dan layer untuk UAV

    //Source dan layer untuk UAV
    this.bcSource = new VectorSource({});

    this.bcLayer = new VectorLayer({
      source: this.bcSource
    });
    //End of source dan layer untuk UAV

    // Source dan layer untuk CC
    this.vectorSource = new VectorSource({
      features: [positionFeature]
    });

    this.vectorLayer = new VectorLayer({
      source: this.vectorSource
    });
    // End of Source dan layer untuk CC

    //Source dan layer untuk layer victim
    this.victimSource = new VectorSource({
    });

    this.victimLayer = new VectorLayer({
      source: this.victimSource
    });
    //End of Source dan layer untuk layer victim

    //Source dan layer untuk layer polygon korban merah
    var polyStyle = new Style({
      fill: new Fill({
        color: 'rgba(255, 0, 0, 0.3)'
      }),
      stroke: new Stroke({
        color: '#FF00FF',
        width: 1
      }),
    });

    this.polySource = new VectorSource({
      // features:[poly2, poly3, poly4, poly5]
    });

    this.polyLayer = new VectorLayer({
      source: this.polySource,
      style: polyStyle
    });

    this.polyLayer.setOpacity(0);
    //End of Source dan layer untuk layer polygon korban merah

    //Source dan layer untuk layer polygon korban kuning
    var polyStyle2 = new Style({
      fill: new Fill({
        color: 'rgba(240, 255, 0, 0.3)'
      }),
      stroke: new Stroke({
        color: '#FF00FF',
        width: 1
      }),
    });

    this.polySource2 = new VectorSource({
      // features:[poly2, poly3, poly4, poly5]
    });

    this.polyLayer2 = new VectorLayer({
      source: this.polySource2,
      style: polyStyle2
    });

    this.polyLayer2.setOpacity(0);
    //End of Source dan layer untuk layer polygon korban kuning

    //Source dan layer untuk layer polygon korban hijau
    var polyStyle3 = new Style({
      fill: new Fill({
        color: 'rgba(77, 175, 124, 0.3)'
      }),
      stroke: new Stroke({
        color: '#FF00FF',
        width: 1
      }),
    });

    this.polySource3 = new VectorSource({
      // features:[poly2, poly3, poly4, poly5]
    });

    this.polyLayer3 = new VectorLayer({
      source: this.polySource3,
      style: polyStyle3
    });

    this.polyLayer3.setOpacity(0);
    //End of Source dan layer untuk layer polygon korban hiau

    //Source dan Layer untuk layer sweeper
    var polyStyle4 = new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.7)'
      }),
      stroke: new Stroke({
        color: '#FFFFFF',
        width: 0.1
      }),
    });

    this.polySource4 = new VectorSource({
      // features:[poly2, poly3, poly4, poly5]
    });

    this.polyLayer4 = new VectorLayer({
      source: this.polySource4,
      style: polyStyle4
    });

    //END of layer sweeper

    //Fitur untuk polygon

    //Area Merah
    var poly = new Feature({
      geometry: new Polygon([
        [
          [107.757198, -6.93987], // kanan-atas
          [107.755198, -6.93987], // kiri-atas
          [107.755198, -6.93787], // kiri-bawah
          [107.757198, -6.93787], // kanan-bawah
        ]
      ]),
    });
    poly.setId('area merah 1');

    poly.getGeometry().transform("EPSG:4326", "EPSG:3857");
    this.polySource.addFeature(poly);

    const poly2 = new Feature({
      geometry: new Polygon([
        [
          [107.759198, -6.93987], // kanan-atas
          [107.757198, -6.93987], // kiri-atas
          [107.757198, -6.93787], // kiri-bawah
          [107.759198, -6.93787], // kanan-bawah
        ],
      ])
    });
    poly2.setId('area merah 2');

    poly2.getGeometry().transform("EPSG:4326", "EPSG:3857");
    this.polySource.addFeature(poly2);

    var poly3 = new Feature({
      geometry: new Polygon([
        [
          [107.759198, -6.93787], // kanan-atas
          [107.757198, -6.93787], // kiri-atas
          [107.757198, -6.93587], // kiri-bawah
          [107.759198, -6.93587], // kanan-bawah
        ]
      ])
    });
    poly3.setId('area merah 3');

    poly3.getGeometry().transform("EPSG:4326", "EPSG:3857");
    this.polySource.addFeature(poly3);

    var poly4 = new Feature({
      geometry: new Polygon([
        [
          [107.757198, -6.93587], // kanan-atas
          [107.755198, -6.93587], // kiri-atas
          [107.755198, -6.93387], // kiri-bawah
          [107.757198, -6.93387], // kanan-bawah
        ]
      ])
    });
    poly4.setId('area merah 4');

    poly4.getGeometry().transform("EPSG:4326", "EPSG:3857");
    this.polySource.addFeature(poly4);

    //Area kuning
    var poly5 = new Feature({
      geometry: new Polygon([
        [
          [107.759198, -6.93587], // kanan-atas
          [107.757198, -6.93587], // kiri-atas
          [107.757198, -6.93387], // kiri-bawah
          [107.759198, -6.93387], // kanan-bawah
        ]
      ])
    });
    poly5.setId('area kuning 1');

    poly5.getGeometry().transform("EPSG:4326", "EPSG:3857");
    this.polySource2.addFeature(poly5);
    //END of Area kuning

    //Poly hijau
    for (var i = 0; i < 4; i++) {
      var b1c1 = (107.755198 - (i * 0.002)).toFixed(6);
      var b1c2 = (107.753198 - (i * 0.002)).toFixed(6);
      var ind = i + 1;

      var poly6 = new Feature({
        geometry: new Polygon([
          [
            [b1c1, -6.93587],
            [b1c2, -6.93587],
            [b1c2, -6.93387],
            [b1c1, -6.93387]
          ]
        ])
      });
      poly6.setId('area hijau ' + ind);

      poly6.getGeometry().transform("EPSG:4326", "EPSG:3857");
      this.polySource3.addFeature(poly6);
    }

    for (var i = 1; i < 6; i++) {
      var b2c1 = (107.759198 - (i * 0.002)).toFixed(6);
      var b2c2 = (107.757198 - (i * 0.002)).toFixed(6);
      var ind2 = i + 4;

      var poly7 = new Feature({
        geometry: new Polygon([
          [
            [b2c1, -6.93787], //kanan-atas
            [b2c2, -6.93787], //kiri-atas
            [b2c2, -6.93587], //kiri-bawah
            [b2c1, -6.93587], //kanan-bawah
          ]
        ])
      });
      poly7.setId('area hijau ' + ind2);

      poly7.getGeometry().transform("EPSG:4326", "EPSG:3857");
      this.polySource3.addFeature(poly7);
    }

    for (var i = 1; i < 6; i++) {
      var b3c1 = (107.757198 - (i * 0.002)).toFixed(6);
      var b3c2 = (107.755198 - (i * 0.002)).toFixed(6);
      var ind3 = i + 9;

      var poly8 = new Feature({
        geometry: new Polygon([
          [
            [b3c1, -6.93987], //kanan-atas
            [b3c2, -6.93987], //kiri-atas
            [b3c2, -6.93787], //kiri-bawah
            [b3c1, -6.93787], //kanan-bawah
          ]
        ])
      });
      poly8.setId('area hijau ' + ind3);

      poly8.getGeometry().transform("EPSG:4326", "EPSG:3857");
      this.polySource3.addFeature(poly8);
    }

    for (var i = 1; i < 10; i++) {
      // console.log((107.757198 - (i * 0.002)).toFixed(6));
      // console.log((107.755198 - (i * 0.002)).toFixed(6));
      // console.log((107.755198 - (i * 0.002)).toFixed(6));
      // console.log((107.757198 - (i * 0.002)).toFixed(6));
      // console.log("OK");

      var b4c1 = (107.767198 - (i * 0.002)).toFixed(6);
      var b4c2 = (107.765198 - (i * 0.002)).toFixed(6);
      var ind4 = i + 14;

      var poly9 = new Feature({
        geometry: new Polygon([
          [
            [b4c1, -6.94187], //kanan-atas
            [b4c2, -6.94187], //kiri-atas
            [b4c2, -6.93987], //kiri-bawah
            [b4c1, -6.93987], //kanan-bawah
          ]
        ])
      });
      poly9.setId('area hijau ' + ind4);

      poly9.getGeometry().transform("EPSG:4326", "EPSG:3857");
      this.polySource3.addFeature(poly9);
    }

    for (var i = 1; i < 4; i++) {

      var b5c1 = (107.767198 - (i * 0.002)).toFixed(6);
      var b5c2 = (107.765198 - (i * 0.002)).toFixed(6);
      var ind5 = i + 23;

      var poly10 = new Feature({
        geometry: new Polygon([
          [
            [b5c1, -6.93987], //kanan-atas
            [b5c2, -6.93987], //kiri-atas
            [b5c2, -6.93787], //kiri-bawah
            [b5c1, -6.93787], //kanan-bawah
          ]
        ])
      });
      poly10.setId('area hijau ' + ind5);

      poly10.getGeometry().transform("EPSG:4326", "EPSG:3857");
      this.polySource3.addFeature(poly10);
    }

    for (var i = 1; i < 4; i++) {

      var b6c1 = (107.767198 - (i * 0.002)).toFixed(6);
      var b6c2 = (107.765198 - (i * 0.002)).toFixed(6);
      var ind6 = i + 26;

      var poly11 = new Feature({
        geometry: new Polygon([
          [
            [b6c1, -6.93787], //kanan-atas
            [b6c2, -6.93787], //kiri-atas
            [b6c2, -6.93587], //kiri-bawah
            [b6c1, -6.93587], //kanan-bawah
          ]
        ])
      });
      poly11.setId('area hijau ' + ind6);

      poly11.getGeometry().transform("EPSG:4326", "EPSG:3857");
      this.polySource3.addFeature(poly11);
    }

    for (var i = 1; i < 4; i++) {

      var b7c1 = (107.767198 - (i * 0.002)).toFixed(6);
      var b7c2 = (107.765198 - (i * 0.002)).toFixed(6);
      var ind7 = i + 29;

      var poly12 = new Feature({
        geometry: new Polygon([
          [
            [b7c1, -6.93587], //kanan-atas
            [b7c2, -6.93587], //kiri-atas
            [b7c2, -6.93387], //kiri-bawah
            [b7c1, -6.93387], //kanan-bawah
          ]
        ])
      });
      poly12.setId('area hijau ' + ind7);

      poly12.getGeometry().transform("EPSG:4326", "EPSG:3857");
      this.polySource3.addFeature(poly12);
    }

    //Sweeper
    indSweep = 1;
    for (var b = 1; b < 21; b++) {
      for (var k = 1; k < 21; k++) {
        var bS1 = (-6.91787 - (b * 0.002)).toFixed(5);
        var bS2 = (-6.91587 - (b * 0.002)).toFixed(5);
        var kS1 = (107.735198 + (k * 0.002)).toFixed(6);
        var kS2 = (107.733198 + (k * 0.002)).toFixed(6);
        polySweep = new Feature({
          geometry: new Polygon([
            [
              [kS1, bS1],
              [kS2, bS1],
              [kS2, bS2],
              [kS1, bS2]
            ]
          ])
        });
        polySweep.setId('as' + indSweep);
        // console.log(indSweep);
        indSweep += 1;

        polySweep.getGeometry().transform("EPSG:4326", "EPSG:3857");
        this.polySource4.addFeature(polySweep);
      }
    }

    var tileCan = 169
    var addition = 0;
    for (var tb = 0; tb < 3; tb++) {
      for (var tc = 0; tc < 5; tc++) {
        var indDel = tc + tileCan + addition;
        var fetS = this.polySource4.getFeatureById('as' + indDel);
        // console.log(fetS);

        if (fetS !== null) {
          this.polySource4.removeFeature(fetS);
        }
      }
      addition += 20;
    }

    this.polyLayer4.setOpacity(0);
    // polySweep = new Feature({
    //   geometry: new Polygon([
    //     [
    //       [107.755198, -6.93587],
    //       [107.753198, -6.93587],
    //       [107.753198, -6.93387],
    //       [107.755198, -6.93387]
    //     ]
    //   ])
    // });
    // polySweep.setId('as1');

    // polySweep.getGeometry().transform("EPSG:4326", "EPSG:3857");
    // this.polySource4.addFeature(polySweep);

    //END of Sweeper

    //End of Fitur untuk polygon

    // Fitur untuk marker

    //Marker BP dummy
    var bpPos = [
      [107.758498, -6.93887],
      [107.756598, -6.93587],
      [107.7576087, -6.9384338],
      [107.757798, -6.93697]
    ];

    for (let i = 0; i < bpPos.length; i++) {
      const bpMarker = new Feature({
        geometry: new Point(fromLonLat([bpPos[i][0], bpPos[i][1]]))
      });

      bpMarker.setStyle(
        new Style({
          image: new Icon({
            src: '/assets/marker-asset/BackPack-Marker.png',
            scale: 0.15,
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction'
          })
        })
      );
      this.vectorSource.addFeature(bpMarker);
    }
    // End of Marker BP dummy

    // Di kondisi nyata victim position diambil dari database
    const victimPos = [
      [107.758198, -6.93887],
      [107.758198, -6.93687],
      [107.756198, -6.93887],
      [107.756198, -6.93587],
      [107.756798, -6.93877],
      [107.758198, -6.93887]
    ];

    for (let i = 0; i < victimPos.length; i++) {
      const victimMarker = new Feature({
        geometry: new Point(fromLonLat([victimPos[i][0], victimPos[i][1]]))
      });

      victimMarker.setStyle(
        new Style({
          image: new Icon({
            src: '/assets/marker-asset/Victim-Marker.png',
            scale: 0.15,
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction'
          })
        })
      );

      this.victimSource.addFeature(victimMarker);
    }
    //End of Fitur untuk marker

    //Setting Pop Up untuk Map
    var popContainer = document.getElementById('popup');
    var popContent = document.getElementById('popup-content');
    var popCloser = document.getElementById('popup-closer');

    popContainer.style.visibility = "visible";

    //Settig overlay
    var overlay = new Overlay({
      element: popContainer,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });

    //Fungsi untuk close pop up
    popCloser.onclick = function () {
      overlay.setPosition(undefined);
      popCloser.blur();
      return false;
    }
    //END of Setting Pop Up untuk Map

    map = new OlMap({
      target: 'map',
      layers: [
        this.layer,
        this.polyLayer,
        this.polyLayer2,
        this.polyLayer3,
        this.polyLayer4,
        this.vectorLayer,
        this.lineLayer,
        this.bcLayer,
        this.uavLayer,
        this.bpLayer,
        this.usvLayer,
        this.victimLayer,
      ],
      overlays: [overlay],
      view: view
    });

    //Fungsi untuk menampilkan popup
    map.on('singleclick', function (evt) {
      var coordinate = evt.coordinate;
      var hdms = toStringHDMS(toLonLat(coordinate));

      if (state == 1) {
        var polyFeature = map.getFeaturesAtPixel(evt.pixel);
        if (polyFeature !== null) {
          try {
            var fId = polyFeature[0].getId();
            popContent.innerHTML = '<code>' + fId + '</code> <br>' +
              '<p>Jumlah Korban di temukan : 50 Orang</p>' +
              '<p>Korban luka ringan : 30 Orang</p>' +
              '<p>Korban meninggal : 20 Orang</p>';
            overlay.setPosition(coordinate);
          } catch (e) {
          }
        }
      } else if (state == 2) {
        var polyFeature = map.getFeaturesAtPixel(evt.pixel);
        if (polyFeature !== null) {
          try {
            var fId = polyFeature[0].getId();
            popContent.innerHTML = '<code>' + fId + '</code>';
            overlay.setPosition(coordinate);
          } catch (e) {
          }
        }
      } else if (state == 0) {
        popContent.innerHTML = '<p>Lokasi : </p><code>' + hdms + '</code>';

        overlay.setPosition(coordinate);
      }
    });
  }

  // Function to get geo Location data
  GeoLocMap(lat, lng) {
    this.source = new OlXYZ({
      // url: "http://tile.osm.org/{z}/{x}/{y}.png"
      attributionsCollapsible: false,
      url:
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    });

    this.layer = new OlTileLayer({
      source: this.source
    });

    const view = new OlView({
      center: fromLonLat([0, 0]),
      zoom: 6
    });

    geolocation = new Geolocation({
      // enableHighAccuracy must be set to true to have the heading value.
      trackingOptions: {
        enableHighAccuracy: true
      },
      projection: view.getProjection()
    });

    geolocation.setTracking(true);

    const positionFeature = new Feature({
      geometry: new Point(fromLonLat([lng, lat]))
    });

    positionFeature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: '#3399CC'
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 2
          })
        })
      })
    );

    this.vectorSource = new VectorSource({
      features: [positionFeature]
    });

    geolocation.on("change:position", function (evt) {
      console.log(geolocation.getPosition());
      const pos = geolocation.getPosition();
      positionFeature.setGeometry(new Point(pos));
      view.setCenter(pos);
      view.setZoom(14);
    });

    this.vectorLayer = new VectorLayer({
      source: this.vectorSource
    });

    map = new OlMap({
      target: 'map',
      layers: [this.layer, this.vectorLayer],
      view
    });

  }

  // function to get data real time
  stayUpdate() {
    const echo = new Echo({
      broadcaster: 'pusher',
      key: PUSHER_API_KEY,
      cluster: PUSHER_CLUSTER
    });
    echo.channel('location').listen('SendLocation', e => {
      this.dataMap = e.location;
      nId = e.location.deviceId;
      nDevice = e.location.device;
      realLat = e.location.lat;
      realLong = e.location.long;
      // console.log(realLong);
      console.log(nDevice);
      console.log("stay Update");

      if (nDevice == "backpack") {
        this.updateMap(realLat, realLong);
      }

      if (nDevice == "usv") {
        this.updateMapUSV(realLat, realLong);
      }

      if (nDevice == "uav") {
        this.updateMapUAV(realLat, realLong);
      }

      if (nDevice == "bicycle") {
        this.updateMapBC(realLat, realLong);
      }

    });
  }

  //Untuk Testing
  // testing() {
  //   // const url = "http://192.168.1.150:8000/api/tracklast";
  //   const url = "http://localhost:8000/api/tracklast";
  //   this.http.get(url).subscribe(res => {
  //     data = res;
  //     // console.log(data);
  //     // latitude = data.t_lat;
  //     // longitude = data.t_lon;
  //     // console.log(latitude);
  //     // console.log(longitude);

  //     nId = data.device_id;
  //     nDevice = data.kategori;
  //     realLat = data.t_lat;
  //     realLong = data.t_lon;

  //     // console.log(realLat);
  //     console.log("stay Update");

  //     if (nDevice == "backpack") {
  //       this.updateMap(realLat, realLong);
  //     }

  //     if (nDevice == "usv") {
  //       this.updateMapUSV(realLat, realLong);
  //     }

  //     if (nDevice == "uav") {
  //       this.updateMapUAV(realLat, realLong);
  //     }

  //     if (nDevice == "bicycle") {
  //       this.updateMapBC(realLat, realLong);
  //     }
  //   });
  // }
  //End of Testing

  updateMap(lat, lon) {
    console.log("Update BP POS");

    // map.removeLayer(this.bpLayer);
    // map.removeLayer(this.lineLayer);

    //Fitur untuk Backpack
    // var nextPos = new Feature({
    //   geometry: new Point(fromLonLat([lon, lat]))
    // });

    // nextPos.setStyle(
    //   new Style({
    //     image: new Icon({
    //       src: "/assets/marker-asset/BackPack-Marker.png",
    //       scale: 0.15,
    //       anchor: [0.5, 1],
    //       anchorXUnits: "fraction",
    //       anchorYUnits: "fraction"
    //     })
    //     // image: new CircleStyle({
    //     //   radius: 6,
    //     //   fill: new Fill({
    //     //     color: "#FF0000"
    //     //   }),
    //     //   stroke: new Stroke({
    //     //     color: "#fff",
    //     //     width: 2
    //     //   })
    //     // })
    //   })
    // );
    //End of Fitur Backpack

    // Fitur untuk nextLine BP
    const nextRoute = new Feature();
    const nextCoordinates = [[lastLon, lastLat], [lon, lat]];
    console.log(nextCoordinates);
    const nextGeom = new LineString(nextCoordinates);
    nextGeom.transform('EPSG:4326', 'EPSG:3857'); // Transform to your map projection
    nextRoute.setGeometry(nextGeom);
    // End of Fitur untuk nextLine BP

    // this.bpSource = new VectorSource({
    //   // features: [nextPos]
    // });

    // this.bpLayer = new VectorLayer({
    //   source: this.bpSource
    // });

    if (nId == "1") {
      var fet = this.bpSource.getFeatureById('bp1');
      if (fet !== null) {
        this.bpSource.removeFeature(fet);
      }

      var nextPos = new Feature({
        geometry: new Point(fromLonLat([lon, lat]))
      });

      nextPos.setStyle(
        new Style({
          image: new Icon({
            src: "/assets/marker-asset/BackPack-Marker.png",
            scale: 0.15,
            anchor: [0.5, 1],
            anchorXUnits: "fraction",
            anchorYUnits: "fraction"
          })
          // image: new CircleStyle({
          //   radius: 6,
          //   fill: new Fill({
          //     color: "#FF0000"
          //   }),
          //   stroke: new Stroke({
          //     color: "#fff",
          //     width: 2
          //   })
          // })
        })
      );
      nextPos.setId('bp1');
      this.bpSource.addFeature(nextPos);

      if (stateSweep) {
        this.letSweep(nextPosB);
      }

    } else if (nId == "2") {
      var fet2 = this.bpSource.getFeatureById('bp2');
      if (fet2 !== null) {
        this.bpSource.removeFeature(fet2);
      }

      var nextPosB = new Feature({
        geometry: new Point(fromLonLat([lon, lat]))
      });

      nextPosB.setStyle(
        new Style({
          image: new Icon({
            src: "/assets/marker-asset/BackPack-Marker.png",
            scale: 0.15,
            anchor: [0.5, 1],
            anchorXUnits: "fraction",
            anchorYUnits: "fraction"
          })
          // image: new CircleStyle({
          //   radius: 6,
          //   fill: new Fill({
          //     color: "#FF0000"
          //   }),
          //   stroke: new Stroke({
          //     color: "#fff",
          //     width: 2
          //   })
          // })
        })
      );
      nextPosB.setId('bp2');
      this.bpSource.addFeature(nextPosB);

      if (stateSweep) {
        this.letSweep(nextPosB);
      }
    }

    // Source dan Layer untuk line BP
    this.lineSource = new VectorSource({
      features: [nextRoute]
    });

    this.lineLayer = new VectorLayer({
      source: this.lineSource
    });
    // End of Source dan Layer untuk line BP

    // Jika ingin menambah fitur dari source yang sudah ada
    // this.lineLayer.getSource().addFeature(nextRoute);
    // map.addLayer(this.lineLayer);

    // map.addLayer(this.bpLayer);

    lastLat = lat;
    lastLon = lon;
  }

  updateMapUSV(lat, lon) {
    console.log("Update USV POS");

    map.removeLayer(this.usvLayer);
    // map.removeLayer(this.lineLayer);

    this.usvSource = new VectorSource({
      // features: [nextPos]
    });

    this.usvLayer = new VectorLayer({
      source: this.usvSource
    });

    var nextPos2 = new Feature({
      geometry: new Point(fromLonLat([lon, lat]))
    });

    nextPos2.setStyle(
      new Style({
        image: new Icon({
          src: "/assets/marker-asset/USV-Marker.png",
          scale: 0.15,
          anchor: [0.5, 1],
          anchorXUnits: "fraction",
          anchorYUnits: "fraction"
        })
      })
    );

    var nextCoordinates = [[lon, lat]];
    console.log(nextCoordinates);
    this.usvSource.addFeature(nextPos2);
    map.addLayer(this.usvLayer);

    if (stateSweep) {
      this.letSweep(nextPos2);
    }

  }

  updateMapUAV(lat, lon) {
    console.log("Update UAV POS");

    map.removeLayer(this.uavLayer);
    // map.removeLayer(this.lineLayer);

    this.uavSource = new VectorSource({
      // features: [nextPos]
    });

    this.uavLayer = new VectorLayer({
      source: this.uavSource
    });

    var nextPos3 = new Feature({
      geometry: new Point(fromLonLat([lon, lat]))
    });

    nextPos3.setStyle(
      new Style({
        image: new Icon({
          src: "/assets/marker-asset/UAV-Marker.png",
          scale: 0.15,
          anchor: [0.5, 1],
          anchorXUnits: "fraction",
          anchorYUnits: "fraction"
        })
      })
    );
    var nextCoordinates = [[lon, lat]];
    console.log(nextCoordinates);
    this.uavSource.addFeature(nextPos3);
    map.addLayer(this.uavLayer);

    if (stateSweep) {
      this.letSweep(nextPos3);
    }
  }

  updateMapBC(lat, lon) {
    console.log("Update BC POS");

    map.removeLayer(this.bcLayer);
    // map.removeLayer(this.lineLayer);

    this.bcSource = new VectorSource({
      // features: [nextPos]
    });

    this.bcLayer = new VectorLayer({
      source: this.bcSource
    });

    var nextPos4 = new Feature({
      geometry: new Point(fromLonLat([lon, lat]))
    });

    nextPos4.setStyle(
      new Style({
        image: new Icon({
          src: "/assets/marker-asset/Bicyle-Marker.png",
          scale: 0.15,
          anchor: [0.5, 1],
          anchorXUnits: "fraction",
          anchorYUnits: "fraction"
        })
      })
    );
    var nextCoordinates = [[lon, lat]];
    console.log(nextCoordinates);
    this.bcSource.addFeature(nextPos4);
    map.addLayer(this.bcLayer);

    if (stateSweep) {
      this.letSweep(nextPos4);
    }

  }

  showVictimdata() {
    this.vectorLayer.setOpacity(0);
    this.polyLayer.setOpacity(1);
    this.polyLayer2.setOpacity(1);
    this.polyLayer3.setOpacity(1);
    this.polyLayer4.setOpacity(0);
    this.uavLayer.setOpacity(0);
    state = 1;
    stateSweep = false;
    console.log("show victim data");
  }

  showAllFeature() {
    this.vectorLayer.setOpacity(1);
    this.polyLayer.setOpacity(0);
    this.polyLayer2.setOpacity(0);
    this.polyLayer3.setOpacity(0);
    this.polyLayer4.setOpacity(0);
    this.uavLayer.setOpacity(1);
    state = 0;
    stateSweep = false;
    console.log("show All data");
  }

  showSweeping() {
    this.polyLayer.setOpacity(0);
    this.polyLayer2.setOpacity(0);
    this.polyLayer3.setOpacity(0);
    this.polyLayer4.setOpacity(1);
    this.uavLayer.setOpacity(1);
    state = 2;

    var PosBp = new Feature({
      geometry: new Point(fromLonLat([107.754998, -6.93327]))
    });

    PosBp.setStyle(
      new Style({
        image: new Icon({
          src: "/assets/marker-asset/BackPack-Marker.png",
          scale: 0.15,
          anchor: [0.5, 1],
          anchorXUnits: "fraction",
          anchorYUnits: "fraction"
        })
      })
    );
    // this.polySource4.addFeature(PosBp);

    stateSweep = true;

    // var fetPol = this.polySource4.getFeatureById('as1').getGeometry().getCoordinates();
    // console.log(fetPol);
    // console.log(fetPol[0][1]);

    // var cPosBp = PosBp.getGeometry().getCoordinates();
    // console.log(cPosBp);

    // for (var ti = 1; ti <= 400; ti++) {
    //   var idPoly = 'as' + ti;

    //   if (this.polySource4.getFeatureById(idPoly) !== null) {
    //     var fetPol = this.polySource4.getFeatureById(idPoly).getGeometry().getCoordinates();
    //     var cPosBp = PosBp.getGeometry().getCoordinates();
    //     var isInside = this.inside(cPosBp,
    //       [
    //         fetPol[0][0],
    //         fetPol[0][1],
    //         fetPol[0][2],
    //         fetPol[0][3],
    //       ]
    //     );

    //     if (isInside) {
    //       console.log(idPoly);
    //     }
    //   }
    // }
  }

  letSweep(feature) {
    for (var ti = 1; ti <= 400; ti++) {
      var idPoly = 'as' + ti;

      if (this.polySource4.getFeatureById(idPoly) !== null) {
        var fetPol = this.polySource4.getFeatureById(idPoly).getGeometry().getCoordinates();
        var cPos = feature.getGeometry().getCoordinates();
        var isInside = this.inside(cPos,
          [
            fetPol[0][0],
            fetPol[0][1],
            fetPol[0][2],
            fetPol[0][3],
          ]
        );

        if (isInside) {
          console.log(idPoly);
          var delPol = this.polySource4.getFeatureById(idPoly);
          if (delPol !== null) {
            this.polySource4.removeFeature(delPol);
          }
        }
      }
    }
  }

  //Fungsi untuk mengetahui adanya titik pada suatu region
  inside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      var xi = vs[i][0], yi = vs[i][1];
      var xj = vs[j][0], yj = vs[j][1];

      var intersect = ((yi > y) != (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  };
}
