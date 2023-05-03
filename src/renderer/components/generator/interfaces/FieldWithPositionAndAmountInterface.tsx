import FieldWithPositionInterface from './FieldWithPositionInterface';

/**
 * A position interface with an amount property.
 */
interface FieldWithPositionAndAmountInterface extends FieldWithPositionInterface {
	amount: number;
}

export default FieldWithPositionAndAmountInterface;
