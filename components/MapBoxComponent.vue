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

    mapboxgl.accessToken = runtimeConfig.public.mapboxAccessToken;
    new mapboxgl.Map({
      container: 'mapDiv',
      style: 'mapbox://styles/jeanbombeur/clbm382qs000l14mu0ayx6zxi',
      center: [-1.656946, 48.114572],
      zoom:13,
      willReadFrequently: true
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