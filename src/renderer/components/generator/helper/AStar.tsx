import FieldWithPositionInterface from '../interfaces/FieldWithPositionInterface';
import SauronsEye from '../fields/SauronsEye';
import { BoardPosition } from '../BoardGenerator';
import Hole from '../fields/Hole';
import River from '../fields/River';
import BoardConfigInterface from '../../../../interfaces/BoardConfigInterface';
import { position2BoardPosition, wallBoardPositions2StringArray, wallConfig2Map } from '../interfaces/BoardPosition';
import directionHelper from './DirectionHelper';
import StartField from '../fields/StartField';
import Checkpoint from '../fields/Checkpoint';
import Lembas from '../fields/Lembas';
import Grass from '../fields/Grass';

export type AStarElement = {
	state: BoardPosition;
	cost: number;
	estimate: number;
};

type AStarElementWithoutEstimate = { state: BoardPosition, cost: number };


/**
 * @since 0.6.5
 * A-Star PathFinding Class for the board generator
 */
class AStar {
	/**
	 * The start position of the A-Star
	 * @private
	 */
	private readonly start: BoardPosition;

	/**
	 * The end position of the A-Star
	 * @private
	 */
	private readonly goal: BoardPosition;

	/**
	 * The virtual board
	 * @private
	 */
	private readonly board: Array<Array<FieldWithPositionInterface>>;

	/**
	 * The walls map
	 * @private
	 */
	private readonly walls: Map<string, boolean>;

	constructor(
		start: BoardPosition,
		goal: BoardPosition,
		board: Array<Array<FieldWithPositionInterface>>,
		walls: Map<string, boolean>,
	) {
		this.start = start;
		this.goal = goal;
		this.board = board;
		this.walls = walls;
	}

	AStar(): Array<{
		state: { x: number; y: number };
		cost: number;
		estimate: number;
	}> {
		const explored: AStarElement[] = [];

		const frontier: AStarElement[] = [
			{
				state: this.start,
				cost: 0,
				estimate: this.heuristic(this.start),
			},
		];

		while (frontier.length > 0) {
			frontier.sort((a, b) => {
				return a.estimate - b.estimate;
			});

			const node = frontier.shift();
			if (node) {
				explored.push(node);

				// If this node reaches the goal, return the node
				if (node.state.x === this.goal.x && node.state.y === this.goal.y) {
					return explored;
				}
				// Generate the possible next steps from this node's state
				const next = this.generateNextSteps(node.state);

				// For each possible next step
				this.forEachNextStep(next, node, explored, frontier);
			}
		}
		return [];
	}

	private forEachNextStep(next: AStarElementWithoutEstimate[], node: AStarElement, explored: AStarElement[], frontier: AStarElement[]) {
		for (const step of next) {
			// Calculate the cost of the next step by adding the step's cost to the node's cost
			const cost = step.cost + node.cost;

			// Check if this step has already been explored
			const isExplored = explored.find((e) => {
				return e.state.x === step.state.x && e.state.y === step.state.y;
			});

			// avoid repeated nodes during the calculation of neighbors
			const isFrontier = frontier.find((e) => {
				return e.state.x === step.state.x && e.state.y === step.state.y;
			});

			// If this step has not been explored
			if (!isExplored && !isFrontier) {
				// Add the step to the frontier, using the cost and the heuristic function to estimate the total cost to reach the goal
				frontier.push({
					state: step.state,
					cost,
					estimate: cost + this.heuristic(step.state),
				});
			}
		}
	}

	heuristic(state: BoardPosition): number {
		const dx = Math.abs(state.x - this.goal.x);
		const dy = Math.abs(state.y - this.goal.y);

		const penalty = this.pathIntersectsObstacle(state, this.goal) * 10;

		return Math.sqrt(dx * dx + dy * dy) + penalty;
	}

