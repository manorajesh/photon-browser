const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  loadUrl: (url, tabId) => ipcRenderer.send("browserview-load", { url, tabId }),
  onNavigate: (cb) => {
    const handler = (_event, data) => cb(data);
    ipcRenderer.on("browserview-navigate", handler);
    return () => ipcRenderer.removeListener("browserview-navigate", handler);
  },
  onTitle: (cb) => {
    const handler = (_event, data) => cb(data);
    ipcRenderer.on("browserview-title", handler);
    return () => ipcRenderer.removeListener("browserview-title", handler);
  },
  onNewWindow: (cb) => {
    const handler = (_event, data) => cb(data);
    ipcRenderer.on("browserview-new-window", handler);
    return () => ipcRenderer.removeListener("browserview-new-window", handler);
  },
});
