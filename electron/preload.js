"use strict";
const { contextBridge, ipcRenderer } = require('electron')

// 安全地暴露API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  quitApp: () => ipcRenderer.invoke('quit-app'),
  
})