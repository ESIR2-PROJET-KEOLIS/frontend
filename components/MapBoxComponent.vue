<template>
  <div id="mapDiv" ref="mapDiv">

  </div>
  <img src="~/assets/icons/bus.png" alt="bus"  style="display: none; pointer-events: none" ref="icon-bus">
  <div class="alert shadow-lg bg-neutral">
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info flex-shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span class="text-base">Real-time, Last updated : {{lastUpdated}}s</span>
    </div>
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import { BusLayer} from "~/classes/BusLayer";
import BusLogo from '~/assets/icons/bus.png';
import axios from "axios";
import {getDistanceFromLatLon, getBearing, destinationPoint} from "~/classes/LocationsLib";
import {FeatureCollection, FeatureCollectionLine} from "~/classes/FeatureCollection";

export default {
  name: "MapBoxComponent",
  data: () => ({
    mapRef : null,
    busses : new FeatureCollection(),
    bus_stops : new FeatureCollection(),
    subway_stops : new FeatureCollection(),
    empty : new FeatureCollection(),
    initialized : false,
    previousData: null,
    debug: false,
    routes: {},
    debugDirectionLines : new FeatureCollectionLine(),
    lastUpdated: 0,
    lastUpdatedDate: new Date(),
    busVisible: true,
  }),
  watch: {
    busLines: {
      handler(val, oldVal) {
        for(let i = 0; i<this.busLines.length; i++){
          this.mapRef.setLayoutProperty(this.busLines[i].layerID, 'visibility', this.busLines[i].visible ? 'visible' : 'none');
        }
      }
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
      if(value){
        this.busVisible = true;
        this.mapRef.getSource('busses').setData(this.busses);
      } else {
        this.busVisible = false;
        this.mapRef.getSource('busses').setData(this.empty);
      }
    },
    loadMapFirstTime(data){
      const runtimeConfig = useRuntimeConfig();
      this.initialized = true;

      // Set mapbox token
      mapboxgl.accessToken = runtimeConfig.public.mapboxAccessToken;

      // Create map
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

        // Set canvas attribute to improve performance
        try {
          this.$refs["mapDiv"].querySelector('.mapboxgl-canvas-container').childNodes[0].setAttribute("willReadFrequently", "true")
        } catch (e) {
          console.log("Error setting canvas attribute willReadFrequently to true");
        }

        // create the bus image logo
        const image = new Image(100, 100);
        image.src = BusLogo;

        // add image to the active style and make it SDF-enabled
        this.mapRef.addImage('bus-icon', image, { sdf: true });

        // Add sources of data to the map
        const sources = [
          {id : "debugDirectionLines", data : this.debugDirectionLines},
          {id : "busses", data : this.busses},
          {id : "busStop", data : this.bus_stops},
          {id : "subwayStation", data : this.subway_stops}];

        for(const source of sources){
          this.mapRef.addSource(source.id, {
            'type': 'geojson',
            'data': source.data
          });
        }

        // Create debug layer (for direction vectors)
        this.mapRef.addLayer({
          type: 'line',
          source: 'debugDirectionLines',
          id: 'line-background',
          paint: {
            'line-color': 'red',
            'line-width': 6,
            'line-opacity': 1
          }
        });

        // Create all bus layers
        for(const feature of data.features) {
          const symbol = "bus-icon"
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
        let debugFeatures = [];
        this.previousData.features.forEach((feature, i) => {
          if(feature === undefined || feature.geometry === undefined || feature.geometry.coordinates === undefined){
            return;
          }

          const currentCoordinates = feature.geometry.coordinates;
          const distance = 1.111; // vitesse 20km/h
          let nextCoor = this.routes[feature.properties.line+"_"+feature.properties.sens];
          if(nextCoor === undefined || nextCoor.length <= feature.properties.nextindex){return;}
          nextCoor = nextCoor[feature.properties.nextindex];
          if(nextCoor === undefined){return;}

          const distanceWithNext = getDistanceFromLatLon(currentCoordinates[1], currentCoordinates[0], nextCoor[0], nextCoor[1])*1000;
          if(distanceWithNext < distance){
            feature.properties.nextindex++;
            feature.geometry.coordinates = [nextCoor[1], nextCoor[0]];
            return;
          }

          const bearing = getBearing(currentCoordinates[1], currentCoordinates[0], nextCoor[0], nextCoor[1]);
          if(this.debug){
            let newFeature = {
              type: 'Feature',
              properties: {},
              geometry: {
                coordinates: [],
                type: 'LineString'
              }};

            newFeature.geometry.coordinates = [[currentCoordinates[0], currentCoordinates[1]], [nextCoor[1], nextCoor[0]]];
            debugFeatures.push(newFeature);
          }

          const nextPoint = destinationPoint(currentCoordinates[1], currentCoordinates[0], distance, bearing);
          feature.geometry.coordinates = [nextPoint[1], nextPoint[0]];
        });

        if(this.busVisible) this.mapRef.getSource('busses').setData(this.previousData);
        if(this.debug){
          this.debugDirectionLines.features = debugFeatures;
          this.mapRef.getSource('debugDirectionLines').setData(this.debugDirectionLines);
        }
      }

      this.lastUpdated = Math.floor((new Date().getTime() - this.lastUpdatedDate.getTime())/1000);

      setTimeout(() => {requestAnimationFrame(this.animate)}, 200);
    },

    updateMap(data){
      console.log("refreshed", data)
      this.mapRef.getSource('busses').setData(data);
    },
  },
  mounted() {
    let webSocket = new WebSocket("ws://localhost:4000");

    webSocket.onopen = (event) => {
      webSocket.send("bus");
      console.log("WebSocket Connection established");
    };

    webSocket.onmessage = (event) => {
      let data = JSON.parse(event.data);
      this.previousData = data;
      this.lastUpdatedDate = new Date();
      if(!this.initialized) this.loadMapFirstTime(data);
      else this.updateMap(data);
    }

    try{
      let ref = this;
      console.log("Api lines request...")
      axios.get('http://localhost:3500/lines', {
        headers: {"Access-Control-Allow-Origin": "*"}
      }).then(function (response) {
        ref.routes = response.data;
      })
    } catch (e){
      console.log(e)
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
.alert{
  position: absolute;
  bottom: 10px;
  left: 10px;
  z-index: 1000;
  max-width: 17vw;

}
</style>