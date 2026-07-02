// Persistent JSON store (electron-store v8). Lives in the app's userData folder.
// Exposes settings + per-day accessors and a weekly aggregation for the dashboard.
const Store = require('electron-store');
const {
  CHECK_IN_HOURS,
  LEARNING_PROMPT_HOUR,
  WORK_START_HOUR,
  DEFAULT_ACTIVE_DAYS,
} = require('./constants');
const { dateKey, dayOfWeek, weekKeys, DOW_LABELS } = require('./dates');

const store = new Store({
  name: 'work-tracker',
  defaults: {
    settings: {
      activeDays: DEFAULT_ACTIVE_DAYS,
      checkInHours: CHECK_IN_HOURS,
      learningPromptHour: LEARNING_PROMPT_HOUR,
      workStartHour: WORK_START_HOUR,
      launchAtLogin: true,
    },
    days: {},
  },
});

function getSettings() {
  return store.get('settings');
}

function saveSettings(patch) {
  const next = { ...store.get('settings'), ...patch };
  store.set('settings', next);
  return next;
}

// Ensure today's record exists; returns it.
function ensureDay(d = new Date()) {
  const key = dateKey(d);
  const existing = store.get(`days.${key}`);
  if (existing) return existing;
  const record = {
    date: key,
    dayOfWeek: dayOfWeek(d),
    primaryGoal: '',
    hourlyEntries: {},
    learning: { text: '', answeredAt: null },
  };
  store.set(`days.${key}`, record);
  return record;
}

function getDay(key = dateKey()) {
  return store.get(`days.${key}`) || null;
}

function setGoal(text, d = new Date()) {
  ensureDay(d);
  const key = dateKey(d);
  store.set(`days.${key}.primaryGoal`, text);
  store.set(`days.${key}.goalSetAt`, new Date().toISOString());
}

// Mark an hour as due-but-unanswered so the queue survives an app restart.
function markPending(hour, d = new Date()) {
  const key = dateKey(d);
  ensureDay(d);
  const path = `days.${key}.hourlyEntries.${hour}`;
  const entry = store.get(path);
  if (!entry) {
    store.set(path, { text: '', status: 'pending', dueAt: new Date().toISOString() });
  }
}

function setHourly(hour, text, d = new Date()) {
  ensureDay(d);
  const key = dateKey(d);
  store.set(`days.${key}.hourlyEntries.${hour}`, {
    text,
    status: 'answered',
    answeredAt: new Date().toISOString(),
  });
}

function setLearning(text, d = new Date()) {
  ensureDay(d);
  const key = dateKey(d);
  store.set(`days.${key}.learning`, { text, answeredAt: new Date().toISOString() });
}

// Aggregate a week (Mon..Sun) for the dashboard.
function getWeek(offset = 0) {
  const settings = getSettings();
  const activeDays = settings.activeDays || DEFAULT_ACTIVE_DAYS;
  return weekKeys(offset).map(({ key, dow }) => {
    const day = getDay(key);
    const entries = day ? day.hourlyEntries : {};
    const achievements = Object.keys(entries)
      .filter((h) => entries[h] && entries[h].text)
      .sort((a, b) => Number(a) - Number(b))
      .map((h) => ({ hour: Number(h), text: entries[h].text }));
    return {
      dateKey: key,
      dow,
      label: DOW_LABELS[dow],
      isActive: activeDays.includes(dow),
      primaryGoal: day ? day.primaryGoal : '',
      achievementCount: achievements.length,
      achievements,
      learning: day && day.learning ? day.learning.text : '',
    };
  });
}

module.exports = {
  store,
  getSettings,
  saveSettings,
  ensureDay,
  getDay,
  setGoal,
  markPending,
  setHourly,
  setLearning,
  getWeek,
};
