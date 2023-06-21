/**
 * The board configuration type interface
 */
interface BoardConfigInterface {
	checkPoints: Array<Position>;
	eye: PositionDirection;
	height: number;
	holes: Array<Position>;
	lembasFields: LembasField[];
	name: string;
	riverFields: PositionDirection[];
	startFields: PositionDirection[];
	walls: Array<Array<Position>>;
	width: number;
	eagleFields: Position[];
}

/**
 * The position with direction interface
 */
export interface PositionDirection {
	direction: Direction;
	position: Position;
}

/**
 * The direction type
 */
export type Direction = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';

/**
 * The direction enum
 */
export enum DirectionEnum {
	'NORTH',
	'EAST',
	'SOUTH',
	'WEST',
}

/**
 * The lembas field type
 */
export interface LembasField {
	amount: number;
	position: Position;
}

/**
 * The position type
 */
export type Position = [number, number];

export default BoardConfigInterface;
