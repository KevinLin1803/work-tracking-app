let offset = 0;
let chart = null;

function hourRange(hour) {
  const f = ((hour - 1 + 11) % 12) + 1;
  const t = ((hour + 11) % 12) + 1;
  return `${f}${hour - 1 < 12 ? 'am' : 'pm'}–${t}${hour < 12 ? 'am' : 'pm'}`;
}

function drawChart(week) {
  const labels = week.map((d) => d.label);
  const data = week.map((d) => d.achievementCount);
  const colors = week.map((d) => (d.isActive ? '#e5453d' : 'rgba(255,255,255,0.10)'));
  const ctx = document.getElementById('chart');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Achievements', data, backgroundColor: colors, borderRadius: 6, maxBarThickness: 44 }] },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0, color: 'rgba(244,241,239,0.5)' }, grid: { color: 'rgba(255,255,255,0.06)' } },
        x: { ticks: { color: 'rgba(244,241,239,0.5)' }, grid: { display: false } },
      },
    },
  });
}

function drawCards(week) {
  const el = document.getElementById('cards');
  el.innerHTML = '';
  const shown = week.filter((d) => d.isActive || d.achievementCount > 0 || d.learning);
  for (const d of shown) {
    const card = document.createElement('div');
    card.className = 'daycard' + (d.isActive ? ' active' : '');
    // Each achievement can hold several items; show the hour once, then one bullet per item.
    const items = d.achievements.map((a) => {
      const lines = a.items && a.items.length ? a.items : [a.text];
      return lines.map((t, i) => `<li>${i === 0 ? `<b>${hourRange(a.hour)}</b> ` : ''}${escapeHtml(t)}</li>`).join('');
    }).join('');
    const goalStr = d.primaryGoal
      ? escapeHtml(String(d.primaryGoal).split('\n').map((s) => s.trim()).filter(Boolean).join('  ·  '))
      : '';
    card.innerHTML = `
      <h3>${d.label}</h3>
      <div class="date">${d.dateKey}</div>
      ${goalStr ? `<div class="goal">Goals: ${goalStr}</div>` : ''}
      ${items ? `<ul>${items}</ul>` : '<div class="empty">No achievements logged</div>'}
      <div class="learn"><span class="k">LEARNED</span><br/>${d.learning ? escapeHtml(d.learning) : '<span class="empty">—</span>'}</div>
    `;
    el.appendChild(card);
  }
  if (shown.length === 0) el.innerHTML = '<div class="empty">Nothing logged this week yet.</div>';
}

function drawTotals(week) {
  const totalAch = week.reduce((s, d) => s + d.achievementCount, 0);
  const totalLearn = week.filter((d) => d.learning).length;
  document.getElementById('totalAch').textContent = totalAch;
  document.getElementById('totalLearn').textContent = totalLearn;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

async function load() {
  const week = await window.api.getWeek(offset);
  document.getElementById('weeklabel').textContent =
    offset === 0 ? 'This week' : offset < 0 ? `${-offset} week${offset === -1 ? '' : 's'} ago` : `${offset} week${offset === 1 ? '' : 's'} ahead`;
  drawTotals(week);
  drawChart(week);
  drawCards(week);
}

document.getElementById('prev').onclick = () => { offset -= 1; load(); };
document.getElementById('next').onclick = () => { offset += 1; load(); };
document.getElementById('today').onclick = () => { offset = 0; load(); };

load();
