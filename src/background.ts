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
import { IpcMainInvokeEvent } from 'electron/main';

const isDevelopment = process.env.NODE_ENV !== 'production';

let oldKeyboardShortcut: string | null = null;
let keyBindDialog: BrowserWindow | null = null;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

// Use pluginOptions.nodeIntegration, leave this alone
// See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
const nodeIntegration = (process.env.ELECTRON_NODE_INTEGRATION as unknown) as boolean;
const preloadPath = path.join(app.getAppPath(), 'preload.js');

const loadWinUrl = async (win: BrowserWindow, path: string) => {
  const devServer = process.env.WEBPACK_DEV_SERVER_URL;
  const baseScheme = devServer || 'app://./';
  if (!devServer) createProtocol('app');
  await win.loadURL(`${baseScheme}${path}`);
};

const wins: BrowserWindow[] = [];

const createWindow = async (
  display: Electron.Display,
  onReadyCb: (w: BrowserWindow) => Promise<void> = async () => {},
) => {
  // Create the browser window.
  const win = new BrowserWindow({
    transparent: true,
    frame: false,
    focusable: process.platform !== 'linux',
    hasShadow: false,
    // @ts-ignore global var
    icon: path.join(__static, 'icon.png'),
    webPreferences: {
      nodeIntegration,
      // contextIsolation: true,
      preload: preloadPath,
    },
  });
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setPosition(display.bounds.x, display.bounds.y);
  win.setSize(display.size.width, display.size.height);
  const waitForShow = new Promise(resolve => {
    win.once('ready-to-show', async () => {
      await onReadyCb(win);
      resolve(true);
    });
  });
  await loadWinUrl(win, `index.html?monitor-idx=${wins.length + 1}`);
  await waitForShow;
  wins.push(win);
};

const setIgnoreMouseEvents = (ignore: boolean = true) => {
  wins.forEach(w => w.setIgnoreMouseEvents(ignore));
};

const createKeybindDialog = async () => {
  if (keyBindDialog) return;
  const primaryWindow = wins[0];
  keyBindDialog = new BrowserWindow({
    width: 300,
    height: 150,
    modal: true,
    frame: true,
    parent: primaryWindow,
    webPreferences: {
      nodeIntegration,
      preload: preloadPath,
    },
  });
  const { width: primaryDisplayWidth } = screen.getPrimaryDisplay().bounds;
  // We do this for Linux, because it can't be on top so we kinda make sure it's not below
  keyBindDialog.setPosition(primaryDisplayWidth - keyBindDialog.getSize()[0] - 100, 100);
  // it's on top but it can't be on top of a non-focusable window in Linux
  keyBindDialog.setAlwaysOnTop(true, 'screen-saver');
  keyBindDialog.removeMenu();
  keyBindDialog.once('ready-to-show', () => {
    keyBindDialog!.focus();
    keyBindDialog!.show();
    setIgnoreMouseEvents(true);
  });
  keyBindDialog.once('close', () => {
    setIgnoreMouseEvents(false);
    keyBindDialog = null;
  });
  loadWinUrl(keyBindDialog, 'keybind_dialog.html');
};

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

type IpcListener = (event: IpcMainInvokeEvent, ...args: any[]) => any;

/**
 * Forwards the event to all the windows
 * @returns a tuple of the channel name and the listener function
 */
const sendPropsToAll = (channel: string): [string, IpcListener] => {
  return [channel, (_, ...args) => wins.forEach(w => w.webContents.send(channel, ...args))];
};

/**
 * Custom events
 */
ipcMain.handle('is-mouse-active', async (_, isMouseActive: boolean) => {
  // If there's a keyBindDialog on the screen, we can't toggle,
  // otherwise mouse events reset and it can't be clicked
  if (!wins.length || keyBindDialog) return;
  wins.forEach(w => w.setIgnoreMouseEvents(!isMouseActive));
});
ipcMain.handle(...sendPropsToAll('change-overlay-opacity'));
ipcMain.handle(...sendPropsToAll('change-overlay-speed'));
ipcMain.handle(...sendPropsToAll('change-play-status'));
ipcMain.handle(...sendPropsToAll('change-overlay-image'));
ipcMain.handle(...sendPropsToAll('change-interval'));
ipcMain.handle(...sendPropsToAll('change-pause'));
/**
 * Register menu open/close hotkey
 * We don't need to wait for all the windows as this is
 * invoked from main screen only
 */
ipcMain.handle('change-hotkey', (_, keyBinds: ChangeKeyboardShortcut) => {
  const { keyboardShortcutDisplay, keyboardShortcutElectron } = keyBinds;
  if (oldKeyboardShortcut) globalShortcut.unregister(oldKeyboardShortcut);
  globalShortcut.register(keyboardShortcutElectron, () => {
    wins.forEach(w => w.webContents.send('menu-hotkey-pressed'));
  });
  oldKeyboardShortcut = keyboardShortcutElectron;
  wins.forEach(w =>
    w.webContents.send('change-hotkey', {
      keyboardShortcutElectron,
      keyboardShortcutDisplay,
    }),
  );
});
ipcMain.handle('close-app', () => {
  app.quit();
});
ipcMain.handle('open-keybind-dialog', createKeybindDialog);
ipcMain.handle('close-keybind-dialog', () => {
  if (keyBindDialog) keyBindDialog.close();
});

/**
 * Helper method called from frontend to log to the
 * terminal instead of enabling dev tools
 */
ipcMain.handle('log', (_, loggable: any) => {
  console.log(JSON.stringify(loggable));
});

/**
 * The listener is set up before the windows are loaded as promises
 * are lazy, so we won't miss it
 */
const checkIfShouldShowScreen: Promise<boolean> = new Promise(resolve => {
  ipcMain.handle('set-show-screen-this-time', (_, shouldShowScreenThisTime: boolean) => {
    resolve(shouldShowScreenThisTime);
  });
});

/**
 * If there is another instance running, focus the menu on the current one
 */
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) app.quit();
else {
  app.on('second-instance', () => {
    wins.forEach(w => w.webContents.send('menu-hotkey-pressed'));
  });
}

/**
 * This method will be called when Electron has finished
 * initialization and is ready to create browser windows.
 * Some APIs can only be used after this event occurs.
 */
app.on('ready', async () => {
  // necessary to make the app transparent
  await new Promise(r => setTimeout(r, 500));

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

  wins.forEach(win => win.webContents.send('setup-timers'));

  // We need to check this after we create all the windows
  // So the event is passed to all of them.
  // We do this to allow input when the window is not opened first
  if (!(await checkIfShouldShowScreen)) setIgnoreMouseEvents(true);

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
}
