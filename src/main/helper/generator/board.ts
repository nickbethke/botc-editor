import BoardConfigInterface, {
	DirectionEnum,
	Lembas,
	Position,
	PositionDirection,
} from './interfaces/BoardConfigInterface';
import BoardGenerator, {
	BoardPosition,
	RandomBoardStartValues,
} from './boardGenerator';
import DirectionHelper from './helper/DirectionHelper';

class Board implements BoardConfigInterface {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	checkPoints: Position[];

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	eye: PositionDirection;

	height: number;

	holes?: Position[];

	lembas?: Lembas[];

	name: string;

	riverFields?: PositionDirection[];

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	startFields: PositionDirection[];

	walls?: Position[][];

	width: number;

	/**
	 * Board Class - attributes equal to Board-Config JSON Format
	 * @param name
	 * @param width
	 * @param height
	 */
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
		const { x, y } = position;
		if (this.checkPoints === undefined) {
			this.checkPoints = [];
		}
		this.checkPoints.push([x, y]);
	}

	/**
	 * Add a position and direction to the startFields array
	 * @param position
	 * @param direction
	 */
	public addStartField(position: BoardPosition, direction: DirectionEnum) {
		const { x, y } = position;
		if (this.startFields === undefined) {
			this.startFields = [];
		}
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
		const { x, y } = position;
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
		const { x, y } = position;
		if (this.holes === undefined) {
			this.holes = [];
		}
		this.holes.push([x, y]);
	}

	/**
	 * Add a position and amount to the lembas array
	 * @param position
	 * @param amount
	 */
	public addLembasField(position: BoardPosition, amount: number) {
		const { x, y } = position;
		if (this.lembas === undefined) {
			this.lembas = [];
		}
		this.lembas.push({ position: [x, y], amount });
	}

	/**
	 * Add a position and direction to the riverFields array
	 * @param position
	 * @param direction
	 */
	public addRiverField(position: BoardPosition, direction: DirectionEnum) {
		const { x, y } = position;
		if (this.riverFields === undefined) {
			this.riverFields = [];
		}
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
		if (this.walls === undefined) {
			this.walls = [];
		}
		this.walls.push(position);
	}

	/**
	 * get the walls count
	 */
	public getWallCount(): number {
		return this.walls ? this.walls.length : 0;
	}

	/**
	 * generate a random valid board via the BoardGeneration class
	 * @param startValues?
	 * @param _callback?
	 */
	static generateRandom(
		startValues?: RandomBoardStartValues,
		_callback?: () => void
	): BoardGenerator {
		return new BoardGenerator(startValues, _callback);
	}
}

export default Board;
