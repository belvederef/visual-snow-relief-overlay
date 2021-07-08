<template lang="pug">
  div
    keybind-input(
      @update-keybind="handleUpdate" 
      @close-window="closeWindow"
    )
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import KeybindInput from './components/KeybindInput.vue';

@Component({
  components: {
    KeybindInput,
  },
})
export default class App extends Vue {
  async handleUpdate(keyBinds: ChangeKeyboardShortcut) {
    await window.ipcRenderer.invoke('change-hotkey', keyBinds);
    this.closeWindow();
  }
  closeWindow() {
    window.ipcRenderer.invoke('close-keybind-dialog');
  }
}
</script>
