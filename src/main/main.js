// App entry point. Wires the store, queue, notifier, scheduler, tray, and IPC
// together and runs as a menu-bar-only background app.
const { app } = require('electron');
const store = require('./store');
const queue = require('./queue');
const windows = require('./windows');
const notifier = require('./notifier');
const scheduler = require('./scheduler');
const trayMod = require('./tray');
const ipc = require('./ipc');
const { weekKeys } = require('./dates');

// Only one instance may run (prevents duplicate schedulers/prompts).
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let trayApi = null;

function applyLoginItem() {
  const s = store.getSettings();
  app.setLoginItemSettings({ openAtLogin: !!s.launchAtLogin, openAsHidden: true });
}

// Dev-only: fill this week's Wed/Thu/Fri with sample data to preview the dashboard.
function seedSampleWeek() {
  const samples = {
    3: { goal: 'Ship the scheduler', hours: { 10: 'Reviewed PRs', 11: 'Fixed queue bug', 14: 'Design review' }, learn: 'powerMonitor resume events are how you survive sleep' },
    4: { goal: 'Build the dashboard', hours: { 10: 'Chart.js setup', 13: 'Weekly aggregator', 15: 'Polished the UI', 16: 'Bugfix' }, learn: 'Grouped bar charts read best for day comparisons' },
    5: { goal: 'Settings + packaging', hours: { 11: 'Settings UI', 12: 'Login item', 17: 'Built the .app' }, learn: 'electron-forge make is enough for a personal unsigned app' },
  };
  for (const { dow, date } of weekKeys(0)) {
    const s = samples[dow];
    if (!s) continue;
    store.setGoal(s.goal, date);
    for (const [h, t] of Object.entries(s.hours)) store.setHourly(Number(h), t, date);
    store.setLearning(s.learn, date);
  }
}

app.whenReady().then(() => {
  if (app.dock) app.dock.hide(); // menu-bar only
  store.ensureDay();
  applyLoginItem();

  // Queue shows one prompt at a time; notifying also refreshes the tray badge.
  queue.configure({
    notify: (item) => { notifier.notify(item); if (trayApi) trayApi.refresh(); },
    show: windows.showInput,
  });
  notifier.configure(() => queue.open());

  const refresh = () => { if (trayApi) trayApi.refresh(); applyLoginItem(); };
  ipc.register({ onChange: refresh });

  let devHour = 10;
  trayApi = trayMod.init({
    openCheckIn: () => {
      if (queue.currentItem()) queue.open();
      else windows.showInput({ type: 'hourly', hour: new Date().getHours() });
    },
    openDashboard: () => windows.showDashboard(),
    openSettings: () => windows.showSettings(),
    devCheckIn: () => { queue.enqueue({ type: 'hourly', hour: devHour }); devHour = devHour >= 17 ? 10 : devHour + 1; },
    devLearning: () => queue.enqueue({ type: 'learning' }),
    devSeed: () => { seedSampleWeek(); windows.showDashboard(); },
  });

  scheduler.start();
});

// Menu-bar app: keep running when all windows are closed.
app.on('window-all-closed', () => {});
