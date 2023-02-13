import React from 'react';
import _uniqueId from 'lodash/uniqueId';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import Mousetrap from 'mousetrap';
import BoardConfigInterface from '../../../schema/interfaces/boardConfigInterface';
import Field from './Field';
import { FieldsEnum } from '../BoardKonfigurator';
import FieldWithPositionInterface from '../../../generator/interfaces/fieldWithPositionInterface';
import { BoardPosition } from '../../../generator/interfaces/boardPosition';

type BoardKonfiguratorBoardProps = {
	config: BoardConfigInterface;
	board: Array<Array<FieldWithPositionInterface>>;
	onSelect: (position: BoardPosition | null) => boolean;
	onDrop: (position: BoardPosition) => void;
};

type BoardKonfiguratorBoardState = {
	zoom: number;
	selected: BoardPosition | null;
	errorViewOpen: boolean;
};

class BoardKonfiguratorBoard extends React.Component<
	BoardKonfiguratorBoardProps,
	BoardKonfiguratorBoardState
> {
	constructor(props: BoardKonfiguratorBoardProps) {
		super(props);
		this.state = { zoom: 100, selected: null, errorViewOpen: true };
		this.handleZoom = this.handleZoom.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);

		Mousetrap.bind(['command+w', 'ctrl+w'], () => {
			const { errorViewOpen } = this.state;
			this.setState({ errorViewOpen: !errorViewOpen });
		});
	}

	handleZoom: React.WheelEventHandler<HTMLDivElement> = (event) => {
		if (event.ctrlKey) {
			const { zoom } = this.state;

			if (event.deltaY > 0) {
				if (zoom <= 10) {
					this.setState({ zoom: 10 });
					return;
				}
				this.setState({ zoom: zoom - 10 });
			} else {
				if (zoom >= 1000) {
					this.setState({ zoom: 1000 });
					return;
				}
				this.setState({ zoom: zoom + 10 });
			}
		}
	};

	handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
		if (event.ctrlKey && event.key === 'Enter') {
			this.setState({ zoom: 100 });
		}
	};

	render() {
		const board: Array<Array<JSX.Element>> = [];
		const { zoom, selected, errorViewOpen } = this.state;
		const { config, onSelect, onDrop, board: cBoard } = this.props;
		const { height, width } = config;
		for (let y = 0; y < height; y += 1) {
			const row: Array<JSX.Element> = [];
			for (let x = 0; x < width; x += 1) {
				const id = _uniqueId('field-');
				let type = FieldsEnum.GRASS;
				if (cBoard.length > 0) {
					type = cBoard[y][x].fieldEnum;
				}
				const field = (
					<Field
						key={id}
						position={{ x, y }}
						fieldSize={16}
						type={type}
						selected={
							!!(selected && selected.x === x && selected.y === y)
						}
						onSelect={(position) => {
							if (onSelect(position)) {
								this.setState({ selected: position });
								return true;
							}
							return false;
						}}
						onDrop={(position) => {
							onDrop(position);
						}}
					/>
				);
				row[x] = field;
			}
			board[y] = row;
		}
		const errorViewOpener = errorViewOpen ? (
			<BsChevronDown />
		) : (
			<BsChevronUp />
		);
		return (
			<div className="h-full max-h-full flex flex-col">
				<div
					role="link"
					tabIndex={-1}
					id="board"
					className="relative flex-grow justify-center overflow-y-auto overflow-x-auto"
					onWheel={this.handleZoom}
					onKeyDown={this.handleKeyDown}
					style={{ zoom: `${zoom}%` }}
				>
					<div className="absolute flex flex-col gap-4 items-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
						{board.map((row) => (
							<div className="flex flex-row gap-4">
								{row.map((field) => field)}
							</div>
						))}
					</div>
				</div>
				<div
					id="errors"
					className="text-white border bg-background-700 relative"
				>
					<div
						role="presentation"
						className="absolute top-[-34px] left-[-1px] p-2 border border-b-0 cursor-pointer"
						onClick={() => {
							this.setState({ errorViewOpen: !errorViewOpen });
						}}
					>
						{errorViewOpener}
					</div>
					<div className="w-fit flex flex-row justify-start">
						<button
							type="button"
							className="p-4 hover:bg-white/50 transition-colors transition"
						>
							Kritisch
						</button>
						<button
							type="button"
							className="p-4 hover:bg-white/50 transition-colors transition"
						>
							Warnung
						</button>
						<button
							type="button"
							className=" p-4 hover:bg-white/50 transition-colors transition"
						>
							Hinweis
						</button>
					</div>
					<div
						className={`${
							errorViewOpen ? 'h-[200px] border-t ' : 'h-0'
						} w-full bg-background transition-all duration-200 overflow-y-auto`}
					/>
				</div>
			</div>
		);
	}
}

export default BoardKonfiguratorBoard;
