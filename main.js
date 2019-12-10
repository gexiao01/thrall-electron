const electron = require('electron');
const electronUpdater = require('electron-updater');
let command = process.platform === 'darwin' ? 'Option+Command+I' : 'Ctrl+Shift+I';

let mainWindow;
let app = electron.app;
let globalShortcut = electron.globalShortcut;
let BrowserWindow = electron.BrowserWindow;
let ipcMain = electron.ipcMain;
let autoUpdater = electronUpdater.autoUpdater;

let uploadUrl = 'https://172.20.10.10:9060/download/'

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
    mainWindow.show();
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    globalShortcut.register(command,()=>{
        mainWindow.webContents.openDevTools();
    })
    updateHandle()
}

// 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写
function updateHandle() {
    let message = {
        error: '检查更新出错',
        checking: '正在检查更新……',
        updateAva: '检测到新版本，正在下载……',
        updateNotAva: '现在使用的就是最新版本，不用更新',
    };
    const os = require('os');

    autoUpdater.setFeedURL(uploadUrl);
    autoUpdater.on('error', function (error) {
        sendUpdateMessage(message.error)
    });
    autoUpdater.on('checking-for-update', function () {
        sendUpdateMessage(message.checking)
    });
    autoUpdater.on('update-available', function (info) {
        sendUpdateMessage(message.updateAva)
    });
    autoUpdater.on('update-not-available', function (info) {
        sendUpdateMessage(message.updateNotAva)
    });

    // 更新下载进度事件
    autoUpdater.on('download-progress', function (progressObj) {
        mainWindow.webContents.send('downloadProgress', progressObj)
    })
    autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {

        ipcMain.on('isUpdateNow', (e, arg) => {
            console.log(arguments);
        console.log("开始更新");
        //some code here to handle event
        autoUpdater.quitAndInstall();
    });

        mainWindow.webContents.send('isUpdateNow')
    });

    ipcMain.on("checkForUpdate",()=>{
        //执行自动更新检查
        autoUpdater.checkForUpdates();
    })
}

// 通过main进程发送事件给renderer进程，提示更新信息
function sendUpdateMessage(text) {
    mainWindow.webContents.send('message', text)
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
