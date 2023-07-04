import Ajv from 'ajv';
import BoardConfigInterface from '../interfaces/BoardConfigInterface';
import * as boardConfigurationSchema from '../schema/boardConfigSchema.json';
import * as gameConfigurationSchema from '../schema/gameConfigSchema.json';
import BoardConfigValidator from '../renderer/helper/BoardConfigValidator';
import GameConfigInterface from '../interfaces/GameConfigInterface';
import TranslationHelper, { AvailableLanguages } from '../renderer/helper/TranslationHelper';

window.t = new TranslationHelper(AvailableLanguages.en, true);

// is valid board configuration after the schema, but not valid for the game
const invalidBoardConfig: BoardConfigInterface = {
	eye: {
		position: [0, 0],
		direction: 'EAST',
	},
	height: 5,
	width: 5,
	holes: [],
	riverFields: [],
	name: 'Invalid Board',
	walls: [],
	startFields: [
		{ direction: 'NORTH', position: [0, 0] },
		{ direction: 'NORTH', position: [0, 1] },
	],
	lembasFields: [],
	checkPoints: [
		[0, 2],
		[0, 3],
		[0, 4],
	],
	eagleFields: [],
};

// is valid board configuration after the schema, and valid for the game
const validBoardConfig: BoardConfigInterface = {
	eye: {
		position: [1, 0],
		direction: 'EAST',
	},
	height: 5,
	width: 5,
	holes: [],
	riverFields: [],
	name: 'Invalid Board',
	walls: [],
	startFields: [
		{ direction: 'NORTH', position: [0, 0] },
		{ direction: 'NORTH', position: [0, 1] },
	],
	lembasFields: [],
	checkPoints: [
		[0, 2],
		[0, 3],
		[0, 4],
	],
	eagleFields: [],
};

// missing required fields for a valid board configuration
const invalidGameConfig: any = {
	cardSelectionTimeout: 10,
	characterChoiceTimeout: 10,
	maxRounds: 10,
	reviveRounds: 10,
	riverMoveCount: 10,
};

// valid game configuration
const validGameConfig: GameConfigInterface = {
	serverIngameDelay: 10,
	shotLembas: 10,
	riverMoveCount: 10,
	reviveRounds: 10,
	maxRounds: 10,
	characterChoiceTimeout: 10,
	cardSelectionTimeout: 10,
	startLembas: 10,
};

describe('validation', () => {
	describe('board configuration', () => {
		test('valid board configuration', () => {
			const validate = new Ajv().compile(boardConfigurationSchema);
			expect(validate(validBoardConfig)).toBeTruthy();

			expect(new BoardConfigValidator(validBoardConfig).errors).toHaveLength(0);
		});

		test('invalid board configuration for game', () => {
			const validate = new Ajv().compile(boardConfigurationSchema);
			expect(validate(invalidBoardConfig)).toBeTruthy();

			expect(new BoardConfigValidator(invalidBoardConfig).errors.length).toBeGreaterThanOrEqual(1);
		});

		test('invalid board configuration against schema', () => {
			const validate = new Ajv().compile(boardConfigurationSchema);
			expect(validate({})).toBeFalsy();
		});
	});

	describe('game configuration', () => {
		test('valid game configuration', () => {
			const validate = new Ajv().compile(gameConfigurationSchema);
			expect(validate(validGameConfig)).toBeTruthy();
		});

		test('invalid game configuration', () => {
			const validate = new Ajv().compile(gameConfigurationSchema);
			expect(validate(invalidGameConfig)).toBeFalsy();
		});
	});
});