	generateNextSteps(state: BoardPosition): AStarElementWithoutEstimate[] {
		// Define an array to store the next steps
		const width = this.board.length;
		const height = this.board[0].length;

		const next: AStarElementWithoutEstimate[] = [];

		// Check if the current state has any valid neighbors
		if (state.x > 0) {
			// If the current state has a neighbor to the left, add it to the array of next steps
			const neighbor = { x: state.x - 1, y: state.y };
			if (!this.isObstacle(state.x - 1, state.y) && !this.isWallBetween(state, neighbor)) {
				next.push({
					state: { x: state.x - 1, y: state.y },
					cost: 1,
				});
			}
		}
		if (state.x < width - 1) {
			// If the current state has a neighbor to the right, add it to the array of next steps
			const neighbor = { x: state.x + 1, y: state.y };
			if (!this.isObstacle(state.x + 1, state.y) && !this.isWallBetween(state, neighbor)) {
				next.push({
					state: { x: state.x + 1, y: state.y },
					cost: 1,
				});
			}
		}
		if (state.y > 0) {
			// If the current state has a neighbor above it, add it to the array of next steps
			const neighbor = { x: state.x, y: state.y - 1 };
			if (!this.isObstacle(state.x, state.y - 1) && !this.isWallBetween(state, neighbor)) {
				next.push({
					state: { x: state.x, y: state.y - 1 },
					cost: 1,
				});
			}
		}
		if (state.y < height - 1) {
			// If the current state has a neighbor below it, add it to the array of next steps
			const neighbor = { x: state.x, y: state.y + 1 };
			if (!this.isObstacle(state.x, state.y + 1) && !this.isWallBetween(state, neighbor)) {
				next.push({
					state: { x: state.x, y: state.y + 1 },
					cost: 1,
				});
			}
		}

		// Return the array of next steps
		return next;
	}

	isObstacle(x: number, y: number): boolean {
		return this.board[x][y] instanceof SauronsEye || this.board[x][y] instanceof Hole;
	}

	isWallBetween(position1: BoardPosition, position2: BoardPosition): boolean {
		const [s1, s2] = wallBoardPositions2StringArray(position1, position2);
		return this.walls.get(s1) === true || this.walls.get(s2) === true;
	}

	pathIntersectsObstacle(start: BoardPosition, end: BoardPosition) {
		// Convert the starting and ending coordinates to grid coordinates
		const { x: startX, y: startY } = start;
		const { x: endX, y: endY } = end;

		// Get the coordinates of all points on the path
		const path: Array<[number, number]> = this.getPath(startX, startY, endX, endY);

		// get the points in the array that are within the list of obstacles

		let interSections = 0;

		for (const element of path) {
			const point = element;
			if (!(this.board[point[0]][point[1]] instanceof SauronsEye || this.board[point[0]][point[1]] instanceof River)) {
				interSections += 1;
			}
		}
		return interSections;
	}

	getPath = (startX: number, startY: number, endX: number, endY: number) => {
		// Initialize an empty array to store the coordinates of the points on the path
		let path: Array<[number, number]> = [];

		// Use the Bresenham's line algorithm to get the coordinates of the points on the path
		let x1 = startX;
		let y1 = startY;
		let x2 = endX;
		let y2 = endY;
		const isSteep = Math.abs(y2 - y1) > Math.abs(x2 - x1);
		if (isSteep) {
			[x1, y1] = [y1, x1];
			[x2, y2] = [y2, x2];
		}
		let isReversed = false;
		if (x1 > x2) {
			[x1, x2] = [x2, x1];
			[y1, y2] = [y2, y1];
			isReversed = true;
		}
		const deltaX = x2 - x1;
		const deltaY = Math.abs(y2 - y1);
		let error = Math.floor(deltaX / 2);
		let y = y1;
		let yStep;
		if (y1 < y2) {
			yStep = 1;
		} else {
			yStep = -1;
		}
		for (let x = x1; x <= x2; x += 1) {
			if (isSteep) {
				path.push([y, x]);
			} else {
				path.push([x, y]);
			}
			error -= deltaY;
			if (error < 0) {
				y += yStep;
				error += deltaX;
			}
		}

		// If the line is reversed, reverse the order of the points in the path
		if (isReversed) {
			path = path.reverse();
		}

		return path;
	};

