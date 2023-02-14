import { app, dialog } from 'electron';
import fs from 'fs';
import Ajv, { JSONSchemaType } from 'ajv';
import * as os from 'os';
import PartieConfigInterface from '../../schema/interfaces/partieConfigInterface';
import * as PartieConfigSchema from '../../schema/partieConfigSchema.json';
import BoardConfigInterface from '../../schema/interfaces/boardConfigInterface';
import * as BoardConfigSchema from '../../schema/boardConfigSchema.json';
import PresetsLoader, { RiverPreset } from './PresetsLoader';
import { RandomBoardStartValues } from '../../renderer/components/RandomBoardStartValuesDialog';

class IPCHelper {
	static handleSavePartieConfig = async (json: string): Promise<boolean> => {
		const { canceled, filePath } = await dialog.showSaveDialog({
			title: 'Partie-Konfiguration speichern',
			filters: [{ name: 'Partie-Konfig', extensions: ['json'] }],
		});
		if (canceled) {
			return false;
		}
		if (filePath) {
			fs.writeFileSync(filePath, json, { encoding: 'utf8', flag: 'w' });
			return true;
		}
		return false;
	};

	static handleFileOpen = async (type = ''): Promise<boolean | object> => {
		if (type === 'board') {
			const { canceled, filePaths } = await dialog.showOpenDialog({
				title: 'Board-Konfiguration auswählen',
				properties: ['openFile'],
				filters: [{ name: 'Board-Konfig', extensions: ['json'] }],
			});
			if (canceled) {
				return false;
			}
			return JSON.parse(
				fs.readFileSync(filePaths[0], { encoding: 'utf8' })
			);
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
			return JSON.parse(
				fs.readFileSync(filePaths[0], { encoding: 'utf8' })
			);
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
			return JSON.parse(
				fs.readFileSync(filePaths[0], { encoding: 'utf8' })
			);
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

	static handleSaveBoardConfig = async (json: string): Promise<boolean> => {
		const { canceled, filePath } = await dialog.showSaveDialog({
			title: 'Board-Konfiguration speichern',
			filters: [{ name: 'Board-Konfig', extensions: ['json'] }],
		});
		if (canceled) {
			return false;
		}
		if (filePath) {
			fs.writeFileSync(filePath, json, { encoding: 'utf8', flag: 'w' });
			return true;
		}
		return false;
	};

	static loadPresets = (): Array<RiverPreset> => {
		const loader = new PresetsLoader();
		return loader.riverPresets;
	};

	static getOS = (): NodeJS.Platform => {
		return os.platform();
	};

	static generateRandomBoard = (
		startValue: RandomBoardStartValues
	): { board: BoardConfigInterface; preview: string } => {
		return {
			board: {
				name: startValue.name,
				width: startValue.width,
				height: startValue.height,
				startFields: [],
				checkPoints: [],
			},
			preview: '',
		};
	};
}

export default IPCHelper;
