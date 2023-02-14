import FieldWithPositionInterface from '../interfaces/fieldWithPositionInterface';
import { BoardPosition } from '../interfaces/boardPosition';
import { FieldsEnum } from '../../../../renderer/components/BoardKonfigurator';

/**
 * Hole Field Class
 */
class Hole implements FieldWithPositionInterface {
	readonly position: BoardPosition;

	constructor(position: BoardPosition) {
		this.position = position;
	}

	readonly fieldEnum: FieldsEnum = FieldsEnum.HOLE;
}

export default Hole;
