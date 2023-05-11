import { Component } from 'react';
import _uniqueId from 'lodash/uniqueId';
import { VscChevronDown, VscChevronUp } from 'react-icons/vsc';
import Button from './Button';

type SelectComponentProps = {
	value: string;
	onChange: (value: string) => void;
	options: Array<{ value: string; text: string }>;
	containerClassName?: string;
};
type SelectComponentState = {
	value: string;
	options: Array<{ value: string; text: string }>;
	isOpen: boolean;
	id: string;
};

class SelectComponent extends Component<SelectComponentProps, SelectComponentState> {
	constructor(props: SelectComponentProps) {
		super(props);
		this.state = {
			value: props.value,
			options: props.options,
			isOpen: false,
			id: _uniqueId(),
		};
	}

	componentDidMount() {
		document.addEventListener('click', this.handleOffClick);
	}

	componentWillUnmount() {
		document.removeEventListener('click', this.handleOffClick);
	}

	handleOffClick = (event: MouseEvent) => {
		const { isOpen, id } = this.state;
		if (event.target instanceof HTMLElement) {
			if (isOpen && !document.getElementById(id)?.contains(event.target)) {
				this.setState({ isOpen: false });
			}
		}
	};

	render() {
		const { onChange, containerClassName } = this.props;
		const { value, options, isOpen, id } = this.state;
		const currentValue = options.find((option) => option.value === value);
		return (
			<div className="relative h-full" id={id}>
				<div
					className={
						'flex gap-1 justify-between px-2 items-center hover:cursor-pointer hover:bg-white/10 h-full ' +
						containerClassName
					}
					onClick={() => this.setState({ isOpen: !isOpen })}
				>
					<button type="button" className="px-2 py-1 font-medium">
						{currentValue?.text}
					</button>
					{isOpen ? <VscChevronUp /> : <VscChevronDown />}
				</div>
				{isOpen && (
					<div className="absolute min-w-full top-full left-0 z-50 flex flex-col gap-0 px-2 w-full max-h-32 overflow-y-auto shadow-lg">
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
