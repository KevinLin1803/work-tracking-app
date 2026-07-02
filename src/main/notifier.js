// Wraps macOS notifications. Clicking a notification calls the configured
// handler (which opens the input box). If notifications are denied, this simply
// no-ops and the tray remains the fallback surface.
const { Notification } = require('electron');

let onClick = () => {};

function configure(cb) {
  onClick = cb || (() => {});
}

function hourLabel(hour) {
  const from = ((hour - 1 + 11) % 12) + 1;
  const to = ((hour + 11) % 12) + 1;
  const fromAmPm = hour - 1 < 12 ? 'am' : 'pm';
  const toAmPm = hour < 12 ? 'am' : 'pm';
  return `${from}${fromAmPm}-${to}${toAmPm}`;
}

function textFor(item) {
  if (item.type === 'goal') {
    return { title: 'Work Tracker', body: 'What is your main goal today?' };
  }
  if (item.type === 'hourly') {
    return { title: 'Hourly check-in', body: 'What did you achieve in the past hour?' };
  }
  if (item.type === 'learning') {
    return { title: 'End of day', body: 'What did you learn at work today?' };
  }
  return { title: 'Work Tracker', body: 'Check-in' };
}

function notify(item) {
  if (!Notification.isSupported()) return;
  const { title, body } = textFor(item);
  const n = new Notification({ title, body });
  n.on('click', () => onClick());
  n.show();
}

module.exports = { configure, notify, textFor };
