import {
	BoardPosition,
	boardPosition2Position,
	boardPosition2String,
	position2String,
	wallBoardPosition2String,
	wallPosition2String,
} from '../generator/interfaces/BoardPosition';
import BoardConfigInterface, {
	Direction,
	DirectionEnum,
	LembasField,
	Position,
	PositionDirection,
} from '../../../interfaces/BoardConfigInterface';
import { FieldsEnum } from '../generator/BoardGenerator';
import DirectionHelper from '../generator/helper/DirectionHelper';
import { Rotation } from '../../../interfaces/Types';

/**
 * The getFieldType return value type
 */
export type GetFieldTypeReturnValues =
	| FieldsEnum.START
	| FieldsEnum.CHECKPOINT
	| FieldsEnum.EYE
	| FieldsEnum.HOLE
	| FieldsEnum.LEMBAS
	| FieldsEnum.RIVER
	| null;

/**
 * get the field type of the position
 * @param position the position to check
 * @param config the board config
 */
export function getFieldType(position: BoardPosition, config: BoardConfigInterface): GetFieldTypeReturnValues {
	const positionString = boardPosition2String(position);

	if (position2String(config.eye.position) === positionString) {
		return FieldsEnum.EYE;
	}
	if (config.checkPoints.find((e) => position2String(e) === positionString) !== undefined) {
		return FieldsEnum.CHECKPOINT;
	}
	if (config.startFields.find((e) => position2String(e.position) === positionString) !== undefined) {
		return FieldsEnum.START;
	}

	if (config.lembasFields.find((e) => position2String(e.position) === positionString) !== undefined) {
		return FieldsEnum.LEMBAS;
	}

	if (config.riverFields.find((e) => position2String(e.position) === positionString) !== undefined) {
		return FieldsEnum.RIVER;
	}
	if (config.holes.find((e) => position2String(e) === positionString) !== undefined) {
		return FieldsEnum.HOLE;
	}

	return null;
}

/**
 * determine if the position is the destiny mountain
 * @param position the position to check
 * @param config the board config
 */
export function isDestinyMountain(position: BoardPosition, config: BoardConfigInterface): boolean {
	const index = config.checkPoints.findIndex((p) => position2String(p) === boardPosition2String(position));
	return index === config.checkPoints.length - 1;
}

/**
 * remove a checkpoint with the position from the board config
 * @param position the position to remove
 * @param config the board config
 */
export function removeCheckpoint(position: BoardPosition, config: BoardConfigInterface): BoardConfigInterface {
	const filteredCheckpointArray = config.checkPoints.filter((e) => {
		return position2String(e) !== boardPosition2String(position);
	});
	return { ...config, checkPoints: filteredCheckpointArray };
}

/**
 * remove a start field with the position from the board config
 * @param position the position to remove
 * @param config the board config
 */
export function removeStartField(position: BoardPosition, config: BoardConfigInterface): BoardConfigInterface {
	const filteredStartFieldsArray = config.startFields.filter((e) => {
		return position2String(e.position) !== boardPosition2String(position);
	});
	return { ...config, startFields: filteredStartFieldsArray };
}

/**
 * remove a lembas field with the position from the board config
 * @param position the position to remove
 * @param config the board config
 */
export function removeLembasField(position: BoardPosition, config: BoardConfigInterface): BoardConfigInterface {
	const filteredLembasFieldsArray = config.lembasFields.filter((e) => {
		return position2String(e.position) !== boardPosition2String(position);
	});
	return { ...config, lembasFields: filteredLembasFieldsArray };
}

/**
 * remove a river field with the position from the board config
 * @param position
 * @param config
 */
export function removeRiver(position: BoardPosition, config: BoardConfigInterface): BoardConfigInterface {
	const filteredRiverFieldsArray = config.riverFields.filter((e) => {
		return position2String(e.position) !== boardPosition2String(position);
	});
	return { ...config, riverFields: filteredRiverFieldsArray };
}

/**
 * remove a hole field with the position from the board config
 * @param position
 * @param config
 */
export function removeHole(position: BoardPosition, config: BoardConfigInterface): BoardConfigInterface {
	const filteredHolesArray = config.holes.filter((e) => position2String(e) !== boardPosition2String(position));
	return { ...config, holes: filteredHolesArray };
}

/**
 * remove a wall with the position from the board config
 * @param position
 * @param config
 */
export function removeWall(
	position: [BoardPosition, BoardPosition],
	config: BoardConfigInterface,
): BoardConfigInterface {
	const filteredWallArray = config.walls.filter(
		(e) => wallPosition2String(e as [Position, Position]) !== wallBoardPosition2String(position),
	);
	return {
		...config,
		walls: filteredWallArray,
	};
}

