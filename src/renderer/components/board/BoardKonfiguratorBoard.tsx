import React from 'react';
import _uniqueId from 'lodash/uniqueId';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import Mousetrap from 'mousetrap';
import Field from './Field';
import { FieldsEnum } from '../BoardKonfigurator';
import FieldWithPositionInterface from '../generator/interfaces/fieldWithPositionInterface';
import { BoardPosition } from '../generator/interfaces/boardPosition';
import Checkpoint from '../generator/fields/checkpoint';
import KeyCode from '../KeyCode';
import Lembas from '../generator/fields/lembas';
import StartField from '../generator/fields/startField';
import SauronsEye from '../generator/fields/sauronsEye';
import River from '../generator/fields/river';
import BoardConfigInterface, {
	Position,
} from '../interfaces/BoardConfigInterface';
import BoardGenerator from '../generator/BoardGenerator';

export type BoardKonfiguratorErrorProps = {
	critical: string[];
	warning: string[];
	hints: string[];
	validation: string[];
};

type BoardKonfiguratorBoardProps = {
	config: BoardConfigInterface;
	board: Array<Array<FieldWithPositionInterface>>;
	onSelect: (position: BoardPosition | null) => boolean;
	onDrop: (position: BoardPosition) => void;
	selected: BoardPosition | null;

	errors: BoardKonfiguratorErrorProps;
};

type BoardKonfiguratorBoardState = {
	zoom: number;
	selected: BoardPosition | null;
	errorViewOpen: boolean;
	tabOpen: 'critical' | 'warning' | 'hints' | 'validation' | 'hotkeys';
};

class BoardKonfiguratorBoard extends React.Component<
	BoardKonfiguratorBoardProps,
	BoardKonfiguratorBoardState
