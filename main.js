const { app, BrowserWindow, ipcMain, Menu } = require("electron");

// Menu
const template = require("./menu");
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

const path = require("path");

// electron context menu
contextMenu = require("electron-context-menu");
contextMenu({
    showSaveImageAs: false,
    showSearchWithGoogle: false,
    showInspectElement: false,
    showSelectAll: false,
    showCopyImage: false,
});

// check if electron is in dev modea
const isEnvSet = "ELECTRON_IS_DEV" in process.env;
const getFromEnv = Number.parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
const isDev = isEnvSet ? getFromEnv : !app.isPackaged;

async function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });
    win.maximize();
    win.show();

    const loadSystem = () =>
        isDev
            ? win.loadURL("http://localhost:4200")
            : win.loadFile("app/browser/index.html");

    loadSystem();

    win.webContents.on("did-fail-load", () => loadSystem());

    // require update module
    const updater = require("./update");
    updater(win, ipcMain);
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        // if (!isDev) {
        //     node.close();
        // }
        app.quit();
    }
});

// -------------------------
// Generic print handler
// -------------------------

// Common print window options
const PRINT_WINDOW_CONFIG = {
    width: 706.95553,
    height: 1000,
    show: false,
    webPreferences: {
        preload: path.join(__dirname, "preload.js"),
    },
};
const PRINT_OPTIONS = { silent: false, marginsType: 0 };

// handle print function
async function handlePrint(templatePath, data) {
    const printWindow = new BrowserWindow(PRINT_WINDOW_CONFIG);
    await printWindow.loadFile(templatePath);
    printWindow.show();

    printWindow.webContents.on("did-finish-load", async () => {
        await printWindow.webContents.send("printDocument", data);
        printWindow.webContents.print(PRINT_OPTIONS, () => printWindow.close());
    });
}

// Register IPC handlers
ipcMain.handle("print-invoice", (e, data) =>
    handlePrint("assets/print.html", data)
);
ipcMain.handle("print-statement", (e, data) =>
    handlePrint("assets/printStatement.html", data)
);
ipcMain.handle("print-stock", (e, data) =>
    handlePrint("assets/stock.html", data)
);

// // let printWindow;
// // ipcMain.handle("print-invoice", async (event, data) => {
// //     printWindow = new BrowserWindow({
// //         width: 706.95553,
// //         height: 1000,
// //         show: false,
// //         webPreferences: {
// //             preload: path.join(__dirname, "preload.js"),
// //         },
// //     });

// //     printWindow.loadFile("assets/print.html");
// //     printWindow.show();

// //     const printOptions = {
// //         silent: false, // Print without showing a dialog (optional)
// //         marginsType: 0, // Set margin type (optional)
// //     };
// //     printWindow.webContents.on("did-finish-load", async function () {
// //         await printWindow.webContents.send("printDocument", data);
// //         printWindow.webContents.print(printOptions, (success) => {
// //             printWindow.close();
// //         });
// //     });
// // });

// // ipcMain.handle("print-statement", async (event, data) => {
// //     printWindow = new BrowserWindow({
// //         width: 706.95553,
// //         height: 1000,
// //         show: false,
// //         webPreferences: {
// //             preload: path.join(__dirname, "preload.js"),
// //         },
// //     });

// //     printWindow.loadFile("assets/printStatement.html");
// //     printWindow.show();

// //     const printOptions = {
// //         silent: false, // Print without showing a dialog (optional)
// //         marginsType: 0, // Set margin type (optional)
// //     };
// //     printWindow.webContents.on("did-finish-load", async function () {
// //         await printWindow.webContents.send("printDocument", data);
// //         printWindow.webContents.print(printOptions, (success) => {
// //             printWindow.close();
// //         });
// //     });
// // });

// // ipcMain.handle("print-stock", async (event, data) => {
// //     // console.log(data);
// //     printWindow = new BrowserWindow({
// //         width: 706.95553,
// //         height: 1000,
// //         show: false,
// //         webPreferences: {
// //             preload: path.join(__dirname, "preload.js"),
// //         },
// //     });

// //     printWindow.loadFile("assets/stock.html");
// //     printWindow.show();

// //     const printOptions = {
// //         silent: false, // Print without showing a dialog (optional)
// //         marginsType: 0, // Set margin type (optional)
// //     };
// //     printWindow.webContents.on("did-finish-load", async function () {
// //         await printWindow.webContents.send("printDocument", data);
// //         printWindow.webContents.print(printOptions, (success) => {
// //             // printWindow.close();
// //         });
// //     });
// // });
