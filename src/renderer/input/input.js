let currentItem = null;
let multi = true;

const eyebrow = document.getElementById('eyebrow');
const label = document.getElementById('label');
const form = document.getElementById('form');
const fields = document.getElementById('fields');
const addBtn = document.getElementById('add');
const hint = document.getElementById('hint');

function hourRange(hour) {
  const f = ((hour - 1 + 11) % 12) + 1;
  const t = ((hour + 11) % 12) + 1;
  return `${f}${hour - 1 < 12 ? 'am' : 'pm'}–${t}${hour < 12 ? 'am' : 'pm'}`;
}

// Ask the main process to size the window to the current content height.
function fit() {
  const h = Math.ceil(document.body.getBoundingClientRect().height) + 4;
  window.api.resize(h);
}

function focusLast() {
  const inputs = fields.querySelectorAll('input');
  if (inputs.length) inputs[inputs.length - 1].focus();
}

function makeRow(value = '') {
  const row = document.createElement('div');
  row.className = 'field-row';

  const inp = document.createElement('input');
  inp.type = 'text';
  inp.value = value;
  inp.placeholder = 'Add an item…';

  const rm = document.createElement('button');
  rm.type = 'button';
  rm.className = 'remove';
  rm.textContent = '×';
  rm.title = 'Remove';
  rm.onclick = () => {
    if (fields.children.length > 1) { row.remove(); fit(); focusLast(); }
  };

  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); form.requestSubmit(); }
    else if (e.key === 'Enter') { e.preventDefault(); addRow(); }
  });

  row.appendChild(inp);
  row.appendChild(rm);
  fields.appendChild(row);
  return inp;
}

function addRow() {
  const inp = makeRow();
  fit();
  inp.focus();
}

function renderMulti() {
  multi = true;
  fields.innerHTML = '';
  addBtn.style.display = '';
  hint.textContent = 'Enter to add · ⌘↵ to save';
  makeRow();
}

function renderSingle(placeholder) {
  multi = false;
  fields.innerHTML = '';
  addBtn.style.display = 'none';
  hint.textContent = '⌘↵ to save';
  const ta = document.createElement('textarea');
  ta.rows = 3;
  ta.placeholder = placeholder;
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); form.requestSubmit(); }
  });
  fields.appendChild(ta);
}

addBtn.onclick = () => addRow();

window.api.onPrompt((item) => {
  currentItem = item;
  if (item.type === 'goal') {
    eyebrow.textContent = 'TODAY';
    label.textContent = 'What are your goals today?';
    renderMulti();
  } else if (item.type === 'hourly') {
    eyebrow.textContent = `CHECK-IN · ${hourRange(item.hour)}`;
    label.textContent = 'What did you achieve in the past hour?';
    renderMulti();
  } else if (item.type === 'learning') {
    eyebrow.textContent = 'END OF DAY';
    label.textContent = 'What did you learn at work today?';
    renderSingle('What did you learn…');
  }
  setTimeout(() => {
    const first = fields.querySelector('input, textarea');
    if (first) first.focus();
    fit();
  }, 30);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentItem) return;
  let text;
  if (multi) {
    const vals = [...fields.querySelectorAll('input')].map((i) => i.value.trim()).filter(Boolean);
    text = vals.join('\n');
  } else {
    text = fields.querySelector('textarea').value.trim();
  }
  window.api.submit({ item: currentItem, text });
});
