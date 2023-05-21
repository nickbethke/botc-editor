import GameConfigInterface from '../../interfaces/GameConfigInterface';

class GameConfigValidator {
	private readonly json: JSON;

	private readonly config: GameConfigInterface;

	public readonly errors: string[] = [];

	constructor(gameConfig: GameConfigInterface) {
		this.config = gameConfig;
		this.json = JSON.parse(JSON.stringify(gameConfig));

		if (!('cardSelectionTimeout' in this.config)) {
			this.errors.push('cardSelectionTimeout is required');
		}
		if (!('characterChoiceTimeout' in this.config)) {
			this.errors.push('characterChoiceTimeout is required');
		}
		if (!('maxRounds' in this.config)) {
			this.errors.push('maxRounds is required');
		}
		if (!('reviveRounds' in this.config)) {
			this.errors.push('reviveRounds is required');
		}
		if (!('riverMoveCount' in this.config)) {
			this.errors.push('riverMoveCount is required');
		}
		if (!('serverIngameDelay' in this.config)) {
			this.errors.push('serverIngameDelay is required');
		}
		if (!('shotLembas' in this.config)) {
			this.errors.push('shotLembas is required');
		}
		if (!('startLembas' in this.config)) {
			this.errors.push('startLembas is required');
		}

		this.errors.forEach((error, index) => {
			this.errors[index] = window.t.translate(error);
		});
	}
}

export default GameConfigValidator;
