import { app, BrowserWindow } from "electron";
import * as path from "path";
import { startDownloader } from "./services/downloader.service";
import { startScraper } from "./services/scraper.service";
import { ChildProcess } from 'child_process';
const childProcesses: ChildProcess[] = [];

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  mainWindow.loadFile(path.join(__dirname, '../packages/social-media-ui/dist/index.html'));
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(async () => {
  await startChildProcesses();
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("before-quit", () => {
  console.log('before-quit')
  killChildProcesses();
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  killChildProcesses();
  app.quit();
});

process.on("SIGTERM", () => {
  killChildProcesses();
  app.quit();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

async function startChildProcesses() {
  startDownloader()
    .then((downloaderProcess) => childProcesses.push(downloaderProcess))
    .catch((error) => console.log(`Error starting downloader app, ${error}`))
  startScraper()
    .then((scraperProcess) => childProcesses.push(scraperProcess))
    .catch((error) => console.log(`Error starting scraper app, ${error}`))
}


function killChildProcesses() {
  childProcesses.forEach((child) => {
    if (child && !child.killed) {
      console.log(child)
      child.kill('SIGKILL');
    }
  });
}
