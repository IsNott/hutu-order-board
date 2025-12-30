"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  quitApp: () => ipcRenderer.invoke("quit-app")
});
