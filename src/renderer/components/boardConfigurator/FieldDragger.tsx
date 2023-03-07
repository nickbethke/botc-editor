import React from 'react';
import { FieldsEnum } from '../generator/BoardGenerator';

type FieldDraggerProps = {
	className?: string;
	text: string;
	type: FieldsEnum;
	onDragStart: (type: FieldsEnum) => void;
	onDragEnd: () => void;
	icon?: string | false;
};

class FieldDragger extends React.Component<FieldDraggerProps, never> {
	private draggableItemClass: string =
		'p-2 bg-white/10 flex text-center justify-center items-center cursor-grab border-2 border-transparent border-dashed hover:border-white';

	static get defaultProps() {
		return {
			className: '',
			icon: false,
		};
	}

	constructor(props: FieldDraggerProps) {
		super(props);
		this.handleDragStart = this.handleDragStart.bind(this);
		this.handleDragEnd = this.handleDragEnd.bind(this);
	}

	handleDragStart: React.DragEventHandler<HTMLDivElement> = () => {
		const { onDragStart, type } = this.props;
		onDragStart(type);
	};

	handleDragEnd: React.DragEventHandler<HTMLDivElement> = () => {
		const { onDragEnd } = this.props;
		onDragEnd();
	};

	render = () => {
		const { text, className, icon } = this.props;
		return (
			<div
				className={`${this.draggableItemClass} ${className}`}
				draggable
				onDragStart={this.handleDragStart}
				onDragEnd={this.handleDragEnd}
			>
				{icon ? (
					<div
						className="flex flex-col justify-center items-center gap-2"
						title={text}
					>
						<img
							alt={text}
							src={icon}
							className="border border-gray-600 bg-white/25 2xl:w-16 xl:w-14 w-12 rounded-2xl"
						/>
						<span
							className="font-jetbrains"
							style={{ fontSize: '0.5rem' }}
						>
							{text}
						</span>
					</div>
				) : (
					<span>{text}</span>
				)}
			</div>
		);
	};
}

export default FieldDragger;
