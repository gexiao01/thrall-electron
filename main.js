const electron = require('electron');
let url = "https://www.kkcoding.net";
const shell = electron.shell;
const path = require('path');
let command = process.platform === 'darwin' ? 'Option+Command+I' : 'Ctrl+Shift+I';

let mainWindow;
let app = electron.app;
let globalShortcut = electron.globalShortcut;
let BrowserWindow = electron.BrowserWindow;

function createWindow(){
    let width = electron.screen.getPrimaryDisplay().workAreaSize.width;
    let height = electron.screen.getPrimaryDisplay().workAreaSize.height;
    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        autoHideMenuBar: true,
        fullscreen: false,
        useContentSize: true,
        fullscreenable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.maximize();
    mainWindow.loadURL(url);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    globalShortcut.register(command,()=>{
        shell.openItem(path.join(__dirname, 'package.json'));
        mainWindow.webContents.openDevTools();
    })

}

app.on('ready', createWindow);
app.on('window-all-closed',function(){
    if(process.platform !== 'darwin'){
        app.quit();
    }
});

app.on('active',function(){
    if(mainWindow === null){
        createWindow();
    }
});