import React, { ChangeEvent } from 'react';
import _uniqueId from 'lodash/uniqueId';
import InputValidator from '../helper/InputValidator';
import DblClickInput from './DblClickInput';

type InputLabelStringProps = {
	type: 'text';
	value: string;
	helperText?: string;
	onChange: (value: string) => void;
	min?: number;
	max?: number;
};

type InputLabelNumberProps = {
	type: 'number';
	value: number;
	helperText?: string;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
};
type InputLabelRangeProps = {
	type: 'range';
	value: number;
	helperText?: string;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
};
type InputLabelSwitchProps = {
	type: 'switch';
	value: boolean;
	helperText?: string;
	onChange: (value: boolean) => void;
	bothSides?: boolean;
};
type InputLabelConditionalProps =
	| InputLabelStringProps
	| InputLabelNumberProps
	| InputLabelSwitchProps
	| InputLabelRangeProps;

type InputLabelCommonProps = {
	label?: string | false;
	placeholder?: string;
	helperText?: string;
	validator?: InputValidator;
	labelClass?: string;
};
type InputLabelProps = InputLabelCommonProps & InputLabelConditionalProps;
type InputLabelState = {
	hasWarning: boolean;
	warningText: string[];
	errorMsg: string[];
	isValid: boolean;
	value: number | string | boolean;
};

class InputLabel extends React.Component<InputLabelProps, InputLabelState> {
	private readonly id: string;

	static get defaultProps() {
		return {
			placeholder: '',
			helperText: '',
			validator: undefined,
			labelClass: '',
			label: false,
		};
	}

	constructor(props: InputLabelProps) {
		super(props);
		this.id = _uniqueId('input-label-');
		this.handleOnChange = this.handleOnChange.bind(this);
		this.state = {
			value: props.value,
			isValid: true,
			hasWarning: false,
			errorMsg: [],
			warningText: [],
		};
	}

	handleOnChange(e: ChangeEvent<HTMLInputElement>) {
		const { value } = e.target;
		const { validator, onChange, type } = this.props;
		if (type === 'text') {
			if (validator) {
				const { valid, warning } = validator.validate(value);
				this.setState({
					warningText: warning.text,
					isValid: valid.is,
					errorMsg: valid.text,
					hasWarning: warning.has,
					value,
				});
			} else {
				this.setState({ value });
			}
			onChange(value);
		} else if (type === 'number') {
			if (validator) {
				const { valid, warning } = validator.validate(value);
				this.setState({
					warningText: warning.text,
					isValid: valid.is,
					errorMsg: valid.text,
					hasWarning: warning.has,
					value,
				});
			} else {
				this.setState({ value });
			}
			onChange(Number.parseInt(value, 10));
		} else if (type === 'range') {
			if (validator) {
				const { valid, warning } = validator.validate(value);
				this.setState({
					warningText: warning.text,
					isValid: valid.is,
					errorMsg: valid.text,
					hasWarning: warning.has,
					value,
				});
			} else {
				this.setState({ value });
			}
			onChange(Number.parseInt(value, 10));
		} else if (type === 'switch') {
			const { checked } = e.target;
			this.setState({ value: checked });
			onChange(checked);
		}
	}

	render() {
		let helper: string | JSX.Element = '';

		const {
			helperText,
			label,
			type,
			placeholder,
			labelClass,
			value: propsValue,
			onChange,
		} = this.props;
		const { value } = this.state;

		if (propsValue !== value) {
			this.setState({ value: propsValue });
		}

		if (helperText) {
			helper = <div>{helperText}</div>;
		}
		const { isValid, hasWarning, warningText, errorMsg } = this.state;
		let warningHelper: string | JSX.Element = '';
		let invalidHelper: string | JSX.Element = '';
		if (hasWarning) {
			warningHelper = (
				<div className="text-sm text-orange-400 pl-4">
					{warningText.join(' | ')}
				</div>
			);
		}
		if (!isValid && errorMsg) {
			invalidHelper = (
				<div className="text-sm text-red-400 pl-4">
					{errorMsg.join(' | ')}
				</div>
			);
		}
		let validClass = '';
		if (isValid) {
			if (hasWarning) {
				validClass = ' border-b-orange-400';
			}
		} else {
			validClass = ' border-b-red-400';
		}
		if (type === 'text' || type === 'number') {
			const { max, min } = this.props;
			return (
				<div className="flex flex-col gap-2 max-w-full">
					<label htmlFor={this.id} className={`${labelClass}`}>
						{label}:
					</label>
					<input
						id={this.id}
						className={`rounded dark:bg-muted-900/25 bg-muted-100/25 px-4 py-2 focus:outline-none${validClass}`}
						type={type}
						placeholder={placeholder || label || ''}
						onChange={this.handleOnChange}
						min={min || -1}
						max={max || 20}
						value={value?.toString()}
					/>
					{helper}
					{warningHelper}
					{invalidHelper}
				</div>
			);
		}
		if (type === 'range') {
			const { max, min } = this.props;
			return (
				<div className="flex flex-col">
					<div>
						<label
							htmlFor={this.id}
							className={`${labelClass} flex flex-row gap-2`}
						>
							<span>{label ? `${label}:` : ''}</span>
							<DblClickInput
								value={Number.parseInt(
									value.toString() ? value.toString() : '0',
									10
								)}
								onChange={(v) => {
									this.setState({ value: v });
									onChange(v);
								}}
								min={min || 0}
								max={max || 20}
							/>
						</label>
					</div>
					<div>
						<input
							id={this.id}
							type="range"
							value={Number.parseInt(value.toString(), 10)}
							min={min || 0}
							max={max || 20}
							onChange={this.handleOnChange}
							className={`w-full h-[2px] rounded-lg appearance-none cursor-pointer ${validClass}`}
						/>
					</div>
					{helper}
					{warningHelper}
					{invalidHelper}
				</div>
			);
		}
		if (type === 'switch') {
			const { bothSides } = this.props;
			return (
				<div>
					<label
						htmlFor={this.id}
						className={`${labelClass} flex flex-row gap-2 justify-center items-center`}
					>
						{label ? (
							<span className="min-h-8">{label}</span>
						) : null}
						<div className="switch">
							<input
								type="checkbox"
								id={this.id}
								checked={!!value}
								onChange={this.handleOnChange}
							/>
							<span
								className={`${
									bothSides ? 'slider-both' : ''
								} slider round`}
							/>
						</div>
					</label>
				</div>
			);
		}
		return null;
	}
}

export default InputLabel;
