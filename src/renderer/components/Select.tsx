import { Component } from 'react';
import _uniqueId from 'lodash/uniqueId';
import { VscChevronDown, VscChevronUp } from 'react-icons/vsc';

type SelectComponentProps = {
	value: string;
	onChange: (value: string) => void;
	options: Array<{ value: string; text: string }>;
};
type SelectComponentState = {
	value: string;
	options: Array<{ value: string; text: string }>;
	isOpen: boolean;
};

class SelectComponent extends Component<SelectComponentProps, SelectComponentState> {
	constructor(props: SelectComponentProps) {
		super(props);
		this.state = {
			value: props.value,
			options: props.options,
			isOpen: false,
		};
	}

	render() {
		const { onChange } = this.props;
		const { value, options, isOpen } = this.state;
		const currentValue = options.find((option) => option.value === value);
		return (
			<div className="relative">
				<div className="flex gap-1 px-2 items-center">
					<button type="button" className="px-2 py-1 font-medium" onClick={() => this.setState({ isOpen: !isOpen })}>
						{currentValue?.text}
					</button>
					{isOpen ? <VscChevronUp /> : <VscChevronDown />}
				</div>
				{isOpen && (
					<div className="absolute min-w-full top-full left-0 z-50 flex flex-col gap-0 px-2">
						{options.map((option, index) => (
							<button
								disabled={option.value === value}
								type="button"
								key={_uniqueId()}
								className={`px-2 py-1 dark:bg-muted-600 bg-muted-400 text-left ${
									index === options.length - 1 ? 'rounded-b' : ''
								}  ${option.value === value ? 'text-gray-300' : 'dark:hover:bg-muted hover:bg-muted'}`}
								onClick={() => {
									this.setState({ isOpen: false, value: option.value }, () => {
										onChange(option.value);
									});
								}}
							>
								{option.text}
							</button>
						))}
					</div>
				)}
			</div>
		);
	}
}

export default SelectComponent;
