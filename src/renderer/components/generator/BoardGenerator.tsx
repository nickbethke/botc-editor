import FieldWithPositionInterface from './interfaces/FieldWithPositionInterface';
import Grass from './fields/Grass';
import BoardConfigInterface, {
	Direction,
	DirectionEnum,
	LembasField,
	Position,
	PositionDirection,
} from '../../../interfaces/BoardConfigInterface';
import SauronsEye from './fields/SauronsEye';
import StartField from './fields/StartField';
import Checkpoint from './fields/Checkpoint';
import Hole from './fields/Hole';
import Lembas from './fields/Lembas';
import River from './fields/River';
import Board from './Board';
import AStar from './helper/AStar';
import DirectionHelper from './helper/DirectionHelper';
import { wallBoardPositions2StringArray } from './interfaces/BoardPosition';

/**
 * random boardConfigurator start configuration type
 */
export type RandomBoardStartValues = {
	name: string;
	width: number;
	height: number;
	startFields: number;
	checkpoints: number;
	lembasFields: number;
	maxLembasAmountOnField: number;
	lembasAmountExactMaximum: boolean;
	rivers: boolean;
	holes: number;
	walls: boolean;
	riverAlgorithm: RiverAlgorithm;
	wallsAlgorithm: WallAlgorithm;
};

/**
 * river algorithm type
 */
export type RiverAlgorithm = 'default' | 'complex';

/**
 * river algorithm type
 */
export type WallAlgorithm = 'iterative' | 'random';

/**
 * default random boardConfigurator start configuration
 */
export const defaultStartValues: RandomBoardStartValues = {
	name: 'THE CENTERLÄND',
	checkpoints: 2,
	height: 3,
	width: 2,
	lembasFields: 0,
	maxLembasAmountOnField: 0,
	lembasAmountExactMaximum: true,
	rivers: false,
	startFields: 2,
	holes: 0,
	walls: false,
	wallsAlgorithm: 'iterative',
	riverAlgorithm: 'default',
};

/**
 * boardConfigurator position type <br>
 * consisting of an x and y number value
 */
export type BoardPosition = {
	x: number;
	y: number;
};

/**
 * The board generation algorithm class
 */
class BoardGenerator {
	/**
	 * The percentage to calculate how many walls should be generated
	 * @private
	 */
	private readonly wallPercentage: number = 0.2;

	/**
	 * The virtual board
	 */
	readonly board: Array<Array<FieldWithPositionInterface>>;

	/**
	 * The start configuration for the generation
	 */
	readonly startValues: RandomBoardStartValues;

	/**
	 * The generated board as board configuration json object
	 */
	readonly boardJSON: Board;

	/**
	 * The amount of walls that had been generated
	 * @private
	 */
	private walls = 0;

	/**
	 * The wall map array for checking, where a wall had been generated
	 * @private
	 */
	private wallMapArray: Array<[string, boolean]>;

	/**
	 * The checkpoints array
	 */
	readonly checkpoints: BoardPosition[];

	/**
	 * The start field array
	 * @private
	 */
	private readonly startFields: BoardPosition[];

	/**
	 * The amount how many times the wall generation algorithm has been applied, to prevent infinite loops
	 * @private
	 */
	private wallCall: number | undefined;

	/**
	 * The maximum number of times the wall generation algorithm will be applied, to prevent infinite loops
	 * @private
	 */
	private wallMaxCall: number | undefined;

	/**
	 * The amount of holes that have been generated
	 * @private
	 */
	private holesSet: number;

	/**
	 * The holes try array, to check where the algorithm is tried to generate holes
	 * @private
	 */
	private holesTrys: Map<string, boolean>;

	/**
	 * The lembas fields array
	 * @private
	 */
	private readonly lembasFields: Array<{
		position: BoardPosition;
		amount: number;
	}>;

