import PartieConfigInterface from '../components/interfaces/PartieConfigInterface';

class PartieConfigValidator {
	private readonly json: JSON;

	private readonly config: PartieConfigInterface;

	public readonly errors: string[] = [];

	constructor(partieConfig: PartieConfigInterface) {
		this.config = partieConfig;
		this.json = JSON.parse(JSON.stringify(partieConfig));

		if (!this.config.cardSelectionTimeout) {
			this.errors.push('cardSelectionTimeout is required');
		}
		if (!this.config.characterChoiceTimeout) {
			this.errors.push('characterChoiceTimeout is required');
		}
		if (!this.config.maxRounds) {
			this.errors.push('maxRounds is required');
		}
		if (!this.config.reviveRounds) {
			this.errors.push('reviveRounds is required');
		}
		if (!this.config.riverMoveCount) {
			this.errors.push('riverMoveCount is required');
		}
		if (!this.config.serverIngameDelay) {
			this.errors.push('serverIngameDelay is required');
		}
		if (!this.config.shotLembas) {
			this.errors.push('shotLembas is required');
		}
		if (!this.config.startLembas) {
			this.errors.push('startLembas is required');
		}
	}
}

export default PartieConfigValidator;
