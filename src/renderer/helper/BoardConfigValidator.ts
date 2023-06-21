import BoardConfigInterface, { Position } from '../../interfaces/BoardConfigInterface';
import BoardGenerator from '../components/generator/BoardGenerator';
import { wallPosition2String } from '../components/generator/interfaces/BoardPosition';

class BoardConfigValidator {
	private readonly json: JSON;

	private readonly config: BoardConfigInterface;

	public readonly errors: string[] = [];

	constructor(boardConfig: BoardConfigInterface) {
		this.config = boardConfig;
		this.json = JSON.parse(JSON.stringify(boardConfig));

		if (!this.config.name || !('name' in this.config)) {
			this.errors.push(`Board name is not defined`);
		}
		if (!this.config.width || !('width' in this.config)) {
			this.errors.push(`Board width is not defined`);
		}
		if (!this.config.height || !('height' in this.config)) {
			this.errors.push(`Board height is not defined`);
		}
		if (!this.config.eye || !('eye' in this.config)) {
			this.errors.push(`Board eye is not defined`);
		}
		if (!this.config.checkPoints || this.config.checkPoints.length < 2 || !('checkPoints' in this.config)) {
			this.errors.push(`Check points are to less (minimum 2) or not defined`);
		}
		if (!this.config.startFields || this.config.startFields.length < 2 || !('startFields' in this.config)) {
			this.errors.push(`Start fields are to less (minimum 2) or not defined`);
		}

		if (!this.config.eagleFields || !('eagleFields' in this.config)) {
			this.errors.push(`Eagle fields are not defined`);
		}

		if (!this.config.lembasFields || !('lembasFields' in this.config)) {
			this.errors.push(`Lembas fields are not defined`);
		}

		this.errors.forEach((error, index) => {
			this.errors[index] = window.t.translate(error);
		});

		if (this.errors.length === 0) {
			const doubleOccupancy = this.checkDoubleOccupancy();
			if (doubleOccupancy) {
				this.errors.push(
					window.t.translateVars('Double occupancy on a field position [{0}, {1}]', [
						doubleOccupancy[0],
						doubleOccupancy[1],
					])
				);
			}
			const wallDoubleOccupancy = this.wallDoubleOccupancy();
			if (wallDoubleOccupancy) {
				this.errors.push(
					window.t.translateVars('Double occupancy on a wall position [[{0}, {1}], [{2}, {3}]]', [
						wallDoubleOccupancy[0][0],
						wallDoubleOccupancy[0][1],
						wallDoubleOccupancy[1][0],
						wallDoubleOccupancy[1][1],
					])
				);
			}
			const dimensions = this.checkDimensions();
			if (dimensions) {
				this.errors.push(
					window.t.translateVars('Board dimensions [{0}, {1}] is smaller then field dimension: [{2}, {3}]', [
						this.config.width,
						this.config.height,
						dimensions[0] + 1,
						dimensions[1] + 1,
					])
				);
			}
		}
	}

	/**
	 * Check if a wall is double occupied
	 * @private
	 */
	private wallDoubleOccupancy(): false | [Position, Position] {
		const occupiedWallsMap = new Set<string>();
		if (this.config.walls) {
			for (const element of this.config.walls) {
				const wallArray = element;
				const string = wallPosition2String([wallArray[0], wallArray[1]]);
				if (occupiedWallsMap.has(string)) {
					return [wallArray[0], wallArray[1]];
				}
				occupiedWallsMap.add(string);
			}
		}
		return false;
	}

	/**
	 * Check if a field is double occupied
	 * @private
	 */
	private checkDoubleOccupancy(): false | Position {
		const occupiedMap = new Set<string>();
		if (this.config.eye) {
			occupiedMap.add(BoardGenerator.position2String(this.config.eye.position));
		}
		if (this.config.startFields) {
			for (const element of this.config.startFields) {
				const startField = element;
				if (occupiedMap.has(BoardGenerator.position2String(startField.position))) {
					return startField.position;
				}
				occupiedMap.add(BoardGenerator.position2String(startField.position));
			}
		}
		if (this.config.checkPoints) {
			for (const element of this.config.checkPoints) {
				const checkpoint = element;
				if (occupiedMap.has(BoardGenerator.position2String(checkpoint))) {
					return checkpoint;
				}
				occupiedMap.add(BoardGenerator.position2String(checkpoint));
			}
		}
		if (this.config.lembasFields) {
			for (const element of this.config.lembasFields) {
				const lembasField = element;
				if (occupiedMap.has(BoardGenerator.position2String(lembasField.position))) {
					return lembasField.position;
				}
				occupiedMap.add(BoardGenerator.position2String(lembasField.position));
			}
		}
		if (this.config.holes) {
			for (const element of this.config.holes) {
				const hole = element;
				if (occupiedMap.has(BoardGenerator.position2String(hole))) {
					return hole;
				}
				occupiedMap.add(BoardGenerator.position2String(hole));
			}
		}
		if (this.config.riverFields) {
			for (const element of this.config.riverFields) {
				const riverField = element;
				if (occupiedMap.has(BoardGenerator.position2String(riverField.position))) {
					return riverField.position;
				}
				occupiedMap.add(BoardGenerator.position2String(riverField.position));
			}
		}

		return false;
	}

	/**
	 * Check if the board dimensions are big enough
	 * @private
	 */
	private checkDimensions(): false | Position {
		let maxDimensions = { x: 0, y: 0 };
		if (this.config.eye) {
			maxDimensions = BoardConfigValidator.getMaxDimension(maxDimensions, this.config.eye.position);
		}
		if (this.config.startFields) {
			for (const element of this.config.startFields) {
				maxDimensions = BoardConfigValidator.getMaxDimension(maxDimensions, element.position);
			}
		}
		if (this.config.checkPoints) {
			for (const element of this.config.checkPoints) {
				maxDimensions = BoardConfigValidator.getMaxDimension(maxDimensions, element);
			}
		}
		if (this.config.lembasFields) {
			for (const element of this.config.lembasFields) {
				maxDimensions = BoardConfigValidator.getMaxDimension(maxDimensions, element.position);
			}
		}
		if (this.config.holes) {
			for (const element of this.config.holes) {
				maxDimensions = BoardConfigValidator.getMaxDimension(maxDimensions, element);
			}
		}
		if (this.config.walls) {
			for (const element of this.config.walls) {
				const wall = element;
				maxDimensions = BoardConfigValidator.getMaxDimension(maxDimensions, wall[0]);
				maxDimensions = BoardConfigValidator.getMaxDimension(maxDimensions, wall[1]);
			}
		}
		if (maxDimensions.x + 1 > this.config.width || maxDimensions.y + 1 > this.config.height) {
			return [maxDimensions.x, maxDimensions.y];
		}

		return false;
	}

	/**
	 * Calculate the max dimensions of the board and the given position
	 * @param maxDimensions
	 * @param position
	 * @private
	 */
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
