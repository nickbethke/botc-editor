import Board from '../renderer/components/generator/Board';
import BoardGenerator, {
	defaultStartValues,
	RandomBoardStartValues,
} from '../renderer/components/generator/BoardGenerator';
import Ajv from 'ajv';
import * as boardConfiguratorSchema from '../schema/boardConfigSchema.json';
import chalk from 'chalk';

function isGeneratedBoardValid(boardJson: Board): boolean {
	const validate = (new Ajv()).compile(boardConfiguratorSchema);
	const valid = validate(boardJson);
	if (!valid) {
		chalk.red('Board is not valid!');
		console.log(validate.errors);
	}
	return valid;
}

describe('start configuration unchanged', () => {
	test('no start configuration equal to default after generation', () => {
		const { startValues, boardJSON } = Board.generateRandom();
		expect(startValues).toStrictEqual(defaultStartValues);
		expect(isGeneratedBoardValid(boardJSON)).toBe(true);
	});
});

describe('calculations', () => {
	test('free space count', () => {
		const generator = Board.generateRandom({
			...defaultStartValues,
			rivers: false,
		});
		expect(generator.getFreeFieldsCount()).toBe(1);
		expect(isGeneratedBoardValid(generator.boardJSON)).toBe(true);
	});

	test('boardConfigurator dimensions', () => {
		const { board, boardJSON } = Board.generateRandom();
		expect(board.length).toBe(defaultStartValues.width);
		expect(board[0].length).toBe(defaultStartValues.height);
		expect(isGeneratedBoardValid(boardJSON)).toBe(true);
	});

	test('boardConfigurator maximal wall count', () => {
		let x = 3;
		let y = 3;
		let sides = (x - 1) * y + (y - 1) * x;
		expect(sides).toBe(12);

		x = 4;
		y = 1;
		sides = (x - 1) * y + (y - 1) * x;
		expect(sides).toBe(3);

		x = 5;
		y = 4;
		sides = (x - 1) * y + (y - 1) * x;
		expect(sides).toBe(31);
	});

	test('probability', () => {
		const chance = 2 / 2 ** 3;
		let counter = 0;
		const runs = 1000;
		for (let i = 0; i < runs; i += 1) {
			counter += BoardGenerator.probably(chance * 100) ? 1 : 0;
		}
		expect(counter / runs).toBeCloseTo(chance, 0.0001);
	});
});

describe('wall generation', () => {
	test('walls', () => {
		const startValuesSmall: RandomBoardStartValues = {
			checkpoints: 4,
			height: 16,
			lembasFields: 8,
			maxLembasAmountOnField: 3,
			lembasAmountExactMaximum: false,
			rivers: true,
			startFields: 6,
			width: 16,
			holes: 8,
			walls: true,
			wallsAlgorithm: 'iterative',
			riverAlgorithm: 'default',
			name: 'Small Board',
		};

		const generator = Board.generateRandom(startValuesSmall);
		expect(generator.wallCount()).toBeGreaterThanOrEqual(0);
		expect(isGeneratedBoardValid(generator.boardJSON)).toBe(true);

		const generatorD = Board.generateRandom(startValuesSmall);
		expect(generatorD.wallCount()).toBeGreaterThanOrEqual(0);
		expect(isGeneratedBoardValid(generatorD.boardJSON)).toBe(true);
	});
});

describe('boardConfigurator generation', () => {
	test('default boardConfigurator', () => {
		const generator = Board.generateRandom();
		const { startValues } = generator;
		expect(startValues).toStrictEqual(defaultStartValues);
		expect(generator.getFreeFieldsCount()).toBe(1);
		expect(isGeneratedBoardValid(generator.boardJSON)).toBe(true);
	});
});
describe('errors', () => {
	test('too small boardConfigurator', () => {
		expect(() => {
			Board.generateRandom({ ...defaultStartValues, checkpoints: 4 });
		}).toThrowError();
	});
});
