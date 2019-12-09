const electron = require('electron');
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
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    globalShortcut.register(command,()=>{
        mainWindow.webContents.openDevTools();
    })
    require('update-electron-app')({
        repo: 'git+https://github.com/gexiao01/thrall-electron.git',
        updateInterval: '1 hour',
        logger: require('electron-log'),
        notifyUser: true
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
