"use strict";
const electron = require("electron");
const path = require("path");
const url = require("url");
var _documentCurrentScript = typeof document !== "undefined" ? document.currentScript : null;
const __filename$1 = url.fileURLToPath(typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("main.js", document.baseURI).href);
const __dirname$1 = path.dirname(__filename$1);
electron.app.whenReady().then(() => {
  const win = new electron.BrowserWindow({
    title: "Hutu Order Board",
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
      preload: path.join(__dirname$1, "preload.js")
      // webSecurity: false
    },
    autoHideMenuBar: true
  });
  const { globalShortcut } = require("electron");
  globalShortcut.register("Ctrl+Shift+=", () => {
    if (win.webContents.isDevToolsOpened()) {
      win.webContents.closeDevTools();
    } else {
      win.webContents.openDevTools();
    }
  });
  globalShortcut.register("Ctrl+Shift+backspace", () => {
    if (win.webContents.navigationHistory.canGoBack()) {
      win.webContents.navigationHistory.goBack();
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile("dist/index.html");
  }
  electron.app.on("will-quit", () => {
    globalShortcut.unregisterAll();
  });
});
electron.ipcMain.handle("quit-app", async () => {
  const { response } = await electron.dialog.showMessageBox({
    type: "question",
    buttons: ["取消", "退出"],
    defaultId: 1,
    title: "确认",
    message: "确定要退出应用程序吗？"
  });
  if (response === 1) {
    electron.app.quit();
  }
});
