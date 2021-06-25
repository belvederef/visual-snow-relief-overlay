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

<style lang="scss">
/** Credits https://projects.lukehaas.me/css-loaders/ */
.loader,
.loader:after {
  border-radius: 50%;
  width: 10em;
  height: 10em;
}
.loader {
  margin: 0 auto;
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
  margin: 3px;
  margin-bottom: 0;
  width: 100%;
  transition-duration: 0.4s;
  background-color: white;
  color: black;
  font-size: 13px;
  padding: 6px 12px;

  &:hover {
    color: white;
  }

  &__save {
    &:hover {
      background-color: #4caf50;
    }
    border: 2px solid #4caf50;
  }

  &__cancel {
    &:hover {
      background-color: #a8230c;
    }
    border: 2px solid #a8230c;
  }
}

.key-bind {
  text-align: center;
  font-weight: bold;
  font-size: 25px;
}

.button-container {
  display: flex;
  flex-direction: row;
}
</style>
