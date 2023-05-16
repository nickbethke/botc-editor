import BoardGenerator, { BoardPosition, RandomBoardStartValues } from './BoardGenerator';
import BoardConfigInterface, {
	DirectionEnum,
	LembasField,
	Position,
	PositionDirection,
} from '../../../interfaces/BoardConfigInterface';
import DirectionHelper from './helper/DirectionHelper';

/**
 * The board class with the properties of a board configuration and helper functions.
 */
class Board implements BoardConfigInterface {
	checkPoints: Position[] = [];

	eye: PositionDirection = {position: [0, 0], direction: 'NORTH'};

	height: number;

	holes: Position[] = [];

	lembasFields: LembasField[] = [];

	name: string;

	riverFields: PositionDirection[] = [];

	startFields: PositionDirection[] = [];

	walls: Position[][] = [];

	width: number;

	constructor(name: string, width: number, height: number) {
		this.width = width;
		this.height = height;
		this.name = name;
	}

	/**
	 * Add a position to the checkPoints array
	 * @param position
	 */
	public addCheckPoint(position: BoardPosition) {
		const {x, y} = position;
		this.checkPoints.push([x, y]);
	}

	/**
	 * Add a position and direction to the startFields array
	 * @param position
	 * @param direction
	 */
	public addStartField(position: BoardPosition, direction: DirectionEnum) {
		const {x, y} = position;
		this.startFields.push({
			position: [x, y],
			direction: DirectionHelper.dirEnumToString(direction),
		});
	}

	/**
	 * Set the position and direction of saurons eye in the eye attribute
	 * @param position
	 * @param direction
	 */
	public setEye(position: BoardPosition, direction: DirectionEnum) {
		const {x, y} = position;
		this.eye = {
			position: [x, y],
			direction: DirectionHelper.dirEnumToString(direction),
		};
	}

	/**
	 * Add a position to the holes array
	 * @param position
	 */
	public addHole(position: BoardPosition) {
		const {x, y} = position;
		this.holes.push([x, y]);
	}

	/**
	 * Add a position and amount to the lembasFields array
	 * @param position
	 * @param amount
	 */
	public addLembasField(position: BoardPosition, amount: number) {
		const {x, y} = position;
		this.lembasFields.push({position: [x, y], amount});
	}

	/**
	 * Add a position and direction to the riverFields array
	 * @param position
	 * @param direction
	 */
	public addRiverField(position: BoardPosition, direction: DirectionEnum) {
		const {x, y} = position;
		this.riverFields.push({
			position: [x, y],
			direction: DirectionHelper.dirEnumToString(direction),
		});
	}

	/**
	 * Add a wall position to the walls array
	 * @param position
	 */
	public addWall(position: [[number, number], [number, number]]) {
		this.walls.push(position);
	}

	/**
	 * Remove a wall from the configuration
	 * @param position
	 */
	public removeWall(position: Position[]) {
		this.walls = this.walls.filter((wall) => {
			return (
				wall[0][0] !== position[0][0] &&
				wall[0][1] !== position[0][1] &&
				wall[1][0] !== position[1][0] &&
				wall[1][1] !== position[1][1]
			);
		});
	}

	/**
	 * generate a random valid boardConfigurator via the BoardGeneration class
	 * @param startValues?
	 */
	static generateRandom(startValues?: RandomBoardStartValues): BoardGenerator {
		return new BoardGenerator(startValues);
	}
}

export default Board;
