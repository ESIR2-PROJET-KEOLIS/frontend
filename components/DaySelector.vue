<template>
  <div class="btn-group mb-5">
    <input v-for="(day,i) in days"
           type="radio"
           name="options"
           @click="click((i+1===7 ? 0 : i+1))"
           :data-title="day"
           class="btn"
           :checked="isChecked((i+1===7 ? 0 : i+1))"
           :disabled="disabled"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: "DaySelector",
  data: () => ({
    days: ["L", "M", "M", "J", "V", "S", "D"]
  }),
  computed:{
    selectedIndex() : number{
      return (this.checkIndex < 0 ? 0 : (this.checkIndex > 6 ? 6 : this.checkIndex));
    },
  },
  methods:{
    isChecked(index:number) : boolean{
      return index === this.selectedIndex;
    },
    click(index:number){
      this.$emit("change", index);
    }
  },
  props: {
    disabled: {
      type: Boolean,
      required: true,
      default : true,
    },
    checkIndex: {
      type: Number,
      required: true,
      default : 0,
    },
  },
});
</script>

<style scoped>

</style>