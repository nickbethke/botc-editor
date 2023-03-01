/* eslint global-require: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { resolveHtmlPath } from './util';
import IPCHelper from './helper/IPCHelper';

class AppUpdater {
	constructor() {
		log.transports.file.level = 'info';
		autoUpdater.logger = log;
		autoUpdater.checkForUpdatesAndNotify();
	}
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
	const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
	event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
	const sourceMapSupport = require('source-map-support');
	sourceMapSupport.install();
}

const isDebug =
	process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
	require('electron-debug')();
}

const installExtensions = async () => {
	const installer = require('electron-devtools-installer');
	const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
	const extensions = ['REACT_DEVELOPER_TOOLS'];

	return installer
		.default(
			extensions.map((name) => installer[name]),
			forceDownload
		)
		.catch(console.log);
};

const createWindow = async () => {
	if (isDebug) {
		await installExtensions();
	}

	const RESOURCES_PATH = app.isPackaged
		? path.join(process.resourcesPath, 'assets')
		: path.join(__dirname, '../../assets');

	const getAssetPath = (...paths: string[]): string => {
		return path.join(RESOURCES_PATH, ...paths);
	};

	mainWindow = new BrowserWindow({
		backgroundColor: 'hsl(233,89%,4%)',
		autoHideMenuBar: true,
		show: false,
		width: 1195,
		height: 880,
		minWidth: 1195,
		minHeight: 880,
		titleBarStyle: 'hidden',
		titleBarOverlay: {
			color: 'hsl(204,14%,49%)',
			symbolColor: '#ffffff',
			height: 32,
		},
		icon: getAssetPath('icon.png'),
		webPreferences: {
			// devTools: false,
			preload: app.isPackaged
				? path.join(__dirname, 'preload.js')
				: path.join(__dirname, '../../.erb/dll/preload.js'),
		},
	});

	mainWindow.on('resize', () => {
		if (mainWindow) {
			process.stdout.write(`resize: ${mainWindow.getSize()}\r`);
		}
	});

	await mainWindow.loadURL(resolveHtmlPath('index.html'));

	mainWindow.on('ready-to-show', () => {
		if (!mainWindow) {
			throw new Error('"mainWindow" is not defined');
		}
		if (process.env.START_MINIMIZED) {
			mainWindow.minimize();
		} else {
			mainWindow.show();
		}
	});

	mainWindow.on('closed', () => {
		mainWindow = null;
	});

	mainWindow.setMenu(null);

	// Open urls in the user's browser
	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: 'deny' };
	});

	// Remove this if your app does not use auto updates
	// eslint-disable-next-line
	new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
	// Respect the OSX convention of having the application in memory even
	// after all windows have been closed
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

function formatBytes(bytes: number, decimals = 2) {
	if (!+bytes) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

app.whenReady()
	.then(() => {
		createWindow();
		app.on('activate', () => {
			// On macOS, it's common to re-create a window in the app when the
			// dock icon is clicked and there are no other windows openExternal.
			if (mainWindow === null) createWindow();
		});

		ipcMain.handle('dialog:openBoardConfig', async () => {
			return IPCHelper.handleFileOpen('board');
		});
		ipcMain.handle('dialog:openPartieConfig', async () => {
			return IPCHelper.handleFileOpen('partie');
		});
		ipcMain.handle('dialog:savePartieConfig', async (event, ...args) => {
			return IPCHelper.handleSavePartieConfig(args[0]);
		});
		ipcMain.handle('dialog:saveBoardConfig', async (event, ...args) => {
			return IPCHelper.handleSaveBoardConfig(args[0]);
		});
		ipcMain.handle('dialog:openConfig', async () => {
			return IPCHelper.handleFileOpen();
		});
		ipcMain.handle('validate:json', (event, ...args) => {
			return IPCHelper.jsonValidate(args[0], args[1]);
		});
		ipcMain.handle('app-close', IPCHelper.closeApp);

		ipcMain.handle('load:presets', () => {
			return IPCHelper.loadPresets();
		});
		ipcMain.handle('get:isLinux', () => {
			return IPCHelper.getOS() === 'linux';
		});
		ipcMain.handle('get:isMac', () => {
			return IPCHelper.getOS() === 'darwin';
		});
		ipcMain.handle('get:isWin', () => {
			return IPCHelper.getOS() === 'win32';
		});
		ipcMain.handle('get:os', () => {
			return IPCHelper.getOS();
		});
		ipcMain.handle('get:version', () => {
			return app.getVersion();
		});
		ipcMain.handle('file:openExternal', (event, ...args) => {
			return IPCHelper.openFile(args[0]);
		});
		ipcMain.handle('file:openDir', (event, ...args) => {
			return IPCHelper.openDirectory(args[0]);
		});
		ipcMain.handle('file:save', (event, ...args) => {
			return IPCHelper.saveFile(args[0], args[1]);
		});
		setInterval(() => {
			process.stdout.write(
				`CPU: ${process
					.getCPUUsage()
					.percentCPUUsage.toFixed(2)} RAM: ${formatBytes(
					process.getSystemMemoryInfo().free * 1000,
					2
				)}/${formatBytes(
					process.getSystemMemoryInfo().total * 1000,
					2
				)} OS Version: ${process.getSystemVersion()}                     \r`
			);
		}, 500);
	})
	.catch(console.log);
