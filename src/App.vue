<template lang="pug">
  #app
    img(:src="backgroundImages[0].path")

</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class App extends Vue {
  backgroundImages: Array<{ title: string; path: string }> = [
    {
      title: 'static 1',
      path: '/assets/static1.gif',
    },
  ];
}
</script>

<style lang="scss">
html {
  opacity: 0.4;
}
</style>

<style lang="scss" scoped>
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
