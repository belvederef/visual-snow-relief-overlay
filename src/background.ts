'use strict';

import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  shell,
  screen,
} from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

const wins: Array<BrowserWindow> = [];
async function createWindow(display: Electron.Display) {
  // Create the browser window.
  const win = new BrowserWindow({
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    // @ts-ignore global var
    icon: path.join(__static, 'icon.png'),
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: (process.env.ELECTRON_NODE_INTEGRATION as unknown) as boolean,
      // contextIsolation: true,
      preload: path.join(app.getAppPath(), 'preload.js'),
    },
  });
  win.setPosition(display.bounds.x, display.bounds.y);
  win.maximize();

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}?monitor-idx=${wins.length + 1}`);
    // if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL(`app://./index.html?monitor-idx=${wins.length + 1}`);
  }
  wins.push(win);
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    for (const display of screen.getAllDisplays()) {
      await createWindow(display);
    }
  }
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}

// Custom events
ipcMain.handle('is-mouse-active', async (_, isMouseActive) => {
  if (!wins.length) return;
  wins.forEach(w => w.setIgnoreMouseEvents(!isMouseActive));
});
ipcMain.handle('change-overlay-opacity', async (_, opacity: number) => {
  wins.forEach(w => w.webContents.send('change-overlay-opacity', opacity));
});
ipcMain.handle('change-background-img', async (_, imgIdx: number) => {
  wins.forEach(w => w.webContents.send('change-background-img', imgIdx));
});
ipcMain.handle('close-app', async () => {
  app.quit();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // necessary to make the app transparent
  await new Promise(r => setTimeout(r, 500));

  // Register menu open/close hotkey
  globalShortcut.register('CommandOrControl+Alt+0', () => {
    wins.forEach(w => w.webContents.send('menu-hotkey-pressed'));
  });

  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  for (const display of screen.getAllDisplays()) {
    await createWindow(display);
  }
  await autoUpdater.checkForUpdatesAndNotify();

  wins.forEach(w => {
    // Open links in default browser
    w.webContents.on('new-window', (e, url) => {
      e.preventDefault();
      shell.openExternal(url);
    });

    w.on('close', _ => {
      // Remove window from list of windows
      wins.splice(w.id - 1, 1);
    });
  });
});

// Flags needed on linux to make the overlay transparent
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('enable-transparent-visuals');
  app.commandLine.appendSwitch('disable-gpu');
  setInterval(() => {
    // Hotfix for linux that does not place the window always on top
    // Waiting for fix from electron
    wins.forEach(w => !w.isDestroyed() && w.setAlwaysOnTop(true));
  }, 300);
}
