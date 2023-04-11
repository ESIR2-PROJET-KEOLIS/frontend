<template>
    <div>
        <drawer drawerFor="my-drawer">
            <template #page-content>
                <layer-menu id="layer"
                            :busVisibility="busVisible"
                            :stopVisibility="stopVisible"
                            @changeStopVisibility="changeStopVisibility"
                            @changeBusLineVisibility="changeBusLineVisibility"></layer-menu>
                <map-box ref="mapBoxComp"
                         :busLines="busLines"
                         :linesHighlight="linesHighlight"
                         :dynamicFrameRate="dynamicFrameRate"
                         :busBearing="busBearing"
                ></map-box>
                <map-btn-grp
                    drawerFor="my-drawer"
                    id="buttons"
                    :layers="busLines"
                    :linesHighlight="linesHighlight"
                    @changeBusLayerVisibility="refreshBusLayer"
                    @changeBusLineVisibility="refreshLines"></map-btn-grp>
                <label class="btn btnSettings" for="settings">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="5 5 36 36" stroke="currentColor"><path d="M6 36v-3h36v3Zm0-10.5v-3h36v3ZM6 15v-3h36v3Z"/></svg>
                </label>
            </template>
            <template #drawer-content>
                <h1 class="text-center text-lg mb-1">Real Time visualization</h1>
                <toggle-btn text="Real Time" v-model:checked="realTime" @toggle="toggleRealTime"></toggle-btn>
                <div class="divider"></div>
                <h1 class="text-center text-lg mb-4"> Simulation</h1>
                <day-selector :disabled="realTime" :checkIndex="currentDaySimulated" @change="changeDay"></day-selector>
                <slider :disabled="realTime" :value="simulatedHourSlider" :min="0" :max="1439" @change="changeTime"></slider>
                <p class="text-center text-lg mb-4"> {{simulatedHour}} </p>
                <div class="divider"></div>
                <h1 class="text-center text-lg mb-1">Settings</h1>
                <toggle-btn text="Dynamic frame rate" v-model:checked="dynamicFrameRate" @toggle="toggleDynFPS"></toggle-btn>
                <slider :disabled="dynamicFrameRate" :value="fps" :min="4" :max="60" @change="changeFPS"></slider>
                <p class="text-center text-lg mb-4"> {{fpsText}} </p>
                <toggle-btn text="Bus Rotation" v-model:checked="busBearing"></toggle-btn>
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

.btnSettings{
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 100;
    cursor: pointer;
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
        linesHighlight: [],
        busVisible: true,
        stopVisible: true,
        dynamicFrameRate: true,
        fps: 40,
        busBearing: true
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
        fpsText() : string {
            if(this.dynamicFrameRate) return "";
            return "FPS : "+this.fps;
        }
    },
    methods:{
        refreshBusLayer(){
            this.$refs.mapBoxComp.updateBusesLayersVisibility();
        },
        refreshLines(){
            this.$refs.mapBoxComp.updateLinesVisibility();
        },
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
        },
        changeStopVisibility(value : boolean){
            this.stopVisible = value;
            this.$refs.mapBoxComp.changeStopVisibility(value);
        },
        changeBusLineVisibility(value : boolean){
            this.busVisible = value;
            this.$refs.mapBoxComp.changeVisibilityBus(value);
        },
        changeFPS(value : number){
            if(!isNaN(value)){
                this.fps = value;
                this.$refs.mapBoxComp.setFPS(value);
            }
        },
        toggleDynFPS(value: boolean){
            if(!value){
                this.$refs.mapBoxComp.setFPS(this.fps);
            }
        }
    }
});

</script>