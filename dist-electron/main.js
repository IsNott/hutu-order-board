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
const createPrintWindow = async (printData) => {
  const pWin = new electron.BrowserWindow({
    title: "打印窗口",
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname$1, "preload.js")
      // webSecurity: false
      // devTools: true
    },
    autoHideMenuBar: true
  });
  pWin.webContents.on("did-finish-load", async () => {
    try {
      pWin.webContents.send("print-data", printData);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const printers = await pWin.webContents.getPrintersAsync();
      console.log(printers);
      if (!printers || printers.length === 0) {
        console.error("没有可用打印机");
        pWin.close();
        return;
      }
      const defPrinter = printers.find((printer) => printer.name == "导出为WPS PDF");
      if (!defPrinter) {
        console.error("没有指定的打印机");
        pWin.close();
        return;
      }
      const printOptions = {
        silent: true,
        printBackground: true,
        deviceName: defPrinter?.name || printers[0].name,
        landscape: false,
        margins: {
          marginType: "none"
        },
        pageSize: {
          width: 16510,
          // 58mm = 16510微米（58 * 283.5 = 16510）
          height: 1e6
        },
        scaleFactor: 85,
        landscape: false,
        pageRanges: {},
        headerFooterEnabled: false,
        pageRange: "all",
        collate: true,
        copies: 1
      };
      pWin.webContents.print(printOptions, (success, errorType) => {
        if (!success) {
          console.error("打印失败", errorType);
        }
        setTimeout(() => {
          pWin.close();
        }, 1e3);
      });
    } catch (error) {
      console.error("打印过程中出错:", error);
      pWin.close();
    }
  });
  pWin.loadFile("templates/receipt.html");
};
electron.ipcMain.handle("print-receipt", async (event, data) => {
  createPrintWindow(data);
});
electron.ipcMain.handle("quit-app", async () => {
  const { response } = await electron.dialog.showMessageBox({
    type: "question",
    buttons: ["退出", "取消"],
    defaultId: 0,
    title: "确认",
    message: "确定要退出应用程序吗？"
  });
  if (response === 0) {
    electron.app.quit();
  }
});
