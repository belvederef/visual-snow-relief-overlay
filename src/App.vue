<template lang="pug">
  #app(
    @keyup.esc.exact="menuToggle()"
    :tabindex="0"
  )
    img#background-img(
      :src="backgroundImages[selectedImgIdx].path"
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
      div.drag-handle.menu-top-bar
        button(@click="menuToggle()") –
        button x
      div#menu
        .group
          label Image
            br
            select(@change="selectedImgIdx = +$event.target.value")
              option(
                v-for="(img, idx) in backgroundImages"
                :value="idx"
                :selected="idx === selectedImgIdx"
              ) {{ img.title }}

        .group
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

  selectedImgIdx = 0;
  backgroundImages: Array<{ title: string; path: string }> = [
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
  opacity = 0.1;

  async menuToggle() {
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

.drag-handle.menu-top-bar {
  margin: 1px;
  padding: 1px 7px 1px 1px;
  letter-spacing: 4px;
  font-weight: 700;
  cursor: grabbing;
  text-align: right;

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
  color: $colour;

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
}
</style>
