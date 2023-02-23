import FieldWithPositionAndDirectionInterface from '../interfaces/fieldWithPositionAndDirectionInterface';
import { DirectionEnum } from '../interfaces/BoardConfigInterface';
import { BoardPosition } from '../interfaces/boardPosition';
import { FieldsEnum } from '../../../../renderer/components/BoardKonfigurator';

/**
 * Saurons Eye Field Class
 */
class SauronsEye implements FieldWithPositionAndDirectionInterface {
	readonly direction: DirectionEnum;

	readonly position: BoardPosition;

	constructor(position: BoardPosition, direction: DirectionEnum) {
		this.position = position;
		this.direction = direction;
	}

	readonly fieldEnum: FieldsEnum = 3;
}

export default SauronsEye;
