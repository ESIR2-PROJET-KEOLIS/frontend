<template>
    <div class="btn-group">
        <!-- LAYER LINE VISIBILITY -->
        <div class="dropdown dropdown-end dropdown-hover">
            <button class="btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M15,3V7.59L7.59,15H3V21H9V16.42L16.42,9H21V3M17,5H19V7H17M5,17H7V19H5" /></svg>
            </button>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 overflow-y-auto grid grid-col-1 max-h-96 overflow-x-hidden">
                <label class="input-group mb-1">
                    <input type="text" placeholder="C5" class="input input-bordered h-10" style="width: 120px;" v-model="filter"/>
                    <span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
                </label>
                <dropdown-checkbox v-for="(layer, i) in filteredLines" :value="layer.visible" @changeValue="changeLineVisibility($event, i)">
                    <template #svg>
                        <img v-if="pictoLoaded && picto[layer.lineName]" :src="picto[layer.lineName].src" style="width: 22px; height: 22px;"/>
                    </template>
                </dropdown-checkbox>
            </ul>
        </div>

        <!-- LAYER BUS VISIBILITY -->
        <div class="dropdown dropdown-end dropdown-hover">
            <button class="btn no-border">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="5 5 36 36" stroke="currentColor"><path d="M12.45 42q-.65 0-1.15-.375-.5-.375-.5-.975v-4.2q-1.45-.8-2.125-2.3Q8 32.65 8 30.95V11.1q0-3.7 3.825-5.4Q15.65 4 24.05 4q8.3 0 12.125 1.7Q40 7.4 40 11.1v19.85q0 1.7-.675 3.2-.675 1.5-2.125 2.3v4.2q0 .6-.5.975T35.55 42h-.95q-.7 0-1.2-.375t-.5-.975V37.9H15.1v2.75q0 .6-.5.975T13.4 42Zm11.6-32.2H37 11h13.05Zm8.85 14.65H11h26-4.1Zm-21.9-3h26V12.8H11Zm5.3 10.95q1.15 0 1.95-.8t.8-1.95q0-1.15-.8-1.95t-1.95-.8q-1.15 0-1.95.8t-.8 1.95q0 1.15.8 1.95t1.95.8Zm15.4 0q1.15 0 1.95-.8t.8-1.95q0-1.15-.8-1.95t-1.95-.8q-1.15 0-1.95.8t-.8 1.95q0 1.15.8 1.95t1.95.8ZM11 9.8h26q-1.2-1.3-4.6-2.05Q29 7 24.05 7q-5.9 0-9.05.675-3.15.675-4 2.125Zm4.1 25.1h17.8q1.75 0 2.925-1.35Q37 32.2 37 30.45v-6H11v6q0 1.75 1.175 3.1T15.1 34.9Z"/></svg>
            </button>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 overflow-y-auto grid grid-col-1 max-h-96 overflow-x-hidden">
                <label class="input-group mb-1">
                    <input type="text" placeholder="C5" class="input input-bordered h-10" style="width: 120px;" v-model="filter"/>
                    <span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
                </label>
                <dropdown-checkbox v-for="(layer, i) in filteredLayers" :value="layer.visible" @changeValue="changeLayerVisibility($event, i)" @doubleClick="changeUniqueLayerVisibility(i)">
                    <template #svg>
                        <img v-if="pictoLoaded && picto[layer.lineName]" :src="picto[layer.lineName].src" style="width: 22px; height: 22px;"/>
                    </template>
                </dropdown-checkbox>
            </ul>
        </div>

        <!-- OPEN SIMULATION SETTINGS PANEL -->
        <label class="btn" :for="drawerFor">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="5 5 36 36" stroke="currentColor"><path d="M6 36v-3h36v3Zm0-10.5v-3h36v3ZM6 15v-3h36v3Z"/></svg>
        </label>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {DropdownCheckbox} from "#components";
import {BusLayer} from "~/classes/BusLayer";
import Pictogram from "~/assets/temporary/picto.json";

export default defineComponent({
    name: "MapButtonGroup",

    components: {
        "dropdown-checkbox" : DropdownCheckbox
    },

    props: {
        drawerFor: String,
        layers: Array<BusLayer>,
        linesHighlight: Array<BusLayer>,
    },

    data: () => ({
        filter: "",
        picto: {},
        pictoLoaded: false
    }),

    computed: {
        filteredLayers(){
            if(this.layers===undefined) return [];
            this.layers.sort((a: any, b: any) => a.lineName.localeCompare(b.lineName));
            let filterLower = this.filter.toLowerCase();
            return this.layers.filter((layer: any) => layer.lineName.toLowerCase().includes(filterLower));
        },
        filteredLines(){
            if(this.linesHighlight===undefined) return [];
            this.linesHighlight.sort((a: any, b: any) => a.lineName.localeCompare(b.lineName));
            let filterLower = this.filter.toLowerCase();
            return this.linesHighlight.filter((layer: any) => layer.lineName.toLowerCase().includes(filterLower));
        },
    },

    methods: {
        changeLayerVisibility(newValue: boolean, layer: number){
            let index = this.layers?.indexOf(this.filteredLayers[layer]);
            this.layers[index].visible = newValue;
            this.$emit("changeBusLayerVisibility");
        },
        changeUniqueLayerVisibility(layer: number){
            let index = this.layers?.indexOf(this.filteredLayers[layer]);
            if(!this.layers[index].visible){
                this.layers?.forEach((layer: any) => layer.visible = true);
            } else {
                this.layers?.forEach((layer: any) => layer.visible = false);
                this.layers[index].visible = true;
            }
            this.$emit("changeBusLayerVisibility");
        },
        changeLineVisibility(newValue: boolean, layer: number){
            let index = this.linesHighlight?.indexOf(this.filteredLines[layer]);
            this.linesHighlight[index].visible = newValue;
            this.$emit("changeBusLineVisibility");
        },
    },

    mounted() {
        let pictoJson = Pictogram;
        pictoJson.forEach((picto: any) => {
            if(this.picto[picto.nomcourtligne] === undefined &&
                (picto.image.width == 22 || picto.image.width == 30)) {
                this.picto[picto.nomcourtligne] = {src: "https://data.explore.star.fr/explore/dataset/tco-bus-lignes-pictogrammes-dm/files/"+picto.image.id+"/300/"};
            }
        });
        this.pictoLoaded = true;
    }
});
</script>

<style scoped>
.no-border{
    border-radius: 0 !important;
}
</style>