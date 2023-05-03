import FieldWithPositionInterface from '../interfaces/FieldWithPositionInterface';
import { BoardPosition } from '../interfaces/BoardPosition';
import { FieldsEnum } from '../BoardGenerator';

/**
 * Hole Field Class
 */
class Hole implements FieldWithPositionInterface {
	readonly position: BoardPosition;

	constructor(position: BoardPosition) {
		this.position = position;
	}

	readonly fieldEnum: FieldsEnum = 4;
}

export default Hole;