	/**
	 * The constructor of the class, that initializes all configuration and starts the generation process
	 * @param startValues
	 */
	constructor(startValues?: RandomBoardStartValues) {
		this.holesSet = 0;

		// merging custom start configuration with default configuration
		this.startValues = { ...defaultStartValues, ...startValues };

		// initializing all needed/required attributes
		this.checkpoints = [];
		this.startFields = [];
		this.lembasFields = [];
		this.wallMapArray = [];
		this.holesTrys = new Map();

		// check ig generation of boardConfigurator is possible, otherwise throws an error
		if (this.getFieldCount() < this.getOccupiedFieldsCount()) {
			throw new Error('Board to small for all fields');
		}

		// initializing the boardConfigurator array
		this.board = BoardGenerator.generateBoardArray(this.startValues.height, this.startValues.width);

		// initializing the new boardConfigurator
		this.boardJSON = new Board(this.startValues.name, this.startValues.width, this.startValues.height);

		// generate saurons eye
		this.genSauronsEye();

		// generate start fields
		this.genStartFields();

		// generate checkpoints
		this.genCheckpoints();

		// generate lembasFields fields if required
		if (this.startValues.lembasFields) {
			this.genLembasFields();
		}

		// generate hole fields if required
		if (this.startValues.holes) {
			this.genHoles();
		}

		// generate river fields if required
		if (this.startValues.rivers && this.getFreeFieldsCount()) {
			this.genRivers();
		}

		// generate walls if required
		if (this.startValues.walls) {
			// determined the algorithm
			if (this.startValues.wallsAlgorithm === 'iterative') {
				this.genWallsIterative();
			} else {
				this.genWallsRandom();
			}
		}

	}

	/**
	 * Generate a boardPosition array from a position array
	 * @param position
	 */
	public static positionArrayToBoardPositionArray(position: Position[]): BoardPosition[] {
		const boardPositions: BoardPosition[] = [];
		for (const positionElement of position) {
			boardPositions.push(BoardGenerator.positionToBoardPosition(positionElement));
		}
		return boardPositions;
	}

	/**
	 * Generate a boardPosition array from a positionDirection array
	 * @param position
	 */
	public static positionDirectionArrayToBoardPositionArray(position: PositionDirection[]): BoardPosition[] {
		const boardPositions: BoardPosition[] = [];
		for (const positionDirection of position) {
			boardPositions.push(BoardGenerator.positionToBoardPosition(positionDirection.position));
		}
		return boardPositions;
	}

	/**
	 * Generate a boardPosition array from a lembas fields array
	 * @param position
	 */
	public static lembasFieldsArrayToBoardPositionArray(
		position: LembasField[],
	): { position: BoardPosition; amount: number }[] {
		const boardPositions: { position: BoardPosition; amount: number }[] = [];
		for (const lembasField of position) {
			boardPositions.push({
				position: BoardGenerator.positionToBoardPosition(lembasField.position),
				amount: lembasField.amount,
			});
		}
		return boardPositions;
	}

	/**
	 * Generates a wall map from a wall array
	 * @param walls
	 */
	public static genWallMap(walls: Position[][]): Map<string, boolean> {
		const map: Map<string, boolean> = new Map();
		for (const wall of walls) {
			const s1 = BoardGenerator.position2String(wall[0]) + BoardGenerator.position2String(wall[1]);
			const s2 = BoardGenerator.position2String(wall[1]) + BoardGenerator.position2String(wall[0]);
			map.set(s1, true);
			map.set(s2, true);
		}
		return map;
	}

	/**
	 * Generates the initial virtual board
	 * @param height Height of the virtual board
	 * @param width Width of the virtual board
	 */
	public static generateBoardArray(height: number, width: number): Array<Array<FieldWithPositionInterface>> {
		const board = new Array<Array<FieldWithPositionInterface>>();

		for (let x = 0; x < width; x += 1) {
			const row: FieldWithPositionInterface[] = new Array<FieldWithPositionInterface>();
			for (let y = 0; y < height; y += 1) {
				row.push(new Grass({ x, y }));
			}
			board.push(row);
		}
		return board;
	}

