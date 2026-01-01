"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  quitApp: () => ipcRenderer.invoke("quit-app"),
  printReceipt: (data) => ipcRenderer.invoke("print-receipt", data),
  onPrintData: (callback) => {
    ipcRenderer.on("print-data", (event, ...args) => {
      if (args.length === 0) {
        callback({ error: "No data received" });
        return;
      }
      const data = args[0];
      callback(data);
    });
  }
});
