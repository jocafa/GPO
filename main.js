const {app, BrowserWindow} = require('electron');

function createWindow() {
  let win = new BrowserWindow({
    frame: false,
    x: 2560/2 - 256,
    y: 1440 - 512,
    width: 512,
    height: 512,
    useContentSize: true,
    backgroundColor: '#00000000',
    transparent: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.setAlwaysOnTop(true, 'floating', 1);

  win.loadFile('index.html');
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);
