import FieldWithPositionInterface from './FieldWithPositionInterface';

interface FieldWithPositionAndAmountInterface
	extends FieldWithPositionInterface {
	amount: number;
}

export default FieldWithPositionAndAmountInterface;
