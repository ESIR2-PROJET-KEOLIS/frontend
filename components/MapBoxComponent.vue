<template>
  <div id="mapDiv">

  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import { BusLayer} from "~/classes/BusLayer";
import emptyFeatureCollection from "~/classes/emptyFeatureCollection.json";

export default {
  name: "MapBoxComponent",
  data: () => ({
    mapRef : null,
    busses : JSON.parse(JSON.stringify(emptyFeatureCollection)),
    bus_stops : JSON.parse(JSON.stringify(emptyFeatureCollection)),
    subway_stops : JSON.parse(JSON.stringify(emptyFeatureCollection)),
    initialized : false,
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
          const symbol = feature.properties.icon;
          const layerID = "bus-line-" + feature.properties.line;

          if (!this.mapRef.getLayer(layerID)) {
            this.mapRef.addLayer({
              'id': layerID,
              'type': 'symbol',
              'source': 'busses',
              'layout': {
                'icon-image': `${symbol}`,
                'icon-allow-overlap': true
              },
              'filter': ['==', 'line', layerID.split("-")[2]]
            });
            this.busLines.push(new BusLayer(layerID, feature.properties.line));
          }
        }
      });
    },
    updateMap(data){
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
      if(!this.initialized) this.loadMapFirstTime(JSON.parse(event.data));
      else this.updateMap(JSON.parse(event.data));
    }

    /*const data = {
      'type': 'FeatureCollection',
      'features': [
        {
          'type': 'Feature',
          'properties': {
            'icon': 'bus',
            'line' : 'C1'
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [-1.643207, 48.124831]
          }
        },
        {
          'type': 'Feature',
          'properties': {
            'icon': 'bus',
            'line' : 'C5'
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [-1.651326, 48.118860]
          }
        },
      ]
    };

    const bus_stop_data = {
      'type': 'FeatureCollection',
      'features': [
        {
          'type': 'Feature',
          'properties': {
            'icon': 'bus-stop',
            'line' : 'C1'
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [-1.657973, 48.115845],
          }
        },
      ]
    };

    const subway_station_data = {
      'type': 'FeatureCollection',
      'features': [
        {
          'type': 'Feature',
          'properties': {
            'icon': 'subway',
            'line' : 'A'
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [-1.639051, 48.122305],
          }
        },
      ]
    };*/


      /**/

      /*if (!this.mapRef.getLayer("bus-stop")) this.mapRef.addLayer({
        'id': "bus-stop",
        'type': 'symbol',
        'source': 'busStop',
        'layout': {
          'icon-image': "bus-stop",
          'icon-allow-overlap': true
        },
        'filter': ['==', 'icon', "bus-stop"]
      });

      if (!this.mapRef.getLayer("subway")) this.mapRef.addLayer({
        'id': "subway",
        'type': 'symbol',
        'source': 'subwayStation',
        'layout': {
          'icon-image': "subway",
          'icon-allow-overlap': true
        },
        'filter': ['==', 'icon', "subway"]
      });*/
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