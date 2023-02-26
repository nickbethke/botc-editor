import FieldWithPositionInterface from './interfaces/fieldWithPositionInterface';
import Grass from './fields/grass';
import BoardConfigInterface, {
	Direction,
	DirectionEnum,
	Position,
} from '../interfaces/BoardConfigInterface';
import SauronsEye from './fields/sauronsEye';
import StartField from './fields/startField';
import Checkpoint from './fields/checkpoint';
import Hole from './fields/hole';
import Lembas from './fields/lembas';
import River from './fields/river';
import Board from './board';
import AStar from './helper/AStar';
import DirectionHelper from './helper/DirectionHelper';

/**
 * random board start values type
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
 * default random board start values
 */
export const defaultStartValues: RandomBoardStartValues = {
	name: 'THE CENTERLÄND',
	checkpoints: 1,
	height: 2,
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
 * board position type <br>
 * consisting of an x and y number value
 */
export type BoardPosition = {
	x: number;

	y: number;
};

class BoardGenerator {
	private readonly percentage: number = 0.2;

	readonly board: Array<Array<FieldWithPositionInterface>>;

	readonly startValues: RandomBoardStartValues;

	readonly boardJSON: Board;

	private walls = 0;

	private wallMapArray: Array<[string, boolean]>;

	readonly checkpoints: BoardPosition[];

	private readonly startFields: BoardPosition[];

	private wallCall: number | undefined;

	private wallMaxCall: number | undefined;

	private holesSet: number;

	private holesTrys: Map<string, boolean> | undefined;

	private readonly lembasFields: Array<{
		position: BoardPosition;
		amount: number;
	}>;

	constructor(startValues?: RandomBoardStartValues) {
		this.holesSet = 0;

		// merging custom start values with default values
		this.startValues = { ...defaultStartValues, ...startValues };

		// initializing all needed/required attributes
		this.checkpoints = [];
		this.startFields = [];
		this.lembasFields = [];
		this.wallMapArray = [];

		// check ig generation of board is possible, otherwise throws an error
		if (this.getFieldCount() < this.getOccupiedFieldsCount()) {
			throw new Error('Board to small for all fields');
		}

		// initializing the board array
		this.board = BoardGenerator.generateBoardArray(
			this.startValues.height,
			this.startValues.width
		);

		// initializing the new board
		this.boardJSON = new Board(
			this.startValues.name,
			this.startValues.width,
			this.startValues.height
		);

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

	public static positionArrayToBoardPositionArray(
		position: Position[]
	): BoardPosition[] {
		const boardPositions: BoardPosition[] = [];
		for (let i = 0; i < position.length; i += 1) {
			const positionItem = position[i];
			boardPositions.push(
				BoardGenerator.positionToBoardPosition(positionItem)
			);
		}
		return boardPositions;
	}

	public static generateBoardArray(
		height: number,
		width: number
	): Array<Array<FieldWithPositionInterface>> {
		const board = new Array<Array<FieldWithPositionInterface>>();

		for (let y = 0; y < height; y += 1) {
			const row: FieldWithPositionInterface[] =
				new Array<FieldWithPositionInterface>();
			for (let x = 0; x < width; x += 1) {
				row.push(new Grass({ x, y }));
			}
			board.push(row);
		}
		return board;
	}

	private genSauronsEye() {
		const position = this.getRandomPosition();
		const direction = BoardGenerator.getRandomDirection();
		this.board[position.y][position.x] = new SauronsEye(
			position,
			direction
		);
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
		this.board[position.y][position.x] = new StartField(
			position,
			direction
		);
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
		this.board[position.y][position.x] = new Checkpoint(position, order);
		this.boardJSON.addCheckPoint(position);
		this.checkpoints.push(position);
	}

	private genHoles() {
		const maxTrys = this.getFieldCount() * 8;
		let trys = 0;
		this.holesTrys = new Map();
		// generate until all holes to be set are set, or the max trys are reached
		while (this.holesSet < this.startValues.holes && trys < maxTrys) {
			this.genHole();
			trys += 1;
		}
	}

	private genHole() {
		this.holesTrys = new Map<string, boolean>();
		// generate random position
		const position = this.getRandomPosition();
		// check if position has already been tried
		if (
			this.holesTrys.get(BoardGenerator.position2String(position)) ===
			undefined
		) {
			// check pathfinding, so all checkpoints are reachable from all start fields
			const { result } = AStar.pathPossible(
				this.checkpoints,
				this.startFields,
				this.lembasFields,
				this.board,
				new Map([])
			);
			// if all paths is possible add the hole field
			if (result) {
				this.board[position.y][position.x] = new Hole(position);
				this.boardJSON.addHole(position);
				this.holesSet += 1;
			}
			// set tried hole position
			this.holesTrys.set(BoardGenerator.position2String(position), true);
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
		this.board[position.y][position.x] = new Lembas(position, amount);
		this.lembasFields.push({ position, amount });
		this.boardJSON.addLembasField(position, amount);
	}

	private genRivers() {
		const freeSpacesCount = this.getFreeFieldsCount();
		let riverFieldCount = Math.floor(freeSpacesCount / 5);

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
			this.board[position.y][position.x] = new River(position, direction);
			this.boardJSON.addRiverField(position, direction);
		}
	}

	private genRiversComplex(riverCount: number) {
		let made = 0;
		while (made < riverCount) {
			const toMake = BoardGenerator.getRandomInt(
				2,
				Math.min(this.startValues.height, this.startValues.width)
			);
			let startPosition = this.getRandomPosition();
			let startDirection = BoardGenerator.getRandomDirection();

			this.board[startPosition.y][startPosition.x] = new River(
				startPosition,
				startDirection
			);
			this.boardJSON.addRiverField(startPosition, startDirection);
			made += 1;

			for (let i = 1; i < toMake; i += 1) {
				const neighbors = this.getRiverNeighbors(startPosition);
				if (neighbors.length > 0) {
					let selected: {
						position: BoardPosition;
						direction: Direction;
					} | null = null;
					const helpDirection =
						DirectionHelper.dirEnumToString(startDirection);
					for (let i1 = 0; i1 < neighbors.length; i1 += 1) {
						const neighbor = neighbors[i1];
						const { direction } = neighbor;
						if (direction === helpDirection) {
							selected = neighbor;
							break;
						}
					}
					if (selected === null) {
						break;
					} else {
						startDirection = BoardGenerator.getRandomDirection();
						if (
							(DirectionHelper.dirEnumToString(startDirection) ===
								'SOUTH' &&
								helpDirection === 'NORTH') ||
							(DirectionHelper.dirEnumToString(startDirection) ===
								'NORTH' &&
								helpDirection === 'SOUTH')
						) {
							startDirection = BoardGenerator.probably(50)
								? DirectionEnum.EAST
								: DirectionEnum.WEST;
						}
						if (
							(DirectionHelper.dirEnumToString(startDirection) ===
								'EAST' &&
								helpDirection === 'WEST') ||
							(DirectionHelper.dirEnumToString(startDirection) ===
								'WEST' &&
								helpDirection === 'EAST')
						) {
							startDirection = BoardGenerator.probably(50)
								? DirectionEnum.NORTH
								: DirectionEnum.SOUTH;
						}
						startPosition = selected.position;
						this.board[startPosition.y][startPosition.x] =
							new River(startPosition, startDirection);
						this.boardJSON.addRiverField(
							startPosition,
							startDirection
						);
						made += 1;
						if (made >= riverCount) {
							break;
						}
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

	public getRiverNeighbors(
		position: BoardPosition
	): Array<{ position: BoardPosition; direction: Direction }> {
		const { x, y } = position;

		const neighbors = new Array<{
			position: BoardPosition;
			direction: Direction;
		}>();
		// north
		let currentPosition = { x, y: y - 1 };
		if (
			this.isPositionInBoard(currentPosition) &&
			!(this.board[y - 1][x] instanceof River)
		) {
			neighbors.push({ position: currentPosition, direction: 'NORTH' });
		}

		// east
		currentPosition = { x: x + 1, y };
		if (
			this.isPositionInBoard(currentPosition) &&
			!(this.board[y][x + 1] instanceof River)
		) {
			neighbors.push({ position: currentPosition, direction: 'EAST' });
		}
		// south
		currentPosition = { x, y: y + 1 };
		if (
			this.isPositionInBoard(currentPosition) &&
			!(this.board[y + 1][x] instanceof River)
		) {
			neighbors.push({ position: currentPosition, direction: 'SOUTH' });
		}

		// west
		currentPosition = { x: x - 1, y };
		if (
			this.isPositionInBoard(currentPosition) &&
			!(this.board[y][x - 1] instanceof River)
		) {
			neighbors.push({ position: currentPosition, direction: 'WEST' });
		}

		return neighbors;
	}

	private genWallsRandom() {
		const x = this.startValues.width;
		const y = this.startValues.height;
		const wallsToSet = Math.floor(
			((x - 1) * y + (y - 1) * x) * this.percentage
		);
		const alreadyTried: Array<string> = [];

		this.wallMaxCall = ((x - 1) * y + (y - 1) * x) * 4;
		this.wallCall = 0;
		if (wallsToSet) {
			while (
				this.wallCall < this.wallMaxCall &&
				this.walls < wallsToSet
			) {
				this.genWallRandom(alreadyTried);
				this.wallCall += 1;
			}
		}
	}

	private genWallRandom(alreadyTried: Array<string>): void {
		const firstPosition = this.getRandomPosition(true);
		const neighbors = this.getNeighbors(firstPosition);
		if (neighbors.length) {
			const secondPosition =
				neighbors[BoardGenerator.getRandomInt(0, neighbors.length)];
			if (
				!(
					this.getFieldFromPosition(firstPosition) instanceof River &&
					this.getFieldFromPosition(secondPosition) instanceof River
				)
			) {
				if (
					!alreadyTried.includes(
						firstPosition.x.toString() +
							firstPosition.y.toString() +
							secondPosition.x.toString() +
							secondPosition.y
					) &&
					!alreadyTried.includes(
						secondPosition.x.toString() +
							secondPosition.y.toString() +
							firstPosition.x.toString() +
							firstPosition.y
					)
				) {
					const s1 =
						BoardGenerator.position2String(firstPosition) +
						BoardGenerator.position2String(secondPosition);
					const s2 =
						BoardGenerator.position2String(secondPosition) +
						BoardGenerator.position2String(firstPosition);
					const wallsArrayCopy = [...this.wallMapArray];
					this.wallMapArray.push([s1, true], [s2, true]);
					const { result } = AStar.pathPossible(
						this.checkpoints,
						this.startFields,
						this.lembasFields,
						this.board,
						new Map(this.wallMapArray)
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

	private getFieldFromPosition(
		position: BoardPosition
	): FieldWithPositionInterface {
		return this.board[position.y][position.x];
	}

	public getNeighbors(position: BoardPosition): Array<BoardPosition> {
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
		for (let y = 0; y < this.board.length; y += 1) {
			const row = this.board[y];
			for (let x = 0; x < row.length; x += 1) {
				const field = row[x];
				this.genWallIterative(field.position);
			}
		}
	}

	private genWallIterative(position: BoardPosition): void {
		const neighbors = this.getNeighbors_David(position);
		for (let i = 0; i < neighbors.length; i += 1) {
			const neighbor = neighbors[i];
			if (
				!(
					this.getFieldFromPosition(position) instanceof River &&
					this.getFieldFromPosition(neighbor) instanceof River
				)
			) {
				if (BoardGenerator.probably(this.percentage * 100)) {
					const s1 =
						BoardGenerator.position2String(position) +
						BoardGenerator.position2String(neighbor);
					const s2 =
						BoardGenerator.position2String(neighbor) +
						BoardGenerator.position2String(position);
					const wallsArrayCopy = [...this.wallMapArray];
					this.wallMapArray.push([s1, true], [s2, true]);
					const { result: pathPossible } = AStar.pathPossible(
						this.checkpoints,
						this.startFields,
						this.lembasFields,
						this.board,
						new Map(this.wallMapArray)
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
		const { x, y } = position;
		if (x > this.startValues.width - 1 || x < 0) {
			return false;
		}
		return !(y > this.startValues.height - 1 || y < 0);
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
		for (let y = 0; y < this.board.length; y += 1) {
			for (let x = 0; x < this.board[y].length; x += 1) {
				if (this.board[y][x] instanceof Grass) {
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
			if (ignoreOccupiedFields) {
				position = { x, y };
				done = true;
			} else if (this.isFieldFree({ x, y })) {
				position = { x, y };
				done = true;
			}
		}
		return position;
	}

	private isFieldFree(position: BoardPosition): boolean {
		return this.board[position.y][position.x] instanceof Grass;
	}

	static getRandomDirection(): DirectionEnum {
		return BoardGenerator.getRandomEnum(DirectionEnum);
	}

	static getRandomEnum<T>(anEnum: T): T[keyof T] {
		const enumValues = Object.keys(anEnum)
			.map((n) => Number.parseInt(n, 10))
			.filter((n) => !Number.isNaN(n)) as unknown as T[keyof T][];
		const randomIndex = Math.floor(Math.random() * enumValues.length);
		return enumValues[randomIndex];
	}

	private getRandomLembasAmount(): number {
		return this.startValues.maxLembasAmountOnField <= 0
			? 0
			: BoardGenerator.getRandomIntInclusive(
					0,
					this.startValues.maxLembasAmountOnField
			  );
	}

	static getRandomIntInclusive(min: number, max: number) {
		return Math.floor(
			Math.random() * (Math.floor(max) - Math.ceil(min) + 1) +
				Math.ceil(min)
		); // The maximum is inclusive and the minimum is inclusive
	}

	static getRandomInt(min: number, max: number) {
		return Math.floor(
			Math.random() * (Math.floor(max) - Math.ceil(min)) + Math.ceil(min)
		);
	}

	static position2String(postion: BoardPosition): string {
		return postion.x.toString() + postion.y.toString();
	}

	static firstLetter(string: string): string {
		return string.substring(0, 1);
	}

	static sleep(ms: number) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}

	static checkpointsPositionArrayToCheckpointArray(
		checkpointPositionArray: BoardPosition[]
	): Checkpoint[] {
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

	static jsonToBoard(
		json: BoardConfigInterface
	): Array<Array<FieldWithPositionInterface>> {
		const board: Array<Array<FieldWithPositionInterface>> =
			BoardGenerator.generateBoardArray(json.height, json.width);

		board[json.eye.position[1]][json.eye.position[0]] = new SauronsEye(
			BoardGenerator.positionToBoardPosition(json.eye.position),
			BoardGenerator.directionToDirectionEnum(json.eye.direction)
		);

		for (let i = 0; i < json.startFields.length; i += 1) {
			const startField = json.startFields[i];
			const position = BoardGenerator.positionToBoardPosition(
				startField.position
			);
			const d = BoardGenerator.directionToDirectionEnum(
				startField.direction
			);
			board[position.y][position.x] = new StartField(position, d);
		}

		for (let i = 0; i < json.checkPoints.length; i += 1) {
			const checkPoint = json.checkPoints[i];
			const position = BoardGenerator.positionToBoardPosition(checkPoint);
			board[position.y][position.x] = new Checkpoint(position, i);
		}
		if (json.holes) {
			for (let i = 0; i < json.holes.length; i += 1) {
				const hole = json.holes[i];
				const position = BoardGenerator.positionToBoardPosition(hole);
				board[position.y][position.x] = new Hole(position);
			}
		}
		if (json.lembasFields) {
			for (let i = 0; i < json.lembasFields.length; i += 1) {
				const lembasField = json.lembasFields[i];
				const position = BoardGenerator.positionToBoardPosition(
					lembasField.position
				);
				board[position.y][position.x] = new Lembas(
					position,
					lembasField.amount
				);
			}
		}

		if (json.riverFields) {
			for (let i = 0; i < json.riverFields.length; i += 1) {
				const riverField = json.riverFields[i];
				const position = BoardGenerator.positionToBoardPosition(
					riverField.position
				);
				const d = BoardGenerator.directionToDirectionEnum(
					riverField.direction
				);
				board[position.y][position.x] = new River(position, d);
			}
		}

		return board;
	}

	public wallCount(): number {
		return this.walls;
	}
}

export default BoardGenerator;
