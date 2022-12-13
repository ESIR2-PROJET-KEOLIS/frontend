<template>
  <li>
    <a>
      <slot name="svg"></slot>
      <check-box :label="label"></check-box>
    </a>
  </li>
</template>

<script>


import CheckBox from "~/components/generic/CheckBox.vue";

export default {
  name: "DropdownCheckbox",
  components: {
    "check-box" : CheckBox
  },
  props: {
    label: {
      type: String,
      default: ""
    }
  }
}
</script>

<style scoped>

</style>