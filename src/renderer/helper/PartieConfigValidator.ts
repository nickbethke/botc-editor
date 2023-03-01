import PartieConfigInterface from '../components/interfaces/PartieConfigInterface';

class PartieConfigValidator {
	private readonly json: JSON;

	private readonly config: PartieConfigInterface;

	public readonly errors: string[] = [];

	constructor(partieConfig: PartieConfigInterface) {
		this.config = partieConfig;
		this.json = JSON.parse(JSON.stringify(partieConfig));
	}
}

export default PartieConfigValidator;
