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
          <toggle-btn text="Temps Réel" v-model:checked="realTime"></toggle-btn>
          <div class="divider"></div>
          <h1 class="text-center text-lg mb-4"> Simulation</h1>
          <day-selector :disabled="realTime" :checkIndex="currentDaySimulated" @change="changeDay"></day-selector>
          <slider :disabled="realTime" :value="simulatedHourSlider" :min="0" :max="1439" @change="changeTime"></slider>
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
import { SimulationInfo } from '@/classes/SimulationInfo';

import {MapBoxComponent, MapButtonGroup, DaySelector} from "#components";
import ToggleButton from "~/components/generic/ToggleButton.vue";
import Slider from "~/components/generic/Slider.vue";

export default defineComponent({
  data: () => ({
    realTime: true,
    realTimeSimulationInfo : new SimulationInfo(),
    simulationInfo : new SimulationInfo(),
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
    simulatedHourSlider() : number {
      if(this.realTime && this.realTimeSimulationInfo !== null && this.realTimeSimulationInfo !== undefined) return this.realTimeSimulationInfo.getHourSimulated();
      if(!this.realTime && this.simulationInfo !== null && this.simulationInfo !== undefined) return this.simulationInfo.getHourSimulated();
      return 0;
    },
    currentDaySimulated() : number {
      if(this.realTime && this.realTimeSimulationInfo !== null && this.realTimeSimulationInfo !== undefined) return this.realTimeSimulationInfo.getDaySimulated();
      if(!this.realTime && this.simulationInfo !== null && this.simulationInfo !== undefined) return this.simulationInfo.getDaySimulated();
      return 0;
    },
  },
  methods:{
    changeTime(value: number){
      if(this.realTime) return;
      if(!isNaN(value)) this.simulationInfo.setHourSimulated(+value);
    },
    changeDay(day: number){
      if(this.realTime) return;
      if(!isNaN(day)) this.simulationInfo.setDaySimulated(day);
    },
  }
});

</script>