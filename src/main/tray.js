// Menu-bar (tray) presence. Shows today's goal and quick actions. Uses a text
// title in the menu bar so no icon asset is required.
const { Tray, Menu, nativeImage, app } = require('electron');
const store = require('./store');
const queue = require('./queue');
const { TEST_MODE } = require('./constants');

let tray = null;
let currentActions = null;

function goalText() {
  const d = store.getDay();
  const g = d && d.primaryGoal ? d.primaryGoal : 'No goal set yet';
  return g;
}

function build() {
  const goal = goalText();
  const pending = queue.currentItem() ? '  •  1 pending check-in' : '';
  const template = [
    { label: `Goal: ${goal}`.slice(0, 64), enabled: false },
    { type: 'separator' },
    { label: 'Open check-in', click: currentActions.openCheckIn },
    { label: 'Dashboard', click: currentActions.openDashboard },
    { label: 'Settings…', click: currentActions.openSettings },
  ];
  if (TEST_MODE) {
    template.push({ type: 'separator' });
    template.push({ label: 'Dev: trigger check-in now', click: currentActions.devCheckIn });
    template.push({ label: 'Dev: learning + dashboard', click: currentActions.devLearning });
    template.push({ label: 'Dev: seed sample week', click: currentActions.devSeed });
  }
  template.push({ type: 'separator' });
  template.push({ label: 'Quit Work Tracker', click: () => app.quit() });

  tray.setContextMenu(Menu.buildFromTemplate(template));
  tray.setToolTip(`Work Tracker — ${goal}${pending}`);
  tray.setTitle(queue.currentItem() ? '⏱ !' : '⏱');
}

function init(actions) {
  currentActions = actions;
  tray = new Tray(nativeImage.createEmpty()); // text-only menu-bar item
  build();
  return { refresh: build };
}

module.exports = { init };
