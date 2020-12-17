<template lang="pug">
  #app(
    @keyup.esc.exact="menuToggle()"
    :tabindex="0"
  )
    img#background-img(
      :src="backgroundImages[0].path"
      :style="{ opacity }"
    )

    vue-draggable-resizable#vue-draggable(
      v-show="isMenuOpen"
      ref="vue-draggable"
      :w="menu.w" 
      :h="menu.h"
      :x="menu.x" 
      :y="menu.y"
      :parent="true"
      drag-handle=".drag-handle"
    )
      p.drag-handle ...
      div(@click="menuToggle()")
        h4#open-menu-button Exit
      div#menu
        label Opacity level
          vue-slider.slider(
            :enable-cross="false"
            :value="opacity"
            :min="0.05"
            :max="0.5"
            :adsorb="true"
            :interval="0.05"
            :marks="value => ({ label: value })"
            @change="opacity = $event"
          )

</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ClickOutside from 'vue-click-outside';
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/antd.css';
import { debounce } from 'lodash';

@Component({
  components: {
    VueSlider,
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

  backgroundImages: Array<{ title: string; path: string }> = [
    {
      title: 'static 1',
      path: '/assets/static1.gif',
    },
  ];
  opacity = 0.1;

  async menuToggle() {
    // TODO: CATCH THE TOGGLE FROM ANYWHERE. PROB NEED TO CATCH FROM ELECTRON MAIN
    await window.ipcRenderer.invoke('is-mouse-active', !this.isMenuOpen);

    // Transition only for opening/closing
    const compClasses = (this.$refs['vue-draggable'] as Vue).$el.classList;
    compClasses.add('transition-active');
    this.isMenuOpen = !this.isMenuOpen;
    compClasses.remove('trasition-active');
  }

  mounted() {
    window.ipcRenderer.on('menu-hotkey-pressed', () => {
      this.menuToggle();
    });
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
}
</style>

<style lang="scss" scoped>
$colour: rgb(41, 41, 41);

.transition-active {
  transition: ease-in-out 0.15s;
}

#vue-draggable {
  background: white;
  border: solid 1px #a3a3a3;
  border-radius: 6px;
  color: $colour;

  &:hover {
    box-shadow: 0 0 11px rgba(33, 33, 33, 0.2);
  }

  .drag-handle {
    margin: 1px;
    padding: 1px;
    letter-spacing: 4px;
    font-weight: 700;
    cursor: grabbing;
  }

  #open-menu-button {
    cursor: pointer;
    margin: 9px 0 0 0;
    padding: 15px 2px;
  }
  #menu {
    background: rgb(245, 245, 245);
    padding: 10px;
    // border: solid 1px rgb(209, 208, 208);
    border-radius: 5px;
    min-width: 500px;
    font-weight: 700;
    // font-size: 1.2em;

    .slider {
      padding: 10px !important;
      margin: 10px;
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
}
</style>
