import { toNumber } from 'lodash';

type InputValidatorValidateAnswer = {
	valid: { is: boolean; text: string[] };
	warning: { has: boolean; text: string[] };
};

export enum InputValidatorType {
	TYPE_STRING,
	TYPE_NUMBER,
}

type InputValidatorArgs =
	| {
			type: InputValidatorType.TYPE_STRING;
			options: {
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
	  }
	| {
			type: InputValidatorType.TYPE_NUMBER;
			options: {
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
	  };

class InputValidator {
	readonly args: InputValidatorArgs;

	constructor(args: InputValidatorArgs) {
		this.args = args;
	}

	validate(value: string): InputValidatorValidateAnswer {
		const answer = {
			valid: { is: true, text: new Array<string>() },
			warning: { has: false, text: new Array<string>() },
		};
		if (this.args.type === InputValidatorType.TYPE_STRING) {
			if (
				this.args.options.longerThan &&
				value.length > (this.args.options.longerThan.number || 0)
			) {
				answer.valid.is = false;
				answer.valid.text.push(this.args.options.longerThan.error);
			}
			if (
				this.args.options.regex &&
				!this.args.options.regex.expression.test(value)
			) {
				answer.valid.is = false;
				answer.valid.text.push(this.args.options.regex.error);
			}
			if (this.args.options.notEmpty && value.length < 1) {
				answer.valid.is = false;
				answer.valid.text.push(this.args.options.notEmpty.error);
			}
		} else if (this.args.type === InputValidatorType.TYPE_NUMBER) {
			if (
				this.args.options.ifBiggerThen &&
				toNumber(value) > this.args.options.ifBiggerThen.number
			) {
				answer.warning.has = true;
				answer.warning.text.push(this.args.options.ifBiggerThen.error);
			}
			if (this.args.options.ifSmallerThen) {
				if (
					!(
						this.args.options.ifSmallerThen.except &&
						toNumber(value) ===
							this.args.options.ifSmallerThen.except
					)
				) {
					if (
						toNumber(value) < this.args.options.ifSmallerThen.number
					) {
						answer.warning.has = true;
						answer.warning.text.push(
							this.args.options.ifSmallerThen.error
						);
					}
				}
			}
		}
		return answer;
	}
}

export default InputValidator;
