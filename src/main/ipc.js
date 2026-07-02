// Bridges the renderer windows to the store and the prompt queue.
const { ipcMain } = require('electron');
const store = require('./store');
const queue = require('./queue');
const windows = require('./windows');
const { IPC } = require('./constants');

function register({ onChange }) {
  const changed = () => { if (onChange) onChange(); };

  ipcMain.on(IPC.RESIZE, (_e, height) => windows.resizeInput(height));

  ipcMain.handle(IPC.GET_GOAL, () => {
    const d = store.getDay();
    return d ? d.primaryGoal : '';
  });
  ipcMain.handle(IPC.GET_WEEK, (_e, offset = 0) => store.getWeek(offset));
  ipcMain.handle(IPC.GET_SETTINGS, () => store.getSettings());
  ipcMain.handle(IPC.SAVE_SETTINGS, (_e, patch) => {
    const s = store.saveSettings(patch);
    changed();
    return s;
  });

  // Answer submitted from the floating input box.
  ipcMain.on(IPC.SUBMIT, (_e, { item, text }) => {
    const t = (text || '').trim();
    if (item.type === 'goal') store.setGoal(t);
    else if (item.type === 'hourly') store.setHourly(item.hour, t);
    else if (item.type === 'learning') store.setLearning(t);

    windows.hideInput();
    queue.resolve();
    changed();

    // The 5pm learning answer rolls straight into the dashboard.
    if (item.type === 'learning') windows.showDashboard();
  });
}

module.exports = { register };
