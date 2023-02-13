import { BoardPosition } from './boardPosition';
import { FieldsEnum } from '../../renderer/components/BoardKonfigurator';

interface FieldWithPositionInterface {
	readonly position: BoardPosition;

	readonly fieldEnum: FieldsEnum;
}

export default FieldWithPositionInterface;
