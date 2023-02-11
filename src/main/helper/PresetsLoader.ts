import fs from 'fs';
import Ajv, { JSONSchemaType } from 'ajv';
import { app } from 'electron';
import path from 'path';
import * as RiverPresetSchema from '../../schema/river.schema.json';

export type RiverPreset = {
	name: string;
	data: {
		position: [number, number];
		direction: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
	}[];
};

class PresetsLoader {
	private riverPresetFolder: string =
		PresetsLoader.getAssetPath('presets/rivers/');

	private p_riverPresets: Array<RiverPreset> = [];

	constructor() {
		const files = fs.readdirSync(this.riverPresetFolder);
		files.forEach((file) => {
			const content = fs.readFileSync(this.riverPresetFolder + file, {
				encoding: 'utf8',
			});
			const valid = PresetsLoader.validateFile('river', content);
			if (valid) {
				this.p_riverPresets.push(JSON.parse(content) as RiverPreset);
			}
		});
	}

	get riverPresets(): Array<RiverPreset> {
		return this.p_riverPresets;
	}

	static validateFile(type: 'river' | 'board', content: string) {
		const ajv = new Ajv({ allErrors: true });
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const schema: JSONSchemaType<RiverPreset> = RiverPresetSchema;
		const validate = ajv.compile(schema);
		try {
			if (validate(JSON.parse(content))) {
				return true;
			}
			return false;
		} catch (e) {
			return false;
		}
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
