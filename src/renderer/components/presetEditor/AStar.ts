import { AStarFinder } from 'astar-typescript';
import { IPoint } from 'astar-typescript/dist/interfaces/astar.interfaces';
import { RiverPreset } from '../../../main/helper/PresetsLoader';
import { BoardPosition } from '../generator/interfaces/BoardPosition';
import { getBoardMaxDimension } from './Helper';

class AStarRiverPreset {
	private readonly matrix: number[][];

	private readonly aStarInstance: AStarFinder;

	readonly toBeRemoved: BoardPosition[];

	constructor(preset: RiverPreset) {
		this.toBeRemoved = [];
		const dimensions = getBoardMaxDimension(preset);
		this.matrix = Array.from(Array(dimensions.width), () => Array(dimensions.height).fill(1));
		preset.data.forEach((river) => {
			this.matrix[river.position[0]][river.position[1]] = 0;
		});
		this.aStarInstance = new AStarFinder({ grid: { matrix: this.matrix }, diagonalAllowed: false });
		preset.data.forEach((river) => {
			const startPos: IPoint = { x: 0, y: 0 };
			const goalPos: IPoint = { y: river.position[0], x: river.position[1] };
			const path = this.aStarInstance.findPath(startPos, goalPos);
			if (path.length < 1) {
				this.toBeRemoved.push({ x: river.position[0], y: river.position[1] });
			}
		});
	}
}

export default AStarRiverPreset;
