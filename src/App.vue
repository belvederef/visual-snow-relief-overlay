<template lang="pug">
  #app
    img#background-img(
      :src="backgroundImages[0].path"
      :style="{ opacity }"
    )

    vue-draggable-resizable#vue-draggable(
      ref="vue-draggable"
      :w="isMenuOpen ? 600 : 50" 
      :h="isMenuOpen ? 500 : 80" 
      :parent="true"
      drag-handle=".drag-handle"
    )
      p.drag-handle ...
      div(@click="menuClick()")
        h4#open-menu-button {{ isMenuOpen? 'Back' : 'Menu' }}
      div#menu(v-show="isMenuOpen")
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
  // UI
  isMenuOpen = false;

  backgroundImages: Array<{ title: string; path: string }> = [
    {
      title: 'static 1',
      path: '/assets/static1.gif',
    },
  ];
  opacity = 0.1;

  menuClick() {
    // Transition only for opening/closing
    const draggableComp = this.$refs['vue-draggable'] as Vue;
    draggableComp.$el.classList.add('transition-active');
    this.isMenuOpen = !this.isMenuOpen;
    draggableComp.$el.classList.remove('trasition-active');
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
}
</style>

<style lang="scss" scoped>
$colour: red;

.transition-active {
  transition: ease-in-out 0.15s all;
}

#vue-draggable {
  background: white;
  border: solid 2px $colour;
  border-radius: 10px;
  color: $colour;

  .drag-handle {
    margin: 1px;
    padding: 1px;
    letter-spacing: 4px;
    font-weight: 700;
    cursor: grabbing;
  }

  #open-menu-button {
    cursor: pointer;
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
