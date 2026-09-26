"use strict";

// Temporary verification script: drives the dashboard in a real Electron
// window and captures the success / loading / failure states.
const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");

const SHOT_DIR = path.join(__dirname, "shots");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const capture = async (win, name) => {
  await sleep(300);
  const image = await win.webContents.capturePage();
  fs.writeFileSync(path.join(SHOT_DIR, name + ".png"), image.toPNG());
  console.log("captured " + name);
};

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const win = new BrowserWindow({
    width: 900,
    height: 720,
    show: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });

  await win.loadURL("http://localhost:4040/dashboard");

  // 1) Success state
  await win.webContents.executeJavaScript(
    "document.getElementById('text-stats-input').value = " +
      "'hello world\\nsecond line 中文统计';" +
      "document.getElementById('text-stats-button').click();"
  );
  await sleep(1500);
  await capture(win, "1-success");

  // 2) Loading state (slow the fetch down to 2s)
  await win.webContents.executeJavaScript(
    "window.__origFetch = window.fetch;" +
      "window.fetch = function () {" +
      "  var args = arguments;" +
      "  return new Promise(function (resolve, reject) {" +
      "    setTimeout(function () {" +
      "      window.__origFetch.apply(window, args).then(resolve, reject);" +
      "    }, 2000);" +
      "  });" +
      "};" +
      "document.getElementById('text-stats-input').value = 'counting...';" +
      "document.getElementById('text-stats-button').click();"
  );
  await capture(win, "2-loading");
  await sleep(2200);

  // 3) Empty-input failure (backend 400)
  await win.webContents.executeJavaScript(
    "window.fetch = window.__origFetch;" +
      "document.getElementById('text-stats-input').value = '';" +
      "document.getElementById('text-stats-button').click();"
  );
  await sleep(1200);
  await capture(win, "3-error-empty");

  // 4) Network failure (fetch rejects like a dead backend)
  await win.webContents.executeJavaScript(
    "window.fetch = function () {" +
      "  return Promise.reject(new TypeError('Failed to fetch'));" +
      "};" +
      "document.getElementById('text-stats-input').value = 'some text';" +
      "document.getElementById('text-stats-button').click();"
  );
  await sleep(1200);
  await capture(win, "4-error-network");

  app.quit();
});
