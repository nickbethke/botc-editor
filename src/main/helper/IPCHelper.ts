import { app, BrowserWindow, clipboard, dialog, shell } from 'electron';
import fs from 'fs';
import Ajv from 'ajv';
import * as os from 'os';
import path, { ParsedPath } from 'path';
import * as GameConfigSchema from '../../schema/gameConfigSchema.json';
import * as BoardConfigSchema from '../../schema/boardConfigSchema.json';
import PresetsLoader, { BoardPresetWithFile, RiverPresetWithFile } from './PresetsLoader';
import GameConfigInterface from '../../interfaces/GameConfigInterface';
import BoardConfigInterface from '../../interfaces/BoardConfigInterface';
import * as SettingsSchema from '../../schema/settings.schema.json';
import { SettingsInterface } from '../../interfaces/SettingsInterface';
import { getAppDataPath } from './functions';
import { ConfigType } from '../../interfaces/Types';

/**
 * The ipc helper class.
 */
class IPCHelper {
	/**
	 * The default app settings
	 */
	static readonly defaultSettings: SettingsInterface = {
		darkMode: true,
		language: 'de',
		popupsDraggable: true,
		defaultValues: {
			defaultBoardName: 'New Board',
			maxBoardSize: 20,
			maxCheckpoints: 16,
			maxLembasFields: 16,
			maxLembasCount: 10,
			maxHoles: 16,
			maxEagleFields: 16,
		},
	};

	/**
	 * Saves a party configuration to a file by displaying a save dialog.
	 * @param json The party configuration to save.
	 * @param window
	 */
	static handleSaveGameConfig = async (
		json: string,
		window: BrowserWindow | null
	): Promise<
		| {
				parsedPath: ParsedPath;
				path: string;
		  }
		| false
		| 'canceled'
	> => {
		let currentCanceled;
		let currentFilePath;
		if (window) {
			const { canceled, filePath } = await dialog.showSaveDialog(window, {
				title: 'Save Game-Configuration',
				filters: [{ name: 'Game-Configuration', extensions: ['json'] }],
			});
			currentCanceled = canceled;
			currentFilePath = filePath;
		} else {
			const { canceled, filePath } = await dialog.showSaveDialog({
				title: 'Save Game-Configuration',
				filters: [{ name: 'Game-Configuration', extensions: ['json'] }],
			});
			currentCanceled = canceled;
			currentFilePath = filePath;
		}
		if (currentCanceled) {
			return 'canceled';
		}
		if (currentFilePath) {
			fs.writeFileSync(currentFilePath, json, {
				encoding: 'utf8',
				flag: 'w',
			});
			return {
				parsedPath: path.parse(currentFilePath),
				path: currentFilePath,
			};
		}
		return false;
	};

	static handleFileOpen = async (
		window: BrowserWindow | null,
		type: '' | ConfigType = ''
	): Promise<
		| { parsedPath: ParsedPath; path: string; config: GameConfigInterface }
		| {
				parsedPath: ParsedPath;
				path: string;
				config: BoardConfigInterface;
		  }
		| { parsedPath: ParsedPath; path: string; config: never }
		| false
	> => {
		if (type === 'board') {
			let currentCanceled;
			let currentFilePaths;
			if (window) {
				const { canceled, filePaths } = await dialog.showOpenDialog(window, {
					title: 'Select Board-Configuration',
					properties: ['openFile'],
					filters: [{ name: 'Board-Configuration', extensions: ['json'] }],
				});
				currentCanceled = canceled;
				currentFilePaths = filePaths;
			} else {
				const { canceled, filePaths } = await dialog.showOpenDialog({
					title: 'Select Board-Configuration',
					properties: ['openFile'],
					filters: [{ name: 'Board-Configuration', extensions: ['json'] }],
				});
				currentCanceled = canceled;
				currentFilePaths = filePaths;
			}
			if (currentCanceled) {
				return false;
			}
			const config = JSON.parse(fs.readFileSync(currentFilePaths[0], { encoding: 'utf8' })) as BoardConfigInterface;
			return {
				config,
				parsedPath: path.parse(currentFilePaths[0]),
				path: currentFilePaths[0],
			};
		}
		if (type === 'game') {
			let currentCanceled;
			let currentFilePaths;
			if (window) {
				const { canceled, filePaths } = await dialog.showOpenDialog(window, {
					title: 'Select Game-Configuration',
					properties: ['openFile'],
					filters: [{ name: 'Game-Configuration', extensions: ['json'] }],
				});
				currentCanceled = canceled;
				currentFilePaths = filePaths;
			} else {
				const { canceled, filePaths } = await dialog.showOpenDialog({
					title: 'Select Game-Configuration',
					properties: ['openFile'],
					filters: [{ name: 'Game-Configuration', extensions: ['json'] }],
				});
				currentCanceled = canceled;
				currentFilePaths = filePaths;
			}
			if (currentCanceled) {
				return false;
			}
			const config = JSON.parse(fs.readFileSync(currentFilePaths[0], { encoding: 'utf8' })) as GameConfigInterface;
			return {
				config,
				parsedPath: path.parse(currentFilePaths[0]),
				path: currentFilePaths[0],
			};
		}
		if (type === '') {
			let currentCanceled;
			let currentFilePaths;
			if (window) {
				const { canceled, filePaths } = await dialog.showOpenDialog(window, {
					title: 'Select Configuration',
					properties: ['openFile'],
					filters: [
						{ name: 'Game-Configuration', extensions: ['json'] },
						{ name: 'Board-Configuration', extensions: ['json'] },
					],
				});
				currentCanceled = canceled;
				currentFilePaths = filePaths;
			} else {
				const { canceled, filePaths } = await dialog.showOpenDialog({
					title: 'Select Configuration',
					properties: ['openFile'],
					filters: [
						{ name: 'Game-Configuration', extensions: ['json'] },
						{ name: 'Board-Configuration', extensions: ['json'] },
					],
				});
				currentCanceled = canceled;
				currentFilePaths = filePaths;
			}
			if (currentCanceled) {
				return false;
			}
			const config = JSON.parse(fs.readFileSync(currentFilePaths[0], { encoding: 'utf8' }));

			return {
				config,
				parsedPath: path.parse(currentFilePaths[0]),
				path: currentFilePaths[0],
			};
		}
		return false;
	};

