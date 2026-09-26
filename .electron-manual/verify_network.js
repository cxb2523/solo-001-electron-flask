"use strict";

const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");

const SHOT_DIR = path.join(__dirname, "shots");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 900,
    height: 720,
    show: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  await win.loadURL("http://localhost:4040/dashboard");
  await win.webContents.executeJavaScript(
    "window.fetch = function () {" +
      "  return Promise.reject(new TypeError('Failed to fetch'));" +
      "};" +
      "document.getElementById('text-stats-input').value = 'some text';" +
      "document.getElementById('text-stats-button').click();"
  );
  await sleep(1000);
  const image = await win.webContents.capturePage();
  fs.writeFileSync(path.join(SHOT_DIR, "4-error-network.png"), image.toPNG());
  console.log("captured 4-error-network");
  app.quit();
});
