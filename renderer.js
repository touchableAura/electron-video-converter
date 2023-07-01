const { ipcRenderer } = require("electron");
const video = document.querySelector(".js-player");
const source = document.querySelector("source");

ipcRenderer.on("filePath", (e, { filePath }) => {
    source.src = filePath;
    video.load();
});
