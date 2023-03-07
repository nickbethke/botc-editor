import React from 'react';
import { OnChangeFunctionInputLabel } from './InputLabel';

type DblClickInputProps = {
	value: number;
	onChange: OnChangeFunctionInputLabel;
	min: number;
	max: number;
};
type DblClickInputState = {
	open: boolean;
	value: string | number;
};

class DblClickInput extends React.Component<
	DblClickInputProps,
	DblClickInputState
> {
	constructor(props: DblClickInputProps) {
		super(props);
		this.state = { open: false, value: props.value };
	}

	render() {
		const { min, max, onChange, value: propsValue } = this.props;
		const { open, value } = this.state;
		if (propsValue !== value && !open) {
			this.setState({ value: propsValue });
		}
		if (open) {
			return (
				<input
					type="number"
					min={min}
					max={max}
					className="bg-transparent border-b-2 pl-4 focus:outline-none w-16"
					onBlur={() => {
						this.setState({ open: false });
						onChange(value);
					}}
					onKeyUp={(e) => {
						if (e.key === 'Enter') {
							this.setState({ open: false });
							onChange(value);
						}
					}}
					onChange={(e) => {
						let v: number = Number.parseInt(e.target.value, 10);
						if (Number.parseInt(e.target.value, 10) > max) {
							v = max;
						}
						if (Number.parseInt(e.target.value, 10) < min) {
							v = min;
						}
						this.setState({ value: v });
					}}
					value={value}
				/>
			);
		}
		return (
			<div
				className="cursor-pointer"
				onDoubleClick={() => {
					this.setState({ open: true });
				}}
			>
				{value}
			</div>
		);
	}
}

export default DblClickInput;
