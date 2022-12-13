<template>
  <label class="label cursor-pointer">
    <span class="label-text text-lg">{{ text }}</span>
    <input @change="toggle" type="checkbox" class="toggle toggle-primary toggle-lg" :checked="checked" />
  </label>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "ToggleButton",
  props: {
    text: {
      type: String,
      required: false,
      default : "",
    },
    checked: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  methods:{
    toggle(event:any){
      this.$emit("toggle", event.srcElement.checked);
    }
  }
});
</script>

<style scoped>

</style>