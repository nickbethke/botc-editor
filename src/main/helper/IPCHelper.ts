import { app, dialog, shell } from 'electron';
import fs from 'fs';
import Ajv, { JSONSchemaType } from 'ajv';
import * as os from 'os';
import path, { ParsedPath } from 'path';
import * as PartieConfigSchema from '../../schema/partieConfigSchema.json';
import * as BoardConfigSchema from '../../schema/boardConfigSchema.json';
import PresetsLoader, { BoardPreset, RiverPreset } from './PresetsLoader';
import PartieConfigInterface from '../../renderer/components/interfaces/PartieConfigInterface';
import BoardConfigInterface from '../../renderer/components/interfaces/BoardConfigInterface';

class IPCHelper {
	static handleSavePartieConfig = async (
		json: string
	): Promise<
		| {
				parsedPath: ParsedPath;
				path: string;
		  }
		| false
	> => {
		const { canceled, filePath } = await dialog.showSaveDialog({
			title: 'Partie-Konfiguration speichern',
			filters: [{ name: 'Partie-Konfig', extensions: ['json'] }],
		});
		if (canceled) {
			return false;
		}
		if (filePath) {
			fs.writeFileSync(filePath, json, { encoding: 'utf8', flag: 'w' });
			return {
				parsedPath: path.parse(filePath),
				path: filePath,
			};
		}
		return false;
	};

	static handleFileOpen = async (
		type = ''
	): Promise<
		| { parsedPath: ParsedPath; path: string; config: BoardConfigInterface }
		| false
	> => {
		if (type === 'board') {
			const { canceled, filePaths } = await dialog.showOpenDialog({
				title: 'Board-Konfiguration auswählen',
				properties: ['openFile'],
				filters: [{ name: 'Board-Konfig', extensions: ['json'] }],
			});
			if (canceled) {
				return false;
			}
			const config = JSON.parse(
				fs.readFileSync(filePaths[0], { encoding: 'utf8' })
			) as BoardConfigInterface;
			return {
				config,
				parsedPath: path.parse(filePaths[0]),
				path: filePaths[0],
			};
		}
		if (type === 'partie') {
			const { canceled, filePaths } = await dialog.showOpenDialog({
				title: 'Partie-Konfiguration auswählen',
				properties: ['openFile'],
				filters: [{ name: 'Partie-Konfig', extensions: ['json'] }],
			});
			if (canceled) {
				return false;
			}
			const config = JSON.parse(
				fs.readFileSync(filePaths[0], { encoding: 'utf8' })
			) as BoardConfigInterface;
			return {
				config,
				parsedPath: path.parse(filePaths[0]),
				path: filePaths[0],
			};
		}
		if (type === '') {
			const { canceled, filePaths } = await dialog.showOpenDialog({
				title: 'Konfiguration auswählen',
				properties: ['openFile'],
				filters: [
					{ name: 'Partie-Konfig', extensions: ['json'] },
					{ name: 'Board-Konfig', extensions: ['json'] },
				],
			});
			if (canceled) {
				return false;
			}
			const config = JSON.parse(
				fs.readFileSync(filePaths[0], { encoding: 'utf8' })
			) as BoardConfigInterface;

			return {
				config,
				parsedPath: path.parse(filePaths[0]),
				path: filePaths[0],
			};
		}
		return false;
	};

	static closeApp = () => {
		if (process.platform !== 'darwin') {
			app.quit();
		}
	};

	static jsonValidate = (
		json: object,
		type: 'board' | 'partie' = 'partie'
	) => {
		const ajv = new Ajv({ allErrors: true });
		let validate;
		let schema:
			| JSONSchemaType<PartieConfigInterface>
			| JSONSchemaType<BoardConfigInterface>;
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
		json: string
	): Promise<
		| {
				parsedPath: ParsedPath;
				path: string;
		  }
		| false
	> => {
		const { canceled, filePath } = await dialog.showSaveDialog({
			title: 'Board-Konfiguration speichern',
			filters: [{ name: 'Board-Konfig', extensions: ['json'] }],
		});
		if (canceled) {
			return false;
		}
		if (filePath) {
			fs.writeFileSync(filePath, json, { encoding: 'utf8', flag: 'w' });
			return {
				parsedPath: path.parse(filePath),
				path: filePath,
			};
		}
		return false;
	};

	static loadPresets = (): {
		rivers: Array<RiverPreset>;
		boards: Array<BoardPreset>;
	} => {
		return {
			rivers: PresetsLoader.getRiverPresets(),
			boards: PresetsLoader.getBoardPresets(),
		};
	};

	static getOS = (): NodeJS.Platform => {
		return os.platform();
	};

	static openFile(file: string) {
		shell.openPath(file).catch(console.log);
	}

	static openDirectory(file: string) {
		const { dir } = path.parse(file);
		shell.openPath(dir).catch(console.log);
	}

	static saveFile(file: string, content: string) {
		if (fs.existsSync(file)) {
			fs.writeFileSync(file, content, { encoding: 'utf8', flag: 'w' });
			return true;
		}
		return 'File does not exits';
	}

	static removeFile(file: string) {
		if (fs.existsSync(file)) {
			fs.unlinkSync(file);
			return true;
		}
		return 'File does not exits';
	}
}

export default IPCHelper;
