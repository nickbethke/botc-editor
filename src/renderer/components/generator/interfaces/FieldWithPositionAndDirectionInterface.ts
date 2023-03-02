import { DirectionEnum } from '../../interfaces/BoardConfigInterface';
import FieldWithPositionInterface from './FieldWithPositionInterface';

interface FieldWithPositionAndDirectionInterface
	extends FieldWithPositionInterface {
	direction: DirectionEnum;
}

export default FieldWithPositionAndDirectionInterface;
