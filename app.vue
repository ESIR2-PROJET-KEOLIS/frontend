<template>
  <div>
    <div class="drawer drawer-end">
      <input id="my-drawer" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content">
        <!-- Page content here -->
        <map-box></map-box>
        <map-btn-grp drawerFor="my-drawer" id="buttons"></map-btn-grp>
      </div>
      <div class="drawer-side">
        <label for="my-drawer" class="drawer-overlay"></label>
        <div class="menu p-4 w-90 bg-base-100 text-base-content">
          <h1 class="text-center text-lg mb-1">Visualisation en Temps réel</h1>
          <toggle-btn text="Temps Réel" @toggle="realTimeToggle"></toggle-btn>
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
@import url('https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.css');

#buttons {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 100;
}
</style>

<script>
import MapBoxComponent from "~/components/MapBoxComponent.vue";
import MapButtonGroup from "~/components/MapButtonGroup.vue";
import ToggleButton from "~/components/generic/ToggleButton.vue";

export default {
  components: {
    "map-box" : MapBoxComponent,
    "map-btn-grp" : MapButtonGroup,
    "toggle-btn" : ToggleButton,
  },
  methods:{
    realTimeToggle(value){
      console.log("real time : "+value);
    }
  }
}

</script>