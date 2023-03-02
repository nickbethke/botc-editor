import FieldWithPositionInterface from '../interfaces/FieldWithPositionInterface';
import { BoardPosition } from '../interfaces/boardPosition';
import { FieldsEnum } from '../BoardGenerator';

/**
 * Grass Field - Default Field Type
 */
class Grass implements FieldWithPositionInterface {
	readonly position: BoardPosition;

	/**
	 * @param position
	 */
	constructor(position: BoardPosition) {
		this.position = position;
	}

	readonly fieldEnum: FieldsEnum = 0;
}

export default Grass;
