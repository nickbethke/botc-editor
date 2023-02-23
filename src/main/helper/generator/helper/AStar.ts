import FieldWithPositionInterface from '../interfaces/fieldWithPositionInterface';
import SauronsEye from '../fields/sauronsEye';
import { BoardPosition } from '../BoardGenerator';
import Hole from '../fields/hole';
import River from '../fields/river';

export type AStarElement = {
	state: BoardPosition;
	cost: number;
	estimate: number;
};

/**
 * A-Star PathFinding Class
 */
class AStar {
	private readonly start: BoardPosition;

	private readonly goal: BoardPosition;

	private readonly board: Array<Array<FieldWithPositionInterface>>;

	private readonly walls: Map<string, boolean>;

	constructor(
		start: BoardPosition,
		goal: BoardPosition,
		board: Array<Array<FieldWithPositionInterface>>,
		walls: Map<string, boolean>
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
				if (
					node.state.x === this.goal.x &&
					node.state.y === this.goal.y
				) {
					return explored;
				}
				// Generate the possible next steps from this node's state
				const next = this.generateNextSteps(node.state);
				// console.log("GOTO", node.state, "NEIGHBORS", next);

				// For each possible next step
				for (let i = 0; i < next.length; i += 1) {
					// Calculate the cost of the next step by adding the step's cost to the node's cost
					const step = next[i];
					const cost = step.cost + node.cost;

					// Check if this step has already been explored
					const isExplored = explored.find((e) => {
						return (
							e.state.x === step.state.x &&
							e.state.y === step.state.y
						);
					});

					// avoid repeated nodes during the calculation of neighbors
					const isFrontier = frontier.find((e) => {
						return (
							e.state.x === step.state.x &&
							e.state.y === step.state.y
						);
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
		}
		return [];
	}

	heuristic(state: BoardPosition): number {
		const dx = Math.abs(state.x - this.goal.x);
		const dy = Math.abs(state.y - this.goal.y);

		const penalty = this.pathIntersectsObstacle(state, this.goal) * 10;

		return Math.sqrt(dx * dx + dy * dy) + penalty;
	}

	generateNextSteps(state: BoardPosition) {
		// Define an array to store the next steps
		const height = this.board.length;
		const width = this.board[0].length;

		const next = [];

		// Check if the current state has any valid neighbors
		if (state.x > 0) {
			// If the current state has a neighbor to the left, add it to the array of next steps
			const neighbor = { x: state.x - 1, y: state.y };
			// console.log("NEIGHBOR?", state, neighbor);
			if (
				!this.isObstacle(state.x - 1, state.y) &&
				!this.isWallBetween(state, neighbor)
			) {
				next.push({
					state: { x: state.x - 1, y: state.y },
					cost: 1,
				});
			}
		}
		if (state.x < width - 1) {
			// If the current state has a neighbor to the right, add it to the array of next steps
			const neighbor = { x: state.x + 1, y: state.y };
			// console.log("NEIGHBOR?", state, neighbor);
			if (
				!this.isObstacle(state.x + 1, state.y) &&
				!this.isWallBetween(state, neighbor)
			) {
				next.push({
					state: { x: state.x + 1, y: state.y },
					cost: 1,
				});
			}
		}
		if (state.y > 0) {
			// If the current state has a neighbor above it, add it to the array of next steps
			const neighbor = { x: state.x, y: state.y - 1 };
			// console.log("NEIGHBOR?", state, neighbor);
			if (
				!this.isObstacle(state.x, state.y - 1) &&
				!this.isWallBetween(state, neighbor)
			) {
				next.push({
					state: { x: state.x, y: state.y - 1 },
					cost: 1,
				});
			}
		}
		if (state.y < height - 1) {
			// If the current state has a neighbor below it, add it to the array of next steps
			const neighbor = { x: state.x, y: state.y + 1 };
			// console.log("NEIGHBOR?", state, neighbor);
			if (
				!this.isObstacle(state.x, state.y + 1) &&
				!this.isWallBetween(state, neighbor)
			) {
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
		return (
			this.board[y][x] instanceof SauronsEye ||
			this.board[y][x] instanceof Hole
		);
	}

	isWallBetween(position1: BoardPosition, position2: BoardPosition): boolean {
		const x1 = position1.x;
		const x2 = position2.x;
		const y1 = position1.y;
		const y2 = position2.y;
		const s1 = [x1, y1].join('') + [x2, y2].join('');
		const s2 = [x2, y2].join('') + [x1, y1].join('');

		if (this.walls.get(s1) === true) {
			return true;
		}
		return this.walls.get(s2) === true;
	}

	pathIntersectsObstacle(start: BoardPosition, end: BoardPosition) {
		// Convert the starting and ending coordinates to grid coordinates
		const { x: startX, y: startY } = start;
		const { x: endX, y: endY } = end;

		// Get the coordinates of all points on the path
		const path: Array<[number, number]> = this.getPath(
			startX,
			startY,
			endX,
			endY
		);

		// get the points in the array that are within the list of obstacles

		let interSections = 0;

		for (let i = 0; i < path.length; i += 1) {
			const point = path[i];
			if (
				!(
					this.board[point[1]][point[0]] instanceof SauronsEye ||
					this.board[point[1]][point[0]] instanceof River
				)
			) {
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
		walls: Map<string, boolean>
	): { result: boolean; pathFindings: number } {
		let pathFindings = 0;
		const startFieldLength = startFields.length;

		const commonStartField: BoardPosition = startFields[0];

		for (let i = 1; i < startFieldLength; i += 1) {
			const currStartField = startFields[i];
			const aStar = new AStar(
				commonStartField,
				currStartField,
				board,
				walls
			);
			const path = aStar.AStar();

			pathFindings += 1;
			if (path.length < 1) {
				return { result: false, pathFindings };
			}
		}

		for (let i = 0; i < lembasFields.length; i += 1) {
			const lembasField = lembasFields[i];
			const aStar = new AStar(
				lembasField.position,
				commonStartField,
				board,
				walls
			);
			const path = aStar.AStar();
			pathFindings += 1;
			if (path.length < 1) {
				return { result: false, pathFindings };
			}
		}

		for (let i = 0; i < checkpoints.length; i += 1) {
			const checkpoint = checkpoints[i];
			const aStar = new AStar(checkpoint, commonStartField, board, walls);
			const path = aStar.AStar();
			pathFindings += 1;
			if (path.length < 1) {
				return { result: false, pathFindings };
			}
		}
		return { result: true, pathFindings };
	}
}

export default AStar;
