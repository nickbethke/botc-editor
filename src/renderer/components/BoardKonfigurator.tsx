import React from 'react';
import {
	BsChevronDown,
	BsChevronUp,
	BsFillCursorFill,
	BsFillTrashFill,
} from 'react-icons/bs';
import _uniqueId from 'lodash/uniqueId';
import { symlink } from 'fs';
import Mousetrap from 'mousetrap';
import App from '../App';
import BoardConfigInterface, {
	Direction,
} from '../../schema/interfaces/boardConfigInterface';
import InputLabel from './InputLabel';
import InputValidator from '../helper/InputValidator';
import { RiverPreset } from '../../main/helper/PresetsLoader';
import BoardKonfiguratorBoard from './board/BoardKonfiguratorBoard';
import FieldDragger from './board/FieldDragger';
import FieldWithPositionInterface from '../../generator/interfaces/fieldWithPositionInterface';
import Grass from '../../generator/fields/grass';
import StartField from '../../generator/fields/startField';
import { DirectionEnum } from '../../generator/interfaces/BoardConfigInterface';
import Checkpoint from '../../generator/fields/checkpoint';
import SauronsEye from '../../generator/fields/sauronsEye';
import { BoardPosition } from '../../generator/interfaces/boardPosition';
import FieldWithPositionAndAmountInterface from '../../generator/interfaces/FieldWithPositionAndAmountInterface';
import Lembas from '../../generator/fields/lembas';
import River from '../../generator/fields/river';
import FieldWithPositionAndDirectionInterface from '../../generator/interfaces/fieldWithPositionAndDirectionInterface';
import KeyCode from './KeyCode';

type BoardKonfiguratorProps = {
	// eslint-disable-next-line react/no-unused-prop-types
	App: App;
};

export enum FieldsEnum {
	GRASS,
	START,
	CHECKPOINT,
	EYE,
	HOLE,
	LEMBAS,
	RIVER,
	WALL,
}

type BoardKonfiguratorState = {
	config: BoardConfigInterface;
	board: Array<Array<FieldWithPositionInterface>>;
	openTab: 'fields' | 'presets' | 'global';
	currentTool: 'select' | 'delete';
	presets: Array<RiverPreset>;
	isDragged: FieldsEnum | null;
	selected: BoardPosition | null;
	helpOpen: boolean;
};

// TODO: Speichern Dialog: Als Preset oder als Board
class BoardKonfigurator extends React.Component<
	BoardKonfiguratorProps,
	BoardKonfiguratorState
