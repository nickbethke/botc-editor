import FieldWithPositionInterface from '../interfaces/FieldWithPositionInterface';
import { BoardPosition } from '../interfaces/BoardPosition';
import { FieldsEnum } from '../BoardGenerator';

/**
 * Checkpoint Field Class
 */
class EagleField implements FieldWithPositionInterface {
	readonly position: BoardPosition;

	/**
	 *
	 * @param position
	 */
	constructor(position: BoardPosition) {
		this.position = position;
	}

	readonly fieldEnum: FieldsEnum = FieldsEnum.EAGLE;
}

export default EagleField;