/**
 * overrides a field with the position from the board config
 * @param position
 * @param config
 */
function overrideField(
	position: BoardPosition,
	config: BoardConfigInterface,
): { override: boolean; config: BoardConfigInterface } {
	const type = getFieldType(position, config);
	switch (type) {
		case FieldsEnum.EYE:
			return { config, override: false };
		case FieldsEnum.START:
			return {
				config: removeStartField(position, config),
				override: true,
			};
		case FieldsEnum.CHECKPOINT:
			return {
				config: removeCheckpoint(position, config),
				override: true,
			};
		case FieldsEnum.LEMBAS:
			return {
				config: removeLembasField(position, config),
				override: true,
			};
		case FieldsEnum.RIVER:
			return {
				config: removeRiver(position, config),
				override: true,
			};
		case FieldsEnum.HOLE:
			return {
				config: removeHole(position, config),
				override: true,
			};
		default:
			return { config, override: false };
	}
}

/**
 * moves saurons eyes to a new position
 * @param position
 * @param config
 */
export function moveSauronsEye(position: BoardPosition, config: BoardConfigInterface): BoardConfigInterface {
	const { config: newConfig } = overrideField(position, config);
	return {
		...newConfig,
		eye: {
			position: boardPosition2Position(position),
			direction: 'NORTH',
		},
	};
}

/**
 * adds a checkpoint to the board config
 * @param position
 * @param config
 */
export function addCheckpoint(position: BoardPosition, config: BoardConfigInterface): BoardConfigInterface {
	const { config: newConfig } = overrideField(position, config);
	const newCheckpointsArray = newConfig.checkPoints;
	newCheckpointsArray.push(boardPosition2Position(position));
	return { ...newConfig, checkPoints: newCheckpointsArray };
}

/**
 * adds a start field to the board config
 * @param position
 * @param config
 * @param direction
 */
export function addStartField(position: BoardPosition, config: BoardConfigInterface, direction: Direction): BoardConfigInterface {
	const { config: newConfig } = overrideField(position, config);

	const newStartFieldsArray = newConfig.startFields;
	newStartFieldsArray.push({
		position: boardPosition2Position(position),
		direction,
	});
	return { ...newConfig, startFields: newStartFieldsArray };
}

/**
 * adds a lembas field to the board config
 * @param position
 * @param config
 */
export function addLembasField(position: BoardPosition, config: BoardConfigInterface): BoardConfigInterface {
	const { config: newConfig } = overrideField(position, config);
	const newLembasFieldsArray = newConfig.lembasFields;
	newLembasFieldsArray.push({
		position: boardPosition2Position(position),
		amount: 3,
	});
	return { ...newConfig, lembasFields: newLembasFieldsArray };
}

/**
 * adds a river field to the board config
 * @param position
 * @param config
 * @param direction
 */
export function addRiver(position: BoardPosition, config: BoardConfigInterface, direction: Direction): BoardConfigInterface {
	const { config: newConfig } = overrideField(position, config);
	const newRiverFieldsArray = newConfig.riverFields;
	newRiverFieldsArray.push({
		position: boardPosition2Position(position),
		direction,
	});
	return { ...newConfig, riverFields: newRiverFieldsArray };
}

/**
 * adds a hole field to the board config
 * @param position
 * @param config
 */
export function addHole(position: BoardPosition, config: BoardConfigInterface): BoardConfigInterface {
	const { config: newConfig } = overrideField(position, config);
	const newHolesArray = newConfig.holes;
	newHolesArray.push(boardPosition2Position(position));
	return { ...newConfig, holes: newHolesArray };
}

/**
 * gets the direction of a field in the board if it has a direction
 * @param position
 * @param config
 */
export function getDirectionFieldConfig(
	position: BoardPosition,
	config: BoardConfigInterface,
): PositionDirection | null {
	const type = getFieldType(position, config);
	if (type === FieldsEnum.EYE) {
		return config.eye;
	}
	if (type === FieldsEnum.RIVER) {
		const index = config.riverFields.findIndex((e) => position2String(e.position) === boardPosition2String(position));
		if (index > -1 && config.riverFields[index]) {
			return config.riverFields[index];
		}
		return null;
	}
	if (type === FieldsEnum.START) {
		const index = config.startFields.findIndex((e) => position2String(e.position) === boardPosition2String(position));
		if (index > -1 && config.startFields[index]) {
			return config.startFields[index];
		}
		return null;
	}
	return null;
}

/**
 * updates the direction of a start field in the board config
 * @param config
 * @param position
 * @param direction
 */
