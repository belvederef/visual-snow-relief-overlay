module.exports = {
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.ts',
    },
  },
  css: {
    loaderOptions: {
      css: {
        sourceMap: true,
      },
      sass: {
        sourceMap: true,
      },
    },
  },
};
