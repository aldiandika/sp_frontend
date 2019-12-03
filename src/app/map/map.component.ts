import { Component, OnInit } from "@angular/core";
import Echo from "laravel-echo";

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
import { fromLonLat } from "ol/proj";
import { LineString } from "ol/geom";

import { Icon } from "ol/style";

import { HttpClient } from "@angular/common/http";

import { MatDialog, MatDialogConfig } from "@angular/material";

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

  dataMap: any;

  marker: any;
  lineCoordinates = [];

  response: any;
  constructor(private http: HttpClient, public dialog: MatDialog) {}

  // constructor() {}

  ngOnInit() {
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
          scale: 0.2,
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

    //Fitur untuk marker

    //Marker BP dummy
    var bpPos = [
      [107.7548287, -6.9385338],
      [107.7547187, -6.9381338],
      [107.7546087, -6.9384338]
    ];

    for (var i = 0; i < bpPos.length; i++) {
      var bpMarker = new Feature({
        geometry: new Point(fromLonLat([bpPos[i][0], bpPos[i][1]]))
      });

      bpMarker.setStyle(
        new Style({
          image: new Icon({
            src: "/assets/marker-asset/BackPack-Marker.png",
            scale: 0.2,
            anchor: [0.5, 1],
            anchorXUnits: "fraction",
            anchorYUnits: "fraction"
          })
        })
      );
      this.vectorSource.addFeature(bpMarker);
    }

    //Di kondisi nyata victim position diambil dari database
    var victimPos = [
      [107.758198, -6.93887],
      [107.758198, -6.93687],
      [107.756198, -6.93887],
      [107.756198, -6.93587],
      [107.757198, -6.93877],
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
            scale: 0.2,
            anchor: [0.5, 1],
            anchorXUnits: "fraction",
            anchorYUnits: "fraction"
          })
        })
      );

      this.vectorSource.addFeature(victimMarker);
    }

    //End of Fitur untuk marker

    map = new OlMap({
      target: "map",
      layers: [this.layer, this.vectorLayer, this.lineLayer, this.bpLayer],
      view: view
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

    geolocation.on("change:position", function(evt) {
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
          scale: 0.2,
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
    map.addLayer(this.lineLayer);
    map.addLayer(this.bpLayer);

    lastLat = lat;
    lastLon = lon;
  }
}

@Component({
  selector: "comm-dialog",
  templateUrl: "comm-dialog.html"
})
export class CommDialog {}

@Component({
  selector: "report-dialog",
  templateUrl: "report-dialog.html"
})
export class ReportDialog {}
