const { app, Menu, BrowserWindow } = require('electron');
const myMenu = require("./src/customMenus/menuTemplate");

let mediaPlayerWindow;

if (process.platform === "darwin") {
    global.isMac = true;
}

Menu.setApplicationMenu(myMenu);

app.on("ready", () => {
    console.log("Application is ready!");

    mediaPlayerWindow = new BrowserWindow({
        width: 900,
        height: 605,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        }
    });
    mediaPlayerWindow.isClosable = true;
    mediaPlayerWindow.setIcon = "./video-icon.png";

    mediaPlayerWindow.loadFile("index.html");

})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})