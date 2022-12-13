<template>
  <div id="mapDiv">

  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";

export default {
  name: "MapBoxComponent",
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
            'coordinates': [-77.038659, 38.931567]
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
            'coordinates': [-77.038659, 38.931567]
          }
        },
        {
          'type': 'Feature',
          'properties': {
            'icon': 'stop',
            'type' : 'bus'
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [-77.038659, 38.931567]
          }
        },
      ]
    };

    mapboxgl.accessToken = runtimeConfig.public.mapboxAccessToken;
    new mapboxgl.Map({
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