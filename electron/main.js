import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.whenReady().then(() => {
  const win = new BrowserWindow({
    title: 'Hutu Order Board',
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
      preload: path.join(__dirname, 'preload.js'),
      // webSecurity: false
    },
    autoHideMenuBar: true,
  })
  const { globalShortcut } = require('electron')

  globalShortcut.register('Ctrl+Shift+=', () => {
    if (win.webContents.isDevToolsOpened()) {
      win.webContents.closeDevTools()
    } else {
      win.webContents.openDevTools()
    }
  })

  globalShortcut.register("Ctrl+Shift+backspace", () => {
    if (win.webContents.navigationHistory.canGoBack()) {
      win.webContents.navigationHistory.goBack()
    }
  })



  // You can use `process.env.VITE_DEV_SERVER_URL` when the vite command is called `serve`
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    // Load your file
    win.loadFile('dist/index.html')
  }

  app.on('will-quit', () => {
    globalShortcut.unregisterAll()
  })
})

const createPrintWindow = async (printData) => {
  const pWin = new BrowserWindow({
    title: '打印窗口',
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      // webSecurity: false
      // devTools: true
    },
    autoHideMenuBar: true,
  })

  // pWin.webContents.openDevTools();

  pWin.webContents.on('did-finish-load', async () => {
    try {
      pWin.webContents.send('print-data', printData)

      await new Promise(resolve => setTimeout(resolve, 500))

      const printers = await pWin.webContents.getPrintersAsync()
      console.log(printers)
      if (!printers || printers.length === 0) {
        console.error('没有可用打印机')
        pWin.close()
        return
      }
      // const defPrinter = printers.find(printer => printer.name == import.meta.env.VITE_APP_PRINT_DIRVER)
      const defPrinter = printers.find(printer => printer.name == '导出为WPS PDF')
      // console.log(defPrinter);

      if (!defPrinter) {
        console.error('没有指定的打印机')
        pWin.close()
        return
      }
      const printOptions = {
        silent: true,
        printBackground: true,
        deviceName: defPrinter?.name || printers[0].name,
        landscape: false,
        margins: {
          marginType: 'none'
        },
        pageSize: {
          width: 16510,    // 58mm = 16510微米（58 * 283.5 = 16510）
          height: 1000000
        },
        scaleFactor: 85,
        landscape: false,
        pageRanges: {},
        headerFooterEnabled: false,
        pageRange: 'all',
        collate: true,
        copies: 1
      }

      pWin.webContents.print(printOptions, (success, errorType) => {
        if (!success) {
          console.error('打印失败', errorType)
        }
        setTimeout(() => {
          pWin.close()
        }, 1000)
      })
    } catch (error) {
      console.error('打印过程中出错:', error)
      pWin.close()
    }
  })

  pWin.loadFile('templates/receipt.html')
}

ipcMain.handle('print-receipt', async (event, data) => {

  createPrintWindow(data)
})

ipcMain.handle('quit-app', async () => {
  const { response } = await dialog.showMessageBox({
    type: 'question',
    buttons: ['退出', '取消'],
    defaultId: 0,
    title: '确认',
    message: '确定要退出应用程序吗？'
  })

  if (response === 0) {
    app.quit()
  }
})