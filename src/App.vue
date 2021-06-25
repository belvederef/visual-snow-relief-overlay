<template lang="pug">
  #app
    img#background-img(
      :src="backgroundImages[settings.selectedImgIdx].path"
      :style="{ opacity: cssOpacity }"
    )

    vue-draggable-resizable#vue-draggable(
      v-show="isPrimaryDisplay && isMenuOpen"
      ref="vue-draggable"
      :w="menu.w" 
      :h="menu.h"
      :x="menu.x" 
      :y="menu.y"
      :parent="true"
      drag-handle=".drag-handle"
    )
      div.drag-handle.menu-top-bar
        .left-aligned
          a(
            href="https://ko-fi.com/belvederef"
            target="_blank"
          )
            img#support-button(src="/assets/support.png")
        .right-aligned
          button.button__traffic.button__traffic__minimize(@click="menuToggle()") –
          button.button__traffic.button__traffic__close(@click="closeWindow()") x
      div#menu
        .group
          label Choose background
            br
            dropdown(@change="onBackgroundImgChange" :options="backgroundImages" :selectedImageIdx="settings.selectedImgIdx")
        .group
          label Opacity level
            vue-slider.slider(
              :enable-cross="false"
              :value="settings.opacity"
              :min="1"
              :max="16"
              :adsorb="true"
              :interval="1"
              :marks="true"
              @change="onOpacityChange"
            )
      div.info
        button#register-keybind-button(@click="openRegisterKeybindDialog") Register new keybind for menu
        p Press {{this.settings.keyboardShortcutDisplay}} to open/close this menu at any time
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ClickOutside from 'vue-click-outside';
import VueSlider from 'vue-slider-component';
import Dropdown from '@/components/Dropdown.vue';
import { Settings, ChangeKeyboardShortcut, BackgroundImage } from '@/types';

import 'vue-slider-component/theme/antd.css';

const DEFAULT_SETTINGS: Settings = {
  opacity: 8,
  keyboardShortcutElectron: 'CommandOrControl+Alt+0',
  keyboardShortcutDisplay: 'Ctrl+Alt+0',
  selectedImgIdx: 0,
};

@Component({
  components: {
    VueSlider,
    Dropdown,
  },
  directives: {
    ClickOutside,
  },
})
export default class App extends Vue {
  /** UI */
  isMenuOpen = true;
  menu = {
    w: 600,
    h: 500,
    get x() {
      return window.innerWidth / 2 - this.w / 2;
    },
    get y() {
      return window.innerHeight / 2 - this.h / 2;
    },
  };
  isPrimaryDisplay = new URLSearchParams(window.location.search).get('monitor-idx') === '1';
  backgroundImages: BackgroundImage[] = [
    {
      title: 'Black & White 1',
      path: '/assets/static1.gif',
    },
    {
      title: 'Black & White 2',
      path: '/assets/static2.gif',
    },
    {
      title: 'Black & White Pixelated',
      path: '/assets/static4.gif',
    },
    {
      title: 'Fine Dots',
      path: '/assets/static6.gif',
    },
    {
      title: 'Colour 1',
      path: '/assets/static3.gif',
    },
  ];

