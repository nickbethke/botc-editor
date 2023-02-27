import { BoardPosition } from './boardPosition';
import { FieldsEnum } from '../BoardGenerator';

interface FieldWithPositionInterface {
	readonly position: BoardPosition;

	readonly fieldEnum: FieldsEnum;
}

export default FieldWithPositionInterface;
