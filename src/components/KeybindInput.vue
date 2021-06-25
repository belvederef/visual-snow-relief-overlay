<template lang="pug">
  div
    button(v-if="!isRegisteringShortcut" @click="isRegisteringShortcut = true") Register new keyboard shortcut
    div(v-else)
      button.option(@click="updateKeybind") Save
      button.option(@click="resetKeybind") Reset
      button.option(@click="isRegisteringShortcut = false" style="margin-right: 0") Cancel
      br
      div.loader(v-if="!currentPressedKeycodes.length")
      p(v-else, style="margin-top: 5px;") {{keyCodesDisplay}}
</template>

<script lang="ts">
import hotkeys from 'hotkeys-js';
import { getKeycodeKeyName } from '@/utils';
import { Component, Emit, Watch } from 'vue-property-decorator';
import Vue from 'vue';
import { ChangeKeyboardShortcut } from '@/types';
@Component
export default class KeybindInput extends Vue {
  isRegisteringShortcut = false;
  currentPressedKeycodes: number[] = [];

  get keyCodesDisplay(): string {
    return this.getKeyBind(true);
  }

  getKeyBind(isDisplay: boolean) {
    return this.currentPressedKeycodes.map(kc => getKeycodeKeyName(kc, isDisplay)).join('+');
  }

  @Watch('isRegisteringShortcut')
  onIsRegisteringShortcutChanged(newVal: boolean) {
    if (!newVal) hotkeys.unbind('*');
    else
      hotkeys('*', { keyup: false }, (e, handler) => {
        this.currentPressedKeycodes = hotkeys.getPressedKeyCodes();
      });
  }

  @Emit()
  updateKeybind(): ChangeKeyboardShortcut {
    this.isRegisteringShortcut = false;
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

<style>
.loader,
.loader:after {
  border-radius: 50%;
  width: 10em;
  height: 10em;
}
.loader {
  margin: 10px auto;
  font-size: 3px;
  position: relative;
  text-indent: -9999em;
  border-top: 1.1em solid rgba(13, 197, 193, 0.2);
  border-right: 1.1em solid rgba(13, 197, 193, 0.2);
  border-bottom: 1.1em solid rgba(13, 197, 193, 0.2);
  border-left: 1.1em solid #0dc5c1;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-animation: load8 1.1s infinite linear;
  animation: load8 1.1s infinite linear;
}
@-webkit-keyframes load8 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes load8 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

.option {
  margin-right: 5px;
}
</style>
