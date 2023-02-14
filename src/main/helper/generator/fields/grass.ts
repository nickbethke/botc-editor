import FieldWithPositionInterface from '../interfaces/fieldWithPositionInterface';
import { BoardPosition } from '../interfaces/boardPosition';
import { FieldsEnum } from '../../../../renderer/components/BoardKonfigurator';

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

	readonly fieldEnum: FieldsEnum = FieldsEnum.GRASS;
}

export default Grass;
