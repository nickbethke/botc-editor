interface BoardConfigInterface {
  checkPoints: Array<[number, number]>;
  eye: PositionDirection;
  height: number;
  holes?: Array<[number, number]>;
  lembas?: Lembas[];
  name: string;
  riverFields?: PositionDirection[];
  startFields: PositionDirection[];
  walls?: Array<Array<[number, number]>>;
  width: number;
}

export interface PositionDirection {
  direction: Direction;
  position: [number, number];
}

export type Direction = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';

export interface Lembas {
  amount: number;
  position: [number, number];
}

export default BoardConfigInterface;
