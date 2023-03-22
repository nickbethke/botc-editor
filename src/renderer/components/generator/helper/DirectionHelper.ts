import { Direction, DirectionEnum } from '../../interfaces/BoardConfigInterface';

class DirectionHelper {
	/**
	 * Converting a direction enum value to its correlating string
	 * @param direction
	 */
	static dirEnumToString(direction: DirectionEnum): Direction {
		return DirectionEnum[direction] as Direction;
	}

	static stringToDirEnum(directionString: Direction): DirectionEnum {
		switch (directionString) {
			case 'NORTH':
				return DirectionEnum.NORTH;
			case 'EAST':
				return DirectionEnum.EAST;
			case 'SOUTH':
				return DirectionEnum.SOUTH;
			case 'WEST':
				return DirectionEnum.WEST;
			default:
				return DirectionEnum.NORTH;
		}
	}
}

export default DirectionHelper;
