import { Position } from '../../../../interfaces/BoardConfigInterface';

/**
 * The board position type
 */
export type BoardPosition = {
	x: number;
	y: number;
};

/**
 * Generates a board position from a position
 * @param position
 */
export function position2BoardPosition(position: Position): BoardPosition {
	return { x: position[0], y: position[1] };
}

/**
 * Generates a position from a board position
 * @param position
 */
export function boardPosition2Position(position: BoardPosition): Position {
	return [position.x, position.y];
}

/**
 * Generates a wall position from a wall board position
 * @param position
 */
export function wallBoardPosition2WallPosition(position: [BoardPosition, BoardPosition]): [Position, Position] {
	return [boardPosition2Position(position[0]), boardPosition2Position(position[1])];
}

/**
 * Generates a unique string from a board position according to a specific format "x|y"
 */
export function boardPosition2String(postion: BoardPosition): string {
	return `${postion.x.toString()}|${postion.y.toString()}`;
}

/**
 * Generates a unique string from a position according to a specific format "x|y"
 * @param postion
 */
export function position2String(postion: Position): string {
	return `${postion[0].toString()}|${postion[1].toString()}`;
}

/**
 * Generates a unique string from a wall board position according to a specific format "x0|y0|x1|y1"
 * @param position
 */
export function wallBoardPosition2String(position: [BoardPosition, BoardPosition]): string {
	return `${boardPosition2String(position[0])}::${boardPosition2String(position[1])}`;
}

/**
 * Generates a unique string from a wall board position according to a specific format "x0|y0|x1|y1"
 * @param position1
 * @param position2
 * @returns [string, string] - The first string is the string representation of the wall position from position1 to position2, the second string is the string representation of the wall position from position2 to position1
 */
export function wallBoardPositions2StringArray(position1: BoardPosition, position2: BoardPosition): [string, string] {
	return [`${boardPosition2String(position1)}::${boardPosition2String(position2)}`, `${boardPosition2String(position2)}::${boardPosition2String(position1)}`];
}

/**
 * Generates a unique string from a wall position according to a specific format "x0|y0|x1|y1"
 * @param position
 */
export function wallPosition2String(position: [Position, Position]): string {
	return `${position2String(position[0])}::${position2String(position[1])}`;
}

/**
 * Convert Wall Array to Map
 * @see {@link Map}
 * @param walls
 */
export function wallConfig2Map(walls: Array<Array<Position>>): Map<string, true> {
	const map = new Map<string, true>();
	for (const element of walls) {
		const wall = element as [Position, Position];
		map.set(wallPosition2String(wall), true);
	}
	return map;
}
