import React, { ChangeEvent } from 'react';
import _uniqueId from 'lodash/uniqueId';
import { VscError, VscWarning } from 'react-icons/vsc';
import InputValidator from '../helper/InputValidator';
import DblClickInput from './DblClickInput';

type InputLabelStringProps = {
	type: 'text';
	value: string;
	helperText?: string;
	onChange: (value: string) => void;
	onEnter?: (value: string) => void;
	min?: number;
	max?: number;
	small?: boolean;
};

type InputLabelNumberProps = {
	type: 'number';
	value: number;
	helperText?: string;
	onChange: (value: number) => void;
	onEnter?: (value: string) => void;
	min?: number;
	max?: number;
	small?: boolean;
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

	componentDidMount() {
		const { value, validator } = this.props;
		this.update(value.toString(), validator);
	}

	// methode if the props change
	componentDidUpdate(prevProps: InputLabelProps) {
		const { value, validator } = this.props;
		if (prevProps.value !== value) {
			this.update(value.toString(), validator);
		}
	}

	handleOnChange(e: ChangeEvent<HTMLInputElement>) {
		const { value } = e.target;
		const { validator, onChange, type } = this.props;
		if (type === 'text') {
			this.update(value, validator);
			onChange(value);
		}
		if (type === 'number') {
			const { min, max } = this.props;
			if (value === '') {
				if (min !== undefined && min > 0) {
					this.update(min.toString(), validator);
					onChange(min);
					return;
				}
				this.update('0', validator);
				onChange(0);
				return;
			}
			if (min !== undefined && Number.parseInt(value, 10) < min) {
				this.update(min.toString(), validator);
				onChange(min);
				return;
			}
			if (max !== undefined && Number.parseInt(value, 10) > max) {
				this.update(max.toString(), validator);
				onChange(max);
				return;
			}
			this.update(value, validator);
			onChange(Number.parseInt(value, 10));
		}

		if (type === 'range') {
			this.update(value, validator);
			if (value !== '') onChange(Number.parseInt(value, 10));
			else onChange(0);
		}
		if (type === 'switch') {
			const { checked } = e.target;
			this.setState({ value: checked });
			onChange(checked);
		}
	}

	update = (value: string, validator: InputValidator | undefined) => {
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
	};

	render() {
		let helper: string | React.JSX.Element = '';

		const { helperText, label, type, placeholder, labelClass, onChange } = this.props;
		const { value } = this.state;

		if (helperText) {
			helper = <p className="text-sm pl-2">{helperText}</p>;
		}
		const { isValid, hasWarning, warningText, errorMsg } = this.state;
		let warningHelper: string | React.JSX.Element = '';
		let invalidHelper: string | React.JSX.Element = '';
		if (hasWarning) {
			warningHelper = (
				<div className="text-sm dark:text-orange-300 text-amber-500 flex gap-2 items-center pl-2">
					<VscWarning />
					{warningText.join(' | ')}
				</div>
			);
		}
		if (!isValid && errorMsg) {
			invalidHelper = (
				<div className="text-sm dark:text-red-300 text-red-400 flex gap-2 items-center pl-2">
					<VscError />
					{errorMsg.join(' | ')}
				</div>
			);
		}
		let validClass = 'border-b-0 border-b-transparent';
		if (isValid) {
			if (hasWarning) {
				validClass = 'border-b-orange-400 border-b-4';
			}
		} else {
			validClass = 'border-b-red-400 border-b-4';
		}
		if (type === 'text' || type === 'number') {
			const { max, min, onEnter, small } = this.props;
			return (
				<div className={`flex flex-col ${label ? 'gap-2' : ''} ${small ? 'text-sm' : ''} max-w-full`}>
					<label htmlFor={this.id} className={`${labelClass}`}>
						{label ? `${label}:` : ''}
					</label>
					<input
						id={this.id}
						className={`rounded dark:bg-muted-900/25 bg-muted-100/25 px-4 py-2 focus:outline-none transition-all ${validClass}`}
						type={type}
						placeholder={placeholder || label || ''}
						onChange={this.handleOnChange}
						min={min || -1}
						max={max || 20}
						value={value?.toString()}
						onKeyDown={(event) => {
							if (event.key === 'Enter' && typeof onEnter === 'function') {
								onEnter(value?.toString());
							}
						}}
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
						<label htmlFor={this.id} className={`${labelClass} flex flex-row gap-2`}>
							<span>{label ? `${label}:` : ''}</span>
							<DblClickInput
								value={Number.parseInt(value.toString() ? value.toString() : '0', 10)}
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
			const checked = value === true || value === 'true';
			return (
				<div>
					<label htmlFor={this.id} className={`${labelClass} flex flex-row gap-2 justify-center items-center`}>
						{label ? <span className="min-h-8">{label}</span> : null}
						<div className="switch">
							<input type="checkbox" id={this.id} checked={checked} onChange={this.handleOnChange} />
							<span className={`${bothSides ? 'slider-both' : ''} slider round`} />
						</div>
					</label>
				</div>
			);
		}
		return null;
	}
}

export default InputLabel;
