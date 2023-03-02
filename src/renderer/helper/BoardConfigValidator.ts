import BoardConfigInterface, {
	Position,
} from '../components/interfaces/BoardConfigInterface';
import BoardGenerator from '../components/generator/BoardGenerator';

class BoardConfigValidator {
	private readonly json: JSON;

	private readonly config: BoardConfigInterface;

	public readonly errors: string[] = [];

	constructor(boardConfig: BoardConfigInterface) {
		this.config = boardConfig;
		this.json = JSON.parse(JSON.stringify(boardConfig));
		const doubleOccupancy = this.checkDoubleOccupancy();
		if (doubleOccupancy) {
			this.errors.push(
				`Double occupancy on field [${doubleOccupancy[0]}, ${doubleOccupancy[1]}]`
			);
		}
		const dimensions = this.checkDimensions();
		if (dimensions) {
			this.errors.push(
				`Board dimensions [${this.config.width}, ${this.config.height}] is smaller then field dimension: `,
				`\t required dimension: [${dimensions[0] + 1}, ${
					dimensions[1] + 1
				}]`
			);
		}
	}

	private checkDoubleOccupancy(): false | Position {
		const occupiedMap = new Map<string, boolean>();
		occupiedMap.set(
			BoardGenerator.position2String(this.config.eye.position),
			true
		);
		for (let i = 0; i < this.config.startFields.length; i += 1) {
			const startField = this.config.startFields[i];
			if (
				occupiedMap.has(
					BoardGenerator.position2String(startField.position)
				)
			) {
				return startField.position;
			}
			occupiedMap.set(
				BoardGenerator.position2String(startField.position),
				true
			);
		}
		for (let i = 0; i < this.config.checkPoints.length; i += 1) {
			const checkpoint = this.config.checkPoints[i];
			if (occupiedMap.has(BoardGenerator.position2String(checkpoint))) {
				return checkpoint;
			}
			occupiedMap.set(BoardGenerator.position2String(checkpoint), true);
		}
		if (this.config.lembasFields) {
			for (let i = 0; i < this.config.lembasFields.length; i += 1) {
				const lembasField = this.config.lembasFields[i];
				if (
					occupiedMap.has(
						BoardGenerator.position2String(lembasField.position)
					)
				) {
					return lembasField.position;
				}
				occupiedMap.set(
					BoardGenerator.position2String(lembasField.position),
					true
				);
			}
		}
		if (this.config.holes) {
			for (let i = 0; i < this.config.holes.length; i += 1) {
				const hole = this.config.holes[i];
				if (occupiedMap.has(BoardGenerator.position2String(hole))) {
					return hole;
				}
				occupiedMap.set(BoardGenerator.position2String(hole), true);
			}
		}
		return false;
	}

	private checkDimensions(): false | Position {
		let maxDimensions = { x: 0, y: 0 };
		maxDimensions = BoardConfigValidator.getMaxDimension(
			maxDimensions,
			this.config.eye.position
		);
		for (let i = 0; i < this.config.startFields.length; i += 1) {
			const startField = this.config.startFields[i];
			maxDimensions = BoardConfigValidator.getMaxDimension(
				maxDimensions,
				startField.position
			);
		}
		for (let i = 0; i < this.config.checkPoints.length; i += 1) {
			const checkpoint = this.config.checkPoints[i];
			maxDimensions = BoardConfigValidator.getMaxDimension(
				maxDimensions,
				checkpoint
			);
		}
		if (this.config.lembasFields) {
			for (let i = 0; i < this.config.lembasFields.length; i += 1) {
				const lembasField = this.config.lembasFields[i];
				maxDimensions = BoardConfigValidator.getMaxDimension(
					maxDimensions,
					lembasField.position
				);
			}
		}
		if (this.config.holes) {
			for (let i = 0; i < this.config.holes.length; i += 1) {
				const hole = this.config.holes[i];
				maxDimensions = BoardConfigValidator.getMaxDimension(
					maxDimensions,
					hole
				);
			}
		}
		if (this.config.walls) {
			for (let i = 0; i < this.config.walls.length; i += 1) {
				const wall = this.config.walls[i];
				maxDimensions = BoardConfigValidator.getMaxDimension(
					maxDimensions,
					wall[0]
				);
				maxDimensions = BoardConfigValidator.getMaxDimension(
					maxDimensions,
					wall[1]
				);
			}
		}
		if (
			maxDimensions.x + 1 > this.config.width ||
			maxDimensions.y + 1 > this.config.height
		) {
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