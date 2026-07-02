// Minimal, safe bridge for the floating input box. Channel names are hardcoded
// because sandboxed preloads cannot require local modules.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  onPrompt: (cb) => ipcRenderer.on('prompt', (_e, item) => cb(item)),
  submit: (payload) => ipcRenderer.send('submit', payload),
});
