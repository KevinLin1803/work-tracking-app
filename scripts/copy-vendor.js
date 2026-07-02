// Copies the Chart.js UMD build into src/renderer/vendor so the dashboard can
// load it locally (no CDN, satisfies the app's strict content policy).
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'node_modules', 'chart.js', 'dist', 'chart.umd.js');
const destDir = path.join(__dirname, '..', 'src', 'renderer', 'vendor');
const dest = path.join(destDir, 'chart.min.js');

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log('Copied Chart.js ->', dest);