	static jsonValidate = (json: object, type: ConfigType = 'game'): boolean | string => {
		const ajv = new Ajv({ allErrors: true });
		let validate;
		if (type === 'game') {
			validate = ajv.compile(GameConfigSchema);
		} else {
			validate = ajv.compile(BoardConfigSchema);
		}
		try {
			if (validate(json)) {
				return true;
			}
			return JSON.stringify(validate.errors, null, 4);
		} catch (e) {
			return JSON.stringify({ error: 'invalid JSON format' }, null, 4);
		}
	};

	static handleSaveBoardConfig = async (
		json: string,
		window: BrowserWindow | null
	): Promise<
		| {
				parsedPath: ParsedPath;
				path: string;
		  }
		| false
	> => {
		let currentCanceled;
		let currentFilePath;
		if (window) {
			const { canceled, filePath } = await dialog.showSaveDialog(window, {
				title: 'Board-Configuration speichern',
				filters: [{ name: 'Board-Configuration', extensions: ['json'] }],
			});
			currentCanceled = canceled;
			currentFilePath = filePath;
		} else {
			const { canceled, filePath } = await dialog.showSaveDialog({
				title: 'Board-Configuration speichern',
				filters: [{ name: 'Board-Configuration', extensions: ['json'] }],
			});
			currentCanceled = canceled;
			currentFilePath = filePath;
		}
		if (currentCanceled) {
			return false;
		}
		if (currentFilePath) {
			fs.writeFileSync(currentFilePath, json, {
				encoding: 'utf8',
				flag: 'w',
			});
			return {
				parsedPath: path.parse(currentFilePath),
				path: currentFilePath,
			};
		}
		return false;
	};

	static loadPresets = (): {
		rivers: Array<RiverPresetWithFile>;
		boards: Array<BoardPresetWithFile>;
	} => {
		return {
			rivers: PresetsLoader.getRiverPresets(),
			boards: PresetsLoader.getBoardPresets(),
		};
	};

	static loadRiverPresets = (): Array<RiverPresetWithFile> => {
		return PresetsLoader.getRiverPresets();
	};

	static loadBoardPresets = (): Array<BoardPresetWithFile> => {
		return PresetsLoader.getBoardPresets();
	};

	static getOS = (): NodeJS.Platform => {
		return os.platform();
	};

	static openFile(file: string): void {
		shell.openPath(file).catch(() => {});
	}

	static openDirectory(file: string): void {
		const { dir } = path.parse(file);
		shell.openPath(dir).catch(() => {});
	}

	static openDirectoryDirectly(dir: string): void {
		shell.openPath(dir).catch(() => {});
	}

	static saveFile(file: string, content: string): boolean | string {
		if (fs.existsSync(file)) {
			fs.writeFileSync(file, content, { encoding: 'utf8', flag: 'w' });
			return true;
		}
		return 'File does not exits';
	}

