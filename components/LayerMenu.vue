<template>
  <div class="dropdown dropdown-bottom dropdown-hover"> <!-- -->
    <label class="btn" tabindex="0">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="5 5 36 36" stroke="currentColor"><path d="m24 41.5-18-14 2.5-1.85L24 37.7l15.5-12.05L42 27.5Zm0-7.6-18-14 18-14 18 14Zm0-15.05Zm0 11.25 13.1-10.2L24 9.7 10.9 19.9Z"/></svg>
    </label>
    <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
      <dropdown-checkbox label="Bus" :value="busVisibility" @changeValue="changeBusVisibility($event)">
        <template #svg>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="5 5 36 36" stroke="currentColor">
            <path d="M12.45 42q-.65 0-1.15-.375-.5-.375-.5-.975v-4.2q-1.45-.8-2.125-2.3Q8 32.65 8 30.95V11.1q0-3.7 3.825-5.4Q15.65 4 24.05 4q8.3 0 12.125 1.7Q40 7.4 40 11.1v19.85q0 1.7-.675 3.2-.675 1.5-2.125 2.3v4.2q0 .6-.5.975T35.55 42h-.95q-.7 0-1.2-.375t-.5-.975V37.9H15.1v2.75q0 .6-.5.975T13.4 42Zm11.6-32.2H37 11h13.05Zm8.85 14.65H11h26-4.1Zm-21.9-3h26V12.8H11Zm5.3 10.95q1.15 0 1.95-.8t.8-1.95q0-1.15-.8-1.95t-1.95-.8q-1.15 0-1.95.8t-.8 1.95q0 1.15.8 1.95t1.95.8Zm15.4 0q1.15 0 1.95-.8t.8-1.95q0-1.15-.8-1.95t-1.95-.8q-1.15 0-1.95.8t-.8 1.95q0 1.15.8 1.95t1.95.8ZM11 9.8h26q-1.2-1.3-4.6-2.05Q29 7 24.05 7q-5.9 0-9.05.675-3.15.675-4 2.125Zm4.1 25.1h17.8q1.75 0 2.925-1.35Q37 32.2 37 30.45v-6H11v6q0 1.75 1.175 3.1T15.1 34.9Z"/>
          </svg>
        </template>
      </dropdown-checkbox>
      <dropdown-checkbox label="Arrêts et Stations" :value="stopVisibility" @changeValue="changeStopVisibility($event)">
        <template #svg>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="6 5 36 36" stroke="currentColor">
            <path d="m6.25 46 5.7-29.3-4.9 2.15v6.7h-3v-8.7l9.4-4.05q1.35-.6 2.925-.325 1.575.275 2.375 1.575l2.1 3.3q1.4 2.25 3.575 3.725Q26.6 22.55 29.45 22.55v3q-3 0-5.75-1.4t-4.85-4.55l-1.95 7.65 4.45 4.15V46h-3V34.05l-5.2-4.95L9.35 46Zm12.5-35.7q-1.5 0-2.575-1.075Q15.1 8.15 15.1 6.65q0-1.5 1.075-2.575Q17.25 3 18.75 3q1.5 0 2.575 1.075Q22.4 5.15 22.4 6.65q0 1.5-1.075 2.575Q20.25 10.3 18.75 10.3Zm20.5 35.65L37.5 44.2l1.75-1.75H28v-2.5h11.25L37.5 38.2l1.75-1.75L44 41.2Zm-6.5-8.8L28 32.4l4.75-4.75 1.75 1.75-1.75 1.75H44v2.5H32.75l1.75 1.75Z"/>
          </svg>
        </template>
      </dropdown-checkbox>
    </ul>
  </div>



</template>

<script lang="ts">
import {DropdownCheckbox} from "#components";
import {defineComponent} from "vue";

export default defineComponent({
  name: "LayerMenu",
  components: {
    "dropdown-checkbox" : DropdownCheckbox
  },

  props: {
    busVisibility: {
      type: Boolean,
      required: true
    },
    stopVisibility: {
      type: Boolean,
      required: true
    }
  },

  methods:{
    changeBusVisibility(value : boolean){
      this.$emit("changeBusLineVisibility", value);
    },
    changeStopVisibility(value : boolean){
      this.$emit("changeStopVisibility", value);
    }
  }
});
</script>

<style scoped>

</style>