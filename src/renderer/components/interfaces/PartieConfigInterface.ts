import { ParsedPath } from 'path';

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

export type PathInterface = {
	parsedPath: ParsedPath;
	path: string;
};
export type PartieConfigWithPath = PathInterface & {
	config: PartieConfigInterface;
};

export default PartieConfigInterface;
