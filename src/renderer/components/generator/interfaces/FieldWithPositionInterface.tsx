import { BoardPosition } from './BoardPosition';
import { FieldsEnum } from '../BoardGenerator';

/**
 * A position interface
 */
interface FieldWithPositionInterface {
	readonly position: BoardPosition;
	readonly fieldEnum: FieldsEnum;
}

export default FieldWithPositionInterface;
