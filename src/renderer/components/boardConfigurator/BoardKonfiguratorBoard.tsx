import React from 'react';
import _uniqueId from 'lodash/uniqueId';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import Mousetrap from 'mousetrap';
import Field from './Field';
import FieldWithPositionInterface from '../generator/interfaces/FieldWithPositionInterface';
import { BoardPosition } from '../generator/interfaces/boardPosition';
import KeyCode from '../KeyCode';
import Lembas from '../generator/fields/Lembas';
import River from '../generator/fields/River';
import BoardConfigInterface, {
	Position,
} from '../interfaces/BoardConfigInterface';
import BoardGenerator, { FieldsEnum } from '../generator/BoardGenerator';
import Checkpoint from '../generator/fields/Checkpoint';

export type ErrorWindows = 'critical' | 'hints' | 'warning' | 'validation';
export type HelperWindows = ErrorWindows | 'config' | 'hotkeys';

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
	hasDragger: boolean;
	errors: BoardKonfiguratorErrorProps;
};

type BoardKonfiguratorBoardState = {
	zoom: number;
	selected: BoardPosition | null;
	errorViewOpen: boolean;
	tabOpen: HelperWindows;
	window: { width: number; height: number };
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
			window: { width: window.innerWidth, height: window.innerHeight },
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
		errors: {
			critical: string[];
			warning: string[];
			hints: string[];
			validation: string[];
		},
		type: ErrorWindows
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
				errorMessages = errors.validation;
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

	configPreview = () => {
		const { config } = this.props;
		return (
			<div className="px-4 py-2 bg-background font-jetbrains">
				<pre>{JSON.stringify(config, null, 4)}</pre>
			</div>
		);
	};

	hotKeys = () => {
		return (
			<div className="bg-[#1d234c]">
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
							keyCodes={['Strg', 'F4']}
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
				if (boardField.fieldEnum === FieldsEnum.CHECKPOINT) {
					attribute = (boardField as Checkpoint).order;
				}

				if (boardField.fieldEnum === FieldsEnum.LEMBAS) {
					attribute = (boardField as Lembas).amount;
				}

				if (
					boardField.fieldEnum === FieldsEnum.START ||
					boardField.fieldEnum === FieldsEnum.EYE ||
					boardField.fieldEnum === FieldsEnum.RIVER
				) {
					attribute = (boardField as River).direction;
				}
				const wallsToBuild = [];
				if (config.walls) {
					for (let i = 0; i < config.walls.length; i += 1) {
						const item: Position[] = config.walls[i];
						const currentPositionString =
							BoardGenerator.boardPosition2String(
								BoardGenerator.positionToBoardPosition([x, y])
							);
						const s1 = BoardGenerator.boardPosition2String(
							BoardGenerator.positionToBoardPosition(item[0])
						);
						const s2 = BoardGenerator.boardPosition2String(
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
		const {
			zoom,
			errorViewOpen,
			tabOpen,
			window: browserWindow,
		} = this.state;
		const { errors, hasDragger } = this.props;
		const { board } = this.buildBoard();
		const errorViewOpener = errorViewOpen ? (
			<BsChevronDown />
		) : (
			<BsChevronUp />
		);
		const draggerHeight: number = hasDragger ? 32 : 0;
		const errorViewHeight: number = errorViewOpen ? 287 : 36;
		const boardViewHeight =
			browserWindow.height - errorViewHeight - draggerHeight;

		window.addEventListener(
			'resize',
			() => {
				this.setState({
					window: {
						width: window.innerWidth,
						height: window.innerHeight,
					},
				});
			},
			{ once: true }
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
			case 'config':
				errorWindow = this.configPreview();
				break;
			default:
				break;
		}
		// TODO: Zoom: oberer Rand verschwindet
		return (
			<div className="h-full max-h-full flex flex-col">
				<div
					role="presentation"
					tabIndex={-1}
					id="board"
					className="relative flex-grow justify-center overflow-y-auto overflow-x-auto p-4 transition-all"
					onWheel={this.handleZoom}
					onKeyDown={this.handleKeyDown}
					style={{ height: `${boardViewHeight}px` }}
				>
					<div className="relative w-full flex items-center h-full">
						<div
							className="flex flex-col items-center bg-[#5c9621] rounded p-6 w-fit mx-auto"
							style={{
								transform: `scale(${zoom / 100})`,
							}}
						>
							{board.map((row) => (
								<div
									key={_uniqueId()}
									className="flex flex-row"
								>
									{row.map((field) => field)}
								</div>
							))}
						</div>
					</div>
				</div>
				<div
					id="errors"
					className="text-white border-t border-gray-600 bg-background-700 relative"
				>
					<div
						role="presentation"
						className="absolute top-[-34px] left-[-1px] p-2 border border-b-0 border-gray-600 cursor-pointer bg-background-700"
						onClick={() => {
							this.setState({ errorViewOpen: !errorViewOpen });
						}}
					>
						{errorViewOpener}
					</div>
					<div className="w-full flex flex-row justify-start font-jetbrains">
						<button
							type="button"
							className={`${
								tabOpen === 'critical' ? 'bg-white/25' : ''
							} p-2 hover:bg-white/50 transition-colors 2xl:text-md text-sm transition`}
							onClick={() => {
								this.setState({
									tabOpen: 'critical',
									errorViewOpen: true,
								});
							}}
						>
							Kritisch{' '}
							{errors.critical.length > 0 ? (
								<span>({errors.critical.length})</span>
							) : null}
						</button>
						<button
							type="button"
							className={`${
								tabOpen === 'warning' ? 'bg-white/25' : ''
							} p-2 hover:bg-white/50 transition-colors 2xl:text-md text-sm transition`}
							onClick={() => {
								this.setState({
									tabOpen: 'warning',
									errorViewOpen: true,
								});
							}}
						>
							Warnung{' '}
							{errors.warning.length > 0 ? (
								<span>({errors.warning.length})</span>
							) : null}
						</button>
						<button
							type="button"
							className={`${
								tabOpen === 'hints' ? 'bg-white/25' : ''
							} p-2 hover:bg-white/50 transition-colors 2xl:text-md text-sm transition`}
							onClick={() => {
								this.setState({
									tabOpen: 'hints',
									errorViewOpen: true,
								});
							}}
						>
							Hinweis{' '}
							{errors.hints.length > 0 ? (
								<span>({errors.hints.length})</span>
							) : null}
						</button>
						<button
							type="button"
							className={`${
								tabOpen === 'validation' ? 'bg-white/25' : ''
							} border-l border-gray-600 p-2 hover:bg-white/50 transition-colors 2xl:text-md text-sm transition`}
							onClick={() => {
								this.setState({
									tabOpen: 'validation',
									errorViewOpen: true,
								});
							}}
						>
							Validierung{' '}
							{errors.validation.length > 0 ? (
								<span>({errors.validation.length})</span>
							) : null}
						</button>
						<button
							type="button"
							className={`${
								tabOpen === 'config' ? 'bg-white/25' : ''
							} border-x border-gray-600 p-2 hover:bg-white/50 transition-colors 2xl:text-md text-sm transition`}
							onClick={() => {
								this.setState({
									tabOpen: 'config',
									errorViewOpen: true,
								});
							}}
						>
							Konfiguration
						</button>
						<button
							type="button"
							className={`${
								tabOpen === 'hotkeys' ? 'bg-white/25' : ''
							} border-l border-gray-600 p-2 hover:bg-white/50 transition-colors 2xl:text-md text-sm transition ml-auto`}
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
							errorViewOpen
								? 'h-[250px] border-t  border-gray-600'
								: 'h-0'
						} w-full bg-background-700 overflow-y-auto transition-all`}
					>
						{errorWindow}
					</div>
				</div>
			</div>
		);
	}
}

export default BoardKonfiguratorBoard;
