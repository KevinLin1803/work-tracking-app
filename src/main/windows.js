// Creates and positions the app windows: the small floating input box (top-right),
// the weekly dashboard, and settings. Windows are created lazily and reused.
const { BrowserWindow, screen } = require('electron');
const path = require('path');
const { IPC } = require('./constants');

const RENDERER = path.join(__dirname, '..', 'renderer');
const PRELOAD = path.join(__dirname, '..', 'preload');

let inputWin = null;
let dashWin = null;
let settingsWin = null;

const INPUT_W = 380;
const INPUT_H = 210;

function positionTopRight(win) {
  const wa = screen.getPrimaryDisplay().workArea;
  const x = wa.x + wa.width - INPUT_W - 16;
  const y = wa.y + 16;
  win.setPosition(x, y, false);
}

function createInput() {
  const win = new BrowserWindow({
    width: INPUT_W,
    height: INPUT_H,
    frame: false,
    resizable: false,
    movable: true,
    minimizable: false,
    maximizable: false,
    skipTaskbar: true,
    show: false,
    fullscreenable: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(PRELOAD, 'inputPreload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.setAlwaysOnTop(true, 'floating');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadFile(path.join(RENDERER, 'input', 'input.html'));
  win.on('closed', () => { inputWin = null; });
  return win;
}

// Show the input box for a given prompt item.
function showInput(item) {
  if (!inputWin) inputWin = createInput();
  const send = () => {
    positionTopRight(inputWin);
    inputWin.showInactive();
    inputWin.setAlwaysOnTop(true, 'floating');
    inputWin.show();
    inputWin.focus();
    inputWin.webContents.send(IPC.PROMPT, item);
  };
  if (inputWin.webContents.isLoading()) {
    inputWin.webContents.once('did-finish-load', send);
  } else {
    send();
  }
}

function hideInput() {
  if (inputWin) inputWin.hide();
}

// Grow/shrink the floating box to fit its content, staying anchored top-right.
function resizeInput(height) {
  if (!inputWin || inputWin.isDestroyed()) return;
  const h = Math.max(140, Math.min(Math.round(height), 620));
  inputWin.setContentSize(INPUT_W, h, false);
  positionTopRight(inputWin);
}

function showDashboard() {
  if (dashWin && !dashWin.isDestroyed()) {
    dashWin.show();
    dashWin.focus();
    dashWin.webContents.reload();
    return;
  }
  dashWin = new BrowserWindow({
    width: 940,
    height: 700,
    title: 'Work Tracker - This Week',
    webPreferences: {
      preload: path.join(PRELOAD, 'dashPreload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  dashWin.loadFile(path.join(RENDERER, 'dashboard', 'dashboard.html'));
  dashWin.on('closed', () => { dashWin = null; });
}

function showSettings() {
  if (settingsWin && !settingsWin.isDestroyed()) {
    settingsWin.show();
    settingsWin.focus();
    return;
  }
  settingsWin = new BrowserWindow({
    width: 440,
    height: 460,
    title: 'Work Tracker - Settings',
    resizable: false,
    webPreferences: {
      preload: path.join(PRELOAD, 'dashPreload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  settingsWin.loadFile(path.join(RENDERER, 'settings', 'settings.html'));
  settingsWin.on('closed', () => { settingsWin = null; });
}

module.exports = { showInput, hideInput, resizeInput, showDashboard, showSettings };
