import React from 'react';
import _uniqueId from 'lodash/uniqueId';
import { FieldsEnum } from '../BoardKonfigurator';
import startFieldImage from '../../../../assets/images/start.png';
import checkpointImage from '../../../../assets/images/checkpoint.png';
import eyeImage from '../../../../assets/images/eye.png';
import riverImage from '../../../../assets/images/river.png';
import lembasImage from '../../../../assets/images/lembas.png';
import holeImage from '../../../../assets/images/hole.png';

import { BoardPosition } from '../generator/interfaces/boardPosition';
import { DirectionEnum } from '../interfaces/BoardConfigInterface';

type FieldProps = {
	type: FieldsEnum;
	onSelect: (position: BoardPosition | null) => boolean;
	onDrop: (position: BoardPosition) => void;
	fieldSize: number;
	position: BoardPosition;
	selected: boolean;
	attribute: DirectionEnum | number | null;
};
type FieldStats = {
	dragOver: boolean;
};

const DirectionArrows: string[] = ['↑', '→', '↓', '←'];

class Field extends React.Component<FieldProps, FieldStats> {
	constructor(props: FieldProps) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
		this.state = { dragOver: false };
	}

	handleClick = () => {
		const { onSelect, position, selected } = this.props;
		if (selected) {
			onSelect(null);
		} else {
			onSelect(position);
		}
	};

	render() {
		const { fieldSize, position, onDrop, type, selected, attribute } =
			this.props;
		const { dragOver } = this.state;
		const id = _uniqueId('field-');
		let image = null;
		let text = null;
		switch (type) {
			case FieldsEnum.START:
				image = startFieldImage;
				text = DirectionArrows[attribute as DirectionEnum];
				break;
			case FieldsEnum.CHECKPOINT:
				image = checkpointImage;
				text = ((attribute as number) + 1).toString();
				break;
			case FieldsEnum.EYE:
				image = eyeImage;
				text = DirectionArrows[attribute as DirectionEnum];
				break;
			case FieldsEnum.RIVER:
				image = riverImage;
				text = DirectionArrows[attribute as DirectionEnum];
				break;
			case FieldsEnum.LEMBAS:
				image = lembasImage;
				text = (attribute as number).toString();
				break;
			case FieldsEnum.HOLE:
				image = holeImage;
				break;
			default:
		}
		const textElement = text ? (
			<div className="absolute bottom-0 right-0 flex items-center justify-center">
				<span className="text-2xl px-1 font-mono font-black text-white bg-gray-900/75">
					{text}
				</span>
			</div>
		) : null;

		return (
			<div>
				<button
					type="button"
					key={id}
					className={`${selected ? 'rounded border-red-400' : ''} ${
						dragOver ? 'border-dashed' : ''
					} relative border-2 hover:bg-white/25 text-transparent`}
					style={{
						height: `${fieldSize / 4}em`,
						width: `${fieldSize / 4}em`,
						backgroundImage: `url(${image})`,
						backgroundPosition: 'center',
						backgroundSize: 'contain',
						backgroundRepeat: 'no-repeat',
						backgroundColor: '#5fa01e',
					}}
					tabIndex={-1}
					onClick={this.handleClick}
					onDrop={() => {
						if (dragOver) this.setState({ dragOver: false });
						onDrop(position);
					}}
					onDragOver={(event) => {
						event.preventDefault();
					}}
					onDragLeave={() => {
						if (dragOver) this.setState({ dragOver: false });
					}}
					onDragEnter={() => {
						if (!dragOver) this.setState({ dragOver: true });
					}}
					onDragExit={() => {
						if (dragOver) this.setState({ dragOver: false });
					}}
				>
					{textElement}
				</button>
			</div>
		);
	}
}

export default Field;
