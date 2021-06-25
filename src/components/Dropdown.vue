<template lang="pug">
div(style="margin-top: 5px;")
  label.select(for='slct')
    select#slct(required v-model="selectedImageIdxValue")
      option(v-for="(option, idx) in options" :key="option.title" :value="idx") {{option.title}}
    svg
      use(xlink:href='#select-arrow-down')

  svg.sprites
    symbol#select-arrow-down(viewbox='0 0 10 6')
      polyline(points="1 1 5 5 9 1")
</template>

<script lang="ts">
import { BackgroundImage } from '@/types';
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class Dropdown extends Vue {
  @Prop(Array) readonly options!: BackgroundImage[];
  @Prop(Number) readonly selectedImageIdx!: number;

  get selectedImageIdxValue(): number {
    return this.selectedImageIdx;
  }

  set selectedImageIdxValue(value: number) {
    this.$emit('change', value);
  }
}
</script>

<style scoped>
/* Credits https://codepen.io/STKNG/pen/GbVogZ */
.select {
  position: relative;
  min-width: 200px;
}
.select svg {
  position: absolute;
  right: 12px;
  top: calc(50% - 3px);
  width: 10px;
  height: 6px;
  stroke-width: 2px;
  stroke: #9098a9;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  pointer-events: none;
}
.select select {
  -webkit-appearance: none;
  padding: 7px 40px 7px 12px;
  width: 250px;
  border: 1px solid #e8eaed;
  border-radius: 5px;
  background: #fff;
  box-shadow: 0 1px 3px -2px #9098a9;
  cursor: pointer;
  font-family: inherit;
  font-size: 16px;
  transition: all 150ms ease;
}
.select select:required:invalid {
  color: #5a667f;
}
.select select option {
  color: #223254;
}
.select select option[value=''][disabled] {
  display: none;
}
.select select:focus {
  outline: none;
  border-color: #07f;
  box-shadow: 0 0 0 2px rgba(0, 119, 255, 0.2);
}
.select select:hover + svg {
  stroke: #07f;
}
.sprites {
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;
  user-select: none;
}
</style>