	static pathPossible(
		checkpoints: Array<BoardPosition>,
		startFields: Array<BoardPosition>,
		lembasFields: Array<{ position: BoardPosition; amount: number }>,
		board: Array<Array<FieldWithPositionInterface>>,
		walls: Map<string, boolean>,
	): {
		result: boolean;
		error: { start: BoardPosition | null; end: BoardPosition | null };
	} {
		const startFieldLength = startFields.length;

		const commonStartField: BoardPosition = startFields[0];

		for (let i = 1; i < startFieldLength; i += 1) {
			const currStartField = startFields[i];
			const aStar = new AStar(commonStartField, currStartField, board, walls);
			const path = aStar.AStar();

			if (path.length < 1) {
				return {
					result: false,
					error: { start: commonStartField, end: currStartField },
				};
			}
		}

		for (const element of lembasFields) {
			const lembasField = element;
			const aStar = new AStar(lembasField.position, commonStartField, board, walls);
			const path = aStar.AStar();
			if (path.length < 1) {
				return {
					result: false,
					error: {
						start: lembasField.position,
						end: commonStartField,
					},
				};
			}
		}

		for (const element of checkpoints) {
			const checkpoint = element;
			const aStar = new AStar(checkpoint, commonStartField, board, walls);
			const path = aStar.AStar();
			if (path.length < 1) {
				return {
					result: false,
					error: { start: checkpoint, end: commonStartField },
				};
			}
		}
		return {
			result: true,
			error: { start: null, end: null },
		};
	}

	static pathPossibleAll(
		checkpoints: Array<BoardPosition>,
		startFields: Array<BoardPosition>,
		lembasFields: Array<{ position: BoardPosition; amount: number }>,
		board: Array<Array<FieldWithPositionInterface>>,
		walls: Map<string, boolean>,
	): {
		result: boolean;
		errors: Array<{
			start: BoardPosition | null;
			end: BoardPosition | null;
		}>;
	} {
		let result = true;
		const errors: Array<{
			start: BoardPosition | null;
			end: BoardPosition | null;
		}> = [];

		for (const startField of startFields) {
			const currStartField = startField;
			for (const checkpoint of checkpoints) {
				const aStar = new AStar(currStartField, checkpoint, board, walls);
				const path = aStar.AStar();

				if (path.length < 1) {
					result = false;
					errors.push({
						start: currStartField,
						end: checkpoint,
					});
				}
			}
		}
		return {
			result,
			errors,
		};
	}

	public static checkBoardConfig(config: BoardConfigInterface): {
		result: boolean;
		errors: Array<{
			start: BoardPosition | null;
			end: BoardPosition | null;
		}>;
	} {
		const board: Array<Array<FieldWithPositionInterface>> = [];

		for (let x = 0; x < config.width; x += 1) {
			const row: Array<FieldWithPositionInterface> = [];

			for (let y = 0; y < config.height; y += 1) {
				row.push(new Grass({ x, y }));
			}
			board.push(row);
		}

		const eye = new SauronsEye(
			position2BoardPosition(config.eye.position),
			directionHelper.string2DirEnum(config.eye.direction),
		);
		board[eye.position.x][eye.position.y] = eye;

		config.startFields.forEach((startField) => {
			const start = new StartField(
				position2BoardPosition(startField.position),
				directionHelper.string2DirEnum(startField.direction),
			);
			board[start.position.x][start.position.y] = start;
		});

		config.checkPoints.forEach((checkPoint, index) => {
			const check = new Checkpoint(position2BoardPosition(checkPoint), index);
			board[check.position.x][check.position.y] = check;
		});

		config.lembasFields.forEach((lembasField) => {
			const lembas = new Lembas(position2BoardPosition(lembasField.position), lembasField.amount);
			board[lembas.position.x][lembas.position.y] = lembas;
		});

		config.riverFields.forEach((riverField) => {
			const river = new River(
				position2BoardPosition(riverField.position),
				directionHelper.string2DirEnum(riverField.direction),
			);
			board[river.position.x][river.position.y] = river;
		});

		config.holes.forEach((holeField) => {
			const hole = new Hole(position2BoardPosition(holeField));
			board[hole.position.x][hole.position.y] = hole;
		});

		const walls = wallConfig2Map(config.walls);

		const checkpoints = config.checkPoints.map((e) => {
			return position2BoardPosition(e);
		});

		const startFields = config.startFields.map((e) => {
			return position2BoardPosition(e.position);
		});

		const lembasFields = config.lembasFields.map((e) => {
			return {
				position: position2BoardPosition(e.position),
				amount: e.amount,
			};
		});
		return AStar.pathPossibleAll(checkpoints, startFields, lembasFields, board, walls);
	}
}

export default AStar;
