import {
	BoardPosition,
	boardPosition2Position,
	boardPosition2String,
	position2String,
	wallBoardPosition2String,
	wallPosition2String,
} from '../generator/interfaces/boardPosition';
import BoardConfigInterface, {
	DirectionEnum,
	LembasField,
	Position,
	PositionDirection,
} from '../interfaces/BoardConfigInterface';
import { FieldsEnum } from '../generator/BoardGenerator';
import DirectionHelper from '../generator/helper/DirectionHelper';

export type GetFieldTypeReturnValues =
	| FieldsEnum.START
	| FieldsEnum.CHECKPOINT
	| FieldsEnum.EYE
	| FieldsEnum.HOLE
	| FieldsEnum.LEMBAS
	| FieldsEnum.RIVER
	| null;

export function getFieldType(
	position: BoardPosition,
	config: BoardConfigInterface
): GetFieldTypeReturnValues {
	const positionString = boardPosition2String(position);

	if (position2String(config.eye.position) === positionString) {
		return FieldsEnum.EYE;
	}
	if (
		config.checkPoints.find(
			(e) => position2String(e) === positionString
		) !== undefined
	) {
		return FieldsEnum.CHECKPOINT;
	}
	if (
		config.startFields.find(
			(e) => position2String(e.position) === positionString
		) !== undefined
	) {
		return FieldsEnum.START;
	}

	if (
		config.lembasFields.find(
			(e) => position2String(e.position) === positionString
		) !== undefined
	) {
		return FieldsEnum.LEMBAS;
	}

	if (
		config.riverFields.find(
			(e) => position2String(e.position) === positionString
		) !== undefined
	) {
		return FieldsEnum.RIVER;
	}
	if (
		config.holes.find((e) => position2String(e) === positionString) !==
		undefined
	) {
		return FieldsEnum.HOLE;
	}

	return null;
}

export function isDestinyMountain(
	position: BoardPosition,
	config: BoardConfigInterface
): boolean {
	const index = config.checkPoints.findIndex(
		(p) => position2String(p) === boardPosition2String(position)
	);
	return index === config.checkPoints.length - 1;
}

export function removeCheckpoint(
	position: BoardPosition,
	config: BoardConfigInterface
): BoardConfigInterface {
	const filteredCheckpointArray = config.checkPoints.filter(
		(e) => position2String(e) !== boardPosition2String(position)
	);
	return { ...config, checkPoints: filteredCheckpointArray };
}

export function removeStartField(
	position: BoardPosition,
	config: BoardConfigInterface
): BoardConfigInterface {
	const filteredStartFieldsArray = config.startFields.filter(
		(e) => position2String(e.position) !== boardPosition2String(position)
	);
	return { ...config, startFields: filteredStartFieldsArray };
}

export function removeLembasField(
	position: BoardPosition,
	config: BoardConfigInterface
): BoardConfigInterface {
	const filteredLembasFieldsArray = config.lembasFields.filter(
		(e) => position2String(e.position) !== boardPosition2String(position)
	);
	return { ...config, lembasFields: filteredLembasFieldsArray };
}

export function removeRiver(
	position: BoardPosition,
	config: BoardConfigInterface
): BoardConfigInterface {
	const filteredRiverFieldsArray = config.riverFields.filter(
		(e) => position2String(e.position) !== boardPosition2String(position)
	);
	return { ...config, riverFields: filteredRiverFieldsArray };
}

export function removeHole(
	position: BoardPosition,
	config: BoardConfigInterface
): BoardConfigInterface {
	const filteredHolesArray = config.holes.filter(
		(e) => position2String(e) !== boardPosition2String(position)
	);
	return { ...config, holes: filteredHolesArray };
}

export function removeWall(
	position: [BoardPosition, BoardPosition],
	config: BoardConfigInterface
) {
	const filteredWallArray = config.walls.filter(
		(e) =>
			wallPosition2String(e as [Position, Position]) !==
			wallBoardPosition2String(position)
	);
	return {
		...config,
		walls: filteredWallArray,
	};
}

function overrideField(
	position: BoardPosition,
	config: BoardConfigInterface
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
			return { config, override: true };
	}
}

export function moveSauronsEye(
	position: BoardPosition,
	config: BoardConfigInterface
): BoardConfigInterface {
	const { override, config: newConfig } = overrideField(position, config);
	if (override) {
		return {
			...newConfig,
			eye: {
				position: boardPosition2Position(position),
				direction: 'NORTH',
			},
		};
	}
	return config;
}

