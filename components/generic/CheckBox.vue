<template>
  <label class="label cursor-pointer content-between w-full p-0">
    <span class="label-text">{{ label }}</span>
    <input type="checkbox" @input="change" :checked="checked" class="checkbox checkbox-primary" />
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
    change(e: any){
      //this.$emit("change", e.target.checked);
      console.log(e);
    }
  }
});
</script>

<style scoped>

</style>