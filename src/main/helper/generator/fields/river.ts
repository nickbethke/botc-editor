import FieldWithPositionAndDirectionInterface from '../interfaces/fieldWithPositionAndDirectionInterface';
import { DirectionEnum } from '../interfaces/BoardConfigInterface';
import { BoardPosition } from '../interfaces/boardPosition';
import { FieldsEnum } from '../../../../renderer/components/BoardKonfigurator';

/**
 * River Field Class
 */
class River implements FieldWithPositionAndDirectionInterface {
	readonly direction: DirectionEnum;

	readonly position: BoardPosition;

	constructor(position: BoardPosition, direction: DirectionEnum) {
		this.position = position;
		this.direction = direction;
	}

	readonly fieldEnum: FieldsEnum = 6;
}

export default River;
