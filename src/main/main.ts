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
import { resolveHtmlPath } from './util';
import IPCHelper from './helper/IPCHelper';
import PresetsLoader from './helper/PresetsLoader';

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
	const sourceMapSupport = require('source-map-support');
	sourceMapSupport.install();
}

const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

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
		.catch(() => {});
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
		backgroundColor: '#ffffff',
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
			preload: app.isPackaged ? path.join(__dirname, 'preload.js') : path.join(__dirname, '../../.erb/dll/preload.js'),
		},
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
	// new AppUpdater();
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
const registerHandlers = () => {
	ipcMain.handle('dialog:openBoardConfig', async () => {
		return IPCHelper.handleFileOpen('board', mainWindow);
	});
	ipcMain.handle('dialog:openPartieConfig', async () => {
		return IPCHelper.handleFileOpen('partie', mainWindow);
	});
	ipcMain.handle('dialog:savePartieConfig', async (event, ...args) => {
		return IPCHelper.handleSavePartieConfig(args[0], mainWindow);
	});
	ipcMain.handle('dialog:saveBoardConfig', async (event, ...args) => {
		return IPCHelper.handleSaveBoardConfig(args[0], mainWindow);
	});
	ipcMain.handle('dialog:openConfig', async () => {
		return IPCHelper.handleFileOpen('', mainWindow);
	});

	ipcMain.handle('dialog:saveScreenshot', (event, ...args) => {
		return IPCHelper.saveScreenShotDialog(args[0], args[1], mainWindow);
	});

	ipcMain.handle('validate:json', (event, ...args) => {
		return IPCHelper.jsonValidate(args[0], args[1]);
	});
	ipcMain.handle('app-close', () => {
		mainWindow = null;
		if (process.platform !== 'darwin') {
			app.quit();
		}
	});

	ipcMain.handle('load:presets', () => {
		return IPCHelper.loadPresets();
	});
	ipcMain.handle('load:riverPresets', () => {
		return IPCHelper.loadRiverPresets();
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
	ipcMain.handle('file:remove', (event, ...args) => {
		return IPCHelper.removeFile(args[0]);
	});

	ipcMain.handle('open:homepage', () => {
		return IPCHelper.openHomepage();
	});

	ipcMain.handle('file:getTranslation', (event, ...args) => {
		return IPCHelper.loadLanguageFile(args[0]);
	});

	ipcMain.handle('file:openPresetDir', () => {
		return IPCHelper.openDirectoryDirectly(path.join(PresetsLoader.getAssetPath(), '/presets/'));
	});
	ipcMain.handle('clipboard:write', (event, ...args) => {
		return IPCHelper.clipBoardWrite(args[0]);
	});

	ipcMain.handle('get:prefetch', () => {
		return IPCHelper.prefetch();
	});

	ipcMain.handle('update:settings', (event, ...args) => {
		return IPCHelper.updateSettings(args[0]);
	});
	ipcMain.handle('beep', () => {
		return shell.beep();
	});
	ipcMain.handle('file:savePreset', (event, ...args) => {
		return IPCHelper.savePreset(args[0], args[1]);
	});
	ipcMain.handle('file:renamePreset', (event, ...args) => {
		return IPCHelper.renamePreset(args[0], args[1]);
	});
};
app
	.whenReady()
	.then(() => {
		createWindow();
		app.on('activate', () => {
			// On macOS, it's common to re-create a window in the app when the
			// dock icon is clicked and there are no other windows openExternal.
			if (mainWindow === null) createWindow();
		});
		registerHandlers();
	})
	.catch(() => {});
