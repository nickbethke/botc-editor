import React, { ChangeEvent } from 'react';
import _uniqueId from 'lodash/uniqueId';
import InputValidator from '../helper/InputValidator';
import DblClickInput from './DblClickInput';

export interface OnChangeFunctionInputLabel {
	(value: string | number): void;
}

type InputLabelProps = {
	label?: string | false;
	type: 'text' | 'number' | 'range' | 'switch';
	placeholder?: string;
	value: number | string | boolean;
	helperText?: string;
	validator?: InputValidator;
	min?: number;
	max?: number;
	onChange: OnChangeFunctionInputLabel;
	labelClass?: string;
	bothSides?: boolean;
};
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
			min: 0,
			labelClass: 'text-lg',
			max: 20,
			label: false,
			bothSides: false,
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
		const { type } = this.props;
		if (type !== 'switch') {
			const { value } = e.target;
			const { validator, onChange } = this.props;
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
		} else {
			const { checked: value } = e.target;
			const { onChange } = this.props;

			this.setState({ value });
			onChange(value ? 1 : 0);
		}
	}

	render() {
		let helper: string | JSX.Element = '';

		const {
			helperText,
			label,
			min,
			type,
			placeholder,
			labelClass,
			max,
			bothSides,
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
			return (
				<div className="flex flex-col">
					<div>
						<label htmlFor={this.id} className={`${labelClass}`}>
							{label}
						</label>
					</div>
					<div>
						<input
							id={this.id}
							className={`bg-transparent border-b-2 text-xl px-4 py-2 focus:outline-none w-full${validClass}`}
							type={type}
							placeholder={placeholder}
							onChange={this.handleOnChange}
							min={min || -1}
							max={max || 20}
							value={value?.toString()}
						/>
					</div>
					{helper}
					{warningHelper}
					{invalidHelper}
				</div>
			);
		}
		if (type === 'range') {
			return (
				<div className="flex flex-col">
					<div>
						<label
							htmlFor={this.id}
							className={`${labelClass} flex flex-row gap-2`}
						>
							<span>{label}:</span>
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
		return (
			<div>
				<label
					htmlFor={this.id}
					className={`${labelClass} flex flex-row gap-2 justify-center items-center`}
				>
					{label ? <span className="min-h-8">{label}</span> : null}
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
}

export default InputLabel;