	private genSauronsEye() {
		const position = this.getRandomPosition();
		const direction = BoardGenerator.getRandomDirection();
		this.board[position.x][position.y] = new SauronsEye(position, direction);
		this.boardJSON.setEye(position, direction);
	}

	private genStartFields() {
		const todo = this.startValues.startFields;
		for (let i = 0; i < todo; i += 1) {
			this.genStartField();
		}
	}

	private genStartField() {
		const position = this.getRandomPosition();
		const direction = BoardGenerator.getRandomDirection();
		this.board[position.x][position.y] = new StartField(position, direction);
		this.boardJSON.addStartField(position, direction);
		this.startFields.push(position);
	}

	private genCheckpoints() {
		for (let i = 0; i < this.startValues.checkpoints; i += 1) {
			this.genCheckpoint(i);
		}
	}

	private genCheckpoint(order: number) {
		const position = this.getRandomPosition();
		this.board[position.x][position.y] = new Checkpoint(position, order);
		this.boardJSON.addCheckPoint(position);
		this.checkpoints.push(position);
	}

	private genHoles() {
		const maxTrys = this.getFieldCount() * 8;
		let trys = 0;
		// generate until all holes to be set are set, or the max trys are reached
		while (this.holesSet < this.startValues.holes && trys < maxTrys) {
			this.genHole();
			trys += 1;
		}
	}

	private genHole() {
		// generate random position
		const position = this.getRandomPosition();
		// check if position has already been tried
		if (!this.holesTrys.has(BoardGenerator.boardPosition2String(position))) {
			// check pathfinding, so all checkpoints are reachable from all start fields
			const boardClone = BoardGenerator.cloneBoard(this.board);
			boardClone[position.x][position.y] = new Hole(position);
			const { result } = AStar.pathPossible(
				this.checkpoints,
				this.startFields,
				this.lembasFields,
				boardClone,
				new Map([]),
			);
			// if all paths is possible add the hole field
			if (result) {
				this.board[position.x][position.y] = new Hole(position);
				this.boardJSON.addHole(position);
				this.holesSet += 1;
			}
			// set tried hole position
			this.holesTrys.set(BoardGenerator.boardPosition2String(position), true);
		}
	}

	private genLembasFields() {
		for (let i = 0; i < this.startValues.lembasFields; i += 1) {
			this.genLembasField();
		}
	}

	private genLembasField() {
		const position = this.getRandomPosition();
		// set amount: either random or exact the start value
		const amount = this.startValues.lembasAmountExactMaximum
			? this.startValues.maxLembasAmountOnField
			: this.getRandomLembasAmount();
		// add lembasFields field
		this.board[position.x][position.y] = new Lembas(position, amount);
		this.lembasFields.push({ position, amount });
		this.boardJSON.addLembasField(position, amount);
	}

	private genRivers() {
		const freeSpacesCount = this.getFreeFieldsCount();
		let riverFieldCount = Math.floor(freeSpacesCount / 4);

		// on max=1, riverFieldCount could be bigger than 1
		if (riverFieldCount > freeSpacesCount) {
			riverFieldCount = freeSpacesCount;
		}

		// determined the algorithm
		if (this.startValues.riverAlgorithm === 'default') {
			this.genRiversDefault(riverFieldCount);
		} else {
			this.genRiversComplex(riverFieldCount);
		}
	}

	private genRiversDefault(riverCount: number) {
		for (let i = 0; i < riverCount; i += 1) {
			const position = this.getRandomPosition();
			const direction = BoardGenerator.getRandomDirection();
			if (this.getRiverNeighbors(position).length > 2 && this.board[position.x][position.y] instanceof Grass) {
				this.board[position.x][position.y] = new River(position, direction);
				this.boardJSON.addRiverField(position, direction);
			}
		}
	}

