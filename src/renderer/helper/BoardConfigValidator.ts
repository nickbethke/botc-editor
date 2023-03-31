import BoardConfigInterface, { Position } from '../components/interfaces/BoardConfigInterface';
import BoardGenerator from '../components/generator/BoardGenerator';
import { wallPosition2String } from '../components/generator/interfaces/boardPosition';

class BoardConfigValidator {
	private readonly json: JSON;

	private readonly config: BoardConfigInterface;

	public readonly errors: string[] = [];

	constructor(boardConfig: BoardConfigInterface) {
		this.config = boardConfig;
		this.json = JSON.parse(JSON.stringify(boardConfig));

		if (!this.config.name) {
			this.errors.push(`Board name is not defined`);
		}
		if (!this.config.width) {
			this.errors.push(`Board width is not defined`);
		}
		if (!this.config.height) {
			this.errors.push(`Board height is not defined`);
		}
		if (!this.config.eye) {
			this.errors.push(`Board eye is not defined`);
		}
		if (!this.config.checkPoints || this.config.checkPoints.length < 2) {
			this.errors.push(`Check points are to less (minimum 2) or not defined`);
		}
		if (!this.config.startFields || this.config.startFields.length < 2) {
			this.errors.push(`Start fields are to less (minimum 2) or not defined`);
		}

		const doubleOccupancy = this.checkDoubleOccupancy();
		if (doubleOccupancy) {
			this.errors.push(`Double occupancy on field [${doubleOccupancy[0]}, ${doubleOccupancy[1]}]`);
		}
		const wallDoubleOccupancy = this.wallDoubleOccupancy();
		if (wallDoubleOccupancy) {
			this.errors.push(
				`Double occupancy on a wall position [${wallDoubleOccupancy[0][0]}, ${wallDoubleOccupancy[0][1]}] [${wallDoubleOccupancy[1][0]}, ${wallDoubleOccupancy[1][1]}]`
			);
		}
		const dimensions = this.checkDimensions();
		if (dimensions) {
			this.errors.push(
				`Board dimensions [${this.config.width}, ${this.config.height}] is smaller then field dimension: `,
				`\t required dimension: [${dimensions[0] + 1}, ${dimensions[1] + 1}]`
			);
		}
	}

	private wallDoubleOccupancy(): false | [Position, Position] {
		const occupiedWallsMap = new Set<string>();
		if (this.config.walls) {
			for (let i = 0; i < this.config.walls.length; i += 1) {
				const wallArray = this.config.walls[i];
				const string = wallPosition2String([wallArray[0], wallArray[1]]);
				if (occupiedWallsMap.has(string)) {
					return [wallArray[0], wallArray[1]];
				}
				occupiedWallsMap.add(string);
			}
		}
		return false;
	}

	private checkDoubleOccupancy(): false | Position {
		const occupiedMap = new Set<string>();
		if (this.config.eye) {
			occupiedMap.add(BoardGenerator.position2String(this.config.eye.position));
		}
		if (this.config.startFields) {
			for (let i = 0; i < this.config.startFields.length; i += 1) {
				const startField = this.config.startFields[i];
				if (occupiedMap.has(BoardGenerator.position2String(startField.position))) {
					return startField.position;
				}
				occupiedMap.add(BoardGenerator.position2String(startField.position));
			}
		}
		if (this.config.checkPoints) {
			for (let i = 0; i < this.config.checkPoints.length; i += 1) {
				const checkpoint = this.config.checkPoints[i];
				if (occupiedMap.has(BoardGenerator.position2String(checkpoint))) {
					return checkpoint;
				}
				occupiedMap.add(BoardGenerator.position2String(checkpoint));
			}
		}
		if (this.config.lembasFields) {
			for (let i = 0; i < this.config.lembasFields.length; i += 1) {
				const lembasField = this.config.lembasFields[i];
				if (occupiedMap.has(BoardGenerator.position2String(lembasField.position))) {
					return lembasField.position;
				}
				occupiedMap.add(BoardGenerator.position2String(lembasField.position));
			}
		}
		if (this.config.holes) {
			for (let i = 0; i < this.config.holes.length; i += 1) {
				const hole = this.config.holes[i];
				if (occupiedMap.has(BoardGenerator.position2String(hole))) {
					return hole;
				}
				occupiedMap.add(BoardGenerator.position2String(hole));
			}
		}
		if (this.config.riverFields) {
			for (let i = 0; i < this.config.riverFields.length; i += 1) {
				const riverField = this.config.riverFields[i];
				if (occupiedMap.has(BoardGenerator.position2String(riverField.position))) {
					return riverField.position;
				}
				occupiedMap.add(BoardGenerator.position2String(riverField.position));
			}
		}

		return false;
	}

	private checkDimensions(): false | Position {
		let maxDimensions = { x: 0, y: 0 };
		if (this.config.eye) {
			maxDimensions = BoardConfigValidator.getMaxDimension(maxDimensions, this.config.eye.position);
		}
		if (this.config.startFields) {
			for (let i = 0; i < this.config.startFields.length; i += 1) {
				const startField = this.config.startFields[i];
				maxDimensions = BoardConfigValidator.getMaxDimension(maxDimensions, startField.position);
			}
		}
		if (this.config.checkPoints) {
			for (let i = 0; i < this.config.checkPoints.length; i += 1) {
				const checkpoint = this.config.checkPoints[i];
				maxDimensions = BoardConfigValidator.getMaxDimension(maxDimensions, checkpoint);
			}
		}
		if (this.config.lembasFields) {
			for (let i = 0; i < this.config.lembasFields.length; i += 1) {
				const lembasField = this.config.lembasFields[i];
				maxDimensions = BoardConfigValidator.getMaxDimension(maxDimensions, lembasField.position);
			}
		}
		if (this.config.holes) {
			for (let i = 0; i < this.config.holes.length; i += 1) {
				const hole = this.config.holes[i];
				maxDimensions = BoardConfigValidator.getMaxDimension(maxDimensions, hole);
			}
		}
		if (this.config.walls) {
			for (let i = 0; i < this.config.walls.length; i += 1) {
				const wall = this.config.walls[i];
				maxDimensions = BoardConfigValidator.getMaxDimension(maxDimensions, wall[0]);
				maxDimensions = BoardConfigValidator.getMaxDimension(maxDimensions, wall[1]);
			}
		}
		if (maxDimensions.x + 1 > this.config.width || maxDimensions.y + 1 > this.config.height) {
			return [maxDimensions.x, maxDimensions.y];
		}

		return false;
	}

	private static getMaxDimension(
		maxDimensions: { x: number; y: number },
		position: Position
	): { x: number; y: number } {
		return {
			x: Math.max(maxDimensions.x, position[0]),
			y: Math.max(maxDimensions.y, position[1]),
		};
	}
}

export default BoardConfigValidator;
