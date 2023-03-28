/**
 * The party configuration type
 */
interface PartieConfigInterface {
	startLembas: number;
	shotLembas: number;
	cardSelectionTimeout: number;
	characterChoiceTimeout: number;
	riverMoveCount: number;
	serverIngameDelay: number;
	reviveRounds: number;
	maxRounds: number;

	[k: string]: unknown;
}

export default PartieConfigInterface;
