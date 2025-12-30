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
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true,
  })

  const { globalShortcut } = require('electron')
  
  globalShortcut.register('Shift+=', () => {
    if (win.webContents.isDevToolsOpened()) {
      win.webContents.closeDevTools()
    } else {
      win.webContents.openDevTools()
    }
  })

  globalShortcut.register("Shift+backspace", () => {
    if(win.webContents.navigationHistory.canGoBack()){
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

ipcMain.handle('quit-app', async () => {
  const { response } = await dialog.showMessageBox({
    type: 'question',
    buttons: ['取消', '退出'],
    defaultId: 1,
    title: '确认',
    message: '确定要退出应用程序吗？'
  })
  
  if (response === 1) {
    app.quit()
  }
})