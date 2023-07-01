const { Menu, dialog } = require('electron');
const ffmpegStatic = require("ffmpeg-static-electron");
const ffprobe = require("ffprobe-static-electron");
const ffmpeg = require("fluent-ffmpeg");
const ProgressBar = require("electron-progressbar");

ffmpeg.setFfprobePath(ffprobe.path);
ffmpeg.setFfmpegPath(ffmpegStatic.path);

const dialogFileType = { name: 'Videos', extensions: ['mkv', 'avi', 'mp4', '.mpeg', 'mpg', 'mov', 'webm'] };

const dialogOptions = {
    properties: ['openFile'],
    message: "Select Video File to load",
    filters: [dialogFileType]
};

let selectedFilePath;

// for checking is user is on a mac 
const isMac = process.platform === 'darwin' 

const myMenuTemplate = [
    {
        label: "File",
        submenu: [
            {
                label: "Video",
                submenu: [
                    {
                        label: "Load video",
                        click(e, dialogWindow) {
                            dialog.showOpenDialog(dialogWindow, dialogOptions)
                                .then(response => {
                                    if (response.filePaths.length) {
                                        selectedFilePath = response.filePaths[0];
                                        // send file path to renderer 
                                        // open file in window
                                        dialogWindow.webContents.send("filePath", { filePath: selectedFilePath });
                                        Menu.getApplicationMenu().getMenuItemById("mp4").enabled = true;
                                        Menu.getApplicationMenu().getMenuItemById("avi").enabled = true;
                                        Menu.getApplicationMenu().getMenuItemById("webm").enabled = true;
                                    }
                                })
                                .catch((err) => console.log(err));
                        }
                    },
                    {
                        type: "separator"
                    },
                    {
                        label: "Convert to MP4...",
                        id: "mp4",
                        enabled: false,
                        click(event, window) {
                            convertVideoFormat(window, "mp4");
                        }
                    },
                    {
                        label: "Convert to AVI...",
                        id: "avi",
                        enabled: false,
                        click(event, window) {
                            convertVideoFormat(window, "avi");
                        }
                    },
                    {
                        label: "Convert to webm...",
                        id: "webm",
                        enabled: false,
                        click(event, window) {
                            convertVideoFormat(window, "webm");
                        }
                    }
                ]
            },
            { type: "separator" },
            {
                label: "Quit Video Player",
                role: global.isMac ? "close" : "quit",
            }
        ],
    },
    {
        label: "Developer Tools",
        submenu: [
            { role: "toggleDevTools" },
            { role: "togglefullscreen" },
            { role: "minimize" },
            { role: "zoomIn" },
            { role: "zoomOut" }
        ],
    }
];

function convertVideoFormat(dialogWindow, fileType) {
    dialog.showSaveDialog(dialogWindow).then((res) => {
        const progressBar = new ProgressBar({
            indeterminate: false,
            text: `Converting video to ${fileType}. Please wait...`,
            detail: "0%"
        });
        progressBar
            .on("progress", (value) => {
                progressBar.detail = `${value}%`;
            })
            .on("completed", () => {
                progressBar.detail = "Video File Type Conversion Complete!";
            });

        ffmpeg(selectedFilePath)
            .toFormat(fileType)
            .on("progress", (progress) => {
                console.log("Progress: ", progress);

                if (!progressBar.isCompleted()) {
                    progressBar.value = Math.ceil(progress.percent);
                }
            })
            .on("end", (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Video File Type Conversion Finished!");
                }
            })
            .saveToFile(`${res.filePath}.${fileType}`);
    });
}

module.exports = Menu.buildFromTemplate(myMenuTemplate);
