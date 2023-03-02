import React from 'react';
import _uniqueId from 'lodash/uniqueId';
import startFieldImage from '../../../../assets/images/start.png';
import checkpointImage from '../../../../assets/images/checkpoint.png';
import eyeImage from '../../../../assets/images/eye.png';
import riverImage from '../../../../assets/images/river.png';
import lembasImage from '../../../../assets/images/lembas.png';
import holeImage from '../../../../assets/images/hole.png';
import wallImage from '../../../../assets/images/wall.png';

import { BoardPosition } from '../generator/interfaces/boardPosition';
import { DirectionEnum, Position } from '../interfaces/BoardConfigInterface';
import BoardGenerator, { FieldsEnum } from '../generator/BoardGenerator';

type FieldProps = {
	type: FieldsEnum;
	onSelect: (position: BoardPosition | null) => boolean;
	onDrop: (position: BoardPosition) => void;
	fieldSize: number;
	wallThickness: number;
	position: BoardPosition;
	selected: boolean;
	attribute: DirectionEnum | number | null;
	boardSize: { width: number; height: number };
	wallsToBuild: Array<Position[]>;
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
		const {
			fieldSize,
			wallThickness,
			position,
			onDrop,
			type,
			selected,
			attribute,
			boardSize,
			wallsToBuild,
		} = this.props;
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

		const currentPositionString =
			BoardGenerator.boardPosition2String(position);
		const walls = { east: false, south: false };
		for (let i = 0; i < wallsToBuild.length; i += 1) {
			const item: Position[] = wallsToBuild[i];

			const s2 = BoardGenerator.boardPosition2String(
				BoardGenerator.positionToBoardPosition(item[1])
			);
			const toWallPosition =
				currentPositionString === s2 ? item[0] : item[1];
			if (toWallPosition[0] === position.x + 1) {
				walls.east = true;
			}
			if (toWallPosition[1] === position.y + 1) {
				walls.south = true;
			}
		}

		let eastWall = null;
		if (boardSize.width !== position.x + 1) {
			eastWall = walls.east ? (
				<div
					style={{
						height: `${fieldSize / 4}em`,
						width: `${wallThickness / 4}em`,
						backgroundImage: `url(${wallImage})`,
						backgroundSize: 'cover',
					}}
				/>
			) : (
				<div
					className={`${dragOver ? 'bg-red-400' : ''}`}
					style={{
						height: `${fieldSize / 4}em`,
						width: `${wallThickness / 4}em`,
					}}
				/>
			);
		}
		let southWall = null;
		if (boardSize.height !== position.y + 1) {
			southWall = walls.south ? (
				<div
					style={{
						width: `${fieldSize / 4}em`,
						height: `${wallThickness / 4}em`,
						backgroundImage: `url(${wallImage})`,
						backgroundSize: 'cover',
					}}
				/>
			) : (
				<div
					className={`${dragOver ? 'bg-red-400' : ''}`}
					style={{
						width: `${fieldSize / 4}em`,
						height: `${wallThickness / 4}em`,
					}}
				/>
			);
		}
		return (
			<div
				className="flex flex-col"
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
				onDrop={() => {
					if (dragOver) this.setState({ dragOver: false });
					onDrop(position);
				}}
			>
				<div className="flex flex-row">
					<button
						type="button"
						key={id}
						className={`${
							selected ? 'rounded border-red-400' : ''
						} ${
							dragOver ? 'border-dashed' : ''
						} relative border hover:bg-white/25 text-transparent`}
						style={{
							height: `${fieldSize / 4}em`,
							width: `${fieldSize / 4}em`,
							backgroundImage: `url(${image})`,
							backgroundPosition: 'center',
							backgroundSize: 'contain',
							backgroundRepeat: 'no-repeat',
						}}
						tabIndex={-1}
						onClick={this.handleClick}
					>
						{textElement}
					</button>
					<div
						className={
							boardSize.width !== position.x + 1 ? 'px-2' : ''
						}
					>
						{eastWall}
					</div>
				</div>
				<div
					className={
						boardSize.height !== position.y + 1 ? 'py-2' : ''
					}
				>
					{southWall}
				</div>
			</div>
		);
	}
}

export default Field;