  privateSettings = ((): Settings => {
    // Load saved settings
    const storedSettings = localStorage.getItem('settings');
    if (storedSettings) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
    }
    return DEFAULT_SETTINGS;
  })();
  get settings(): Settings {
    return this.privateSettings;
  }
  set settings(settings) {
    this.privateSettings = settings;
    localStorage.setItem('settings', JSON.stringify(this.privateSettings));
  }
  get cssOpacity(): number {
    return this.settings.opacity / 200;
  }

  async menuToggle() {
    await window.ipcRenderer.invoke('is-mouse-active', !this.isMenuOpen);

    // Transition only for opening/closing
    const compClasses = (this.$refs['vue-draggable'] as Vue).$el.classList;
    compClasses.add('transition-active');
    this.isMenuOpen = !this.isMenuOpen;
    compClasses.remove('trasition-active');
  }

  onOpacityChange(opacity: number) {
    window.ipcRenderer.invoke('change-overlay-opacity', opacity);
  }

  onBackgroundImgChange(idx: number) {
    window.ipcRenderer.invoke('change-background-img', idx);
  }
  logToConsole(loggable: unknown) {
    window.ipcRenderer.invoke('log', JSON.stringify(loggable));
  }

  openRegisterKeybindDialog() {
    window.ipcRenderer.invoke('open-keybind-dialog');
  }

  closeWindow() {
    window.ipcRenderer.invoke('close-app');
  }

  mounted() {
    if (this.isPrimaryDisplay) {
      window.ipcRenderer.on('menu-hotkey-pressed', () => {
        this.menuToggle();
      });
      const { keyboardShortcutElectron, keyboardShortcutDisplay } = this.settings;
      window.ipcRenderer.invoke('change-keyboard-shortcut', {
        keyboardShortcutElectron,
        keyboardShortcutDisplay,
      });
    }

    window.ipcRenderer.on('change-overlay-opacity', (_, opacity: number) => {
      this.settings = { ...this.settings, opacity };
    });
    window.ipcRenderer.on('change-background-img', (_, selectedImgIdx: number) => {
      this.settings = { ...this.settings, selectedImgIdx };
    });
    window.ipcRenderer.on(
      'change-keyboard-shortcut',
      (_, keyBinds: ChangeKeyboardShortcut) => {
        this.settings = {
          ...this.settings,
          ...keyBinds,
        };
      },
    );
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
}
</style>

<style lang="scss" scoped>
$textColor: rgb(41, 41, 41);

.button {
  &__traffic {
    color: white;
    border: none;
    width: 28px;
    height: 28px;
    font-weight: bold;
    border-radius: 60px;
    cursor: pointer;
    transition: 0.4s;

    &__close {
      $closeBkg: rgb(226, 71, 71);
      background-color: $closeBkg;

      &:hover {
        background-color: darken($closeBkg, 5%);
      }
    }

    &__minimize {
      $minimizeBkg: rgb(240, 200, 68);
      background-color: $minimizeBkg;

      &:hover {
        background-color: darken($minimizeBkg, 5%);
      }
    }
  }
}

.info {
  width: inherit;
  position: absolute;
  bottom: 0;
}

.transition-active {
  transition: ease-in-out 0.15s;
}

.drag-handle.menu-top-bar {
  margin: 1px;
  padding: 1px 7px 1px 1px;
  letter-spacing: 4px;
  font-weight: 700;
  cursor: grabbing;
  display: grid;
  grid-template-columns: 50% 50%;

  .left-aligned {
    text-align: left;
  }
  .right-aligned {
    text-align: right;
  }

  #support-button {
    margin: 5px 0 0 5px;
    height: 2.3em;
  }
  button {
    cursor: pointer;
    margin: 9px 3px;
    font-size: 16px;
  }
}

#vue-draggable {
  background: white;
  border: solid 1px #a3a3a3;
  border-radius: 6px;
  color: $textColor;

  &:hover {
    box-shadow: 0 0 11px rgba(33, 33, 33, 0.2);
  }

  #menu {
    padding: 10px;
    border-radius: 5px;
    min-width: 500px;
    font-weight: 700;

    .group {
      background: rgb(245, 245, 245);
      padding: 30px;
      border-bottom: solid 1px #a3a3a3;
    }

    .slider {
      padding: 10px !important;
    }
  }
}

#background-img {
  pointer-events: none;
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: -1;
}
#app {
  display: grid;
  min-height: 100vh;
  flex-direction: column;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    'Open Sans', 'Helvetica Neue', sans-serif;
  overflow: hidden;
}

$register-bkg: rgb(18, 79, 119);
#register-keybind-button {
  background-color: $register-bkg;
  color: white;
  border: 1px solid black;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.4s;
  &:hover {
    background-color: darken($register-bkg, 5%);
  }
}
</style>
