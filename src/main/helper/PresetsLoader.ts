import fs from 'fs';
import Ajv, { JSONSchemaType } from 'ajv';
import path from 'path';
import { app } from 'electron';
import * as RiverPresetSchema from '../../schema/riverPreset.schema.json';
import * as BoardPresetSchema from '../../schema/boardPreset.schema.json';

export type RiverPreset = {
	name: string;
	file: string;
	data: {
		position: [number, number];
		direction: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
	}[];
};
export type BoardPreset = {
	name: string;
	file: string;
	data: object;
};

class PresetsLoader {
	private static riverPresetFolder: string =
		PresetsLoader.getAssetPath('presets/rivers/');

	private static boardPresetFolder: string =
		PresetsLoader.getAssetPath('presets/boards/');

	public static getRiverPresets() {
		const riverPresets: Array<RiverPreset> = [];
		const files = fs.readdirSync(PresetsLoader.riverPresetFolder);
		files.forEach((file) => {
			const content = fs.readFileSync(
				PresetsLoader.riverPresetFolder + file,
				{
					encoding: 'utf8',
				}
			);
			const valid = PresetsLoader.validateFile('river', content);
			if (valid) {
				riverPresets.push({
					...(JSON.parse(content) as RiverPreset),
					file: PresetsLoader.riverPresetFolder + file,
				});
			}
		});
		return riverPresets;
	}

	public static getBoardPresets() {
		const boardPresets: Array<BoardPreset> = [];
		const files = fs.readdirSync(PresetsLoader.boardPresetFolder);
		files.forEach((file) => {
			const content = fs.readFileSync(
				PresetsLoader.boardPresetFolder + file,
				{
					encoding: 'utf8',
				}
			);
			const valid = PresetsLoader.validateFile('board', content);
			if (valid) {
				boardPresets.push({
					...(JSON.parse(content) as BoardPreset),
					file: PresetsLoader.boardPresetFolder + file,
				});
			}
		});
		return boardPresets;
	}

	static validateFile(type: 'river' | 'board', content: string) {
		const ajv = new Ajv({ allErrors: true });
		if (type === 'river') {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const schema: JSONSchemaType<RiverPreset> = RiverPresetSchema;
			const validate = ajv.compile(schema);
			try {
				return !!validate(JSON.parse(content));
			} catch (e) {
				return false;
			}
		}
		if (type === 'board') {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const schema: JSONSchemaType<BoardPreset> = BoardPresetSchema;
			const validate = ajv.compile(schema);
			try {
				return !!validate(JSON.parse(content));
			} catch (e) {
				return false;
			}
		}
		return false;
	}

	static getAssetPath(...paths: string[]): string {
		return path.join(
			app.isPackaged
				? path.join(process.resourcesPath, 'assets')
				: path.join(__dirname, '../../../assets'),
			...paths
		);
	}
}

export default PresetsLoader;
