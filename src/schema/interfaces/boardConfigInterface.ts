interface BoardConfigInterface {
  checkPoints: Array<number[]>;
  eye: PositionDirection;
  height: number;
  holes: Array<number[]>;
  lembas: Lembas[];
  name: string;
  riverFields: PositionDirection[];
  startFields: PositionDirection[];
  walls: Array<Array<number[]>>;
  width: number;
}

export interface PositionDirection {
  direction: Direction;
  position: number[];
}

export type Direction = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';

export interface Lembas {
  amount: number;
  position: number[];
}

export default BoardConfigInterface;
