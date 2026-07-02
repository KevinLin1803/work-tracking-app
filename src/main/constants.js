// Shared constants and defaults.

// Hourly check-in hours (24h clock): 10am .. 5pm.
const CHECK_IN_HOURS = [10, 11, 12, 13, 14, 15, 16, 17];

// The 5pm step also asks "what did you learn today?" and opens the dashboard.
const LEARNING_PROMPT_HOUR = 17;

// Morning goal prompt fires once the clock passes this hour on an active day.
const WORK_START_HOUR = 9;

// Default active days. 0=Sun .. 6=Sat, so [3,4,5] = Wed, Thu, Fri.
const DEFAULT_ACTIVE_DAYS = [3, 4, 5];

// Re-notify an ignored pending prompt at most this often (ms).
const RENOTIFY_INTERVAL_MS = 15 * 60 * 1000;

// Test mode (npm run dev, or --test): fire a synthetic check-in every 30s and
// treat every day as active so we can verify behavior without waiting real hours.
const TEST_MODE = process.argv.includes('--test') || process.env.WT_TEST === '1';
const TEST_TICK_MS = 30 * 1000;

const IPC = {
  PROMPT: 'prompt',            // main -> input renderer: show this prompt
  SUBMIT: 'submit',            // input renderer -> main: answer text
  GET_GOAL: 'get-goal',
  GET_WEEK: 'get-week',
  GET_SETTINGS: 'get-settings',
  SAVE_SETTINGS: 'save-settings',
};

module.exports = {
  CHECK_IN_HOURS,
  LEARNING_PROMPT_HOUR,
  WORK_START_HOUR,
  DEFAULT_ACTIVE_DAYS,
  RENOTIFY_INTERVAL_MS,
  TEST_MODE,
  TEST_TICK_MS,
  IPC,
};
