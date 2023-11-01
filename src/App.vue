<template lang="pug">
  #app
    div#static-wrapper(:style="staticStyles")

    vue-draggable-resizable#vue-draggable(
      v-show="shouldShowScreen"
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
        .center-aligned
          button.play-pause.play-pause__start(
            v-if="isPaused"
            @click="onPlayPauseButtonPress" 
          ) Play
          button.play-pause.play-pause__stop(
            v-else
            @click="onPlayPauseButtonPress"
          ) Pause
        .right-aligned
          button.button__traffic.button__traffic__minimize(@click="menuToggle()") –
          button.button__traffic.button__traffic__close(@click="closeWindow()") x
      div#menu
        .group
          label Choose background
            br
            dropdown(
              @change="onBackgroundImgChange" 
              :options="backgroundImages" 
              :selected-idx="settings.selectedImgIdx"
            )
          br
          div(style="display: flex; flex-align: row; justify-content: space-between;")
            label Choose interval
              br
              dropdown(
                @change="onIntervalChange" 
                :options="intervals" 
                :selected-idx="settings.selectedIntervalIdx"
              )
            br
            label Choose pause
              br
              dropdown(
                @change="onPauseChange" 
                :options="pauses" 
                :selected-idx="settings.selectedPauseIdx" 
                :is-disabled="settings.selectedIntervalIdx === 0"
              )
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
          br
          br
          label Speed
            vue-slider.slider(
              :enable-cross="false"
              :value="settings.speed"
              :min="0"
              :max="MAX_SPEED"
              :adsorb="true"
              :interval="1"
              :marks="true"
              @change="onSpeedChange"
            )
      div.info
        checkbox(
          label="See this screen the next time", 
          :checked="settings.showScreenNextTime" 
          @change="onShowNextTimeChange"
        )
        button#register-keybind-button(
          @click="openRegisterKeybindDialog"
        ) Register new keybind for menu
        p Press {{ this.settings.keyboardShortcutDisplay }} to open/close this menu at any time
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import VueSlider from 'vue-slider-component';
import Dropdown from '@/components/Dropdown.vue';
import Checkbox from '@/components/Checkbox.vue';
import backgroundImagesData from '@/data/backgrounds';
import { INTERVALS, PAUSES } from '@/data/timer';

import 'vue-slider-component/theme/antd.css';

const DEFAULT_SETTINGS: Settings = {
  speed: 10,
  opacity: 8,
  keyboardShortcutElectron: 'CommandOrControl+Alt+0',
  keyboardShortcutDisplay: 'Ctrl+Alt+0 (or Cmd+Option+0 on Mac)',
  selectedImgIdx: 0,
  selectedPauseIdx: 0,
  selectedIntervalIdx: 0,
  showScreenNextTime: true,
};

const MENU_SIZE = {
  WIDTH: 600,
  HEIGHT: 600,
};

@Component({
  components: {
    VueSlider,
    Checkbox,
    Dropdown,
  }
})
export default class App extends Vue {
  /** UI */
  MAX_SPEED = 20;
  activeTimeout: NodeJS.Timer | null = null;
  pauseTimeout: NodeJS.Timer | null = null;
  isMenuOpen = false;
  showScreenThisTime = false;
  wasHotkeyPressed = false;
  menu = {
    w: MENU_SIZE.WIDTH,
    h: MENU_SIZE.HEIGHT,
    get x() {
      return window.innerWidth / 2 - this.w / 2;
    },
    get y() {
      return window.innerHeight / 2 - this.h / 2;
    },
  };
  isPrimaryDisplay = new URLSearchParams(window.location.search).get('monitor-idx') === '1';
  backgroundImages = backgroundImagesData;
  isPaused = false;
  intervals = INTERVALS;
  pauses = PAUSES;

