import { Component } from 'react';
import _uniqueId from 'lodash/uniqueId';
import { VscChevronUp } from 'react-icons/vsc';

type SelectComponentProps<T> = {
	value: T;
	onChange: (value: T) => void;
	options: Array<{ value: T; text: string; icon?: JSX.Element }>;
	containerClassName?: string;
};
type SelectComponentState<T> = {
	value: T;
	options: Array<{ value: T; text: string; icon?: JSX.Element }>;
	isOpen: boolean;
	id: string;
};

class SelectComponent<T> extends Component<SelectComponentProps<T>, SelectComponentState<T>> {
	constructor(props: SelectComponentProps<T>) {
		super(props);
		this.state = {
			value: props.value,
			options: props.options,
			isOpen: false,
			id: _uniqueId(),
		};
	}

	componentDidUpdate(prevProps: Readonly<SelectComponentProps<T>>) {
		const { value, options } = this.props;
		if (prevProps.value !== value || prevProps.options !== options) {
			this.setState({ value, options });
		}
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
			<div className='relative h-full' id={id}>
				<div
					className={
						'flex gap-1 justify-between px-2 items-center hover:cursor-pointer hover:bg-white/10 h-full ' +
						containerClassName
					}
					onClick={() => this.setState({ isOpen: !isOpen })}
				>
					<button type='button' className='px-2 py-1 font-medium flex gap-2 items-center'>
						{currentValue?.icon}
						<span>{currentValue?.text}</span>
					</button>
					<VscChevronUp className={`transition-transform ${isOpen ? 'rotate-0' : 'rotate-180'}`} />
				</div>
				<div
					className={`absolute min-w-full top-full left-0 z-50 flex flex-col gap-0 px-2 w-full max-h-32 overflow-y-auto shadow-lg transition-all ${
						isOpen ? 'visible opacity-1' : 'hidden opacity-0'
					}`}
				>
					{options.map((option, index) => (
						<button
							disabled={option.value === value}
							type='button'
							key={_uniqueId()}
							className={`px-2 py-1 dark:bg-muted-600 bg-muted-400 text-left flex gap-2 items-center ${
								index === options.length - 1 ? 'rounded-b' : ''
							}  ${option.value === value ? 'text-gray-300' : 'dark:hover:bg-muted hover:bg-muted'}`}
							onClick={() => {
								this.setState({ isOpen: false, value: option.value }, () => {
									onChange(option.value);
								});
							}}
						>
							{option.icon}
							<span>{option.text}</span>
						</button>
					))}
				</div>
			</div>
		);
	}
}

export default SelectComponent;
