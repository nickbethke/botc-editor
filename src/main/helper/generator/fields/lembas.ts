import FieldWithPositionAndAmountInterface from '../interfaces/FieldWithPositionAndAmountInterface';
import { BoardPosition } from '../interfaces/boardPosition';
import { FieldsEnum } from '../../../../renderer/components/BoardKonfigurator';

/**
 * Lembas Field Class
 */
class Lembas implements FieldWithPositionAndAmountInterface {
	amount: number;

	readonly position: BoardPosition;

	constructor(position: BoardPosition, amount: number) {
		this.position = position;
		this.amount = amount;
	}

	readonly fieldEnum: FieldsEnum = 5;
}

export default Lembas;
