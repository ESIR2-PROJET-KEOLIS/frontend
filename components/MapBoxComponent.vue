<template>
  <div id="mapDiv">

  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import { BusLayer} from "~/classes/BusLayer";

export default {
  name: "MapBoxComponent",
  data: () => ({
    mapRef : null,
  }),
  props: {
    busLines: {
      type: Array,
      default: []
    }
  },
  mounted() {
    const runtimeConfig = useRuntimeConfig();

    const data = {
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
    };



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

    this.mapRef.on('load', () => {
      this.mapRef.addSource('testData', {
        'type': 'geojson',
        'data': data
      });

      this.mapRef.addSource('busStop', {
        'type': 'geojson',
        'data': bus_stop_data
      });

      this.mapRef.addSource('subwayStation', {
        'type': 'geojson',
        'data': subway_station_data
      });

      if (!this.mapRef.getLayer("bus-stop")) this.mapRef.addLayer({
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
      });

      for(const feature of data.features) {
        const symbol = feature.properties.icon;
        const layerID = "bus-line-" + feature.properties.line;

        if (!this.mapRef.getLayer(layerID)) {
          this.mapRef.addLayer({
            'id': layerID,
            'type': 'symbol',
            'source': 'testData',
            'layout': {
              'icon-image': `${symbol}`,
              'icon-allow-overlap': true
            },
            'filter': ['==', 'icon', symbol]
          });
          this.busLines.push(new BusLayer(layerID, feature.properties.line));
        }
      }
    });
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