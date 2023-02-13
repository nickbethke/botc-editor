import React from 'react';
import _uniqueId from 'lodash/uniqueId';
import { FieldsEnum } from '../BoardKonfigurator';
import startFieldImage from '../../../../assets/images/start.png';
import checkpointImage from '../../../../assets/images/checkpoint.png';
import eyeImage from '../../../../assets/images/eye.png';
import riverImage from '../../../../assets/images/river.png';

import { BoardPosition } from '../../../generator/interfaces/boardPosition';

type FieldProps = {
	type: FieldsEnum;
	onSelect: (position: BoardPosition | null) => boolean;
	onDrop: (position: BoardPosition) => void;
	fieldSize: number;
	position: BoardPosition;
	selected: boolean;
};
type FieldStats = {
	dragOver: boolean;
};

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
		const { fieldSize, position, onDrop, type, selected } = this.props;
		const { dragOver } = this.state;
		const id = _uniqueId('field-');
		let image = null;
		switch (type) {
			case FieldsEnum.START:
				image = startFieldImage;
				break;
			case FieldsEnum.CHECKPOINT:
				image = checkpointImage;
				break;
			case FieldsEnum.EYE:
				image = eyeImage;
				break;
			case FieldsEnum.RIVER:
				image = riverImage;
				break;
			default:
		}

		return (
			<button
				type="button"
				key={id}
				className={`${selected ? 'border-red-400' : ''} ${
					dragOver ? 'border-dashed' : ''
				} border rounded hover:bg-white/25 text-transparent`}
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
				onDrop={(event) => {
					if (dragOver) this.setState({ dragOver: false });
					onDrop(position);
				}}
				onDragOver={(event) => {
					event.preventDefault();
				}}
				onDragLeave={(event) => {
					if (dragOver) this.setState({ dragOver: false });
				}}
				onDragEnter={(event) => {
					if (!dragOver) this.setState({ dragOver: true });
				}}
				onDragExit={(event) => {
					if (dragOver) this.setState({ dragOver: false });
				}}
			>
				Field
			</button>
		);
	}
}

export default Field;
