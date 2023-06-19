import { toNumber } from 'lodash';

/**
 * InputValidatorValidateAnswer interface
 * @interface InputValidatorValidateAnswer
 * @description defines the answer of the InputValidator.validate() method
 */
type InputValidatorValidateAnswer = {
	valid: { is: boolean; text: string[] };
	warning: { has: boolean; text: string[] };
};

/**
 * InputValidatorType enum
 * @enum InputValidatorType
 * @description defines the type of the InputValidator
 */
export enum InputValidatorType {
	TYPE_STRING,
	TYPE_NUMBER,
}

/**
 * InputValidatorArgs interface
 * @interface InputValidatorArgs
 * @description defines the args for the InputValidator class
 */
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
					isError?: boolean;
				};
				exact?: {
					number: number;
					error: string;
				};
			};
	  };

/**
 * InputValidator class
 * @class InputValidator
 * @description creates a new InputValidator instance with the given args and validates the given value by the given rules
 * @param args
 * @example
 * const inputValidator = new InputValidator({
 * 	type: InputValidatorType.TYPE_STRING,
 * 		options: {
 * 			longerThan: {
 * 				number: 3,
 * 				error: 'The value must be longer than 3 characters',
 * 				},
 * 			regex: {
 * 				expression: /^[a-z]+$/,
 * 				error: 'The value must only contain lowercase letters',
 * 			},
 * 			notEmpty: {
 * 				error: 'The value must not be empty',
 * 			},
 * 		},
 * 	});
 * 	const answer = inputValidator.validate('abc');
 * 	console.log(answer);
 */
class InputValidator {
	readonly args: InputValidatorArgs;

	constructor(args: InputValidatorArgs) {
		this.args = args;
	}

	/**
	 * validates the given value by the given rules
	 * @param value
	 */
	validate(value: string): InputValidatorValidateAnswer {
		const answer: InputValidatorValidateAnswer = {
			valid: { is: true, text: [] },
			warning: { has: false, text: [] },
		};
		if (this.args.type === InputValidatorType.TYPE_STRING) {
			if (this.args.options.longerThan && value.length > (this.args.options.longerThan.number || 0)) {
				answer.valid.is = false;
				answer.valid.text.push(this.args.options.longerThan.error);
			}
			if (this.args.options.regex && !this.args.options.regex.expression.test(value)) {
				answer.valid.is = false;
				answer.valid.text.push(this.args.options.regex.error);
			}
			if (this.args.options.notEmpty && value.length < 1) {
				answer.valid.is = false;
				answer.valid.text.push(this.args.options.notEmpty.error);
			}
		}
		if (this.args.type === InputValidatorType.TYPE_NUMBER) {
			if (this.args.options.ifBiggerThen && toNumber(value) > this.args.options.ifBiggerThen.number) {
				answer.warning.has = true;
				answer.warning.text.push(this.args.options.ifBiggerThen.error);
			}
			if (this.args.options.ifSmallerThen) {
				if (
					!(
						this.args.options.ifSmallerThen.except !== undefined &&
						toNumber(value) === this.args.options.ifSmallerThen.except
					)
				) {
					if (toNumber(value) < this.args.options.ifSmallerThen.number) {
						if (this.args.options.ifSmallerThen.isError) {
							answer.valid.is = false;
							answer.valid.text.push(this.args.options.ifSmallerThen.error);
						} else {
							answer.warning.has = true;
							answer.warning.text.push(this.args.options.ifSmallerThen.error);
						}
					}
				}
			}
			if (this.args.options.exact && toNumber(value) === this.args.options.exact.number) {
				answer.warning.has = true;
				answer.warning.text.push(this.args.options.exact.error);
			}
		}
		return answer;
	}
}

export default InputValidator;
