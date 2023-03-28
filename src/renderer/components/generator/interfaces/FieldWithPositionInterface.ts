import { BoardPosition } from './boardPosition';
import { FieldsEnum } from '../BoardGenerator';

/**
 * A position interface
 */
interface FieldWithPositionInterface {
	readonly position: BoardPosition;

	readonly fieldEnum: FieldsEnum;
}

export default FieldWithPositionInterface;
