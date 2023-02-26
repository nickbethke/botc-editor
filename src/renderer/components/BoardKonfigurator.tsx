import React, { MouseEventHandler } from 'react';
import { BsFillCursorFill, BsFillTrashFill } from 'react-icons/bs';
import _uniqueId from 'lodash/uniqueId';
import Mousetrap from 'mousetrap';
import { ProgressBar } from 'react-loader-spinner';
import InputLabel, { OnChangeFunctionInputLabel } from './InputLabel';
import InputValidator from '../helper/InputValidator';
import { RiverPreset } from '../../main/helper/PresetsLoader';
import BoardKonfiguratorBoard, {
	BoardKonfiguratorErrorProps,
} from './board/BoardKonfiguratorBoard';
import FieldDragger from './board/FieldDragger';
import FieldWithPositionInterface from './generator/interfaces/fieldWithPositionInterface';
import Grass from './generator/fields/grass';
import StartField from './generator/fields/startField';
import BoardConfigInterface, {
	DirectionEnum,
} from './interfaces/BoardConfigInterface';
import Checkpoint from './generator/fields/checkpoint';
import SauronsEye from './generator/fields/sauronsEye';
import { BoardPosition } from './generator/interfaces/boardPosition';
import River from './generator/fields/river';
import FieldWithPositionAndDirectionInterface from './generator/interfaces/fieldWithPositionAndDirectionInterface';
import CheckpointSortable from './board/CheckpointSortable';
import FieldWithPositionAndAmountInterface from './generator/interfaces/FieldWithPositionAndAmountInterface';
import Hole from './generator/fields/hole';
import ConfirmPopup from './ConfirmPopup';
import BoardGenerator from './generator/BoardGenerator';
import Lembas from './generator/fields/lembas';
import Popup from './Popup';
import RandomBoardStartValuesDialog from './RandomBoardStartValuesDialog';

type BoardKonfiguratorProps = {
	generator?: BoardGenerator | null;
	json?: BoardConfigInterface | null;
	onClose: () => void;
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
	checkpoints: Array<Checkpoint>;
	leave: boolean;
	os: NodeJS.Platform;
	loading: boolean;
	error: string | null;
	random: boolean;
};

