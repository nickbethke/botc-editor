import { Direction, DirectionEnum } from '../../../../interfaces/BoardConfigInterface';

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
	 * @deprecated Use string2DirEnum instead
	 */
	static directionToDirEnum(directionString: Direction): DirectionEnum {
		return DirectionHelper.string2DirEnum(directionString);
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

	static getNextDirection(direction: Direction): Direction {
		switch (direction) {
			case 'EAST':
				return 'SOUTH';
			case 'SOUTH':
				return 'WEST';
			case 'WEST':
				return 'NORTH';
			case 'NORTH':
			default:
				return 'EAST';

		}
	}

	static getPreviousDirection(direction: Direction): Direction {
		switch (direction) {
			case 'EAST':
				return 'NORTH';
			case 'SOUTH':
				return 'EAST';
			case 'WEST':
				return 'SOUTH';
			case 'NORTH':
			default:
				return 'WEST';
		}
	}
}

export default DirectionHelper;
