import BoardGenerator, {
	defaultStartValues,
} from '../renderer/components/generator/BoardGenerator';
import Board from '../renderer/components/generator/board';
import FieldWithPositionInterface from '../renderer/components/generator/interfaces/fieldWithPositionInterface';
import Grass from '../renderer/components/generator/fields/grass';
import SauronsEye from '../renderer/components/generator/fields/sauronsEye';
import StartField from '../renderer/components/generator/fields/startField';
import { DirectionEnum } from '../renderer/components/interfaces/BoardConfigInterface';
import River from '../renderer/components/generator/fields/river';
import Checkpoint from '../renderer/components/generator/fields/checkpoint';
import AStar from '../renderer/components/generator/helper/AStar';
import Hole from '../renderer/components/generator/fields/hole';
import { RandomBoardStartValues } from '../renderer/components/RandomBoardStartValuesDialog';

describe('start values unchanged', () => {
	test('no start values equal to default after generation', () => {
		const { startValues } = Board.generateRandom();
		expect(startValues).toStrictEqual(defaultStartValues);
	});
});

describe('calculations', () => {
	test('free space count', () => {
		const generator = Board.generateRandom({
			...defaultStartValues,
			rivers: false,
		});
		expect(generator.getFreeFieldsCount()).toBe(0);
	});

	test('board dimensions', () => {
		const { board } = Board.generateRandom();
		expect(board.length).toBe(defaultStartValues.height);
		expect(board[0].length).toBe(defaultStartValues.width);
	});

	test('board maximal wall count', () => {
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
		const runs = 100000;
		for (let i = 0; i < runs; i += 1) {
			counter += BoardGenerator.probably(chance * 100) ? 1 : 0;
		}
		expect(counter / runs).toBeCloseTo(chance, 0.0001);
	});
});

describe('a-star', () => {
	test('max walls on 3x3 a-start test', () => {
		const board: Array<Array<FieldWithPositionInterface>> = [
			[
				new Grass({ x: 0, y: 0 }),
				new SauronsEye({ x: 1, y: 0 }, DirectionEnum.NORTH),
				new StartField({ x: 2, y: 0 }, DirectionEnum.NORTH),
			],
			[
				new StartField({ x: 0, y: 1 }, DirectionEnum.NORTH),
				new Checkpoint({ x: 1, y: 1 }, 0),
				new River({ x: 1, y: 1 }, DirectionEnum.NORTH),
			],
			[
				new Grass({ x: 0, y: 2 }),
				new Checkpoint({ x: 1, y: 2 }, 1),
				new Grass({ x: 2, y: 2 }),
			],
		];

		const walls: Array<[[number, number], [number, number]]> = [
			[
				[0, 2],
				[1, 2],
			],
			[
				[2, 2],
				[1, 2],
			],
			[
				[0, 1],
				[0, 2],
			],
			[
				[2, 1],
				[2, 2],
			],
			[
				[0, 0],
				[1, 0],
			],
			[
				[0, 0],
				[0, 1],
			],
			[
				[1, 0],
				[1, 1],
			],
			[
				[1, 0],
				[2, 0],
			],
		];
		const checkpoints = [
			{ x: 1, y: 1 },
			{ x: 1, y: 2 },
		];
		const startFields = [
			{ x: 0, y: 1 },
			{ x: 2, y: 0 },
		];
		const map: Map<string, boolean> = new Map();
		for (let i = 0; i < walls.length; i += 1) {
			const wall = walls[i];
			const s1 =
				wall[0][0].toString() +
				wall[0][1].toString() +
				wall[1][0].toString() +
				wall[1][1].toString();
			const s2 =
				wall[1][0].toString() +
				wall[1][1].toString() +
				wall[0][0].toString() +
				wall[0][1].toString();
			map.set(s1, true);
			map.set(s2, true);
		}
		const { result } = AStar.pathPossible(
			checkpoints,
			startFields,
			[],
			board,
			map
		);
		expect(result).toBe(true);
	});
	test('a-star algorithm', () => {
		const board: Array<Array<FieldWithPositionInterface>> = [
			[
				new Hole({ x: 0, y: 0 }),
				new SauronsEye({ x: 1, y: 0 }, DirectionEnum.NORTH),
				new StartField({ x: 2, y: 0 }, DirectionEnum.NORTH),
			],
			[
				new StartField({ x: 0, y: 1 }, DirectionEnum.NORTH),
				new Checkpoint({ x: 1, y: 1 }, 0),
				new River({ x: 1, y: 1 }, DirectionEnum.NORTH),
			],
			[
				new Grass({ x: 0, y: 2 }),
				new Checkpoint({ x: 1, y: 2 }, 1),
				new Grass({ x: 2, y: 2 }),
			],
		];

		const checkpoints = [
			{ x: 1, y: 1 },
			{ x: 1, y: 2 },
		];
		const startFields = [
			{ x: 0, y: 1 },
			{ x: 2, y: 0 },
		];
		const { result } = AStar.pathPossible(
			checkpoints,
			startFields,
			[],
			board,
			new Map([])
		);
		expect(result).toBe(true);
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
		const generatorD = Board.generateRandom(startValuesSmall);
		expect(generatorD.wallCount()).toBeGreaterThanOrEqual(0);
	});
});

describe('board generation', () => {
	test('default board', () => {
		const generator = Board.generateRandom();
		const { startValues } = generator;
		expect(startValues).toStrictEqual(defaultStartValues);
		expect(generator.getFreeFieldsCount()).toBe(0);
	});
});
describe('errors', () => {
	test('too small board', () => {
		expect(() => {
			Board.generateRandom({ ...defaultStartValues, checkpoints: 3 });
		}).toThrowError();
	});
});