export function addCheckpoint(
	position: BoardPosition,
	config: BoardConfigInterface
): BoardConfigInterface {
	const { override, config: newConfig } = overrideField(position, config);
	if (override) {
		const newCheckpointsArray = config.checkPoints;
		newCheckpointsArray.push(boardPosition2Position(position));
		return { ...newConfig, checkPoints: newCheckpointsArray };
	}
	return config;
}

export function addStartField(
	position: BoardPosition,
	config: BoardConfigInterface
): BoardConfigInterface {
	const { override, config: newConfig } = overrideField(position, config);
	if (override) {
		const newStartFieldsArray = config.startFields;
		newStartFieldsArray.push({
			position: boardPosition2Position(position),
			direction: 'NORTH',
		});
		return { ...newConfig, startFields: newStartFieldsArray };
	}
	return config;
}

export function addLembasField(
	position: BoardPosition,
	config: BoardConfigInterface
): BoardConfigInterface {
	const { override, config: newConfig } = overrideField(position, config);
	if (override) {
		const newLembasFieldsArray = config.lembasFields;
		newLembasFieldsArray.push({
			position: boardPosition2Position(position),
			amount: 3,
		});
		return { ...newConfig, lembasFields: newLembasFieldsArray };
	}
	return config;
}

export function addRiver(
	position: BoardPosition,
	config: BoardConfigInterface
): BoardConfigInterface {
	const { override, config: newConfig } = overrideField(position, config);
	if (override) {
		const newRiverFieldsArray = config.riverFields;
		newRiverFieldsArray.push({
			position: boardPosition2Position(position),
			direction: 'NORTH',
		});
		return { ...newConfig, riverFields: newRiverFieldsArray };
	}
	return config;
}

export function addHole(
	position: BoardPosition,
	config: BoardConfigInterface
): BoardConfigInterface {
	const { override, config: newConfig } = overrideField(position, config);
	if (override) {
		const newHolesArray = config.holes;
		newHolesArray.push(boardPosition2Position(position));
		return { ...newConfig, holes: newHolesArray };
	}
	return config;
}

export function getDirectionFieldConfig(
	position: BoardPosition,
	config: BoardConfigInterface
): PositionDirection | null {
	const type = getFieldType(position, config);
	if (type === FieldsEnum.EYE) {
		return config.eye;
	}
	if (type === FieldsEnum.RIVER) {
		const index = config.riverFields.findIndex(
			(e) =>
				position2String(e.position) === boardPosition2String(position)
		);
		if (index > -1 && config.riverFields[index]) {
			return config.riverFields[index];
		}
		return null;
	}
	if (type === FieldsEnum.START) {
		const index = config.startFields.findIndex(
			(e) =>
				position2String(e.position) === boardPosition2String(position)
		);
		if (index > -1 && config.startFields[index]) {
			return config.startFields[index];
		}
		return null;
	}
	return null;
}

export function updateStartFieldDirection(
	config: BoardConfigInterface,
	position: BoardPosition,
	direction: DirectionEnum
): BoardConfigInterface {
	if (getFieldType(position, config) !== FieldsEnum.START) {
		return config;
	}

	const index = config.startFields.findIndex(
		(e) => position2String(e.position) === boardPosition2String(position)
	);
	if (index > -1) {
		const newConfig = config;
		newConfig.startFields[index].direction =
			DirectionHelper.dirEnumToString(direction);
		return newConfig;
	}

	return config;
}

export function updateRiverFieldDirection(
	config: BoardConfigInterface,
	position: BoardPosition,
	direction: DirectionEnum
): BoardConfigInterface {
	if (getFieldType(position, config) !== FieldsEnum.RIVER) {
		return config;
	}

	const index = config.riverFields.findIndex(
		(e) => position2String(e.position) === boardPosition2String(position)
	);
	if (index > -1) {
		const newConfig = config;
		newConfig.riverFields[index].direction =
			DirectionHelper.dirEnumToString(direction);
		return newConfig;
	}

	return config;
}

export function updateLembasFieldAmount(
	config: BoardConfigInterface,
	position: BoardPosition,
	amount: number
): BoardConfigInterface {
	if (getFieldType(position, config) !== FieldsEnum.LEMBAS) {
		return config;
	}

	const index = config.lembasFields.findIndex(
		(e) => position2String(e.position) === boardPosition2String(position)
	);
	if (index > -1) {
		const newConfig = config;
		newConfig.lembasFields[index].amount = amount;
		return newConfig;
	}

	return config;
}

export function getLembasFieldConfig(
	position: BoardPosition,
	config: BoardConfigInterface
): LembasField | null {
	const index = config.lembasFields.findIndex(
		(e) => position2String(e.position) === boardPosition2String(position)
	);
	if (index > -1 && config.lembasFields[index]) {
		return config.lembasFields[index];
	}
	return null;
}

export default {};
