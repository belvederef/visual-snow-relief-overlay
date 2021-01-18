module.exports = {
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.ts',
      builderOptions: {
        appId: 'com.belvederef.vs-overlay',
        copyright: 'Copyright © 2020 Francesco Belvedere',
        productName: 'VS Relief Overlay',
        mac: {
          target: ['dmg', '7z'],
          category: 'public.app-category.utilities',
        },
        win: {
          target: ['portable', 'NSIS'],
        },
        linux: {
          target: ['AppImage'],
        },
        files: ['**/*', 'build/icons/*'],
        publish: [
          {
            provider: 'github',
            owner: 'belvederef',
            repo: 'visual-snow-relief-overlay',
          },
        ],
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
