import { Position } from '../../interfaces/BoardConfigInterface';

export type BoardPosition = {
	x: number;
	y: number;
};

export function position2BoardPosition(position: Position): BoardPosition {
	return { x: position[0], y: position[1] };
}

export function boardPosition2Position(position: BoardPosition): Position {
	return [position.x, position.y];
}

export function wallBoardPosition2WallPosition(position: [BoardPosition, BoardPosition]): [Position, Position] {
	return [boardPosition2Position(position[0]), boardPosition2Position(position[1])];
}

export function boardPosition2String(postion: BoardPosition): string {
	return postion.x.toString() + postion.y.toString();
}

export function position2String(postion: Position): string {
	return postion[0].toString() + postion[1].toString();
}

export function wallBoardPosition2String(position: [BoardPosition, BoardPosition]): string {
	return boardPosition2String(position[0]) + boardPosition2String(position[1]);
}

export function wallPosition2String(position: [Position, Position]): string {
	return position2String(position[0]) + position2String(position[1]);
}

/**
 * Convert Wall Array to Map
 * @see {@link Map}
 * @param walls
 */
export function wallConfig2Map(walls: Array<Array<Position>>): Map<string, true> {
	const map = new Map<string, true>();
	for (let i = 0; i < walls.length; i += 1) {
		const wall = walls[i] as [Position, Position];
		map.set(wallPosition2String(wall), true);
	}
	return map;
}
