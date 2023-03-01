import { toNumber } from 'lodash';

type InputValidatorValidateAnswer = {
	valid: { is: boolean; text: string[] };
	warning: { has: boolean; text: string[] };
};
type InputValidatorErrors = {
	number?: {
		ifBiggerThen?: {
			number: number;
			error: string;
		};
		ifSmallerThen?: {
			number: number;
			error: string;
			except?: number;
		};
	};
	text?: {
		longerThan?: {
			number: number;
			error: string;
		};
		regex?: {
			expression: RegExp;
			error: string;
		};
		notEmpty?: {
			error: string;
		};
	};
};

class InputValidator {
	static readonly TYPE_STRING = 'string';

	static readonly TYPE_NUMBER = 'number';

	readonly type: string;

	readonly errors: InputValidatorErrors;

	/**
	 *
	 * @param type: TYPE_STRING|TYPE_NUMBER
	 * @param errors
	 */
	constructor(type: string, errors: InputValidatorErrors) {
		this.type = type;
		this.errors = errors;
	}

	validate(value: string): InputValidatorValidateAnswer {
		const answer = {
			valid: { is: true, text: new Array<string>() },
			warning: { has: false, text: new Array<string>() },
		};
		switch (this.type) {
			case InputValidator.TYPE_STRING:
				if (this.errors.text) {
					if (
						this.errors.text.longerThan &&
						value.length > (this.errors.text.longerThan.number || 0)
					) {
						answer.valid.is = false;
						answer.valid.text.push(
							this.errors.text.longerThan.error
						);
					}
					if (
						this.errors.text.regex &&
						!this.errors.text.regex.expression.test(value)
					) {
						answer.valid.is = false;
						answer.valid.text.push(this.errors.text.regex.error);
					}
					if (this.errors.text.notEmpty && value.length < 1) {
						answer.valid.is = false;
						answer.valid.text.push(this.errors.text.notEmpty.error);
					}
				}
				break;
			case InputValidator.TYPE_NUMBER:
				if (this.errors.number) {
					if (
						this.errors.number.ifBiggerThen &&
						toNumber(value) > this.errors.number.ifBiggerThen.number
					) {
						answer.warning.has = true;
						answer.warning.text.push(
							this.errors.number.ifBiggerThen.error
						);
					}
					if (this.errors.number.ifSmallerThen) {
						if (this.errors.number.ifSmallerThen.except) {
							if (
								toNumber(value) ===
								this.errors.number.ifSmallerThen.except
							) {
								break;
							}
						}
						if (
							toNumber(value) <
							this.errors.number.ifSmallerThen.number
						) {
							answer.warning.has = true;
							answer.warning.text.push(
								this.errors.number.ifSmallerThen.error
							);
						}
					}
				}
				break;
			default:
		}
		return answer;
	}
}

export default InputValidator;
