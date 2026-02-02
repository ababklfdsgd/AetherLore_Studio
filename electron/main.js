const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#02040a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For simple compatibility with process.env if needed in renderer
    },
    autoHideMenuBar: true,
    titleBarStyle: 'hidden', // Create a frameless feel typical of modern apps
    titleBarOverlay: {
      color: '#02040a',
      symbolColor: '#94a3b8',
      height: 40
    }
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});