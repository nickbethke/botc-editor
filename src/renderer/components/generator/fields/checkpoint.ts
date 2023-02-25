import FieldWithPositionInterface from '../interfaces/fieldWithPositionInterface';
import { BoardPosition } from '../interfaces/boardPosition';
import { FieldsEnum } from '../../BoardKonfigurator';

/**
 * Checkpoint Field Class
 */
class Checkpoint implements FieldWithPositionInterface {
	readonly position: BoardPosition;

	readonly order: number;

	/**
	 *
	 * @param position
	 * @param order
	 */
	constructor(position: BoardPosition, order: number) {
		this.position = position;
		this.order = order;
	}

	readonly fieldEnum: FieldsEnum = 2;
}

export default Checkpoint;
