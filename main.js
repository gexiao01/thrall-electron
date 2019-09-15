const electron = require('electron');
const autoUpdater = require('electron-updater').autoUpdater;
let command = process.platform === 'darwin' ? 'Option+Command+I' : 'Ctrl+Shift+I';

let mainWindow;
let app = electron.app;
let ipcMain = electron.ipcMain;
let globalShortcut = electron.globalShortcut;
let BrowserWindow = electron.BrowserWindow;
let appUrl = 'https://172.20.10.10:9060/download/';

function updateHandler() {
    let message = {
        error: '检查更新出错',
        checking: '正在检查更新……',
        updateAva: '检测到新版本，正在下载……',
        updateNotAva: '现在使用的就是最新版本，不用更新'
    }
    const os = require('os');
    autoUpdater.setFeedURL(appUrl);
    autoUpdater.on("error", function (error) {
        console.log(error);
        sendUpdateMessage(message.error);
    });
    autoUpdater.on('checking-for-update', function () {
        console.log(message);
        sendUpdateMessage(message.checking);
    });
    autoUpdater.on('update-available',function (info) {
        console.log(message);
        sendUpdateMessage(message.updateAva);
    });
    autoUpdater.on('update-not-available', function (info) {
        sendUpdateMessage(message.updateNotAva);
    });

    autoUpdater.on('download-progress', function (progressObj) {
        mainWindow.webContents.send('downloadProgress', progressObj);
    });

    autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate,updateUrl, quitAndUpdate) {
        ipcMain.on('isUpdateNow', (e,arg) => {
            console.log(arguments);
            console.log('开始更新');
            autoUpdater.quitAndInstall();
        });
        mainWindow.webContents.send('isUpdateNow');
    });
}

function sendUpdateMessage(text){
    mainWindow.webContents.send('message', text);
}
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
    updateHandler();
    globalShortcut.register(command,()=>{
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