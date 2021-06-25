<template>
  <div class="neumorphism-toggle">
    <input type="checkbox" id="neumorphism" v-model="checkedValue" />
    <label for="neumorphism">
      <div class="switch">
        <div class="dot"></div>
      </div>
      <span>{{ label }}</span>
    </label>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Checkbox extends Vue {
  @Prop(String) readonly label!: string;
  @Prop(Boolean) readonly checked!: boolean;

  get checkedValue(): boolean {
    return this.checked;
  }

  set checkedValue(value: boolean) {
    this.$emit('change', value);
  }
}
</script>
<style lang="scss">
/** Credits https://codepen.io/aaroniker/pen/qBdZEjQ */
.neumorphism-toggle {
  position: relative;
  & input {
    display: none;
    & + label {
      background: #fff;
      border-radius: 9px;
      padding: 16px 0 16px 20px;
      min-width: 208px;
      display: block;
      cursor: pointer;
      position: relative;
      box-shadow: -12px -12px 24px var(--light-shadow, transparent),
        12px 12px 24px var(--shadow, transparent);
      transition: box-shadow 0.4s;
      &:before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        border-radius: inherit;
        opacity: var(--gradient, 0);
        transition: opacity 0.4s;
      }
      .switch {
        position: relative;
        display: inline-block;
        z-index: 1;
        vertical-align: top;
        height: 22px;
        width: 40px;
        border-radius: 11px;
        background: #eceffc;
        &:before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          border-radius: inherit;
          background: linear-gradient(90deg, #4f97ff, #275efe);
          opacity: var(--gradient, 0);
          transition: opacity 0.4s;
        }
        .dot {
          background: #d1d6ee;
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          left: -1px;
          top: -1px;
          transform: translateX(var(--offset, 0));
          transition: transform 0.4s, box-shadow 0.4s;
          box-shadow: -4px -4px 8px var(--light-shadow-2, transparent),
            4px 4px 8px var(--shadow, transparent);
          &:before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            border-radius: inherit;
            background: linear-gradient(160deg, #f1f4ff, #f9faff);
            opacity: var(--gradient, 0);
            transition: opacity 0.4s;
          }
        }
      }
      span {
        line-height: 22px;
        font-size: 16px;
        color: var(--text, #646b8c);
        font-weight: 500;
        display: inline-block;
        vertical-align: top;
        z-index: 1;
        position: relative;
        margin-left: 12px;
        transition: color 0.4s;
      }
      & + span {
        text-align: center;
        display: block;
        position: absolute;
        left: 0;
        right: 0;
        top: 100%;
        opacity: 0;
        font-size: 12px;
        font-weight: 500;
        color: #a6accd;
        transform: translateY(4px);
        transition: opacity 0.4s, transform 0.4s;
      }
    }

    &:checked {
      & + label {
        --offset: 18px;
        --text: #404660;
        --gradient: 1;
      }
    }
  }
}
</style>
