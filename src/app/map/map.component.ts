import { Component, OnInit } from "@angular/core";
import Echo from "laravel-echo";
import * as Pusher from "pusher-js";

import OlMap from "ol/Map";
import OlXYZ from "ol/source/XYZ";
import OlTileLayer from "ol/layer/Tile";
import OlView from "ol/View";
import "ol/ol.css";
import Feature from "ol/Feature";
import Geolocation from "ol/Geolocation";
import Point from "ol/geom/Point";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource } from "ol/source";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import { fromLonLat, toLonLat } from "ol/proj";
import { LineString } from "ol/geom";

import { Icon } from "ol/style";
import { Polygon } from "ol/geom";

import Overlay from "ol/Overlay";
import { toStringHDMS } from 'ol/coordinate';

import { HttpClient } from "@angular/common/http";

import { MatDialog, MatDialogConfig, MAT_RIPPLE_GLOBAL_OPTIONS } from "@angular/material";


const PUSHER_API_KEY = "6f4176ccff502d8ce53b";
const PUSHER_CLUSTER = "ap1";

declare var google: any;
var latitude = -6.9380338;
var longitude = 107.7558287;
var geolocation;
var data: any;
var map: OlMap;
var view: OlView;

var lastLat = -6.9380338;
var lastLon = 107.7558287;

var realLat;
var realLong;

