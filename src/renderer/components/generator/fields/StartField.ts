import FieldWithPositionAndDirectionInterface from '../interfaces/FieldWithPositionAndDirectionInterface';
import { DirectionEnum } from '../../../../interfaces/BoardConfigInterface';
import { BoardPosition } from '../interfaces/BoardPosition';
import { FieldsEnum } from '../BoardGenerator';

/**
 * Start Field Class
 */
class StartField implements FieldWithPositionAndDirectionInterface {
	readonly direction: DirectionEnum;

	readonly position: BoardPosition;

	constructor(position: BoardPosition, direction: DirectionEnum) {
		this.position = position;
		this.direction = direction;
	}

	readonly fieldEnum: FieldsEnum = 1;
}

export default StartField;