	private genRiversComplex(riverCount: number) {
		let made = 0;
		while (made < riverCount) {
			const toMake = BoardGenerator.getRandomInt(2, Math.min(this.startValues.height, this.startValues.width));
			let startPosition = this.getRandomPosition();
			let startDirection = BoardGenerator.getRandomDirection();
			if (
				this.getRiverNeighbors(startPosition).length < 3 &&
				this.board[startPosition.x][startPosition.y] instanceof Grass
			) {
				this.board[startPosition.x][startPosition.y] = new River(startPosition, startDirection);
				this.boardJSON.addRiverField(startPosition, startDirection);
				made += 1;
				for (let i = 1; i < toMake; i += 1) {
					const neighbors = this.getRiverNeighbors(startPosition);
					if (neighbors.length > 0) {
						let selected: {
							position: BoardPosition;
							direction: Direction;
						} | null = null;
						const helpDirection = DirectionHelper.dirEnumToString(startDirection);
						for (const neighbor of neighbors) {
							const { direction } = neighbor;
							if (direction === helpDirection) {
								selected = neighbor;
								break;
							}
						}
						if (selected !== null) {
							startDirection = BoardGenerator.getRandomDirection();
							if (
								(DirectionHelper.dirEnumToString(startDirection) === 'SOUTH' && helpDirection === 'NORTH') ||
								(DirectionHelper.dirEnumToString(startDirection) === 'NORTH' && helpDirection === 'SOUTH')
							) {
								startDirection = BoardGenerator.probably(50) ? DirectionEnum.EAST : DirectionEnum.WEST;
							}
							if (
								(DirectionHelper.dirEnumToString(startDirection) === 'EAST' && helpDirection === 'WEST') ||
								(DirectionHelper.dirEnumToString(startDirection) === 'WEST' && helpDirection === 'EAST')
							) {
								startDirection = BoardGenerator.probably(50) ? DirectionEnum.NORTH : DirectionEnum.SOUTH;
							}
							startPosition = selected.position;
							if (this.board[startPosition.x][startPosition.y] instanceof Grass) {
								this.board[startPosition.x][startPosition.y] = new River(startPosition, startDirection);
								this.boardJSON.addRiverField(startPosition, startDirection);
								made += 1;
							}
							if (made >= riverCount) {
								break;
							}
						} else {
							break;
						}
					} else {
						break;
					}
				}
				if (!this.boardHasFreeField()) {
					made = riverCount;
				}
			}
		}
	}

	public getRiverNeighbors(position: BoardPosition): Array<{ position: BoardPosition; direction: Direction }> {
		const { x, y } = position;

		const neighbors = new Array<{
			position: BoardPosition;
			direction: Direction;
		}>();
		// north
		let currentPosition = { x, y: y - 1 };
		if (this.isPositionInBoard(currentPosition) && this.board[y - 1][x] instanceof Grass) {
			neighbors.push({ position: currentPosition, direction: 'NORTH' });
		}

		// east
		currentPosition = { x: x + 1, y };
		if (this.isPositionInBoard(currentPosition) && this.board[y][x + 1] instanceof Grass) {
			neighbors.push({ position: currentPosition, direction: 'EAST' });
		}
		// south
		currentPosition = { x, y: y + 1 };
		if (this.isPositionInBoard(currentPosition) && this.board[y + 1][x] instanceof Grass) {
			neighbors.push({ position: currentPosition, direction: 'SOUTH' });
		}

		// west
		currentPosition = { x: x - 1, y };
		if (this.isPositionInBoard(currentPosition) && this.board[y][x - 1] instanceof Grass) {
			neighbors.push({ position: currentPosition, direction: 'WEST' });
		}

		return neighbors;
	}

