<template>
  <div id="mapDiv">

  </div>
  <img src="~/assets/icons/bus.png" alt="bus"  style="display: none; pointer-events: none" ref="icon-bus">
</template>

<script>
import mapboxgl from "mapbox-gl";
import { BusLayer} from "~/classes/BusLayer";
import emptyFeatureCollection from "~/classes/emptyFeatureCollection.json";
import BusLogo from '~/assets/icons/bus.png';

export default {
  name: "MapBoxComponent",
  data: () => ({
    mapRef : null,
    busses : JSON.parse(JSON.stringify(emptyFeatureCollection)),
    bus_stops : JSON.parse(JSON.stringify(emptyFeatureCollection)),
    subway_stops : JSON.parse(JSON.stringify(emptyFeatureCollection)),
    empty : JSON.parse(JSON.stringify(emptyFeatureCollection)),
    initialized : false,
    previousData: null,
  }),
  watch: {
    busLines: {
      handler(val, oldVal) {
        for(let i = 0; i<this.busLines.length; i++){
          this.mapRef.setLayoutProperty(this.busLines[i].layerID, 'visibility', this.busLines[i].visible ? 'visible' : 'none');
        }
      },
      deep: true
    },
  },
  props: {
    busLines: {
      type: Array,
      default: []
    }
  },
  methods:{
    changeVisibilityBus(value){
      if(value)
        this.mapRef.getSource('busses').setData(this.busses);
      else
        this.mapRef.getSource('busses').setData(this.empty);
    },
    loadMapFirstTime(data){
      const runtimeConfig = useRuntimeConfig();
      this.initialized = true;

      mapboxgl.accessToken = runtimeConfig.public.mapboxAccessToken;
      this.mapRef = new mapboxgl.Map({
        container: 'mapDiv',
        style: 'mapbox://styles/jeanbombeur/clbm382qs000l14mu0ayx6zxi',
        center: [-1.656946, 48.114572],
        zoom:13,
        minzoom: 16,
        maxPitch: 0,
        minPitch: 0,
        maxBounds: new mapboxgl.LngLatBounds(
            new mapboxgl.LngLat(-1.776660, 48.044477), //48.044477, -1.776660
            new mapboxgl.LngLat(-1.563988, 48.188023) //48.188023, -1.563988
        ),
      });

      this.busses = data;

      this.mapRef.on('load', () => {

        const image = new Image(100, 100);
        image.src = BusLogo;

        // add image to the active style and make it SDF-enabled
        this.mapRef.addImage('bus-icon', image, { sdf: true });

          this.mapRef.addSource('busses', {
            'type': 'geojson',
            'data': this.busses
          });

          this.mapRef.addSource('busStop', {
            'type': 'geojson',
            'data': this.bus_stops
          });

          this.mapRef.addSource('subwayStation', {
            'type': 'geojson',
            'data': this.subway_stops
          });

          for(const feature of data.features) {
            const symbol = "bus-icon"//"BSicon_BUS"//feature.properties.icon;
            const layerID = "bus-line-" + feature.properties.line;

            if (!this.mapRef.getLayer(layerID)) {
              this.mapRef.addLayer({
                'id': layerID,
                'type': 'symbol',
                'source': 'busses',
                'layout': {
                  'icon-image': `${symbol}`,
                  'icon-size': 0.35,
                  'icon-allow-overlap': true
                },
                "paint": {
                  "icon-color": "#1f89a9"
                },
                'filter': ['==', 'line', layerID.split("-")[2]]
              });
              this.busLines.push(new BusLayer(layerID, feature.properties.line));
            }
          }

          this.animate();

      });
    },
    animate(){
      if(this.previousData !== null){
        this.previousData.features.forEach((feature, i) => {
          if(feature === undefined || feature.geometry === undefined || feature.geometry.coordinates === undefined){
            return;
          }
          const currentCoordinates = feature.geometry.coordinates;

          const bearing = 30;
          const distance = 1;
          const nextPoint = this.destinationPoint(currentCoordinates[1], currentCoordinates[0], distance, bearing);
          feature.geometry.coordinates = [nextPoint[1], nextPoint[0]];
        });

        this.mapRef.getSource('busses').setData(this.previousData);
      }

      setTimeout(() => {requestAnimationFrame(this.animate)}, 100);


    },
    // source : (DaveAlden) https://stackoverflow.com/questions/19352921/how-to-use-direction-angle-and-speed-to-calculate-next-times-latitude-and-longi
    destinationPoint(lat, lon, distance, bearing) {
      var radius = 6371e3; // (Mean) radius of earth

      var toRadians = function(v) { return v * Math.PI / 180; };
      var toDegrees = function(v) { return v * 180 / Math.PI; };

      // sinφ2 = sinφ1·cosδ + cosφ1·sinδ·cosθ
      // tanΔλ = sinθ·sinδ·cosφ1 / cosδ−sinφ1·sinφ2
      // see mathforum.org/library/drmath/view/52049.html for derivation

      var δ = Number(distance) / radius; // angular distance in radians
      var θ = toRadians(Number(bearing));

      var φ1 = toRadians(Number(lat));
      var λ1 = toRadians(Number(lon));

      var sinφ1 = Math.sin(φ1), cosφ1 = Math.cos(φ1);
      var sinδ = Math.sin(δ), cosδ = Math.cos(δ);
      var sinθ = Math.sin(θ), cosθ = Math.cos(θ);

      var sinφ2 = sinφ1*cosδ + cosφ1*sinδ*cosθ;
      var φ2 = Math.asin(sinφ2);
      var y = sinθ * sinδ * cosφ1;
      var x = cosδ - sinφ1 * sinφ2;
      var λ2 = λ1 + Math.atan2(y, x);

      return [toDegrees(φ2), (toDegrees(λ2)+540)%360-180]; // normalise to −180..+180°
    },
    updateMap(data){
      this.mapRef.getSource('busses').setData(data);
      this.previousData = data;
    },
  },
  mounted() {
    let webSocket = new WebSocket("ws://localhost:4000");

    webSocket.onopen = (event) => {
      webSocket.send("bus");
      console.log("WebSocket Connection established");
    };

    webSocket.onmessage = (event) => {
      if(!this.initialized) this.loadMapFirstTime(JSON.parse(event.data));
      else this.updateMap(JSON.parse(event.data));
    }
  }
}
</script>

<style scoped>
#mapDiv{
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>