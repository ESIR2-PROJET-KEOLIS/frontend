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
          <toggle-btn text="Temps Réel" @toggle="realTimeToggle" v-model:checked="realTime"></toggle-btn>
          <div class="divider"></div>
          <h1 class="text-center text-lg mb-4"> Simulation</h1>
          <day-selector :disabled="realTime" :checkIndex="2"></day-selector>
          <slider :disabled="realTime" v-model:value="simulatedHourSlider" min="0" max="1439"></slider>
          <p class="text-center text-lg mb-4"> {{simulatedHour}} </p>

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

<script lang="ts">
import { defineComponent } from 'vue';

import {MapBoxComponent, MapButtonGroup, DaySelector} from "#components";
import ToggleButton from "~/components/generic/ToggleButton.vue";
import Slider from "~/components/generic/Slider.vue";

export default defineComponent({
  data: () => ({
    realTime: true,
    simulatedHourSlider : 600,
  }),
  components: {
    "map-box" : MapBoxComponent,
    "map-btn-grp" : MapButtonGroup,
    "toggle-btn" : ToggleButton,
    "day-selector" : DaySelector,
    "slider" : Slider,
  },
  computed:{
    simulatedHour() : string{
      let hour = Math.floor(this.simulatedHourSlider / 60);
      let minute : number = this.simulatedHourSlider % 60;
      return hour + "h" + (minute < 10 ? "0" + minute : minute);
    },
  },
  methods:{
    realTimeToggle(value:boolean){
      console.log("new real time value : " +value);
      //
    }
  }
});

</script>