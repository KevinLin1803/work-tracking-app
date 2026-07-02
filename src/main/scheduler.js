// Clock-based scheduler. The source of truth is "reconcile against the wall
// clock", not a timer firing, so missed hours (sleep, app closed) are caught the
// moment we wake or relaunch.
const { powerMonitor } = require('electron');
const store = require('./store');
const queue = require('./queue');
const { TEST_MODE, TEST_TICK_MS } = require('./constants');

let timer = null;
let safety = null;

function isActiveToday(settings, now) {
  if (TEST_MODE) return true; // any day is active in test mode
  return (settings.activeDays || []).includes(now.getDay());
}

// Mark every due-but-unanswered prompt as pending and queue it (in order).
function reconcile() {
  const now = new Date();
  store.ensureDay(now);
  const settings = store.getSettings();
  if (!isActiveToday(settings, now)) return;

  const day = store.getDay();
  const hour = now.getHours();

  if (!day.primaryGoal && hour >= settings.workStartHour) {
    queue.enqueue({ type: 'goal' });
  }

  for (const h of settings.checkInHours) {
    if (h <= hour) {
      const e = day.hourlyEntries[String(h)];
      if (!e || !e.text) {
        store.markPending(h, now);
        queue.enqueue({ type: 'hourly', hour: h });
      }
    }
  }

  if (hour >= settings.learningPromptHour && !(day.learning && day.learning.text)) {
    queue.enqueue({ type: 'learning' });
  }
}

// Delay until the next check-in boundary today, capped at 1h so we re-evaluate.
function nextBoundaryDelay(now) {
  const settings = store.getSettings();
  let next = null;
  for (const h of settings.checkInHours) {
    const b = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, 0, 0, 0);
    if (b > now) { next = b; break; }
  }
  if (!next) {
    next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  }
  return Math.max(1000, Math.min(next - now, 60 * 60 * 1000));
}

function scheduleNext() {
  clearTimeout(timer);
  const delay = TEST_MODE ? TEST_TICK_MS : nextBoundaryDelay(new Date());
  timer = setTimeout(() => {
    reconcile();
    scheduleNext();
  }, delay);
}

function start() {
  reconcile();
  scheduleNext();
  // 60s safety net: catch clock jumps and re-notify an ignored prompt.
  safety = setInterval(() => {
    reconcile();
    queue.tick();
  }, 60 * 1000);
  powerMonitor.on('resume', reconcile);
  powerMonitor.on('unlock-screen', reconcile);
}

function stop() {
  clearTimeout(timer);
  clearInterval(safety);
}

module.exports = { start, stop, reconcile };
