<template>
  <label class="label cursor-pointer content-between w-full p-0">
    <span class="label-text">{{ label }}</span>
    <input type="checkbox" @input.stop="changeValue" :checked="checked" class="checkbox checkbox-primary" />
  </label>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "CheckBox",
  props: {
    checked: {
      type: Boolean,
      default: true
    },
    label: {
      type: String,
      default: ""
    }
  },
  methods:{
    changeValue(e: any){
      this.$emit("changeValue", e.target.checked);
    }
  }
});
</script>

<style scoped>

</style>