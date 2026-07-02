let currentItem = null;
const eyebrow = document.getElementById('eyebrow');
const label = document.getElementById('label');
const field = document.getElementById('field');
const form = document.getElementById('form');

function hourRange(hour) {
  const f = ((hour - 1 + 11) % 12) + 1;
  const t = ((hour + 11) % 12) + 1;
  return `${f}${hour - 1 < 12 ? 'am' : 'pm'}–${t}${hour < 12 ? 'am' : 'pm'}`;
}

function render(item) {
  if (item.type === 'goal') {
    eyebrow.textContent = 'TODAY';
    label.textContent = 'What is your main goal today?';
  } else if (item.type === 'hourly') {
    eyebrow.textContent = `CHECK-IN · ${hourRange(item.hour)}`;
    label.textContent = 'What did you get done in the past hour?';
  } else if (item.type === 'learning') {
    eyebrow.textContent = 'END OF DAY';
    label.textContent = 'What did you learn at work today?';
  }
}

window.api.onPrompt((item) => {
  currentItem = item;
  render(item);
  field.value = '';
  setTimeout(() => field.focus(), 30);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentItem) return;
  window.api.submit({ item: currentItem, text: field.value });
});

// Enter submits; Shift+Enter makes a new line.
field.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});
