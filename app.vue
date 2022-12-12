<template>
  <div>
    <div class="drawer drawer-end">
      <input id="my-drawer-4" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content">
        <!-- Page content here -->
        <div id="test"></div>
        <div class="btn-group" id="button">
          <label class="btn">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="5 5 36 36" stroke="currentColor"><path d="M12.45 42q-.65 0-1.15-.375-.5-.375-.5-.975v-4.2q-1.45-.8-2.125-2.3Q8 32.65 8 30.95V11.1q0-3.7 3.825-5.4Q15.65 4 24.05 4q8.3 0 12.125 1.7Q40 7.4 40 11.1v19.85q0 1.7-.675 3.2-.675 1.5-2.125 2.3v4.2q0 .6-.5.975T35.55 42h-.95q-.7 0-1.2-.375t-.5-.975V37.9H15.1v2.75q0 .6-.5.975T13.4 42Zm11.6-32.2H37 11h13.05Zm8.85 14.65H11h26-4.1Zm-21.9-3h26V12.8H11Zm5.3 10.95q1.15 0 1.95-.8t.8-1.95q0-1.15-.8-1.95t-1.95-.8q-1.15 0-1.95.8t-.8 1.95q0 1.15.8 1.95t1.95.8Zm15.4 0q1.15 0 1.95-.8t.8-1.95q0-1.15-.8-1.95t-1.95-.8q-1.15 0-1.95.8t-.8 1.95q0 1.15.8 1.95t1.95.8ZM11 9.8h26q-1.2-1.3-4.6-2.05Q29 7 24.05 7q-5.9 0-9.05.675-3.15.675-4 2.125Zm4.1 25.1h17.8q1.75 0 2.925-1.35Q37 32.2 37 30.45v-6H11v6q0 1.75 1.175 3.1T15.1 34.9Z"/></svg>
          </label>
          <label class="btn" for="my-drawer-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="5 5 36 36" stroke="currentColor"><path d="M6 36v-3h36v3Zm0-10.5v-3h36v3ZM6 15v-3h36v3Z"/></svg>
          </label>
        </div>
      </div>
      <div class="drawer-side">
        <label for="my-drawer-4" class="drawer-overlay"></label>
        <div class="menu p-4 w-90 bg-base-100 text-base-content">
          <h1 class="text-center text-lg mb-1">Visualisation en Temps réel</h1>
          <label class="label cursor-pointer">
            <span class="label-text text-lg">Temps réel</span>
            <input type="checkbox" class="toggle toggle-primary toggle-lg" checked/>
          </label>
          <div class="divider"></div>
          <h1 class="text-center text-lg mb-4"> Simulation</h1>
          <div class="btn-group mb-5">
            <input type="radio" name="options" data-title="L" class="btn" checked disabled/>
            <input type="radio" name="options" data-title="M" class="btn" disabled/>
            <input type="radio" name="options" data-title="M" class="btn" disabled/>
            <input type="radio" name="options" data-title="J" class="btn" disabled/>
            <input type="radio" name="options" data-title="V" class="btn" disabled/>
            <input type="radio" name="options" data-title="S" class="btn" disabled/>
            <input type="radio" name="options" data-title="D" class="btn" disabled/>
          </div>

          <input class="mb-2 range range-primary" type="range" min="0" max="100" value="40" disabled/>
          <p class="text-center text-lg mb-4"> 14:00 </p>

        </div>
      </div>
    </div>
  </div>
</template>

<style>
#button {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 100;
}

#test{
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>

<script>
import mapboxgl from "mapbox-gl";
/* useAsyncData()and $fetch() are auto-imported */
//const { data, refresh, pending } = await useAsyncData('/api/hello', () => $fetch('/api/hello'))

export default {
  data() {
    return {
      count: 0
    }
  },
  mounted() {
    const runtimeConfig = useRuntimeConfig();

    mapboxgl.accessToken = runtimeConfig.public.mapboxAccessToken;
    var map = new mapboxgl.Map({
      container: 'test',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-1.656946, 48.114572],
      zoom:13
    });
  }
}

</script>