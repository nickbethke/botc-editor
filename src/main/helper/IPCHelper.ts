import { app, BrowserWindow, clipboard, dialog, shell } from 'electron';
import fs from 'fs';
import Ajv, { JSONSchemaType } from 'ajv';
import * as os from 'os';
import path, { ParsedPath } from 'path';
import * as PartieConfigSchema from '../../schema/partieConfigSchema.json';
import * as BoardConfigSchema from '../../schema/boardConfigSchema.json';
import PresetsLoader, { BoardPresetWithFile, RiverPresetWithFile } from './PresetsLoader';
import PartieConfigInterface from '../../renderer/components/interfaces/PartieConfigInterface';
import BoardConfigInterface from '../../renderer/components/interfaces/BoardConfigInterface';
import * as SettingsSchema from '../../schema/settings.schema.json';
import { SettingsInterface } from '../../interfaces/SettingsInterface';
import { getAppDataPath } from './functions';

class IPCHelper {
	static readonly defaultSettings: SettingsInterface = {
		darkMode: true,
		language: 'de',
		popupsDraggable: true,
	};

	static handleSavePartieConfig = async (
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
				title: 'Partie-Konfiguration speichern',
				filters: [{ name: 'Partie-Konfig', extensions: ['json'] }],
			});
			currentCanceled = canceled;
			currentFilePath = filePath;
		} else {
			const { canceled, filePath } = await dialog.showSaveDialog({
				title: 'Partie-Konfiguration speichern',
				filters: [{ name: 'Partie-Konfig', extensions: ['json'] }],
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

	static handleFileOpen = async (
		type = '',
		window: BrowserWindow | null
	): Promise<{ parsedPath: ParsedPath; path: string; config: BoardConfigInterface } | false> => {
		if (type === 'board') {
			let currentCanceled;
			let currentFilePaths;
			if (window) {
				const { canceled, filePaths } = await dialog.showOpenDialog(window, {
					title: 'Board-Konfiguration auswählen',
					properties: ['openFile'],
					filters: [{ name: 'Board-Konfig', extensions: ['json'] }],
				});
				currentCanceled = canceled;
				currentFilePaths = filePaths;
			} else {
				const { canceled, filePaths } = await dialog.showOpenDialog({
					title: 'Board-Konfiguration auswählen',
					properties: ['openFile'],
					filters: [{ name: 'Board-Konfig', extensions: ['json'] }],
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
		if (type === 'partie') {
			let currentCanceled;
			let currentFilePaths;
			if (window) {
				const { canceled, filePaths } = await dialog.showOpenDialog(window, {
					title: 'Partie-Konfiguration auswählen',
					properties: ['openFile'],
					filters: [{ name: 'Partie-Konfig', extensions: ['json'] }],
				});
				currentCanceled = canceled;
				currentFilePaths = filePaths;
			} else {
				const { canceled, filePaths } = await dialog.showOpenDialog({
					title: 'Partie-Konfiguration auswählen',
					properties: ['openFile'],
					filters: [{ name: 'Partie-Konfig', extensions: ['json'] }],
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
		if (type === '') {
			let currentCanceled;
			let currentFilePaths;
			if (window) {
				const { canceled, filePaths } = await dialog.showOpenDialog(window, {
					title: 'Konfiguration auswählen',
					properties: ['openFile'],
					filters: [
						{ name: 'Partie-Konfig', extensions: ['json'] },
						{ name: 'Board-Konfig', extensions: ['json'] },
					],
				});
				currentCanceled = canceled;
				currentFilePaths = filePaths;
			} else {
				const { canceled, filePaths } = await dialog.showOpenDialog({
					title: 'Konfiguration auswählen',
					properties: ['openFile'],
					filters: [
						{ name: 'Partie-Konfig', extensions: ['json'] },
						{ name: 'Board-Konfig', extensions: ['json'] },
					],
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
		return false;
	};

	static jsonValidate = (json: object, type: 'board' | 'partie' = 'partie') => {
		const ajv = new Ajv({ allErrors: true });
		let validate;
		let schema: JSONSchemaType<PartieConfigInterface> | JSONSchemaType<BoardConfigInterface>;
		if (type === 'partie') {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			schema = PartieConfigSchema;
			validate = ajv.compile(schema);
		} else {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			schema = BoardConfigSchema;
			validate = ajv.compile(schema);
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
				title: 'Board-Konfiguration speichern',
				filters: [{ name: 'Board-Konfig', extensions: ['json'] }],
			});
			currentCanceled = canceled;
			currentFilePath = filePath;
		} else {
			const { canceled, filePath } = await dialog.showSaveDialog({
				title: 'Board-Konfiguration speichern',
				filters: [{ name: 'Board-Konfig', extensions: ['json'] }],
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

	static openFile(file: string) {
		shell.openPath(file).catch(() => {});
	}

	static openDirectory(file: string) {
		const { dir } = path.parse(file);
		shell.openPath(dir).catch(() => {});
	}

	static openDirectoryDirectly(dir: string) {
		shell.openPath(dir).catch(() => {});
	}

	static saveFile(file: string, content: string) {
		if (fs.existsSync(file)) {
			fs.writeFileSync(file, content, { encoding: 'utf8', flag: 'w' });
			return true;
		}
		return 'File does not exits';
	}

	static async saveScreenShotDialog(file: string, content: string, window: BrowserWindow | null) {
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

	static removeFile(file: string) {
		if (fs.existsSync(file)) {
			fs.unlinkSync(file);
			return true;
		}
		return 'File does not exits';
	}

	static async openHomepage() {
		await shell.openExternal('https://battle-of-the-centerlaend.web.app');
	}

	static loadLanguageFile(lang: string) {
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

	static clipBoardWrite(text: string) {
		clipboard.writeText(text);
	}

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
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const validate = ajv.compile(SettingsSchema);

		try {
			if (validate(JSON.parse(content))) {
				return {
					os: IPCHelper.getOS(),
					settings: JSON.parse(content) as SettingsInterface,
				};
			}
			return {
				os: IPCHelper.getOS(),
				settings: IPCHelper.defaultSettings,
			};
		} catch (e) {
			return {
				os: IPCHelper.getOS(),
				settings: IPCHelper.defaultSettings,
			};
		}
	}

	static updateSettings(settings: SettingsInterface) {
		const settingsPath = getAppDataPath('/settings.json');
		if (!fs.existsSync(settingsPath)) {
			fs.writeFileSync(settingsPath, JSON.stringify({ ...IPCHelper.defaultSettings, settings }, null, 4));
			return { ...IPCHelper.defaultSettings, settings };
		}
		fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));
		return settings;
	}

	static savePreset(file: string, content: string) {
		return PresetsLoader.saveRiverPreset(file, content);
	}

	static renamePreset(from: string, to: string) {
		return PresetsLoader.renameRiverPreset(from, to);
	}

	static getSchemaPartie() {
		return PartieConfigSchema;
	}

	static getSchemaBoard() {
		return BoardConfigSchema;
	}

	static openPresetDir() {
		IPCHelper.openDirectoryDirectly(path.join(getAppDataPath(), '/presets/'));
	}
}

export default IPCHelper;
