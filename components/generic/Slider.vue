<template>
  <input class="mb-2 range range-primary" @input="change" type="range" :min="min" :max="max" :value="value" :disabled="disabled"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: "Slider",
  props: {
    min: {
      type: Number,
      required: false,
      default: 0,
    },
    max: {
      type: Number,
      required: false,
      default: 100,
    },
    disabled: {
      type: Boolean,
      required: true,
      default : false,
    },
    value: {
      type: Number,
      required: true,
      default : 0,
    },
  },
  methods:{
    change(event:any){
      this.$emit("change", +event.srcElement.value);
      this.$emit("update:value", +event.srcElement.value);
    }
  }
});
</script>

<style scoped>

</style>