	private genWallsRandom() {
		const x = this.startValues.width;
		const y = this.startValues.height;
		const wallsToSet = Math.floor(((x - 1) * y + (y - 1) * x) * this.wallPercentage);
		const alreadyTried: Array<string> = [];

		this.wallMaxCall = ((x - 1) * y + (y - 1) * x) * 4;
		this.wallCall = 0;
		if (wallsToSet) {
			while (this.wallCall < this.wallMaxCall && this.walls < wallsToSet) {
				this.genWallRandom(alreadyTried);
				this.wallCall += 1;
			}
		}
	}

	private genWallRandom(alreadyTried: Array<string>): void {
		const firstPosition = this.getRandomPosition(true);
		const neighbors = this.getNeighbors(firstPosition);
		if (neighbors.length) {
			const secondPosition = neighbors[BoardGenerator.getRandomInt(0, neighbors.length)];
			if (
				!(
					this.getFieldFromPosition(firstPosition) instanceof River &&
					this.getFieldFromPosition(secondPosition) instanceof River
				)
			) {
				const [s1, s2] = wallBoardPositions2StringArray(firstPosition, secondPosition);
				if (!alreadyTried.includes(s1) && !alreadyTried.includes(s2)) {
					const wallsArrayCopy = [...this.wallMapArray];
					this.wallMapArray.push([s1, true], [s2, true]);
					const { result } = AStar.pathPossible(
						this.checkpoints,
						this.startFields,
						this.lembasFields,
						this.board,
						new Map(this.wallMapArray),
					);
					alreadyTried.push(s1, s2);
					if (result) {
						this.walls += 1;
						this.boardJSON.addWall([
							[firstPosition.x, firstPosition.y],
							[secondPosition.x, secondPosition.y],
						]);
					} else {
						this.wallMapArray = wallsArrayCopy;
					}
				}
			}
		}
	}

	private getFieldFromPosition(position: BoardPosition): FieldWithPositionInterface {
		return this.board[position.y][position.x];
	}

	private getNeighbors(position: BoardPosition): Array<BoardPosition> {
		const { x, y } = position;

		const neighbors = new Array<BoardPosition>();
		// north
		let currentPosition = { x, y: y - 1 };
		if (this.isPositionInBoard(currentPosition)) {
			neighbors.push(currentPosition);
		}

		// east
		currentPosition = { x: x + 1, y };
		if (this.isPositionInBoard(currentPosition)) {
			neighbors.push(currentPosition);
		}
		// south
		currentPosition = { x, y: y + 1 };
		if (this.isPositionInBoard(currentPosition)) {
			neighbors.push(currentPosition);
		}

		// west
		currentPosition = { x: x - 1, y };
		if (this.isPositionInBoard(currentPosition)) {
			neighbors.push(currentPosition);
		}

		return neighbors;
	}

	private genWallsIterative(): void {
		for (const row of this.board) {
			for (const field of row) {
				this.genWallIterative(field.position);
			}
		}
	}

	private genWallIterative(position: BoardPosition): void {
		const neighbors = this.getNeighbors_David(position);
		for (const neighbor of neighbors) {
			if (
				!(this.getFieldFromPosition(position) instanceof River && this.getFieldFromPosition(neighbor) instanceof River)
			) {
				if (BoardGenerator.probably(this.wallPercentage * 100)) {
					const [s1, s2] = wallBoardPositions2StringArray(position, neighbor);
					const wallsArrayCopy = [...this.wallMapArray];
					this.wallMapArray.push([s1, true], [s2, true]);
					const { result: pathPossible } = AStar.pathPossible(
						this.checkpoints,
						this.startFields,
						this.lembasFields,
						this.board,
						new Map(this.wallMapArray),
					);
					if (!pathPossible) {
						this.wallMapArray = wallsArrayCopy;
					} else {
						this.walls += 1;
						this.wallMapArray.push([s1, true], [s2, true]);
						this.boardJSON.addWall([
							[position.x, position.y],
							[neighbor.x, neighbor.y],
						]);
					}
				}
			}
		}
	}