export function updateStartFieldDirection(
	config: BoardConfigInterface,
	position: BoardPosition,
	direction: DirectionEnum,
): BoardConfigInterface {
	if (getFieldType(position, config) !== FieldsEnum.START) {
		return config;
	}

	const index = config.startFields.findIndex((e) => position2String(e.position) === boardPosition2String(position));
	if (index > -1) {
		const newConfig = config;
		newConfig.startFields[index].direction = DirectionHelper.dirEnumToString(direction);
		return newConfig;
	}

	return config;
}

/**
 * updates the direction of a river field in the board config
 * @param config
 * @param position
 * @param direction
 */
export function updateRiverFieldDirection(
	config: BoardConfigInterface,
	position: BoardPosition,
	direction: DirectionEnum,
): BoardConfigInterface {
	if (getFieldType(position, config) !== FieldsEnum.RIVER) {
		return config;
	}

	const index = config.riverFields.findIndex((e) => position2String(e.position) === boardPosition2String(position));
	if (index > -1) {
		const newConfig = config;
		newConfig.riverFields[index].direction = DirectionHelper.dirEnumToString(direction);
		return newConfig;
	}

	return config;
}

/**
 * updates the amount of a lembas field in the board config
 * @param config
 * @param position
 * @param amount
 */
export function updateLembasFieldAmount(
	config: BoardConfigInterface,
	position: BoardPosition,
	amount: number,
): BoardConfigInterface {
	if (getFieldType(position, config) !== FieldsEnum.LEMBAS) {
		return config;
	}

	const index = config.lembasFields.findIndex((e) => position2String(e.position) === boardPosition2String(position));
	if (index > -1) {
		const newConfig = config;
		newConfig.lembasFields[index].amount = amount;
		return newConfig;
	}

	return config;
}

/**
 * gets a lembas field by its position from the board config
 * @param position
 * @param config
 */
export function getLembasFieldConfig(position: BoardPosition, config: BoardConfigInterface): LembasField | null {
	const index = config.lembasFields.findIndex((e) => position2String(e.position) === boardPosition2String(position));
	if (index > -1 && config.lembasFields[index]) {
		return config.lembasFields[index];
	}
	return null;
}

/**
 * gets a checkpoint field index by its position from the board config
 * @param position
 * @param config
 */
export function getCheckpointIndexConfig(position: BoardPosition, config: BoardConfigInterface): number | null {
	return config.checkPoints.findIndex((e) => position2String(e) === boardPosition2String(position));
}

/**
 * predicts if a configuration is a board configuration
 * @param config
 */
export function predictIfConfigurationIsBoardConfiguration(config: any): config is BoardConfigInterface {
	if ('width' in config)
		return true;
	if ('height' in config)
		return true;
	if ('name' in config)
		return true;
	if ('checkPoints' in config)
		return true;
	if ('eye' in config)
		return true;
	if ('holes' in config)
		return true;
	if ('lembasFields' in config)
		return true;
	if ('riverFields' in config)
		return true;
	if ('startFields' in config)
		return true;
	return 'walls' in config;
}

/**
 * calculates the next rotation value
 * @param rotation
 */
export function getNextRotation(rotation: Rotation): Rotation {
	switch (rotation) {
		case '0':
			return '90';
		case '90':
			return '180';
		case '180':
			return '270';
		case '270':
			return '0';
		default:
			return '0';
	}
}

/**
 * calculates the previous rotation value
 * @param rotation
 */
export function getPreviousRotation(rotation: Rotation): Rotation {
	switch (rotation) {
		case '0':
			return '270';
		case '90':
			return '0';
		case '180':
			return '90';
		case '270':
			return '180';
	}
}

export function rotateDirection(direction: Direction, rotation: Rotation): Direction {
	switch (rotation) {
		case '0':
			return direction;
		case '90':
			return DirectionHelper.getNextDirection(direction);
		case '180':
			return DirectionHelper.getNextDirection(DirectionHelper.getNextDirection(direction));
		case '270':
			return DirectionHelper.getPreviousDirection(direction);
	}
}

export function calculateRiverPresetFieldPositionWithRotation(position: [number, number], rotation: '0' | '90' | '180' | '270'): BoardPosition {
	const [positionX, positionY] = position;

	let x = positionX;
	let y = positionY;
	if (rotation === '90') {
		x = -positionY;
		y = positionX;
	} else if (rotation === '180') {
		x = -positionX;
		y = -positionY;
	} else if (rotation === '270') {
		x = positionY;
		y = -positionX;
	}
	return {
		x,
		y,
	};
}

/**
 * calculates the next direction value
 * @param direction
 */
export function getNextDirection(direction: Direction): Direction {
	switch (direction) {
		case 'NORTH':
			return 'EAST';
		case 'EAST':
			return 'SOUTH';
		case 'SOUTH':
			return 'WEST';
		case 'WEST':
			return 'NORTH';
	}
}