  privateSettings = ((): Settings => {
    // Load saved settings
    const storedSettings = localStorage.getItem('settings');
    return storedSettings
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) }
      : DEFAULT_SETTINGS;
  })();

  get staticStyles(): StaticStylesInterface {
    const { path, steps } = this.backgroundImages[this.settings.selectedImgIdx];
    return {
      '--static-background': `url(${path})`,
      '--static-opacity': this.cssOpacity,
      '--static-steps': steps,
      '--static-animation-duration': this.overlayAnimationDuration + 's',
    };
  }

  get settings(): Settings {
    return this.privateSettings;
  }

  get activeTimeMs(): number {
    return this.intervals[this.settings.selectedIntervalIdx].value * 60 * 1000;
  }

  get pauseTimeMs(): number {
    return this.pauses[this.settings.selectedPauseIdx].value * 60 * 1000;
  }

  set settings(settings) {
    this.privateSettings = settings;
    localStorage.setItem('settings', JSON.stringify(this.privateSettings));
  }

  get cssOpacity(): number {
    return this.isPaused ? 0 : this.settings.opacity / 200;
  }

  get overlayAnimationDuration(): string {
    if (this.settings.speed === 0) return '0';
    return ((this.MAX_SPEED + 1 - this.settings.speed) / 15).toFixed(1);
  }

  get shouldShowScreen(): boolean {
    return (
      (this.showScreenThisTime || this.wasHotkeyPressed) &&
      this.isMenuOpen &&
      this.isPrimaryDisplay
    );
  }

  async menuToggle() {
    await window.ipcRenderer.invoke('is-mouse-active', !this.isMenuOpen);

    // Transition only for opening/closing
    const compClasses = (this.$refs['vue-draggable'] as Vue).$el.classList;
    compClasses.add('transition-active');
    this.isMenuOpen = !this.isMenuOpen;
    compClasses.remove('trasition-active');
  }

  onIntervalChange(intervalIdx: number) {
    window.ipcRenderer.invoke('change-interval', intervalIdx);
  }

  onPauseChange(pauseIdx: number) {
    window.ipcRenderer.invoke('change-pause', pauseIdx);
  }

  onOpacityChange(opacity: number) {
    window.ipcRenderer.invoke('change-overlay-opacity', opacity);
  }

  onSpeedChange(speed: number) {
    window.ipcRenderer.invoke('change-overlay-speed', speed);
  }

  onShowNextTimeChange(showScreenNextTime: boolean) {
    this.settings = { ...this.settings, showScreenNextTime };
  }

  onBackgroundImgChange(idx: number) {
    window.ipcRenderer.invoke('change-overlay-image', idx);
  }

  onPlayPauseButtonPress() {
    window.ipcRenderer.invoke('change-play-status', !this.isPaused);
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

  updateSettings(params: Partial<Settings>) {
    this.settings = { ...this.settings, ...params };
  }

  setUpHotkeyListener() {
    window.ipcRenderer.on('menu-hotkey-pressed', () => {
      // flag used for the showScreenThisTime routine
      this.wasHotkeyPressed = true;
      this.menuToggle();
    });
  }

  /**
   * Sets the hotkey for opening the menu
   */
  setUpHotkey() {
    const { keyboardShortcutElectron, keyboardShortcutDisplay } = this.settings;
    window.ipcRenderer.invoke('change-hotkey', {
      keyboardShortcutElectron,
      keyboardShortcutDisplay,
    });
  }

  /**
   * Checks if we show the config screen and ignores mouse events if we don't
   */
  initShowScreen() {
    const { showScreenNextTime } = this.settings;

    window.ipcRenderer.invoke('set-show-screen-this-time', showScreenNextTime);
    if (showScreenNextTime) {
      this.showScreenThisTime = true;
      this.isMenuOpen = true;
    }
  }

  startTimers() {
    const startPauseTimer = () => {
      this.pauseTimeout = setTimeout(() => {
        this.isPaused = false;
        startActiveTimer();
      }, this.pauseTimeMs);
    };
    const startActiveTimer = () => {
      if (!this.activeTimeMs) return;
      this.activeTimeout = setTimeout(() => {
        this.isPaused = true;
        startPauseTimer();
      }, this.activeTimeMs);
    };
    if (this.activeTimeout) clearTimeout(this.activeTimeout);
    if (this.pauseTimeout) clearTimeout(this.pauseTimeout);
    this.isPaused = false;
    startActiveTimer();
  }

  handleSettingsChanges() {
    const eventsToListenTo = {
      opacity: 'change-overlay-opacity',
      speed: 'change-overlay-speed',
      selectedImgIdx: 'change-overlay-image',
      selectedPauseIdx: 'change-pause',
    } as Record<keyof Settings, string>;

    Object.entries(eventsToListenTo).forEach(([k, v]) => {
      window.ipcRenderer.on(v, (_, setting) => {
        this.updateSettings({ [k]: setting });
      });
    });

    window.ipcRenderer.on('change-play-status', (_, status: boolean) => {
      this.isPaused = status;
    });

    window.ipcRenderer.on('change-hotkey', (_, keyBinds: ChangeKeyboardShortcut) => {
      this.updateSettings(keyBinds);
    });

    window.ipcRenderer.on('change-interval', (_, selectedIntervalIdx: number) => {
      this.updateSettings({ selectedIntervalIdx });
      this.startTimers();
    });
  }

  setUpTimer() {
    window.ipcRenderer.on('setup-timers', () => {
      window.ipcRenderer.invoke('change-pause', this.settings.selectedPauseIdx);
      window.ipcRenderer.invoke('change-interval', this.settings.selectedIntervalIdx);
    });
  }

  mounted() {
    if (this.isPrimaryDisplay) {
      // called only once from this display so we
      // know we have the good one set up
      this.setUpHotkey();
      this.setUpHotkeyListener();
      this.initShowScreen();
      this.setUpTimer();
    }

    // those need to be handled in every BrowserWindow
    this.handleSettingsChanges();
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
}
</style>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';
</style>
