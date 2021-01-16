module.exports = {
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.ts',
      builderOptions: {
        appId: 'com.belvederef.vs-overlay',
        copyright: 'Copyright © 2020 Francesco Belvedere',
        productName: 'VS Relief',
        mac: {
          target: ['dmg', '7z'],
          category: 'public.app-category.utilities',
        },
        win: {
          target: ['portable', 'NSIS'],
        },
        linux: {
          target: ['AppImage', 'pacman'],
        },
        files: ['**/*', 'build/icons/*'],
      },
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