> {
	static default: BoardConfigInterface = {
		height: 2,
		width: 2,
		name: 'Default Board',
		checkPoints: [],
		startFields: [],
	};

	private draggableItemClass: string =
		'p-4 bg-white/10 flex text-center justify-center items-center cursor-grab border-2 border-transparent border-dashed hover:border-white';

	private tabOpenClass =
		'p-4 bg-white/25 text-center hover:bg-white/50 transition-colors transition';

	private tabClosedClass =
		'p-4 text-center hover:bg-white/50 transition-colors transition';

	constructor(props: BoardKonfiguratorProps) {
		super(props);

		this.state = {
			config: BoardKonfigurator.default,
			currentTool: 'select',
			openTab: 'fields',
			presets: [],
			isDragged: null,
			board: [],
			selected: null,
			helpOpen: false,
		};

		this.changeToPresets = this.changeToPresets.bind(this);
		// this.changeToPresets();

		this.handleDragStart = this.handleDragStart.bind(this);
		this.draggerOnDragStart = this.draggerOnDragStart.bind(this);
		this.handleBoardOnDrop = this.handleBoardOnDrop.bind(this);

		Mousetrap.bind(['command+1', 'ctrl+1'], () => {
			this.setState({ openTab: 'global' });
		});
		Mousetrap.bind(['command+2', 'ctrl+2'], () => {
			this.setState({ openTab: 'fields' });
		});
		Mousetrap.bind(['command+3', 'ctrl+3'], () => {
			this.setState({ openTab: 'presets' });
		});
		Mousetrap.bind(['command+e', 'ctrl+e'], () => {
			this.setState({ currentTool: 'select' });
		});
		Mousetrap.bind(['command+d', 'ctrl+d'], () => {
			this.setState({ currentTool: 'delete' });
		});
		Mousetrap.bind(['command+h', 'ctrl+h'], () => {
			const { helpOpen } = this.state;
			this.setState({ helpOpen: !helpOpen });
		});
	}

	changeToPresets = () => {
		this.setState({
			openTab: 'presets',
		});
		window.electron.load
			.presets()
			.then((presets) => {
				this.setState({ presets });
				return true;
			})
			.catch((e) => {
				if (!e) {
					throw Error();
				}
			});
	};

	handleDragStart: React.DragEventHandler<HTMLDivElement> = (event) => {};

	render = () => {
		const { openTab, config, board } = this.state;
		if (board.length < 1) {
			const newBoard: Array<Array<FieldWithPositionInterface>> = [];
			const { height, width } = config;
			for (let y = 0; y < height; y += 1) {
				const row: Array<FieldWithPositionInterface> = [];
				for (let x = 0; x < width; x += 1) {
					const field = new Grass({ x, y });
					row[x] = field;
				}
				newBoard[y] = row;
			}
			this.setState({ board: newBoard });
			return null;
		}

		return (
			<div className="flex flex-col h-[100vh]" role="presentation">
				<div className="dragger w-[100vw] h-8 bg-[#6b808e]" />
				<div className="grid grid-cols-4 xl:grid-cols-6 flex-grow bg-background">
					<div
						id="board-configurator-sidebar-left"
						className="w-full h-full bg-background-700 text-white flex flex-col"
					>
						<div className="p-4 text-2xl text-center">
							Board-Konfigurator
						</div>
						<div className="flex-grow border-t flex flex-col">
							<div className="flex flex-col">
								<div className="grid grid-cols-3 border-b">
									<button
										className={
											openTab === 'global'
												? this.tabOpenClass
												: this.tabClosedClass
										}
										onClick={() => {
											this.setState({
												openTab: 'global',
											});
										}}
										type="button"
									>
										Global
									</button>
									<button
										className={
											openTab === 'fields'
												? this.tabOpenClass
												: this.tabClosedClass
										}
										onClick={() => {
											this.setState({
												openTab: 'fields',
											});
										}}
										type="button"
									>
										Felder
									</button>
									<button
										className={
											openTab === 'presets'
												? this.tabOpenClass
												: this.tabClosedClass
										}
										onClick={this.changeToPresets}
										type="button"
									>
										Presets
									</button>
								</div>
							</div>
							{this.tools()}
						</div>
						<div className="grid grid-cols-3 border-t border-b">
							<button
								type="button"
								className="p-4 hover:bg-white/50 transition-colors transition"
							>
								Laden
							</button>
							<button
								type="button"
								className="p-4 hover:bg-white/50 transition-colors transition"
							>
								Speichern
							</button>
							<button
								type="button"
								className="p-4 hover:bg-white/50 transition-colors transition"
							>
								Beenden
							</button>
						</div>
					</div>
					<div className="col-span-2 xl:col-span-4">
						{this.board()}
					</div>
					{this.rightSidebar()}
				</div>
			</div>
		);
	};

	tools = () => {
		let currentTab;
		const { openTab, currentTool } = this.state;

		switch (openTab) {
			case 'fields':
				currentTab = this.fields();
				break;
			case 'presets':
				currentTab = this.presets();
				break;
			case 'global':
			default:
				currentTab = this.globals();
				break;
		}
		if (openTab === 'global')
			return (
				<div className="flex flex-col flex-grow">
					<div className="bg-white/10 flex flex-grow">
						{currentTab}
					</div>
				</div>
			);
		return (
			<div className="flex flex-col flex-grow">
				<div className="border-b">
					<div className="grid grid-cols-2">
						<button
							className={
								currentTool === 'select'
									? this.tabOpenClass
									: this.tabClosedClass
							}
							onClick={() => {
								this.setState({
									currentTool: 'select',
								});
							}}
							type="button"
						>
							<BsFillCursorFill className="text-2xl mx-auto" />
						</button>
						<button
							className={
								currentTool === 'delete'
									? this.tabOpenClass
									: this.tabClosedClass
							}
							onClick={() => {
								this.setState({
									currentTool: 'delete',
								});
							}}
							type="button"
						>
							<BsFillTrashFill className="text-2xl mx-auto" />
						</button>
					</div>
				</div>
				<div className="bg-white/10 flex flex-col flex-grow">
					{currentTab}
				</div>
			</div>
		);
	};

	draggerOnDragStart: (type: FieldsEnum) => void = (type) => {
		this.setState({ isDragged: type, currentTool: 'select' });
	};

	draggerOnDragEnd: () => void = () => {
		this.setState({ isDragged: null });
	};

	fields = () => {
		return (
			<div className="grid grid-cols-2 m-4 gap-4">
				<FieldDragger
					type={FieldsEnum.START}
					text="Start"
					onDragStart={this.draggerOnDragStart}
					onDragEnd={this.draggerOnDragEnd}
				/>
				<FieldDragger
					type={FieldsEnum.CHECKPOINT}
					text="Checkpoint"
					onDragStart={this.draggerOnDragStart}
					onDragEnd={this.draggerOnDragEnd}
				/>
				<FieldDragger
					type={FieldsEnum.EYE}
					text="Saurons Auge"
					onDragStart={this.draggerOnDragStart}
					onDragEnd={this.draggerOnDragEnd}
				/>
				<FieldDragger
					type={FieldsEnum.RIVER}
					text="Fluss"
					onDragStart={this.draggerOnDragStart}
					onDragEnd={this.draggerOnDragEnd}
				/>
				<FieldDragger
					type={FieldsEnum.LEMBAS}
					text="Lembas"
					onDragStart={this.draggerOnDragStart}
					onDragEnd={this.draggerOnDragEnd}
				/>
				<FieldDragger
					type={FieldsEnum.HOLE}
					text="Loch"
					onDragStart={this.draggerOnDragStart}
					onDragEnd={this.draggerOnDragEnd}
				/>
				<FieldDragger
					type={FieldsEnum.WALL}
					text="Wand"
					className="col-span-2"
					onDragStart={this.draggerOnDragStart}
					onDragEnd={this.draggerOnDragEnd}
				/>
			</div>
		);
	};

	presets = () => {
		const presetsElements: Array<JSX.Element> = [];
		const { presets } = this.state;
		presets.forEach((preset) => {
			const id = _uniqueId('preset-element-');
			presetsElements.push(
				<div key={id} className={this.draggableItemClass}>
					{preset.name}
				</div>
			);
		});
		return (
			<div className="grid grid-cols-2 m-4 gap-4">
				{presetsElements.map((presetsElement) => presetsElement)}
			</div>
		);
	};

	globals = () => {
		const { config, board } = this.state;
		return (
			<div className="flex flex-col flex-grow">
				<div className="flex-shrink">
					<div className="p-4">
						<InputLabel
							label="Board-Name"
							type="text"
							labelClass="text-xl"
							placeholder="Board-Name"
							value={config.name}
							onChange={(boardName) => {
								this.setState({
									config: {
										...config,
										name: boardName.toString(),
									},
								});
							}}
							validator={
								new InputValidator(InputValidator.TYPE_STRING, {
									text: {
										notEmpty: {
											error: 'Board-Name darf nicht leer sein!',
										},
									},
								})
							}
						/>
					</div>
					<div className="p-4">
						<InputLabel
							label="Breite"
							type="range"
							labelClass="text-xl"
							value={config.width}
							min={config.height === 1 ? 2 : 1}
							onChange={(width) => {
								for (let y = 0; y < board.length; y += 1) {
									const row = board[y];
									const newRow = [];
									for (let x = 0; x < width; x += 1) {
										if (x + 1 <= row.length) {
											newRow[x] = row[x];
										} else {
											newRow[x] = new Grass({ x, y });
										}
									}
									board[y] = newRow;
								}
								this.setState({
									config: {
										...config,
										width: Number.parseInt(
											width.toString(),
											10
										),
									},
									board,
								});
							}}
						/>
					</div>
					<div className="p-4">
						<InputLabel
							label="Höhe"
							type="range"
							labelClass="text-xl"
							value={config.height}
							min={config.width === 1 ? 2 : 1}
							onChange={(height) => {
								const newboard = [];
								for (let y = 0; y < height; y += 1) {
									if (y + 1 <= board.length) {
										newboard[y] = board[y];
									} else {
										const row = [];
										for (
											let x = 0;
											x < config.width;
											x += 1
										) {
											row[x] = new Grass({ x, y });
										}
										newboard[y] = row;
									}
								}

								this.setState({
									config: {
										...config,
										height: Number.parseInt(
											height.toString(),
											10
										),
									},
									board: newboard,
								});
							}}
						/>
					</div>
				</div>
				<div className="flex-grow p-4 border-t">
					<div className="text-xl">Checkpoint Reihenfolge</div>
				</div>
			</div>
		);
	};

	handleBoardOnDrop: (position: { x: number; y: number }) => void = (
		position
	) => {
		const { isDragged, config, board } = this.state;
		switch (isDragged) {
			case FieldsEnum.START:
				board[position.y][position.x] = new StartField(
					{
						x: position.x,
						y: position.y,
					},
					DirectionEnum.NORTH
				);
				this.setState({ board });
				break;
			case FieldsEnum.CHECKPOINT:
				board[position.y][position.x] = new Checkpoint(
					{
						x: position.x,
						y: position.y,
					},
					config.checkPoints.length
				);
				this.setState({ board });
				break;
			case FieldsEnum.EYE:
				board[position.y][position.x] = new SauronsEye(
					{
						x: position.x,
						y: position.y,
					},
					DirectionEnum.NORTH
				);
				this.setState({ board });
				break;
			case FieldsEnum.RIVER:
				if (!config.riverFields) config.riverFields = [];
				board[position.y][position.x] = new River(
					{
						x: position.x,
						y: position.y,
					},
					DirectionEnum.NORTH
				);
				this.setState({ board });
				break;
			default:
				break;
		}
	};

	board = () => {
		const { config, board } = this.state;
		return (
			<BoardKonfiguratorBoard
				config={config}
				board={board}
				onSelect={(position) => {
					if (position) {
						const { currentTool } = this.state;
						if (currentTool === 'delete') {
							board[position.y][position.x] = new Grass(position);
							this.setState({ board, selected: null });
							return false;
						}
						this.setState({ selected: position });
					} else {
						this.setState({ selected: null });
					}
					return true;
				}}
				onDrop={this.handleBoardOnDrop}
			/>
		);
	};

	rightSidebar = () => {
		const { selected, board, helpOpen } = this.state;
		let field: FieldWithPositionInterface | null = null;
		let option: JSX.Element | null = null;
		if (selected) {
			field = board[selected.y][selected.x];
			if (field instanceof Lembas) {
				option = (
					<InputLabel
						label="Lembas-Anzahl"
						type="range"
						value={field.amount}
						onChange={(value) => {
							(field as Lembas).amount = Number.parseInt(
								value.toString(),
								10
							);
						}}
					/>
				);
			} else if (
				field instanceof River ||
				field instanceof SauronsEye ||
				field instanceof StartField
			) {
				const id = _uniqueId('select-');
				option = (
					<div className="flex flex-col">
						<p className="text-xl">Blickrichtung</p>
						<select
							id="select-direction"
							className="bg-transparent border-b-2 text-xl px-4 py-2 focus:outline-none w-full"
							value={field.direction}
							onChange={(event) => {
								(
									board[selected.y][
										selected.x
									] as FieldWithPositionAndDirectionInterface
								).direction = Number.parseInt(
									event.target.value,
									10
								);
								this.setState({ board });
							}}
						>
							<option value={DirectionEnum.NORTH}>Norden</option>
							<option value={DirectionEnum.EAST}>Osten</option>
							<option value={DirectionEnum.SOUTH}>Süden</option>
							<option value={DirectionEnum.WEST}>Westen</option>
						</select>
					</div>
				);
			}
		}
		const helpOpener = helpOpen ? (
			<BsChevronDown className="text-xl" />
		) : (
			<BsChevronUp className="text-xl" />
		);

		return (
			<div
				id="board-configurator-sidebar-right"
				className="w-full h-full bg-background-700"
			>
				<div className="flex flex-col h-full">
					<div className="flex flex-col flex-grow text-white h-1/2">
						<div className="text-2xl text-center p-4">
							Feldeigenschaft
						</div>
						<div className="p-4">{option}</div>
					</div>
					<div>
						<div className="relative border-y text-white flex flex-col">
							<div
								role="presentation"
								className="p-4 cursor-pointer flex flex-row justify-between"
								onClick={() => {
									this.setState({ helpOpen: !helpOpen });
								}}
							>
								<div>Hilfe</div>
								<div>{helpOpener}</div>
							</div>
							<div
								className={`${
									helpOpen
										? 'h-[500px] border-t p-4'
										: 'h-0 overflow-y-hidden px-4'
								} transition-all duration-200 bg-white/25 gap-4 flex flex-col gap-4 overflow-y-auto`}
							>
								<KeyCode
									text="Hilfe öffnen"
									keyCodes={['Strg', 'H']}
								/>
								<KeyCode
									text="Warnung/Fehler Fenster"
									keyCodes={['Strg', 'W']}
								/>
								<div className="">Tabs</div>
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
								<div className="">Editor</div>
								<KeyCode
									text="Auswahl-Tool"
									keyCodes={['Strg', 'E']}
								/>
								<KeyCode
									text="Entfernen-Tool"
									keyCodes={['Strg', 'D']}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};
}

export default BoardKonfigurator;
