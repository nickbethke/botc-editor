import { BoardPosition } from '../generator/interfaces/boardPosition';
import { RiverPreset } from '../../../main/helper/PresetsLoader';

export function removeRiver(position: BoardPosition, config: RiverPreset) {
	const newData = config.data.filter((field) => {
		return !(field.position[0] === position.x && field.position[1] === position.y);
	});
	return { ...config, data: newData };
}

export function getBoardMaxDimension(config: RiverPreset) {
	let dimensions = { width: 1, height: 1 };
	if (config) {
		config.data.forEach((field) => {
			if (field.position[0] + 1 > dimensions.width) {
				dimensions = { ...dimensions, width: field.position[0] + 1 };
			}
			if (field.position[1] + 1 > dimensions.height) {
				dimensions = { ...dimensions, height: field.position[1] + 1 };
			}
		});
	}

	return dimensions;
}
