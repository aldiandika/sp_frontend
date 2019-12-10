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

var nDevice: any;
var nId: any;

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

    for (var i = 1; i < 6; i++) {
      // console.log((107.757198 - (i * 0.002)).toFixed(6));
      // console.log((107.755198 - (i * 0.002)).toFixed(6));
      // console.log((107.755198 - (i * 0.002)).toFixed(6));
      // console.log((107.757198 - (i * 0.002)).toFixed(6));
      // console.log("OK");

      var b4c1 = (107.757198 - (i * 0.002)).toFixed(6);
      var b4c2 = (107.755198 - (i * 0.002)).toFixed(6);
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
    //End of Fitur untuk polygon

    //Fitur untuk marker

    //Marker BP dummy
    var bpPos = [
      [107.758498, -6.93887],
      [107.756598, -6.93587],
      [107.7576087, -6.9384338],
      [107.757798, -6.93697]
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
        this.vectorLayer,
        this.polyLayer,
        this.polyLayer2,
        this.polyLayer3,
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

    //Fitur untuk nextLine BP
    var nextRoute = new Feature();
    var nextCoordinates = [[lastLon, lastLat], [lon, lat]];
    console.log(nextCoordinates);
    var nextGeom = new LineString(nextCoordinates);
    nextGeom.transform("EPSG:4326", "EPSG:3857"); //Transform to your map projection
    nextRoute.setGeometry(nextGeom);
    //End of Fitur untuk nextLine BP

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
    }

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
    this.usvSource.addFeature(nextPos2);
    map.addLayer(this.usvLayer);

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
    this.uavSource.addFeature(nextPos3);
    map.addLayer(this.uavLayer);

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
    this.bcSource.addFeature(nextPos4);
    map.addLayer(this.bcLayer);

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
