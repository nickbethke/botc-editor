import fs from 'fs';
import Ajv from 'ajv';
import path, { ParsedPath } from 'path';
import * as RiverPresetSchema from '../../schema/riverPreset.schema.json';
import * as BoardPresetSchema from '../../schema/boardPreset.schema.json';
import { getAppDataPath } from './functions';
import { Direction, Position } from '../../interfaces/BoardConfigInterface';
import IPCHelper from './IPCHelper';

/**
 * The river preset scheme
 */
export type RiverPreset = {
	name: string;
	width: number;
	height: number;
	data: {
		position: Position;
		direction: Direction;
	}[];
};
/**
 * The river preset schema with file property
 */
export type RiverPresetWithFile = RiverPreset & {
	file: ParsedPath;
};
/**
 * The board preset schema
 */
export type BoardPreset = {
	name: string;
	width: number;
	height: number;
	data: object;
};
/**
 * The board preset schema with file property
 */
export type BoardPresetWithFile = BoardPreset & {
	file: ParsedPath;
};

/**
 * The preset loader class
 */
class PresetsLoader {
	/**
	 * The river presets app data path
	 * @private
	 */
	private static riverPresetFolder: string = getAppDataPath('presets/rivers/');

	/**
	 * The board presets app data path
	 * @private
	 */
	private static boardPresetFolder: string = getAppDataPath('presets/boards/');

	/**
	 * Generates the required folder structure
	 * @private
	 */
	private static generateFolders() {
		if (!fs.existsSync(getAppDataPath('presets/'))) {
			fs.mkdirSync(getAppDataPath('presets'));
		}
		if (!fs.existsSync(PresetsLoader.riverPresetFolder)) {
			fs.mkdirSync(getAppDataPath('presets/rivers'));
			fs.readdirSync(IPCHelper.getAssetPath('defaultPresets/rivers')).forEach((file) => {
				fs.copyFileSync(
					IPCHelper.getAssetPath(`defaultPresets/rivers/${file}`),
					getAppDataPath(`presets/rivers/${file}`)
				);
			});
		}
		if (!fs.existsSync(PresetsLoader.boardPresetFolder)) {
			fs.mkdirSync(getAppDataPath('presets/boards'));
		}
	}

	/**
	 * Loads the river presets
	 */
	public static getRiverPresets() {
		const riverPresets: Array<RiverPresetWithFile> = [];
		PresetsLoader.generateFolders();
		const files = fs.readdirSync(PresetsLoader.riverPresetFolder);
		files.forEach((file) => {
			const content = fs.readFileSync(PresetsLoader.riverPresetFolder + file, {
				encoding: 'utf8',
			});
			const valid = PresetsLoader.validateFile('river', content);
			if (valid) {
				riverPresets.push({
					...(JSON.parse(content) as RiverPreset),
					file: path.parse(PresetsLoader.riverPresetFolder + file),
				});
			}
		});
		riverPresets.sort((a, b) => {
			const textA = a.file.base.toUpperCase();
			const textB = b.file.base.toUpperCase();
			const elseE = textA > textB ? 1 : 0;
			return textA < textB ? -1 : elseE;
		});
		return riverPresets;
	}

	/**
	 * Loads the board presets
	 */
	public static getBoardPresets() {
		const boardPresets: Array<BoardPresetWithFile> = [];
		PresetsLoader.generateFolders();
		const files = fs.readdirSync(PresetsLoader.boardPresetFolder);

		files.forEach((file) => {
			const content = fs.readFileSync(PresetsLoader.boardPresetFolder + file, {
				encoding: 'utf8',
			});
			const valid = PresetsLoader.validateFile('board', content);
			if (valid) {
				boardPresets.push({
					...(JSON.parse(content) as BoardPreset),
					file: path.parse(PresetsLoader.boardPresetFolder + file),
				});
			}
		});
		boardPresets.sort((a, b) => {
			const textA = a.file.base.toUpperCase();
			const textB = b.file.base.toUpperCase();
			const elseE = textA > textB ? 1 : 0;
			return textA < textB ? -1 : elseE;
		});
		return boardPresets;
	}

	/**
	 * Validates the file content
	 * @param type Whether it is a river or a board preset
	 * @param content The content to validate
	 */
	static validateFile(type: 'river' | 'board', content: string) {
		const ajv = new Ajv({ allErrors: true });
		if (type === 'river') {
			const validate = ajv.compile(RiverPresetSchema);
			try {
				return !!validate(JSON.parse(content));
			} catch (e) {
				return false;
			}
		}
		if (type === 'board') {
			const validate = ajv.compile(BoardPresetSchema);
			try {
				return !!validate(JSON.parse(content));
			} catch (e) {
				return false;
			}
		}
		return false;
	}

	/**
	 * Saves a river preset to file
	 * @param file the path to the preset file
	 * @param content the content of the preset
	 */
	static saveRiverPreset(file: string, content: string) {
		return fs.writeFileSync(path.join(PresetsLoader.riverPresetFolder, file), content, {
			encoding: 'utf8',
		});
	}

	/**
	 * Renames a river preset
	 * @param from original preset name
	 * @param to new preset name
	 * @return the new preset file path
	 */
	static async renameRiverPreset(from: string, to: string): Promise<ParsedPath> {
		fs.renameSync(path.join(PresetsLoader.riverPresetFolder, from), path.join(PresetsLoader.riverPresetFolder, to));
		return path.parse(path.join(PresetsLoader.riverPresetFolder, to));
	}
}

export default PresetsLoader;
