import FieldWithPositionInterface from '../interfaces/fieldWithPositionInterface';
import { BoardPosition } from '../interfaces/boardPosition';
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
