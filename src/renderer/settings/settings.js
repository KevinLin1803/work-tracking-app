const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
let activeDays = [];

const daysEl = document.getElementById('days');
const workStart = document.getElementById('workStart');
const learnHour = document.getElementById('learnHour');
const launch = document.getElementById('launch');
const saved = document.getElementById('saved');

function renderDays() {
  daysEl.innerHTML = '';
  DOW.forEach((name, i) => {
    const el = document.createElement('div');
    el.className = 'day' + (activeDays.includes(i) ? ' on' : '');
    el.textContent = name;
    el.onclick = () => {
      if (activeDays.includes(i)) activeDays = activeDays.filter((d) => d !== i);
      else activeDays.push(i);
      activeDays.sort();
      renderDays();
    };
    daysEl.appendChild(el);
  });
}

async function init() {
  const s = await window.api.getSettings();
  activeDays = [...(s.activeDays || [])];
  workStart.value = s.workStartHour;
  learnHour.value = s.learningPromptHour;
  launch.checked = !!s.launchAtLogin;
  renderDays();
}

document.getElementById('save').onclick = async () => {
  await window.api.saveSettings({
    activeDays: [...activeDays].sort((a, b) => a - b),
    workStartHour: Number(workStart.value),
    learningPromptHour: Number(learnHour.value),
    launchAtLogin: launch.checked,
  });
  saved.textContent = 'Saved ✓';
  setTimeout(() => { saved.textContent = ''; }, 1800);
};

init();
