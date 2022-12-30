<template>
  <div>
    <drawer drawerFor="my-drawer">

      <template #page-content>
        <layer-menu id="layer"></layer-menu>
        <map-box :busLines="busLines"></map-box>
        <map-btn-grp drawerFor="my-drawer" id="buttons" :layers="busLines"></map-btn-grp>
      </template>

      <template #drawer-content>
        <h1 class="text-center text-lg mb-1">Visualisation en Temps réel</h1>
        <toggle-btn text="Temps Réel" v-model:checked="realTime" @toggle="toggleRealTime"></toggle-btn>
        <div class="divider"></div>
        <h1 class="text-center text-lg mb-4"> Simulation</h1>
        <day-selector :disabled="realTime" :checkIndex="currentDaySimulated" @change="changeDay"></day-selector>
        <slider :disabled="realTime" :value="simulatedHourSlider" :min="0" :max="1439" @change="changeTime"></slider>
        <p class="text-center text-lg mb-4"> {{simulatedHour}} </p>
      </template>

    </drawer>
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

#layer {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 100;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import { SimulationInfo } from '@/classes/SimulationInfo';

import {MapBoxComponent, MapButtonGroup, DaySelector, LayerMenu} from "#components";
import ToggleButton from "~/components/generic/ToggleButton.vue";
import Slider from "~/components/generic/Slider.vue";
import Drawer from "~/components/generic/Drawer.vue";

export default defineComponent({
  data: () => ({
    realTime: true,
    realTimeSimulationInfo : new SimulationInfo(),
    simulationInfo : new SimulationInfo(),
    busLines : [],
  }),
  components: {
    "map-box" : MapBoxComponent,
    "map-btn-grp" : MapButtonGroup,
    "toggle-btn" : ToggleButton,
    "day-selector" : DaySelector,
    "slider" : Slider,
    "drawer" : Drawer,
    "layer-menu" : LayerMenu
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
    toggleRealTime(value: boolean){
      if(value) this.realTimeSimulationInfo.refreshRealTime();
    }
  }
});

</script>