> {
	constructor(props: BoardKonfiguratorBoardProps) {
		super(props);
		const { selected } = this.props;
		this.state = {
			zoom: 100,
			selected,
			errorViewOpen: true,
			tabOpen: 'critical',
		};
		this.handleZoom = this.handleZoom.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);

		Mousetrap.bind(['command+w', 'ctrl+w'], () => {
			const { errorViewOpen } = this.state;
			this.setState({
				errorViewOpen: !errorViewOpen,
			});
		});
		Mousetrap.bind(['command+enter', 'ctrl+enter'], () => {
			this.setState({ zoom: 100 });
		});
		Mousetrap.bind(['command++', 'ctrl++'], () => {
			const { zoom } = this.state;
			if (zoom >= 1000) {
				this.setState({ zoom: 1000 });
				return;
			}
			this.setState({ zoom: zoom + 10 });
		});
		Mousetrap.bind(['command+-', 'ctrl+-'], () => {
			const { zoom } = this.state;
			if (zoom <= 10) {
				this.setState({ zoom: 10 });
				return;
			}
			this.setState({ zoom: zoom - 10 });
		});
		Mousetrap.bind(['command+h', 'ctrl+h'], () => {
			const { errorViewOpen } = this.state;
			if (!errorViewOpen) {
				this.setState({ errorViewOpen: true, tabOpen: 'hotkeys' });
			} else {
				this.setState({ tabOpen: 'hotkeys' });
			}
		});
		Mousetrap.bind(['ctrl+f1'], () => {
			const { errorViewOpen } = this.state;
			if (!errorViewOpen) {
				this.setState({ errorViewOpen: true, tabOpen: 'critical' });
			} else {
				this.setState({ tabOpen: 'critical' });
			}
		});
		Mousetrap.bind(['ctrl+f2'], () => {
			const { errorViewOpen } = this.state;
			if (!errorViewOpen) {
				this.setState({ errorViewOpen: true, tabOpen: 'warning' });
			} else {
				this.setState({ tabOpen: 'warning' });
			}
		});
		Mousetrap.bind(['ctrl+f3'], () => {
			const { errorViewOpen } = this.state;
			if (!errorViewOpen) {
				this.setState({ errorViewOpen: true, tabOpen: 'hints' });
			} else {
				this.setState({ tabOpen: 'hints' });
			}
		});
		Mousetrap.bind(['ctrl+f4'], () => {
			const { errorViewOpen } = this.state;
			if (!errorViewOpen) {
				this.setState({ errorViewOpen: true, tabOpen: 'validation' });
			} else {
				this.setState({ tabOpen: 'validation' });
			}
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

	handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = () => {};

	errorWindow = (
		errors: { critical: string[]; warning: string[]; hints: string[] },
		type: 'critical' | 'hints' | 'warning' | 'validation'
	) => {
		let errorMessages: string[] | null = [];
		let symbol: string | null = null;
		let className = '';
		switch (type) {
			case 'critical':
				errorMessages = errors.critical;
				symbol = '!';
				className = 'text-red-400';
				break;
			case 'warning':
				errorMessages = errors.warning;
				className = 'text-orange-400';
				symbol = '!';
				break;
			case 'hints':
				errorMessages = errors.hints;
				symbol = '!';
				break;
			case 'validation':
				errorMessages = null;
				symbol = '!';
				break;
			default:
				break;
		}
		if (errorMessages && errorMessages.length) {
			return (
				<div className="px-4 py-2 bg-background font-jetbrains">
					{errorMessages.map((error) => (
						<div className={className}>
							<span className="mr-2">{symbol}</span>
							{error}
						</div>
					))}
				</div>
			);
		}
		return null;
	};

	hotKeys = () => {
		return (
			<div className="bg-white/25">
				<div className="grid 2xl:grid-cols-3 gap-2 p-2 max-w-[800px] mx-auto justify-center">
					<div className="flex flex-col mb-2 items-center">
						<p className="text-lg">Allgemein</p>
						<KeyCode text="Hilfe öffnen" keyCodes={['Strg', 'H']} />
						<KeyCode
							text="Warnung Fenster"
							keyCodes={['Strg', 'W']}
						/>
					</div>
					<div className="flex flex-col mb-2 items-center">
						<p className="text-lg">Tabs</p>
						<KeyCode
							text="Global Tab öffnen"
							keyCodes={['Strg', '1']}
						/>
						<KeyCode
							text="Felder Tab öffnen"
							keyCodes={['Strg', '2']}
						/>
						<KeyCode
							text="Presets Tab öffnen"
							keyCodes={['Strg', '3']}
						/>
					</div>
					<div className="flex flex-col mb-2 items-center">
						<p className="text-lg">Tool</p>
						<KeyCode text="Auswahl-Tool" keyCodes={['Strg', 'E']} />
						<KeyCode
							text="Entfernen-Tool"
							keyCodes={['Strg', 'D']}
						/>
					</div>
					<div className="flex flex-col mb-2 items-center">
						<p className="text-lg">Fehlerfenster</p>
						<KeyCode
							text="Kritisch öffnen"
							keyCodes={['Strg', 'F1']}
						/>
						<KeyCode
							text="Warnung öffnen"
							keyCodes={['Strg', 'F2']}
						/>
						<KeyCode
							text="Hinweis öffnen"
							keyCodes={['Strg', 'F3']}
						/>
						<KeyCode
							text="Validierungshilfe öffnen"
							keyCodes={['Strg', 'F3']}
						/>
					</div>
					<div className="flex flex-col mb-2 items-center 2xl:col-span-2">
						<p className="text-lg">Board</p>
						<KeyCode
							text="Auswahl bewegen"
							keyCodes={['↑', '↓', '←', '→']}
							delimiter=""
						/>
						<KeyCode
							text="Zoom 100%"
							keyCodes={['Strg', 'Enter']}
						/>
						<KeyCode text="Zoom + 10%" keyCodes={['Strg', '+']} />
						<KeyCode text="Zoom - 10%" keyCodes={['Strg', '-']} />
					</div>
				</div>
			</div>
		);
	};

	private buildBoard() {
		const board: Array<Array<JSX.Element>> = [];
		const { selected } = this.state;
		const {
			config,
			onSelect,
			onDrop,
			board: cBoard,
			selected: propsSelected,
		} = this.props;
		if (propsSelected && selected !== propsSelected) {
			this.setState({ selected: propsSelected });
		}

		const { height, width } = config;
		for (let y = 0; y < height; y += 1) {
			const row: Array<JSX.Element> = [];
			for (let x = 0; x < width; x += 1) {
				const boardField = cBoard[y][x];
				const id = _uniqueId('field-');
				let type = FieldsEnum.GRASS;
				let attribute = null;
				if (cBoard.length > 0) {
					type = cBoard[y][x].fieldEnum;
				}
				if (boardField instanceof Checkpoint) {
					attribute = boardField.order;
				}
				if (boardField instanceof Lembas) {
					attribute = boardField.amount;
				}
				if (
					boardField instanceof StartField ||
					boardField instanceof SauronsEye ||
					boardField instanceof River
				) {
					attribute = boardField.direction;
				}
				const wallsToBuild = [];
				if (config.walls) {
					for (let i = 0; i < config.walls.length; i += 1) {
						const item: Position[] = config.walls[i];
						const currentPositionString =
							BoardGenerator.position2String(
								BoardGenerator.positionToBoardPosition([x, y])
							);
						const s1 = BoardGenerator.position2String(
							BoardGenerator.positionToBoardPosition(item[0])
						);
						const s2 = BoardGenerator.position2String(
							BoardGenerator.positionToBoardPosition(item[1])
						);
						if (
							currentPositionString === s1 ||
							currentPositionString === s2
						) {
							wallsToBuild.push(item);
						}
					}
				}

				row[x] = (
					<Field
						key={id}
						boardSize={{ width, height }}
						position={{ x, y }}
						fieldSize={16}
						wallThickness={2}
						wallsToBuild={wallsToBuild}
						type={type}
						selected={
							!!(selected && selected.x === x && selected.y === y)
						}
						attribute={attribute}
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
			}
			board[y] = row;
		}
		return { board };
	}

	render() {
		const { zoom, errorViewOpen, tabOpen } = this.state;
		const { errors } = this.props;
		const { board } = this.buildBoard();
		const errorViewOpener = errorViewOpen ? (
			<BsChevronDown />
		) : (
			<BsChevronUp />
		);

		let errorWindow = null;
		switch (tabOpen) {
			case 'hotkeys':
				errorWindow = this.hotKeys();
				break;
			case 'critical':
			case 'warning':
			case 'hints':
			case 'validation':
				errorWindow = this.errorWindow(errors, tabOpen);
				break;
			default:
				break;
		}

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
					<div className="absolute flex flex-col items-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#5c9621] rounded p-6">
						{board.map((row) => (
							<div key={_uniqueId()} className="flex flex-row">
								{row.map((field) => field)}
							</div>
						))}
					</div>
				</div>
				<div
					id="errors"
					className="text-white border border-t-0 bg-background-700 relative"
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
					<div className="w-full h-1 bg-white cursor-row-resize" />
					<div className="w-full flex flex-row justify-start">
						<button
							type="button"
							className={`${
								tabOpen === 'critical' ? 'bg-white/25' : ''
							} p-4 hover:bg-white/50 transition-colors transition`}
							onClick={() => {
								this.setState({
									tabOpen: 'critical',
									errorViewOpen: true,
								});
							}}
						>
							Kritisch{' '}
							{errors.critical.length > 0 ? (
								<span className="font-jetbrains">
									({errors.critical.length})
								</span>
							) : null}
						</button>
						<button
							type="button"
							className={`${
								tabOpen === 'warning' ? 'bg-white/25' : ''
							} p-4 hover:bg-white/50 transition-colors transition`}
							onClick={() => {
								this.setState({
									tabOpen: 'warning',
									errorViewOpen: true,
								});
							}}
						>
							Warnung{' '}
							{errors.warning.length > 0 ? (
								<span className="font-jetbrains">
									({errors.warning.length})
								</span>
							) : null}
						</button>
						<button
							type="button"
							className={`${
								tabOpen === 'hints' ? 'bg-white/25' : ''
							} p-4 hover:bg-white/50 transition-colors transition`}
							onClick={() => {
								this.setState({
									tabOpen: 'hints',
									errorViewOpen: true,
								});
							}}
						>
							Hinweis{' '}
							{errors.hints.length > 0 ? (
								<span className="font-jetbrains">
									({errors.hints.length})
								</span>
							) : null}
						</button>
						<button
							type="button"
							className={`${
								tabOpen === 'validation' ? 'bg-white/25' : ''
							} border-x p-4 hover:bg-white/50 transition-colors transition`}
							onClick={() => {
								this.setState({
									tabOpen: 'validation',
									errorViewOpen: true,
								});
							}}
						>
							Validierung{' '}
							{errors.validation.length > 0 ? (
								<span className="font-jetbrains">
									({errors.validation.length})
								</span>
							) : null}
						</button>
						<button
							type="button"
							className={`${
								tabOpen === 'hotkeys' ? 'bg-white/25' : ''
							} border-l p-4 hover:bg-white/50 transition-colors transition ml-auto`}
							onClick={() => {
								this.setState({
									tabOpen: 'hotkeys',
									errorViewOpen: true,
								});
							}}
						>
							Hotkeys
						</button>
					</div>
					<div
						className={`${
							errorViewOpen ? 'h-[250px] border-t ' : 'h-0'
						} w-full bg-background-700 transition-all duration-200 overflow-y-auto`}
					>
						{errorWindow}
					</div>
				</div>
			</div>
		);
	}
}

export default BoardKonfiguratorBoard;
