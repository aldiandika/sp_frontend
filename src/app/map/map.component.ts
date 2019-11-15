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

import axios from "axios";

const PUSHER_API_KEY = "6f4176ccff502d8ce53b";
const PUSHER_CLUSTER = "ap1";

declare var google: any;
var lat: any;
var long: any;
var geolocation;

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

  data: any;
  lat: number = -6.921867999999984;
  long: number = 107.607093;
  marker: any;
  lineCoordinates = [];

  response: any;
  constructor(private http: HttpClient) {}

  // constructor() {}

  ngOnInit() {
    this.launchMap(this.lat, this.long);
    this.getData();
  }

  getData() {
    const url = "http://localhost:8000/api/tracklast";
    this.http.get(url).subscribe(res => {
      this.data = res;
      console.log(this.data);
    });
  }

  launchMap(lat, lng) {
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

  // this.geolocation = new Geolocation({
  //   // enableHighAccuracy must be set to true to have the heading value.
  //   trackingOptions: {
  //     enableHighAccuracy: true
  //   },
  //   projection: this.view.getProjection()
  // });

  // this.geolocation.setTracking(true);

  // this.accuracyFeature = new Feature();
  // this.geolocation.on("change:accuracyGeometry", function() {
  //   this.accuracyFeature.setGeometry(this.geolocation.getAccuracyGeometry());
  // });

  // this.positionFeature = new Feature();
  // this.positionFeature.setStyle(
  //   new Style({
  //     image: new CircleStyle({
  //       radius: 8,
  //       fill: new Fill({
  //         color: "#3399CC"
  //       }),
  //       stroke: new Stroke({
  //         color: "#fff",
  //         width: 2
  //       })
  //     })
  //   })
  // );

  // this.geolocation.on("change:position", function() {
  //   var coordinates = this.geolocation.getPosition();
  //   this.positionFeature.setGeometry(
  //     coordinates ? new Point(coordinates) : null
  //   );
  // });

  // this.yes = new Feature();
  // this.yes.setStyle(
  //   new Style({
  //     image: new CircleStyle({
  //       radius: 8,
  //       fill: new Fill({
  //         color: "#3399CC"
  //       }),
  //       stroke: new Stroke({
  //         color: "#fff",
  //         width: 2
  //       })
  //     })
  //   })
  // );

  // new VectorLayer({
  //   map: this.map,
  //   source: new VectorSource({
  //     features: [this.positionFeature, this.yes, this.accuracyFeature]
  //   })
  // });

  // subscribe() {
  //   var echo = new Echo({
  //     broadcaster: "pusher",
  //     key: PUSHER_API_KEY,
  //     cluster: PUSHER_CLUSTER
  //   });
  //   echo.channel("location").listen("SendLocation", e => {
  //     this.data = e.location;
  //     this.updateMap(this.data);
  //   });
  // }

  // updateMap(data) {
  //   this.lat = parseFloat(data.lat);
  //   this.long = parseFloat(data.long);

  //   this.map.setCenter({ lat: this.lat, lng: this.long, alt: 0 });
  //   this.marker.setPosition({ lat: this.lat, lng: this.long, alt: 0 });

  //   this.lineCoordinates.push(new google.maps.LatLng(this.lat, this.long));

  //   var lineCoordinatesPath = new google.maps.Polyline({
  //     path: this.lineCoordinates,
  //     geodesic: true,
  //     map: this.map,
  //     strokeColor: "#FF0000",
  //     strokeOpacity: 1.0,
  //     strokeWeight: 2
  //   });
  // }
}