	public static probably(percentage: number): boolean {
		const zeroToOne = Math.random(); // greater than or equal to 0.0 and less than 1.0
		const multiple = zeroToOne * 100; // greater than or equal to 0.0 and less than 100.0
		return multiple < percentage;
	}

	private getNeighbors_David(position: BoardPosition): Array<BoardPosition> {
		const { x, y } = position;

		const neighbors = new Array<BoardPosition>();
		// east
		let currentPosition = { x: x + 1, y };
		if (this.isPositionInBoard(currentPosition)) {
			neighbors.push(currentPosition);
		}
		// south
		currentPosition = { x, y: y + 1 };
		if (this.isPositionInBoard(currentPosition)) {
			neighbors.push(currentPosition);
		}
		return neighbors;
	}

	private isPositionInBoard(position: BoardPosition): boolean {
		const width = this.startValues.width;
		const height = this.startValues.height;
		const { x, y } = position;
		return x >= 0 && x < width - 1 && y >= 0 && y < height - 1;
	}

	private getFieldCount(): number {
		return this.startValues.width * this.startValues.height;
	}

	public getFreeFieldsCount(): number {
		return this.getFieldCount() - this.getOccupiedFieldsCount();
	}

	public getOccupiedFieldsCount(): number {
		return (
			this.startValues.holes +
			this.startValues.startFields +
			this.startValues.lembasFields +
			this.startValues.checkpoints +
			1
		);
	}

	private boardHasFreeField(): boolean {
		for (const row of this.board) {
			for (const item of row) {
				if (item instanceof Grass) {
					return true;
				}
			}
		}
		return false;
	}

	private getRandomPosition(ignoreOccupiedFields = false): BoardPosition {
		let done = false;
		let position: BoardPosition = {
			x: 0,
			y: 0,
		};
		while (!done) {
			const x = BoardGenerator.getRandomInt(0, this.startValues.width);
			const y = BoardGenerator.getRandomInt(0, this.startValues.height);
			if (ignoreOccupiedFields || this.isFieldFree({ x, y })) {
				position = { x, y };
				done = true;
			}
		}
		return position;
	}

	private isFieldFree(position: BoardPosition): boolean {
		return this.board[position.x][position.y] instanceof Grass;
	}

	static randomEnumKey(): string {
		const keys = Object.keys(DirectionEnum).filter((k) => !(Math.abs(Number.parseInt(k, 10)) + 1));
		return keys[Math.floor(Math.random() * keys.length)];
	}

	static getRandomDirection(): DirectionEnum {
		return DirectionHelper.string2DirEnum(BoardGenerator.randomEnumKey());
	}

	private getRandomLembasAmount(): number {
		return this.startValues.maxLembasAmountOnField <= 0
			? 0
			: BoardGenerator.getRandomIntInclusive(0, this.startValues.maxLembasAmountOnField);
	}

