<template>
  <li>
    <a @click.passive.stop="clickLink">
      <slot name="svg" style="pointer-events: none;"></slot>
      <check-box :label="label" :checked="value" style="pointer-events: none;"></check-box>
    </a>
  </li>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import CheckBox from "~/components/generic/CheckBox.vue";

export default defineComponent({
  name: "DropdownCheckbox",
  components: {
    "check-box" : CheckBox
  },
  props: {
    label: {
      type: String,
      default: ""
    },
    value: {
      type : Boolean,
      default: true
    }
  },
  methods:{
    clickLink(){
      this.$emit("changeValue", !this.value);
    },
  }
});
</script>

<style scoped>

</style>