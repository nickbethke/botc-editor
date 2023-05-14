import { ParsedPath } from 'path';

/**
 * The party configuration type
 */
interface GameConfigInterface {
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
export type GameConfigWithPath = PathInterface & {
	config: GameConfigInterface;
};

export default GameConfigInterface;
