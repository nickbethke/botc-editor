import FieldWithPositionAndAmountInterface from '../interfaces/FieldWithPositionAndAmountInterface';
import { BoardPosition } from '../interfaces/BoardPosition';
import { FieldsEnum } from '../BoardGenerator';

/**
 * LembasField Field Class
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