	static getRandomIntInclusive(min: number, max: number) {
		return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1) + Math.ceil(min)); // The maximum is inclusive and the minimum is inclusive
	}

	static getRandomInt(min: number, max: number) {
		return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min)) + Math.ceil(min));
	}

	static boardPosition2String(postion: BoardPosition): string {
		return `${postion.x.toString()}|${postion.y.toString()}`;
	}

	static position2String(postion: Position): string {
		return `${postion[0].toString()}|${postion[1].toString()}`;
	}

	static firstLetter(string: string): string {
		return string.substring(0, 1);
	}

	static sleep(ms: number) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}

	static checkpointsPositionArrayToCheckpointArray(checkpointPositionArray: BoardPosition[]): Checkpoint[] {
		const checkpoints = [];
		for (let i = 0; i < checkpointPositionArray.length; i += 1) {
			const c = checkpointPositionArray[i];
			checkpoints.push(new Checkpoint(c, i));
		}
		return checkpoints;
	}

	static positionToBoardPosition(position: Position): BoardPosition {
		return { x: position[0], y: position[1] };
	}

	static boardPositionToPosition(position: BoardPosition): Position {
		return [position.x, position.y];
	}

	static directionToDirectionEnum(direction: Direction): DirectionEnum {
		if (direction === 'NORTH') {
			return DirectionEnum.NORTH;
		}
		if (direction === 'EAST') {
			return DirectionEnum.EAST;
		}
		if (direction === 'SOUTH') {
			return DirectionEnum.SOUTH;
		}
		if (direction === 'WEST') {
			return DirectionEnum.WEST;
		}
		return DirectionEnum.NORTH;
	}

	static directionEnumToDirection(direction: DirectionEnum): Direction {
		if (direction === DirectionEnum.NORTH) {
			return 'NORTH';
		}
		if (direction === DirectionEnum.EAST) {
			return 'EAST';
		}
		if (direction === DirectionEnum.SOUTH) {
			return 'SOUTH';
		}
		if (direction === DirectionEnum.WEST) {
			return 'WEST';
		}
		return 'NORTH';
	}

	static jsonToBoard = (json: BoardConfigInterface): Array<Array<FieldWithPositionInterface>> => {
		const board: Array<Array<FieldWithPositionInterface>> = BoardGenerator.generateBoardArray(json.height, json.width);

		board[json.eye.position[1]][json.eye.position[0]] = new SauronsEye(
			BoardGenerator.positionToBoardPosition(json.eye.position),
			BoardGenerator.directionToDirectionEnum(json.eye.direction),
		);

		for (const startField of json.startFields) {
			const position = BoardGenerator.positionToBoardPosition(startField.position);
			const d = BoardGenerator.directionToDirectionEnum(startField.direction);
			board[position.x][position.y] = new StartField(position, d);
		}

		for (let i = 0; i < json.checkPoints.length; i += 1) {
			const checkPoint = json.checkPoints[i];
			const position = BoardGenerator.positionToBoardPosition(checkPoint);
			board[position.x][position.y] = new Checkpoint(position, i);
		}
		if (json.holes) {
			for (const hole of json.holes) {
				const position = BoardGenerator.positionToBoardPosition(hole);
				board[position.x][position.y] = new Hole(position);
			}
		}
		if (json.lembasFields) {
			for (const lembasField of json.lembasFields) {
				const position = BoardGenerator.positionToBoardPosition(lembasField.position);
				board[position.x][position.y] = new Lembas(position, lembasField.amount);
			}
		}

		if (json.riverFields) {
			for (const riverField of json.riverFields) {
				const position = BoardGenerator.positionToBoardPosition(riverField.position);
				const d = BoardGenerator.directionToDirectionEnum(riverField.direction);
				board[position.x][position.y] = new River(position, d);
			}
		}

		return board;
	};

	static checkPointArrayToPositionArray(array: Checkpoint[]): Position[] {
		const r: Position[] = [];
		for (const checkpoint of array) {
			r[checkpoint.order] = BoardGenerator.boardPositionToPosition(checkpoint.position);
		}
		return r;
	}

	public wallCount(): number {
		return this.walls;
	}

	static isRiver(position: BoardPosition, config: BoardConfigInterface) {
		return (
			config.riverFields.filter((field) => field.position[0] === position.x && field.position[1] === position.y)
				.length > 0
		);
	}

	private static cloneBoard(board: Array<Array<FieldWithPositionInterface>>) {
		const newBoard: Array<Array<FieldWithPositionInterface>> = [];
		for (let i = 0; i < board.length; i += 1) {
			newBoard[i] = [];
			for (let j = 0; j < board[i].length; j += 1) {
				newBoard[i][j] = board[i][j];
			}
		}
		return newBoard;
	}
}

export default BoardGenerator;

export enum FieldsEnum {
	GRASS,
	START,
	CHECKPOINT,
	EYE,
	HOLE,
	LEMBAS,
	RIVER,
	WALL,
	DESTINY_MOUNTAIN,
}
