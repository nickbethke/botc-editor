import FieldWithPositionInterface from '../renderer/components/generator/interfaces/FieldWithPositionInterface';
import Grass from '../renderer/components/generator/fields/Grass';
import StartField from '../renderer/components/generator/fields/StartField';
import { DirectionEnum } from '../interfaces/BoardConfigInterface';
import SauronsEye from '../renderer/components/generator/fields/SauronsEye';
import Checkpoint from '../renderer/components/generator/fields/Checkpoint';
import River from '../renderer/components/generator/fields/River';
import BoardGenerator from '../renderer/components/generator/BoardGenerator';
import AStar from '../renderer/components/generator/helper/AStar';
import Hole from '../renderer/components/generator/fields/Hole';

describe('a-star', () => {
	test('max walls on 3x3 a-start test', () => {

		const board: Array<Array<FieldWithPositionInterface>> = [
			[
				new Grass({ x: 0, y: 0 }),
				new StartField({ x: 0, y: 1 }, DirectionEnum.NORTH),
				new Grass({ x: 0, y: 2 }),
			],
			[
				new SauronsEye({ x: 1, y: 0 }, DirectionEnum.NORTH),
				new Checkpoint({ x: 1, y: 1 }, 0),
				new Checkpoint({ x: 1, y: 2 }, 1),
			],
			[
				new StartField({ x: 2, y: 0 }, DirectionEnum.NORTH),
				new River({ x: 2, y: 1 }, DirectionEnum.NORTH),
				new Grass({ x: 2, y: 2 }),
			],
		];

		const walls: Array<[[number, number], [number, number]]> = [
			[[0, 2], [1, 2]],
			[[2, 2], [1, 2]],
			[[0, 1], [0, 2]],
			[[2, 1], [2, 2]],
			[[0, 0], [1, 0]],
			[[0, 0], [0, 1]],
			[[1, 0], [1, 1]],
			[[1, 0], [2, 0]],
		];
		const checkpoints = [
			{ x: 1, y: 1 },
			{ x: 1, y: 2 },
		];
		const startFields = [
			{ x: 0, y: 1 },
			{ x: 2, y: 0 },
		];
		const map = BoardGenerator.genWallMap(walls);
		const { result } = AStar.pathPossible(checkpoints, startFields, [], board, map);
		expect(result).toBe(true);
	});

	test('a-star algorithm', () => {
		const board: Array<Array<FieldWithPositionInterface>> = [
			[new Hole({ x: 0, y: 0 }), new StartField({ x: 0, y: 1 }, DirectionEnum.NORTH), new Grass({ x: 0, y: 2 })],
			[
				new SauronsEye({ x: 1, y: 0 }, DirectionEnum.NORTH),
				new Checkpoint({ x: 1, y: 1 }, 0),
				new Checkpoint({ x: 1, y: 2 }, 1),
			],
			[
				new StartField({ x: 2, y: 0 }, DirectionEnum.NORTH),
				new River({ x: 2, y: 1 }, DirectionEnum.NORTH),
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
		const { result } = AStar.pathPossible(checkpoints, startFields, [], board, new Map([]));
		expect(result).toBe(true);
	});

	test('a-star algorithm impossible', () => {
		const board: Array<Array<FieldWithPositionInterface>> = [
			[
				new SauronsEye({ x: 0, y: 0 }, DirectionEnum.NORTH),
				new Checkpoint({ x: 0, y: 1 }, DirectionEnum.NORTH),
			],
			[
				new Hole({ x: 1, y: 0 }),
				new Hole({ x: 1, y: 1 }),
			],
			[
				new StartField({ x: 2, y: 0 }, DirectionEnum.NORTH),
				new StartField({ x: 2, y: 1 }, DirectionEnum.NORTH),
			],
		];

		const checkpoints = [{ x: 0, y: 1 }];
		const startFields = [{ x: 2, y: 0 }, { x: 2, y: 1 }];
		const { result } = AStar.pathPossible(checkpoints, startFields, [], board, new Map([]));
		expect(result).toBe(false);
	});
});
