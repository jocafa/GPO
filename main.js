const {app, BrowserWindow} = require('electron');

function createWindow() {
  let win = new BrowserWindow({
    frame: false,
    /*
    x: 1920/2 - 256,
    y: 1080 - 512,
    */



    /*
    x: 3840/2 - 256,
    y: 2160 - 512,
    width: 512,
    height: 512,
    */

    x: 3840/2 - 512,
    y: 2160 - 1024,
    width: 1024,
    height: 1024,
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
  //win.webContents.openDevTools();
}

app.whenReady().then(createWindow);
