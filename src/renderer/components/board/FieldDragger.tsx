import React from 'react';
import { FieldsEnum } from '../BoardKonfigurator';

type FieldDraggerProps = {
	className?: string;
	text: string;
	type: FieldsEnum;
	onDragStart: (type: FieldsEnum) => void;
};

class FieldDragger extends React.Component<FieldDraggerProps, any> {
	private draggableItemClass: string =
		'p-4 bg-white/10 flex text-center justify-center items-center cursor-grab border-2 border-transparent border-dashed hover:border-white';

	static get defaultProps() {
		return {
			className: '',
		};
	}

	constructor(props: FieldDraggerProps) {
		super(props);
		this.handleDragStart = this.handleDragStart.bind(this);
		this.handleDragEnd = this.handleDragEnd.bind(this);
	}

	handleDragStart: React.DragEventHandler<HTMLDivElement> = (event) => {
		const { onDragStart, type } = this.props;
		onDragStart(type);
	};

	handleDragEnd: React.DragEventHandler<HTMLDivElement> = (event) => {
		const { onDragStart, type } = this.props;
		onDragStart(type);
	};

	render = () => {
		const { text, className } = this.props;
		return (
			<div
				className={`${this.draggableItemClass} ${className}`}
				draggable="true"
				onDragStart={this.handleDragStart}
				onDragEnd={this.handleDragEnd}
			>
				{text}
			</div>
		);
	};
}

export default FieldDragger;
