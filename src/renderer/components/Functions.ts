export function predictIfConfigurationIsPartyConfiguration(configuration: object) {
	return (
		'maxRounds' in configuration ||
		'reviveRounds' in configuration ||
		'serverIngameDelay' in configuration ||
		'riverMoveCount' in configuration ||
		'cardSelectionTimeout' in configuration ||
		'characterChoiceTimeout' in configuration ||
		'shotLembas' in configuration ||
		'startLembas' in configuration
	);
}

export default {};
