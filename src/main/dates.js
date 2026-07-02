// Local-time date helpers. Everything is keyed off the user's wall clock so the
// scheduler self-corrects across sleep, DST, and day boundaries.

function pad(n) {
  return String(n).padStart(2, '0');
}

// Local YYYY-MM-DD for a Date (not UTC).
function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// 0=Sun .. 6=Sat
function dayOfWeek(d = new Date()) {
  return d.getDay();
}

// Monday-based start of the ISO week containing `d`, returned as a Date at 00:00 local.
function startOfWeek(d = new Date()) {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = copy.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1) - day; // shift back to Monday
  copy.setDate(copy.getDate() + diff);
  return copy;
}

// Array of 7 date keys (Mon..Sun) for the week `offset` weeks from the current one.
function weekKeys(offset = 0, base = new Date()) {
  const start = startOfWeek(base);
  start.setDate(start.getDate() + offset * 7);
  const keys = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    keys.push({ key: dateKey(d), dow: d.getDay(), date: d });
  }
  return keys;
}

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

module.exports = { dateKey, dayOfWeek, startOfWeek, weekKeys, DOW_LABELS };