//State untuk menu 
// 0 = home
// 1 = data korban
// 2 = sweeper mode
var state = 0;

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"]
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

  victimSource: any;
  victimLayer: any;

  polySource: any;
  polyLayer: any;

  polySource2: any;
  polyLayer2: any;

  polySource3: any;
  polyLayer3: any;

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
  }

  // function to open Communication dialog
  openCommDialog() {
    const dialogRef = this.dialog.open(CommDialog);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  // function to open Report dialog
  openReportDialog() {
    const dialogRef = this.dialog.open(ReportDialog);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  //Function to get data from database and launch map
  getDataNlaunch() {
    // const url = "http://10.10.60.93:8000/api/tracklast";
    const url = "http://localhost:8000/api/tracklast";
    this.http.get(url).subscribe(res => {
      data = res;
      latitude = data.t_lat;
      longitude = data.t_lon;

      // console.log(latitude);
      // console.log(longitude);

      this.launchMap();
    });
  }

  //Function to launch map
  launchMap() {
    this.source = new OlXYZ({
      // url: "http://tile.osm.org/{z}/{x}/{y}.png"
      // attributionsCollapsible: false,
      url:
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    });

    this.layer = new OlTileLayer({
      source: this.source
    });

    view = new OlView({
      center: fromLonLat([longitude, latitude]),
      zoom: 17,
      maxzoom: 19
    });

    //Fitur untuk CC
    var positionFeature = new Feature({
      geometry: new Point(fromLonLat([longitude, latitude]))
    });

    positionFeature.setStyle(
      new Style({
        image: new Icon({
          src: "/assets/marker-asset/CC-Marker.png",
          scale: 0.15,
          anchor: [0.5, 1],
          anchorXUnits: "fraction",
          anchorYUnits: "fraction"
        })
      })
    );
    //End of Fitur untuk CC

    //Fitur untuk Line
    var route = new Feature();
    var coordinates = [[longitude, latitude], [longitude, latitude]];
    console.log(coordinates);
    var geometry = new LineString(coordinates);
    geometry.transform("EPSG:4326", "EPSG:3857"); //Transform to your map projection
    route.setGeometry(geometry);
    //End of Fitur untuk Line

    //Source dan layer untuk line
    this.lineSource = new VectorSource({
      features: [route]
    });

    this.lineLayer = new VectorLayer({
      source: this.lineSource
    });
    //End of source dan layer untuk line

    //Source dan layer untuk Backpack
    this.bpSource = new VectorSource({});

    this.bpLayer = new VectorLayer({
      source: this.bpSource
    });
    //End of source dan layer untuk line

    //Source dan layer untuk CC
    this.vectorSource = new VectorSource({
      features: [positionFeature]
    });

    this.vectorLayer = new VectorLayer({
      source: this.vectorSource
    });
    //End of Source dan layer untuk CC

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


    //Fitur untuk polygon

    //Area Merah
    var poly = new Feature({
      geometry: new Polygon([
        [
          [107.757198, -6.93987], //kanan-atas
          [107.755198, -6.93987], //kiri-atas
          [107.755198, -6.93787], //kiri-bawah
          [107.757198, -6.93787], //kanan-bawah
        ]
      ]),
    });
    poly.setId('area merah 1');

    poly.getGeometry().transform("EPSG:4326", "EPSG:3857");
    this.polySource.addFeature(poly);

    var poly2 = new Feature({
      geometry: new Polygon([
        [
          [107.759198, -6.93987], //kanan-atas
          [107.757198, -6.93987], //kiri-atas
          [107.757198, -6.93787], //kiri-bawah
          [107.759198, -6.93787], //kanan-bawah
        ],
      ])
    });
    poly2.setId('area merah 2');

    poly2.getGeometry().transform("EPSG:4326", "EPSG:3857");
    this.polySource.addFeature(poly2);

    var poly3 = new Feature({
      geometry: new Polygon([
        [
          [107.759198, -6.93787], //kanan-atas
          [107.757198, -6.93787], //kiri-atas
          [107.757198, -6.93587], //kiri-bawah
          [107.759198, -6.93587], //kanan-bawah
        ]
      ])
    });
    poly3.setId('area merah 3');

    poly3.getGeometry().transform("EPSG:4326", "EPSG:3857");
    this.polySource.addFeature(poly3);

    var poly4 = new Feature({
      geometry: new Polygon([
        [
          [107.757198, -6.93587], //kanan-atas
          [107.755198, -6.93587], //kiri-atas
          [107.755198, -6.93387], //kiri-bawah
          [107.757198, -6.93387], //kanan-bawah
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
          [107.759198, -6.93587], //kanan-atas
          [107.757198, -6.93587], //kiri-atas
          [107.757198, -6.93387], //kiri-bawah
          [107.759198, -6.93387], //kanan-bawah
        ]
      ])
    });
    poly5.setId('area kuning 1');

    poly5.getGeometry().transform("EPSG:4326", "EPSG:3857");
    this.polySource2.addFeature(poly5);
    //END of Area kuning

    //Poly hijau
    for (var i = 0; i < 3; i++) {
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

    for (var i = 0; i < 7; i++) {
      console.log((107.759198 - (i * 0.002)).toFixed(6));
      console.log((107.757198 - (i * 0.002)).toFixed(6));
      console.log((107.757198 - (i * 0.002)).toFixed(6));
      console.log((107.759198 - (i * 0.002)).toFixed(6));
      console.log("OK");

      var b2c1 = (107.759198 - (i * 0.002)).toFixed(6);
      var b2c2 = (107.757198 - (i * 0.002)).toFixed(6);
      var ind2 = i + 1;

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

    //End of Fitur untuk polygon

    //Fitur untuk marker

    //Marker BP dummy
    var bpPos = [
      [107.7578287, -6.9385338],
      [107.7576187, -6.9381338],
      [107.7576087, -6.9384338]
    ];

    for (var i = 0; i < bpPos.length; i++) {
      var bpMarker = new Feature({
        geometry: new Point(fromLonLat([bpPos[i][0], bpPos[i][1]]))
      });

      bpMarker.setStyle(
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
      this.vectorSource.addFeature(bpMarker);
    }
    //End of Marker BP dummy

    //Di kondisi nyata victim position diambil dari database
    var victimPos = [
      [107.758198, -6.93887],
      [107.758198, -6.93687],
      [107.756198, -6.93887],
      [107.756198, -6.93587],
      [107.756798, -6.93877],
      [107.758198, -6.93887]
    ];

    for (var i = 0; i < victimPos.length; i++) {
      var victimMarker = new Feature({
        geometry: new Point(fromLonLat([victimPos[i][0], victimPos[i][1]]))
      });

      victimMarker.setStyle(
        new Style({
          image: new Icon({
            src: "/assets/marker-asset/Victim-Marker.png",
            scale: 0.15,
            anchor: [0.5, 1],
            anchorXUnits: "fraction",
            anchorYUnits: "fraction"
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
      target: "map",
      layers: [
        this.layer,
        this.victimLayer,
        this.vectorLayer,
        this.polyLayer,
        this.polyLayer2,
        this.polyLayer3,
        this.lineLayer,
        this.bpLayer
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

  //Function to get geo Location data
  GeoLocMap(lat, lng) {
    this.source = new OlXYZ({
      // url: "http://tile.osm.org/{z}/{x}/{y}.png"
      attributionsCollapsible: false,
      url:
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    });

    this.layer = new OlTileLayer({
      source: this.source
    });

    var view = new OlView({
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

    var positionFeature = new Feature({
      geometry: new Point(fromLonLat([lng, lat]))
    });

    positionFeature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: "#3399CC"
          }),
          stroke: new Stroke({
            color: "#fff",
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
      var pos = geolocation.getPosition();
      positionFeature.setGeometry(new Point(pos));
      view.setCenter(pos);
      view.setZoom(14);
    });

    this.vectorLayer = new VectorLayer({
      source: this.vectorSource
    });

    map = new OlMap({
      target: "map",
      layers: [this.layer, this.vectorLayer],
      view: view
    });

  }

  //function to get data real time
  stayUpdate() {
    var echo = new Echo({
      broadcaster: "pusher",
      key: PUSHER_API_KEY,
      cluster: PUSHER_CLUSTER
    });
    echo.channel("location").listen("SendLocation", e => {
      this.dataMap = e.location;
      realLat = e.location.lat;
      realLong = e.location.long;
      // console.log(realLong);
      console.log("stay Update");
      this.updateMap(realLat, realLong);
    });
  }

  updateMap(lat, lon) {
    console.log("Update Map");

    map.removeLayer(this.bpLayer);
    // map.removeLayer(this.lineLayer);

    //Fitur untuk Backpack
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
    //End of Fitur Backpack

    //Fitur untuk nextLine BP
    var nextRoute = new Feature();
    var nextCoordinates = [[lastLon, lastLat], [lon, lat]];
    console.log(nextCoordinates);
    var nextGeom = new LineString(nextCoordinates);
    nextGeom.transform("EPSG:4326", "EPSG:3857"); //Transform to your map projection
    nextRoute.setGeometry(nextGeom);
    //End of Fitur untuk nextLine BP

    this.bpSource = new VectorSource({
      features: [nextPos]
    });

    this.bpLayer = new VectorLayer({
      source: this.bpSource
    });

    //Source dan Layer untuk line BP
    this.lineSource = new VectorSource({
      features: [nextRoute]
    });

    this.lineLayer = new VectorLayer({
      source: this.lineSource
    });
    //End of Source dan Layer untuk line BP

    // Jika ingin menambah fitur dari source yang sudah ada
    // this.lineLayer.getSource().addFeature(nextRoute);
    // map.addLayer(this.lineLayer);
    map.addLayer(this.bpLayer);

    lastLat = lat;
    lastLon = lon;
  }

  showVictimdata() {
    this.vectorLayer.setOpacity(0);
    this.polyLayer.setOpacity(1);
    this.polyLayer2.setOpacity(1);
    this.polyLayer3.setOpacity(1);
    state = 1;
    console.log("show victim data");
  }

  showAllFeature() {
    this.vectorLayer.setOpacity(1);
    this.polyLayer.setOpacity(0);
    this.polyLayer2.setOpacity(0);
    this.polyLayer3.setOpacity(0);
    state = 0;
    console.log("show All data");
  }
}

@Component({
  selector: "comm-dialog",
  templateUrl: "comm-dialog.html"
})
export class CommDialog { }

@Component({
  selector: "report-dialog",
  templateUrl: "report-dialog.html"
})
export class ReportDialog { }
