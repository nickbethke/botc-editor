import { Direction, DirectionEnum } from '../../interfaces/BoardConfigInterface';

/**
 * The direction helper class.
 */
class DirectionHelper {
	/**
	 * Converting a direction enum value to its correlating string
	 * @param direction
	 */
	static dirEnumToString(direction: DirectionEnum): Direction {
		return DirectionEnum[direction] as Direction;
	}

	/**
	 * Converting a direction to its correlating enum value
	 * @param directionString
	 */
	static directionToDirEnum(directionString: Direction): DirectionEnum {
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

	/**
	 * Converting a direction string to its correlating enum value
	 * @param directionString
	 */
	static string2DirEnum(directionString: string): DirectionEnum {
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