	static async saveScreenShotDialog(file: string, content: string, window: BrowserWindow | null): Promise<boolean> {
		let currentCanceled;
		let currentFilePath;
		if (window) {
			const { canceled, filePath } = await dialog.showSaveDialog(window, {
				title: 'Screenshot speichern',
				defaultPath: file,
				filters: [{ name: 'Images', extensions: ['png'] }],
			});
			currentCanceled = canceled;
			currentFilePath = filePath;
		} else {
			const { canceled, filePath } = await dialog.showSaveDialog({
				title: 'Screenshot speichern',
				defaultPath: file,
				filters: [{ name: 'Images', extensions: ['png'] }],
			});
			currentCanceled = canceled;
			currentFilePath = filePath;
		}
		if (currentCanceled) {
			return false;
		}
		if (currentFilePath) {
			const regex = /^data:.+\/(.+);base64,(.*)$/;

			const matches = content.match(regex);
			if (matches) {
				const data = matches[2];
				const buffer = Buffer.from(data, 'base64');
				fs.writeFileSync(currentFilePath, buffer);
				IPCHelper.openFile(currentFilePath);
				return true;
			}
			return false;
		}
		return false;
	}

	static removeFile(file: string): boolean | string {
		if (fs.existsSync(file)) {
			fs.unlinkSync(file);
			return true;
		}
		return 'File does not exits';
	}

	static loadLanguageFile(lang: string): string {
		const languagesPath = IPCHelper.getAssetPath('languages/');
		if (fs.existsSync(path.join(languagesPath, `${lang}.json`))) {
			return fs.readFileSync(path.join(languagesPath, `${lang}.json`), {
				encoding: 'utf8',
			});
		}
		return JSON.stringify({ lang: '', data: [] });
	}

	static getAssetPath(...paths: string[]): string {
		return path.join(
			app.isPackaged ? path.join(process.resourcesPath, 'assets') : path.join(__dirname, '../../../assets'),
			...paths
		);
	}

	static clipBoardWrite(text: string): void {
		clipboard.writeText(text);
	}

	/**
	 * Prefetches the needed resources for the current platform and the settings
	 */
	static prefetch(): {
		os: NodeJS.Platform;
		settings: SettingsInterface;
	} {
		const settingsPath = getAppDataPath('/settings.json');
		if (!fs.existsSync(settingsPath)) {
			fs.writeFileSync(settingsPath, JSON.stringify(IPCHelper.defaultSettings, null, 4));
			return {
				os: IPCHelper.getOS(),
				settings: IPCHelper.defaultSettings,
			};
		}
		const content = fs.readFileSync(settingsPath, 'utf8');
		const ajv = new Ajv({ allErrors: true });
		const validate = ajv.compile(SettingsSchema);

		try {
			if (validate(JSON.parse(content))) {
				return {
					os: IPCHelper.getOS(),
					settings: JSON.parse(content) as SettingsInterface,
				};
			}
			fs.writeFileSync(settingsPath, JSON.stringify(IPCHelper.defaultSettings, null, 4));
			return {
				os: IPCHelper.getOS(),
				settings: IPCHelper.defaultSettings,
			};
		} catch (e) {
			fs.writeFileSync(settingsPath, JSON.stringify(IPCHelper.defaultSettings, null, 4));
			return {
				os: IPCHelper.getOS(),
				settings: IPCHelper.defaultSettings,
			};
		}
	}

	static updateSettings(settings: SettingsInterface): SettingsInterface {
		const settingsPath = getAppDataPath('/settings.json');
		if (settings.defaultValues.defaultBoardName === '' || settings.defaultValues.defaultBoardName === ' ') {
			settings.defaultValues.defaultBoardName = IPCHelper.defaultSettings.defaultValues.defaultBoardName;
		}

		const ajv = new Ajv({ allErrors: true });
		const validate = ajv.compile(SettingsSchema);

		if (!validate(settings)) {
			fs.writeFileSync(settingsPath, JSON.stringify(IPCHelper.defaultSettings, null, 4));
			return IPCHelper.defaultSettings;
		}

		if (!fs.existsSync(settingsPath)) {
			fs.writeFileSync(settingsPath, JSON.stringify({ ...IPCHelper.defaultSettings, settings }, null, 4));
			return { ...IPCHelper.defaultSettings, ...settings };
		}
		fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));
		return settings;
	}

	static savePreset(file: string, content: string): void {
		return PresetsLoader.saveRiverPreset(file, content);
	}

	static renamePreset(from: string, to: string): Promise<path.ParsedPath> {
		return PresetsLoader.renameRiverPreset(from, to);
	}

	static getSchemaGame(): object {
		return GameConfigSchema;
	}

	static getSchemaBoard(): object {
		return BoardConfigSchema;
	}

	static openPresetDir(): void {
		IPCHelper.openDirectoryDirectly(path.join(getAppDataPath(), '/presets/'));
	}
}

export default IPCHelper;
