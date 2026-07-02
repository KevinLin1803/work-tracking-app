// Sequential prompt queue. Shows exactly one prompt at a time. Missed prompts
// wait (stay `current`) until answered, then the next one appears. Gentle: it
// fires a notification only; it never force-focuses the input window.
const { RENOTIFY_INTERVAL_MS } = require('./constants');

let queue = [];
let current = null; // the prompt awaiting an answer (may be un-opened)
let handlers = { notify: () => {}, show: () => {} };

// Sort order so prompts appear in the natural sequence: goal, then hours, then learning.
function rank(item) {
  if (item.type === 'goal') return 0;
  if (item.type === 'hourly') return item.hour; // 10..17
  if (item.type === 'learning') return 99;
  return 50;
}

function keyOf(item) {
  return `${item.type}:${item.hour ?? ''}`;
}

function configure(h) {
  handlers = { ...handlers, ...h };
}

function has(item) {
  if (current && keyOf(current) === keyOf(item)) return true;
  return queue.some((q) => keyOf(q) === keyOf(item));
}

function enqueue(item) {
  if (has(item)) return; // dedupe
  queue.push(item);
  queue.sort((a, b) => rank(a) - rank(b));
  pump();
}

function pump() {
  if (current) return; // one at a time
  if (queue.length === 0) return;
  current = queue.shift();
  current.notifiedAt = Date.now();
  handlers.notify(current);
}

// User clicked the notification (or the tray "Open check-in"): show the box.
function open() {
  if (current) handlers.show(current);
}

// The current prompt was answered.
function resolve() {
  const done = current;
  current = null;
  pump();
  return done;
}

// Called periodically by the scheduler's safety tick: re-notify an ignored prompt.
function tick() {
  if (current && Date.now() - (current.notifiedAt || 0) >= RENOTIFY_INTERVAL_MS) {
    current.notifiedAt = Date.now();
    handlers.notify(current);
  }
}

function currentItem() {
  return current;
}

module.exports = { configure, enqueue, open, resolve, tick, currentItem };
