import * as settingsSchema from '../schema/settings.schema.json';
import Ajv from 'ajv';
import { SettingsInterface } from '../interfaces/SettingsInterface';

describe('defaults', () => {
	test('default settings', () => {
		const defaultSettings: SettingsInterface = {
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
			},

		};
		const validate = (new Ajv()).compile(settingsSchema);
		const valid = validate(defaultSettings);
		if (!valid) {
			console.warn(validate.errors);
		}
		expect(valid).toBe(true);
	});
});
