import { DirectionEnum } from '../../../../../../../Projekte/BotC-board-generator/src/interfaces/boardConfigInterface';
import FieldWithPositionInterface from './fieldWithPositionInterface';

interface FieldWithPositionAndDirectionInterface
	extends FieldWithPositionInterface {
	direction: DirectionEnum;
}

export default FieldWithPositionAndDirectionInterface;
