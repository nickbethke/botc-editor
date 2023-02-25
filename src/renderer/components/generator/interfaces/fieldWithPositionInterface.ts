import { BoardPosition } from './boardPosition';
import { FieldsEnum } from '../../BoardKonfigurator';

interface FieldWithPositionInterface {
	readonly position: BoardPosition;

	readonly fieldEnum: FieldsEnum;
}

export default FieldWithPositionInterface;
