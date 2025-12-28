const { app, BrowserView, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const SIDEBAR_WIDTH = 330;
let mainWindow;
let mainView;
let activeTabId = null;

const updateViewBounds = () => {
  if (!mainWindow || !mainView) return;
  const { width, height } = mainWindow.getContentBounds();
  const viewWidth = Math.max(0, width - SIDEBAR_WIDTH);
  mainView.setBounds({ x: SIDEBAR_WIDTH, y: 0, width: viewWidth, height });
};

const buildErrorPage = ({ url, errorCode, errorDescription }) => {
  const safeUrl = (url || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeDesc = (errorDescription || "Failed to load").replace(
    /</g,
    "&lt;"
  );
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Site can't be reached</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
            background: #fff;
            color: #333;
            padding: 60px;
          }
          .card {
            max-width: 520px;
          }
          h1 {
            font-size: 24px;
            margin: 0 0 10px 0;
          }
          p {
            margin: 6px 0;
            color: #555;
          }
          .code {
            color: #777;
            font-size: 12px;
            margin-top: 12px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>This site can't be reached</h1>
          <p>${safeDesc}</p>
          <p><strong>${safeUrl}</strong> took too long to respond.</p>
          <div class="code">Error code: ${errorCode}</div>
        </div>
      </body>
    </html>
  `;
};

const attachViewHandlers = () => {
  if (!mainView) return;
  mainView.webContents.on("did-navigate", (_event, url) => {
    mainWindow?.webContents.send("browserview-navigate", {
      tabId: activeTabId,
      url,
    });
  });
  mainView.webContents.on("did-navigate-in-page", (_event, url) => {
    mainWindow?.webContents.send("browserview-navigate", {
      tabId: activeTabId,
      url,
    });
  });
  mainView.webContents.on("page-title-updated", (_event, title) => {
    mainWindow?.webContents.send("browserview-title", {
      tabId: activeTabId,
      title,
    });
  });
  mainView.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, url) => {
      if (errorCode === -3 || !url || url.startsWith("data:text/html")) return;
      const html = buildErrorPage({ url, errorCode, errorDescription });
      mainView.webContents.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
      );
      mainWindow?.webContents.send("browserview-title", {
        tabId: activeTabId,
        title: "Site can't be reached",
      });
      mainWindow?.webContents.send("browserview-navigate", {
        tabId: activeTabId,
        url,
      });
    }
  );
  mainView.webContents.setWindowOpenHandler(({ url }) => {
    mainWindow?.webContents.send("browserview-new-window", { url });
    return { action: "deny" };
  });
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 820,
    backgroundColor: "#efe7c8",
    titleBarStyle: "hiddenInset", // mac-like
    trafficLightPosition: { x: 12, y: 11 },
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const devURL = process.env.VITE_DEV_SERVER_URL;
  if (devURL) mainWindow.loadURL(devURL);
  else mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));

  mainView = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.setBrowserView(mainView);
  mainView.setAutoResize({ width: true, height: true });
  updateViewBounds();
  attachViewHandlers();
  mainView.webContents.loadURL("about:blank");

  mainWindow.on("resize", updateViewBounds);
  mainWindow.on("enter-full-screen", updateViewBounds);
  mainWindow.on("leave-full-screen", updateViewBounds);
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
app.on(
  "activate",
  () => BrowserWindow.getAllWindows().length === 0 && createWindow()
);

ipcMain.on("browserview-load", (_event, { url, tabId }) => {
  if (!mainView || !url) return;
  activeTabId = tabId || activeTabId;
  mainView.webContents.loadURL(url);
});
