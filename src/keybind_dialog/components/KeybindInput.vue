<template lang="pug">
  div
    div.button-container
      button.option.option__save(@click="updateKeybind") Save
      button.option.option__cancel(@click="closeWindow" style="margin-right: 0") Cancel
    div(v-if="!currentPressedKeycodes.length")
      <p style="margin: 0; text-align: center; margin: 10px 0;">Waiting for input...</p>
      div.loader(v-if="!currentPressedKeycodes.length")
    p.key-bind(v-else, style="margin-top: 20px; font-family: Roboto") {{keyCodesDisplay}}
</template>

<script lang="ts">
import hotkeys from 'hotkeys-js';
import { getKeycodeKeyName } from '@/utils';
import { Component, Emit } from 'vue-property-decorator';
import Vue from 'vue';
import { ChangeKeyboardShortcut } from '@/types';

@Component
export default class KeybindInput extends Vue {
  currentPressedKeycodes: number[] = [];

  get keyCodesDisplay(): string {
    return this.getKeyBind(true);
  }

  mounted() {
    hotkeys('*', { keyup: false }, () => {
      this.currentPressedKeycodes = hotkeys.getPressedKeyCodes();
    });
  }

  @Emit()
  closeWindow() {}

  getKeyBind(isDisplay: boolean) {
    const joinKey = isDisplay ? ' + ' : '+';
    return this.currentPressedKeycodes
      .map(kc => getKeycodeKeyName(kc, isDisplay))
      .join(joinKey);
  }

  @Emit()
  updateKeybind(): ChangeKeyboardShortcut {
    const keyBinds = {
      keyboardShortcutElectron: this.getKeyBind(false),
      keyboardShortcutDisplay: this.getKeyBind(true),
    };
    this.currentPressedKeycodes = [];
    return keyBinds;
  }

  resetKeybind() {
    this.currentPressedKeycodes = [];
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/keybind-dialog.scss';
</style>
