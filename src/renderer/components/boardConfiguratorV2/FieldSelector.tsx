import React from 'react';
import { FieldsEnum } from '../generator/BoardGenerator';

type FieldSelectorProps = {
	text: string;
	type: FieldsEnum;
	onSelect: (selected: FieldsEnum | null) => void;
	icon: string;
	selected: boolean;
};
type FieldSelectorState = unknown;

class FieldSelector extends React.Component<
	FieldSelectorProps,
	FieldSelectorState
> {
	constructor(props: FieldSelectorProps) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}

	onClick = () => {
		const { onSelect, selected, type } = this.props;
		if (selected) {
			onSelect(null);
		} else {
			onSelect(type);
		}
	};

	render() {
		const { icon, text, selected } = this.props;
		return (
			<button
				type="button"
				onClick={this.onClick}
				title={text}
				className="w-fit"
			>
				<img
					alt={text}
					src={icon}
					className={`border dark:border-muted-700 border-muted-400 w-12 rounded-xl ${
						selected ? 'bg-white/25' : 'hover:bg-white/10'
					}`}
				/>
			</button>
		);
	}
}

export default FieldSelector;
