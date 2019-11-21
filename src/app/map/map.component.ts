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

import { HttpClient } from "@angular/common/http";

const PUSHER_API_KEY = "6f4176ccff502d8ce53b";
const PUSHER_CLUSTER = "ap1";

declare var google: any;
var latitude: any;
var longitude: any;
var geolocation;
var data: any;
var dataG;

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"]
})
export class MapComponent implements OnInit {
  map: OlMap;
  source: OlXYZ;
  layer: OlTileLayer;

  crd: any;

  coordinates: any;
  accuracyFeature: any;

  vectorSource: any;
  vectorLayer: any;

  yes: any;

  dataMap: any;

  // lat: number = -6.921867999999984;
  // long: number = 107.607093;
  marker: any;
  lineCoordinates = [];

  response: any;
  constructor(private http: HttpClient) {}

  // constructor() {}

  ngOnInit() {
    // this.GeoLocMap(this.lat, this.long);
    this.stayUpdate();
    this.getDataNlaunch();
    // this.launchMap();
  }

  //Function to get data from database and launch map
  getDataNlaunch() {
    const url = "http://localhost:8000/api/tracklast";
    this.http.get(url).subscribe(res => {
      data = res;
      latitude = data.t_lat;
      longitude = data.t_lon;

      this.launchMap();
    });
  }

  //Function to launch map
  launchMap() {
    this.source = new OlXYZ({
      url: "http://tile.osm.org/{z}/{x}/{y}.png"
    });

    this.layer = new OlTileLayer({
      source: this.source
    });

    var view = new OlView({
      center: fromLonLat([longitude, latitude]),
      zoom: 6
    });

    var positionFeature = new Feature({
      geometry: new Point(fromLonLat([longitude, latitude]))
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

    this.vectorLayer = new VectorLayer({
      source: this.vectorSource
    });

    this.map = new OlMap({
      target: "map",
      layers: [this.layer, this.vectorLayer],
      view: view
    });
  }

  //Function to get geo Location data
  GeoLocMap(lat, lng) {
    this.source = new OlXYZ({
      url: "http://tile.osm.org/{z}/{x}/{y}.png"
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

    this.map = new OlMap({
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
      console.log(this.dataMap);
      // this.updateMap(this.dataMap);
    });
  }

  updateMap(data) {
    console.log("Update Map");
  }
}
