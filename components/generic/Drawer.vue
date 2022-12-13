<template>
  <div class="drawer drawer-end">
    <input :id="drawerFor" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content">
      <slot name="page-content"></slot>
    </div>
    <div class="drawer-side">
      <label :for="drawerFor" class="drawer-overlay"></label>
      <div class="menu p-4 w-90 bg-base-100 text-base-content">
        <slot name="drawer-content"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Drawer",
  props: {
    drawerFor: {
      type: String,
      required: true,
    },
  },
}
</script>

<style scoped>

</style>