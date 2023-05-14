import { DirectionEnum } from '../../../../interfaces/BoardConfigInterface';
import FieldWithPositionInterface from './FieldWithPositionInterface';

/**
 * A position interface with a direction property.
 */
interface FieldWithPositionAndDirectionInterface extends FieldWithPositionInterface {
	direction: DirectionEnum;
}

export default FieldWithPositionAndDirectionInterface;
