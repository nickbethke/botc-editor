import {
	Direction,
	DirectionEnum,
} from '../../interfaces/BoardConfigInterface';

class DirectionHelper {
	/**
	 * Converting a direction enum value to its correlating string
	 * @param direction
	 */
	static dirEnumToString(direction: DirectionEnum): Direction {
		return DirectionEnum[direction] as Direction;
	}
}

export default DirectionHelper;