// TODO: Speichern Dialog: Als Preset oder als Board
// TODO: Walls!!!
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
		eye: { position: [0, 0], direction: 'NORTH' },
	};

	static defaultState: BoardKonfiguratorState = {
		config: BoardKonfigurator.default,
		currentTool: 'select',
		openTab: 'fields',
		presets: [],
		isDragged: null,
		board: BoardGenerator.jsonToBoard(BoardKonfigurator.default),
		selected: BoardGenerator.positionToBoardPosition(
			BoardKonfigurator.default.eye.position
		),
		checkpoints: BoardGenerator.checkpointsPositionArrayToCheckpointArray(
			BoardGenerator.positionArrayToBoardPositionArray(
				BoardKonfigurator.default.checkPoints
			)
		),
		leave: false,
		os: 'win32',
		loading: false,
		error: null,
		random: false,
	};

	private draggableItemClass: string =
		'p-4 bg-white/10 flex text-center justify-center items-center cursor-grab border-2 border-transparent border-dashed hover:border-white';

	private tabOpenClass =
		'p-4 bg-white/25 text-center hover:bg-white/50 transition-colors transition';

	private tabClosedClass =
		'p-4 text-center hover:bg-white/50 transition-colors transition';

	static get defaultProps() {
		return {
			generator: null,
			json: null,
		};
	}

	constructor(props: BoardKonfiguratorProps) {
		super(props);
		const { generator, json } = this.props;

		if (json) {
			try {
				this.state = {
					config: { ...BoardKonfigurator.default, ...json },
					currentTool: 'select',
					openTab: 'fields',
					presets: [],
					isDragged: null,
					board: BoardGenerator.jsonToBoard(
						json as BoardConfigInterface
					),
					selected: null,
					checkpoints:
						BoardGenerator.checkpointsPositionArrayToCheckpointArray(
							BoardGenerator.positionArrayToBoardPositionArray(
								json.checkPoints
							)
						),
					leave: false,
					os: 'win32',
					loading: false,
					error: null,
					random: false,
				};
			} catch (e) {
				if (e instanceof Error)
					this.state = {
						...BoardKonfigurator.defaultState,
						loading: false,
						error:
							`Invalides JSON für eine Board-Konfiguration\n` +
							`${e.message}`,
					};
			}
		} else if (generator) {
			this.state = {
				config: {
					...BoardKonfigurator.default,
					...generator.boardJSON,
				},
				currentTool: 'select',
				openTab: 'fields',
				presets: [],
				isDragged: null,
				board: generator.board,
				selected: null,
				checkpoints:
					BoardGenerator.checkpointsPositionArrayToCheckpointArray(
						generator.checkpoints
					),
				leave: false,
				os: 'win32',
				loading: false,
				error: null,
				random: false,
			};
		} else {
			this.state = BoardKonfigurator.defaultState;
		}

		window.electron.app
			.getOS()
			.then((platform) => {
				this.setState({ os: platform });
				return true;
			})
			.catch((e) => {
				if (!e) {
					this.setState({ error: 'OS not detected' });
				}
			});

		this.changeToPresets = this.changeToPresets.bind(this);
		// this.changeToPresets();

		this.draggerOnDragStart = this.draggerOnDragStart.bind(this);
		this.handleBoardOnDrop = this.handleBoardOnDrop.bind(this);

		this.onCheckpointSortUpdate = this.onCheckpointSortUpdate.bind(this);

		this.onWidthChange = this.onWidthChange.bind(this);
		this.onHeightChange = this.onHeightChange.bind(this);

		this.abortBackToHomeScreen = this.abortBackToHomeScreen.bind(this);
		this.openBoardConfig = this.openBoardConfig.bind(this);

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

		Mousetrap.bind(['up'], () => {
			const { selected } = this.state;
			if (selected && selected.y > 0) {
				this.setState({
					selected: { y: selected.y - 1, x: selected.x },
				});
			}
		});
		Mousetrap.bind(['down'], () => {
			const { selected, config } = this.state;
			if (selected && selected.y < config.height - 1) {
				this.setState({
					selected: { y: selected.y + 1, x: selected.x },
				});
			}
		});
		Mousetrap.bind(['left'], () => {
			const { selected } = this.state;
			if (selected && selected.x > 0) {
				this.setState({
					selected: { y: selected.y, x: selected.x - 1 },
				});
			}
		});
		Mousetrap.bind(['right'], () => {
			const { selected, config } = this.state;
			if (selected && selected.x < config.width - 1) {
				this.setState({
					selected: { y: selected.y, x: selected.x + 1 },
				});
			}
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

	backToHomeScreen = () => {
		const { onClose } = this.props;
		onClose();
	};

	abortBackToHomeScreen = () => {
		this.setState({ leave: false });
	};

	openBoardConfig: MouseEventHandler<HTMLButtonElement> = async () => {
		this.setState({ loading: true });
		const boardJSON = await window.electron.dialog.openBoardConfig();
		if (boardJSON) {
			try {
				this.setState({
					config: { ...BoardKonfigurator.default, ...boardJSON },
					selected: null,
					board: BoardGenerator.jsonToBoard(boardJSON),
					checkpoints:
						BoardGenerator.checkpointsPositionArrayToCheckpointArray(
							BoardGenerator.positionArrayToBoardPositionArray(
								boardJSON.checkPoints
							)
						),
					loading: false,
				});
			} catch (e) {
				if (e instanceof Error)
					this.setState({
						loading: false,
						error:
							`Invalides JSON für eine Board-Konfiguration\n` +
							`${e.message}`,
					});
			}
		} else {
			this.setState({ loading: false });
		}
	};

	render = () => {
		const { openTab, config, board, leave, os, loading, error, random } =
			this.state;
		if (board.length < 1) {
			const newBoard: Array<Array<FieldWithPositionInterface>> = [];
			const { height, width } = config;
			for (let y = 0; y < height; y += 1) {
				const row: Array<FieldWithPositionInterface> = [];
				for (let x = 0; x < width; x += 1) {
					row[x] = new Grass({ x, y });
				}
				newBoard[y] = row;
			}
			this.setState({ board: newBoard });
			return null;
		}
		let popup: JSX.Element | null = null;
		if (leave) {
			popup = (
				<ConfirmPopup
					label="Board-Konfigurator wirklich verlassen?"
					text="Alle ungespeicherten Änderungen werden verworfen."
					onConfirm={this.backToHomeScreen}
					onAbort={this.abortBackToHomeScreen}
				/>
			);
		}
		if (loading) {
			popup = (
				<Popup
					label="Lädt Board-Konfiguration"
					content={
						<ProgressBar
							wrapperClass="text-center mx-auto justify-center"
							borderColor="#ffffff"
							barColor="#71C294"
							width="80"
						/>
					}
					onClose={() => {}}
				/>
			);
		}
		if (error) {
			popup = (
				<Popup
					label="Fehler"
					content={<pre>{error}</pre>}
					onClose={() => {
						this.setState({ error: null });
					}}
				/>
			);
		}
		if (random) {
			popup = (
				<RandomBoardStartValuesDialog
					onClose={() => {
						this.setState({ random: false });
					}}
					onGenerated={(generator) =>
						this.setState({
							config: {
								...BoardKonfigurator.default,
								...generator.boardJSON,
							},
							board: generator.board,
							checkpoints:
								BoardGenerator.checkpointsPositionArrayToCheckpointArray(
									generator.checkpoints
								),
							random: false,
						})
					}
				/>
			);
		}
		// TODO: Speichern
		// TODO: Update config, wenn was am Board geändert wird (Array<Array<FieldWithPositionInterface>> 2 BoardConfigInterface)
		// TODO: Error Tab -> Validation
		return (
			<div className="flex flex-col h-[100vh] text-white">
				{os === 'win32' ? (
					<div className="dragger w-[100vw] h-8 bg-[#6b808e]" />
				) : null}
				<div className="grid grid-cols-4 2xl:grid-cols-6 flex-grow bg-background">
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
						<div className="border-t border-b">
							<button
								type="button"
								className="p-4 hover:bg-white/50 transition-colors transition w-full"
								onClick={() => {
									this.setState({ random: true });
								}}
							>
								Zufälliges Board
							</button>
						</div>
						<div className="grid grid-cols-3 border-t border-b">
							<button
								type="button"
								className="p-4 hover:bg-white/50 transition-colors transition"
								onClick={this.openBoardConfig}
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
								onClick={() => {
									this.setState({ leave: true });
								}}
							>
								Beenden
							</button>
						</div>
					</div>
					<div className="col-span-2 2xl:col-span-4">
						{this.board()}
					</div>
					{this.rightSidebar()}
				</div>
				{popup}
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
			<div>
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
						className="col-span-2"
						onDragStart={this.draggerOnDragStart}
						onDragEnd={this.draggerOnDragEnd}
					/>
				</div>
				<hr />
				<div className="grid grid-cols-2 m-4 gap-4">
					<FieldDragger
						type={FieldsEnum.RIVER}
						text="Fluss"
						onDragStart={this.draggerOnDragStart}
						onDragEnd={this.draggerOnDragEnd}
					/>
					<FieldDragger
						type={FieldsEnum.LEMBAS}
						text="LembasField"
						onDragStart={this.draggerOnDragStart}
						onDragEnd={this.draggerOnDragEnd}
					/>
					<FieldDragger
						type={FieldsEnum.HOLE}
						text="Loch"
						className="col-span-2"
						onDragStart={this.draggerOnDragStart}
						onDragEnd={this.draggerOnDragEnd}
					/>
				</div>
				<hr />
				<div className="grid grid-cols-2 m-4 gap-4">
					<FieldDragger
						type={FieldsEnum.WALL}
						text="Wand"
						className="col-span-2"
						onDragStart={this.draggerOnDragStart}
						onDragEnd={this.draggerOnDragEnd}
					/>
				</div>
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

	updateCheckpointArray = () => {
		const { board, checkpoints } = this.state;
		const helpArray: Checkpoint[] = [];
		let i = 0;
		board.map((row) => {
			return row.map((f) => {
				if (f instanceof Checkpoint) {
					helpArray.push(new Checkpoint(f.position, i));
					board[f.position.y][f.position.x] = new Checkpoint(
						f.position,
						i
					);
					i += 1;
				}
				return true;
			});
		});
		this.setState({
			checkpoints:
				helpArray.length !== checkpoints.length
					? helpArray
					: checkpoints,
		});
	};

	onCheckpointSortUpdate: (checkpoints: Checkpoint[]) => void = (check) => {
		const { board } = this.state;
		for (let i = 0; i < check.length; i += 1) {
			const checkpoint = check[i];
			board[checkpoint.position.y][checkpoint.position.x] =
				new Checkpoint(checkpoint.position, checkpoint.order);
		}
		this.setState({ checkpoints: check, board });
	};

	onWidthChange: OnChangeFunctionInputLabel = (width) => {
		const { board, config } = this.state;
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
		this.setState(
			{
				config: {
					...config,
					width: Number.parseInt(width.toString(), 10),
				},
				board,
			},
			() => {
				this.updateCheckpointArray();
			}
		);
	};

	onHeightChange: OnChangeFunctionInputLabel = (height) => {
		const { board, config } = this.state;
		const newBoard = [];
		for (let y = 0; y < height; y += 1) {
			if (y + 1 <= board.length) {
				newBoard[y] = board[y];
			} else {
				const row = [];
				for (let x = 0; x < config.width; x += 1) {
					row[x] = new Grass({ x, y });
				}
				newBoard[y] = row;
			}
		}

		this.setState(
			{
				config: {
					...config,
					height: Number.parseInt(height.toString(), 10),
				},
				board: newBoard,
			},
			() => {
				this.updateCheckpointArray();
			}
		);
	};

	globals = () => {
		const { config, checkpoints } = this.state;

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
							onChange={this.onWidthChange}
						/>
					</div>
					<div className="p-4">
						<InputLabel
							label="Höhe"
							type="range"
							labelClass="text-xl"
							value={config.height}
							min={config.width === 1 ? 2 : 1}
							onChange={this.onHeightChange}
						/>
					</div>
				</div>
				<div className="flex-grow p-4 border-t">
					<div className="text-xl mb-2">Checkpoint Reihenfolge</div>
					<CheckpointSortable
						checkpoints={checkpoints}
						onUpdate={this.onCheckpointSortUpdate}
						onSelect={(pos) => {
							this.setState({ selected: pos });
						}}
					/>
				</div>
			</div>
		);
	};

	handleBoardOnDrop: (position: { x: number; y: number }) => void = (
		position
	) => {
		const { isDragged, board, checkpoints } = this.state;
		let newField: FieldWithPositionInterface;
		switch (isDragged) {
			case FieldsEnum.START:
				newField = new StartField(
					{
						x: position.x,
						y: position.y,
					},
					DirectionEnum.NORTH
				);
				board[position.y][position.x] = newField;
				this.setState({ board });
				break;
			case FieldsEnum.CHECKPOINT:
				newField = new Checkpoint(
					{
						x: position.x,
						y: position.y,
					},
					checkpoints.length
				);
				checkpoints.push(newField as Checkpoint);
				board[position.y][position.x] = newField;
				this.setState({ board });
				break;
			case FieldsEnum.EYE:
				newField = new SauronsEye(
					{
						x: position.x,
						y: position.y,
					},
					DirectionEnum.NORTH
				);
				board[position.y][position.x] = newField;
				this.setState({ board });
				break;
			case FieldsEnum.RIVER:
				newField = new River(
					{
						x: position.x,
						y: position.y,
					},
					DirectionEnum.NORTH
				);
				board[position.y][position.x] = newField;
				this.setState({ board });
				break;
			case FieldsEnum.LEMBAS:
				newField = new Lembas(
					{
						x: position.x,
						y: position.y,
					},
					1
				);
				board[position.y][position.x] = newField;
				this.setState({ board });
				break;
			case FieldsEnum.HOLE:
				newField = new Hole({
					x: position.x,
					y: position.y,
				});
				board[position.y][position.x] = newField;
				this.setState({ board });
				break;
			default:
				break;
		}
	};

	board = () => {
		const { config, board, selected } = this.state;

		const errors: BoardKonfiguratorErrorProps = {
			critical: [],
			hints: [],
			warning: [],
			validation: [],
		};

		// TODO: Warnungen
		if (config.checkPoints.length < 1) {
			errors.critical.push(
				'Es muss mindestens ein Checkpoint auf dem Board vorhanden sein!'
			);
		}
		if (config.startFields.length < 2) {
			errors.critical.push(
				'Es müssen mindestens zwei Startfelder auf dem Board vorhanden sein!'
			);
		}

		return (
			<BoardKonfiguratorBoard
				errors={errors}
				config={config}
				board={board}
				selected={selected}
				onSelect={(position) => {
					if (position) {
						const { currentTool } = this.state;
						const field = board[position.y][position.x];
						if (
							currentTool === 'delete' &&
							!(field instanceof Grass)
						) {
							board[position.y][position.x] = new Grass(position);

							this.setState(
								{
									board,
									selected: null,
								},
								() => {
									this.updateCheckpointArray();
								}
							);
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
		const { selected, board } = this.state;
		let field: FieldWithPositionInterface | null = null;
		let option: JSX.Element | null = null;
		if (selected) {
			field = board[selected.y][selected.x];
			if (field instanceof Lembas) {
				option = (
					<InputLabel
						label="LembasField-Anzahl"
						type="range"
						value={field.amount}
						onChange={(value) => {
							(
								board[selected.y][
									selected.x
								] as FieldWithPositionAndAmountInterface
							).amount = Number.parseInt(value.toString(), 10);
							this.setState({ board });
						}}
					/>
				);
			} else if (
				field instanceof River ||
				field instanceof SauronsEye ||
				field instanceof StartField
			) {
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
		return (
			<div
				id="board-configurator-sidebar-right"
				className="w-full h-full bg-background-700"
			>
				<div className="flex flex-col h-full">
					<div className="flex flex-col flex-grow text-white h-1/2">
						<div className="text-2xl text-center p-4">
							Feld-Eigenschaft
						</div>
						<div className="p-4">{option}</div>
					</div>
				</div>
			</div>
		);
	};
}

export default BoardKonfigurator;
