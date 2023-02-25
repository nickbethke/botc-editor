import { DirectionEnum } from '../../interfaces/BoardConfigInterface';
import FieldWithPositionInterface from './fieldWithPositionInterface';

interface FieldWithPositionAndDirectionInterface
	extends FieldWithPositionInterface {
	direction: DirectionEnum;
}

export default FieldWithPositionAndDirectionInterface;
