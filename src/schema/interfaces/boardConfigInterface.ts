interface BoardConfigInterface {
  checkPoints: Array<Position>;
  eye: PositionDirection;
  height: number;
  holes?: Array<Position>;
  lembas?: Lembas[];
  name: string;
  riverFields?: PositionDirection[];
  startFields: PositionDirection[];
  walls?: Array<Array<Position>>;
  width: number;
}

export interface PositionDirection {
  direction: Direction;
  position: Position;
}

export enum Direction {
  'NORTH',
  'EAST',
  'SOUTH',
  'WEST',
}

export interface Lembas {
  amount: number;
  position: Position;
}

export type Position = [number, number];

export default BoardConfigInterface;
