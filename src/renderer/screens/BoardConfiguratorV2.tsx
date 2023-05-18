import React from 'react';
import Mousetrap from 'mousetrap';
import { ParsedPath } from 'path';
import _uniqueId from 'lodash/uniqueId';
import { monaco } from 'react-monaco-editor';
import TopMenu, { TopMenuActions } from '../components/boardConfigurator/TopMenu';
import BoardConfigInterface, { Direction, Position, PositionDirection } from '../../interfaces/BoardConfigInterface';
import LeftSidebar, {
	LeftSidebarConfigType,
	LeftSidebarOpenTab,
} from '../components/boardConfigurator/sidebars/LeftSidebar';
import BoardGenerator, { FieldsEnum } from '../components/generator/BoardGenerator';
import RightSidebar, { RightSidebarOpenTab } from '../components/boardConfigurator/sidebars/RightSidebar';
import MainEditor, { FieldTypeOnClick } from '../components/boardConfigurator/MainEditor';
import {
	BoardPosition,
	boardPosition2String,
	position2BoardPosition,
	position2String,
	wallBoardPosition2String,
	wallBoardPosition2WallPosition,
	wallConfig2Map,
	wallPosition2String,
} from '../components/generator/interfaces/BoardPosition';
import {
	addCheckpoint,
	addHole,
	addLembasField,
	addRiver,
	addStartField,
	calculateRiverPresetFieldPositionWithRotation,
	getFieldType, isBoardConfiguration,
	moveSauronsEye,
	removeCheckpoint,
	removeHole,
	removeLembasField,
	removeRiver,
	removeStartField,
	removeWall,
	rotateDirection,
} from '../components/boardConfigurator/HelperFunctions';
import ConfirmPopupV2 from '../components/popups/ConfirmPopupV2';
import { SettingsInterface } from '../../interfaces/SettingsInterface';
import SettingsPopup from '../components/popups/SettingsPopup';
import RandomBoardStartValuesDialogV2 from '../components/popups/RandomBoardStartValuesDialogV2';
import AStar from '../components/generator/helper/AStar';
import { Warnings, WarningsMap } from '../components/boardConfigurator/Warning';
import { BoardPresetWithFile, RiverPresetWithFile } from '../../main/helper/PresetsLoader';
import AddRiverPresetConfirmPopup from '../components/popups/AddRiverPresetConfirmPopup';
import Dragger from '../components/Dragger';
import { Rotation } from '../../interfaces/Types';
import PopupV2 from '../components/popups/PopupV2';

window.electron.schemas
	.board()
	.then((boardSchema) => {
		return monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
			validate: false,
			schemas: [
				{
					uri: '#',
					fileMatch: ['*'],
					schema: boardSchema,
				},
			],
		});
	})
	.catch(() => {
	});

export type EditorToolType = FieldsEnum | 'delete' | 'edit' | 'riverPreset' | null;
type EditorPopupType =
	| null
	| 'newFileSaveCurrent'
	| 'closeSaveCurrent'
	| 'settings'
	| 'newFromRandom'
	| 'newRandomFileSaveCurrent'
	| 'loadingError'
	| 'addRiverPreset';

type BoardConfiguratorV2Props = {
	os: NodeJS.Platform;
	onClose: () => void;
	settings: SettingsInterface;
	onSettingsUpdate: (settings: SettingsInterface) => void;
	config?: BoardConfigInterface;
	file?: {
		parsedPath: ParsedPath;
		path: string;
	} | null;
};
type BoardConfiguratorV2State = {
	windowDimensions: {
		width: number;
		height: number;
	};
	sidebars: { left: number; right: number };
	popup: EditorPopupType;
	currentTool: EditorToolType;
	sideBarTabLeft: LeftSidebarOpenTab;
	sideBarTabLeftConfigType: LeftSidebarConfigType;
	sideBarTabRight: RightSidebarOpenTab;
	config: BoardConfigInterface;
	mainEditorZoom: number;
	fieldInEdit: BoardPosition | null;
	file: {
		parsedPath: ParsedPath;
		path: string;
	} | null;
	fileSaved: boolean;
	warnings: WarningsMap;
	riverPresets: Array<RiverPresetWithFile>;
	boardPresets: Array<BoardPresetWithFile>;
	newRiverPreset: RiverPresetWithFile | null;
	defaultDirection: Direction;
};

class BoardConfiguratorV2 extends React.Component<BoardConfiguratorV2Props, BoardConfiguratorV2State> {
	static defaultBoard: BoardConfigInterface = {
		height: 2,
		width: 3,
		name: 'Default Board',
		checkPoints: [],
		startFields: [],
		eye: { position: [0, 0], direction: 'NORTH' },
		lembasFields: [],
		riverFields: [],
		holes: [],
		walls: [],
	};

	constructor(props: BoardConfiguratorV2Props) {
		super(props);
		const conf = props.config || BoardConfiguratorV2.defaultBoard;
		this.state = {
			windowDimensions: {
				width: window.innerWidth,
				height: window.innerHeight,
			},
			sidebars: {
				left: 52,
				right: 52,
			},
			popup: null,
			currentTool: null,
			sideBarTabLeft: null,
			sideBarTabLeftConfigType: 'global',
			sideBarTabRight: null,
			config: conf,
			mainEditorZoom: 1,
			fieldInEdit: null,
			file: props.file || null,
			fileSaved: !!props.file,
			warnings: this.checkWarnings(conf),
			riverPresets: [],
			boardPresets: [],
			newRiverPreset: null,
			defaultDirection: 'NORTH',
		};
		this.onTopMenuAction = this.onTopMenuAction.bind(this);
		this.handleOnFieldOrWallClick = this.handleOnFieldOrWallClick.bind(this);
		document.querySelector('html')?.classList.add('dark');
	}

	static get defaultProps() {
		return {
			config: BoardConfiguratorV2.defaultBoard,
			file: null,
		};
	}

	componentDidMount() {
		Mousetrap.bind('alt+1', () => {
			const { sideBarTabLeft } = this.state;
			this.setState({
				sideBarTabLeft: sideBarTabLeft === 'settings' ? null : 'settings',
			});
		});
		Mousetrap.bind('alt+2', () => {
			const { sideBarTabLeft } = this.state;
			this.setState({
				sideBarTabLeft: sideBarTabLeft === 'checkpointOrder' ? null : 'checkpointOrder',
			});
		});
		Mousetrap.bind('alt+3', () => {
			const { sideBarTabLeft } = this.state;
			this.setState({
				sideBarTabLeft: sideBarTabLeft === 'presets' ? null : 'presets',
			});
		});
		Mousetrap.bind(['ctrl+0', 'alt+0'], () => {
			this.setState({ currentTool: null });
		});
		Mousetrap.bind('ctrl+1', () => {
			this.setState({ currentTool: FieldsEnum.START });
		});
		Mousetrap.bind('ctrl+2', () => {
			this.setState({ currentTool: FieldsEnum.CHECKPOINT });
		});
		Mousetrap.bind('ctrl+3', () => {
			this.setState({ currentTool: FieldsEnum.EYE });
		});
		Mousetrap.bind('ctrl+4', () => {
			this.setState({ currentTool: FieldsEnum.LEMBAS });
		});
		Mousetrap.bind('ctrl+5', () => {
			this.setState({ currentTool: FieldsEnum.RIVER });
		});
		Mousetrap.bind('ctrl+6', () => {
			this.setState({ currentTool: FieldsEnum.HOLE });
		});
		Mousetrap.bind('ctrl+7', () => {
			this.setState({ currentTool: FieldsEnum.WALL });
		});
		Mousetrap.bind(['ctrl+e'], () => {
			this.setState({ currentTool: 'edit' });
		});
		Mousetrap.bind(['ctrl+d'], () => {
			this.setState({ currentTool: 'delete' });
		});
		Mousetrap.bind('alt+-', () => {
			const { sideBarTabRight } = this.state;
			this.setState({
				sideBarTabRight: sideBarTabRight === 'warnings' ? null : 'warnings',
			});
		});
		Mousetrap.bind('alt++', () => {
			const { sideBarTabRight } = this.state;
			this.setState({
				sideBarTabRight: sideBarTabRight === 'configPreview' ? null : 'configPreview',
			});
		});

		Mousetrap.bind('ctrl+shift+d', () => {
			const { settings, onSettingsUpdate } = this.props;
			onSettingsUpdate({ ...settings, darkMode: !settings.darkMode });
		});

		Mousetrap.bind('ctrl+alt+s', () => {
			this.setState({ popup: 'settings' });
		});

		Mousetrap.bind(['command+enter', 'ctrl+enter'], () => {
			this.setState({ mainEditorZoom: 1 });
		});
		Mousetrap.bind(['command++', 'ctrl++'], () => {
			this.zoomIn();
		});
		Mousetrap.bind(['command+-', 'ctrl+-'], () => {
			this.zoomOut();
		});
		Mousetrap.bind(['command+s', 'ctrl+s'], () => {
			this.saveConfig();
		});
		Mousetrap.bind(['command+shift+s', 'ctrl+shift+s'], () => {
			this.saveConfig(true);
		});
		Mousetrap.bind(['command+o', 'ctrl+o'], () => {
			this.openConfiguration();
		});

		Mousetrap.bind(['w', 'up'], () => {
			this.setState({ defaultDirection: 'NORTH' });
		});

		Mousetrap.bind(['s', 'down'], () => {
			this.setState({ defaultDirection: 'SOUTH' });
		});

		Mousetrap.bind(['a', 'left'], () => {
			this.setState({ defaultDirection: 'WEST' });
		});

		Mousetrap.bind(['d', 'right'], () => {
			this.setState({ defaultDirection: 'EAST' });
		});

		window.addEventListener('resize', this.handleResize);

		window.electron.load
			.riverPresets()
			.then((riverPresets) => {
				this.setState({
					riverPresets,
				});
				return null;
			})
			.catch(() => {
			});
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
		Mousetrap.reset();
	}

	handleResize = () => {
		this.setState({
			windowDimensions: {
				width: window.innerWidth,
				height: window.innerHeight,
			},
		});
	};

	componentDidUpdate(prevProps: Readonly<BoardConfiguratorV2Props>, prevState: Readonly<BoardConfiguratorV2State>) {
		const { sideBarTabLeft, sidebars, sideBarTabRight, currentTool } = this.state;
		const {
			sideBarTabLeft: preSideBarTabLeft,
			sideBarTabRight: preSideBarTabRight,
			currentTool: preTool,
		} = prevState;
		if (sideBarTabLeft === null && sidebars.left > 52) {
			this.setState({ sidebars: { ...sidebars, left: 52 } });
		}
		if (preSideBarTabLeft === null && sideBarTabLeft !== null) {
			this.setState({ sidebars: { ...sidebars, left: 400 } });
		}
		if (sideBarTabRight === null && sidebars.right > 52) {
			this.setState({ sidebars: { ...sidebars, right: 52 } });
		}
		if (preSideBarTabRight === null && sideBarTabRight !== null) {
			this.setState({ sidebars: { ...sidebars, right: 400 } });
		}
		if (preTool === 'edit' && currentTool !== 'edit') {
			this.setState({
				sideBarTabLeftConfigType: 'global',
				fieldInEdit: null,
			});
		}
	}

	handleOnFieldOrWallClick: FieldTypeOnClick = (type, position) => {
		const { currentTool, config } = this.state;
		if (type === 'field') {
			this.handleFieldPlacement(position as BoardPosition, config, currentTool);
		} else if (type === 'wall') {
			this.handleWallPlacement(position as [BoardPosition, BoardPosition], config, currentTool);
		}
	};

	private handleFieldPlacement(position: BoardPosition, config: BoardConfigInterface, currentTool: EditorToolType) {
		if (currentTool === 'delete') {
			this.handleFieldDelete(position, config);
		} else if (currentTool === 'edit') {
			this.handleFieldEdit(position, config);
		} else {
			this.handleFieldPlacing(position, config, currentTool as FieldsEnum);
		}
	}

	private handleFieldDelete(position: BoardPosition, config: BoardConfigInterface) {
		const type = getFieldType(position, config);
		switch (type) {
			case FieldsEnum.EYE:
				break;
			case FieldsEnum.CHECKPOINT:
				this.updateConfiguration(removeCheckpoint(position, config));
				break;
			case FieldsEnum.START:
				this.updateConfiguration(removeStartField(position, config));
				break;
			case FieldsEnum.LEMBAS:
				this.updateConfiguration(removeLembasField(position, config));
				break;
			case FieldsEnum.RIVER:
				this.updateConfiguration(removeRiver(position, config));
				break;
			case FieldsEnum.HOLE:
				this.updateConfiguration(removeHole(position, config));
				break;
			default:
				break;
		}
	}

	private handleFieldEdit(position: BoardPosition, config: BoardConfigInterface, ignorePrev = false) {
		const positionString = boardPosition2String(position);

		const { fieldInEdit } = this.state;
		if (!ignorePrev && fieldInEdit && positionString === boardPosition2String(fieldInEdit)) {
			this.setState({
				fieldInEdit: null,
				sideBarTabLeftConfigType: 'global',
			});
		} else {
			const type = getFieldType(position, config);
			switch (type) {
				case FieldsEnum.CHECKPOINT:
					this.setState({
						fieldInEdit: position,
						sideBarTabLeftConfigType: 'global',
						sideBarTabLeft: 'checkpointOrder',
					});
					break;
				case FieldsEnum.LEMBAS:
					this.setState({
						fieldInEdit: position,
						sideBarTabLeftConfigType: 'amount',
						sideBarTabLeft: 'settings',
					});
					break;
				case FieldsEnum.EYE:
				case FieldsEnum.START:
				case FieldsEnum.RIVER:
					this.setState({
						fieldInEdit: position,
						sideBarTabLeftConfigType: 'direction',
						sideBarTabLeft: 'settings',
					});
					break;
				case FieldsEnum.HOLE:
				default:
					this.setState({
						fieldInEdit: position,
						sideBarTabLeftConfigType: 'global',
					});
					break;
			}
		}
	}

	private handleFieldPlacing(position: BoardPosition, config: BoardConfigInterface, currentTool: FieldsEnum) {
		const { defaultDirection } = this.state;
		switch (currentTool) {
			case FieldsEnum.EYE:
				this.updateConfiguration(moveSauronsEye(position, config));
				break;
			case FieldsEnum.CHECKPOINT:
				this.updateConfiguration(addCheckpoint(position, config));
				break;
			case FieldsEnum.START:
				this.updateConfiguration(addStartField(position, config, defaultDirection));
				break;
			case FieldsEnum.LEMBAS:
				this.updateConfiguration(addLembasField(position, config));
				break;
			case FieldsEnum.RIVER:
				this.updateConfiguration(addRiver(position, config, defaultDirection));
				break;
			case FieldsEnum.HOLE:
				this.updateConfiguration(addHole(position, config));
				break;
			default:
				break;
		}
	}

	private handleWallPlacement(
		position: [BoardPosition, BoardPosition],
		config: BoardConfigInterface,
		currentTool: EditorToolType,
	) {
		const positionString = wallBoardPosition2String(position);
		const wallMap = wallConfig2Map(config.walls);
		if (currentTool === FieldsEnum.WALL) {
			if (!wallMap.get(positionString)) {
				this.updateConfiguration({
					...config,
					walls: [...config.walls, wallBoardPosition2WallPosition(position)],
				});
			}
			if (wallMap.get(positionString)) {
				this.updateConfiguration(removeWall(position, config));
			}
		}
		if (currentTool === 'delete' && !!wallMap.get(positionString)) {
			this.updateConfiguration(removeWall(position, config));
		}
	}

	/**
	 * Checks the current board configuration for warnings
	 * @param startConfig - optional board configuration to check
	 */
	checkWarnings = (startConfig?: BoardConfigInterface): WarningsMap => {
		let handledConfig: BoardConfigInterface;
		if (startConfig) {
			handledConfig = startConfig;
		} else {
			const { config } = this.state;
			handledConfig = config;
		}
		let newWarnings: WarningsMap = new Map();

		// Check if there is a path from start to end
		const { result, errors } = AStar.checkBoardConfig(handledConfig);
		if (!result) {
			for (const element of errors) {
				const error = element;
				if (error.start && error.end) {
					newWarnings.set(_uniqueId('warning-'), {
						type: Warnings.pathImpossible,
						title: window.t.translate('Pathfinding'),
						content: window.t.translateVars(
							'The current board state is not playable, because {0} to {1} has no valid path.',
							[`[${error.start.x}, ${error.start.y}]`, `[${error.end.x}, ${error.end.y}]`],
						),
						fields: [error.start, error.end],
					});
				} else {
					newWarnings.set(_uniqueId('warning-'), {
						type: Warnings.pathImpossible,
						title: window.t.translate('Pathfinding'),
						content: window.t.translate('The current board state is not playable.'),
					});
				}
			}
		}

		// Check if there are enough start fields (2 - 6)
		if (handledConfig.startFields.length < 2) {
			newWarnings.set(_uniqueId('warning-'), {
				type: Warnings.configurationInvalid,
				title: window.t.translate('Start fields'),
				content: window.t.translate(
					'The current game board state is not playable because there are not enough starting spaces.',
				),
				helper: [window.t.translateVars('Minimum {0}', ['2'])],
			});
		} else if (handledConfig.startFields.length > 6) {
			newWarnings.set(_uniqueId('warning-'), {
				type: Warnings.configurationInvalid,
				title: window.t.translate('Start fields'),
				content: window.t.translate(
					'The current game board state is invalid because there are too many starting spaces.',
				),
				helper: [window.t.translateVars('Maximum {0}', ['6'])],
			});
		}

		// Check if there are enough checkpoints (2)
		if (handledConfig.checkPoints.length < 2) {
			newWarnings.set(_uniqueId('warning-'), {
				type: Warnings.configurationInvalid,
				title: window.t.translate('Checkpoints'),
				content: window.t.translate(
					'The current game board state is not playable because there are not enough checkpoints.',
				),
				helper: [window.t.translateVars('Minimum {0}', ['2'])],
			});
		}

		// Check if there are walls on walls
		const occupiedWallsMap = new Set<string>();
		if (handledConfig.walls) {
			for (const element of handledConfig.walls) {
				const wallArray = element;
				const [x, y] = wallArray[0];
				const [x1, y1] = wallArray[1];
				const string = wallPosition2String([wallArray[0], wallArray[1]]);
				if (occupiedWallsMap.has(string)) {
					newWarnings.set(_uniqueId('warning-'), {
						type: Warnings.configurationInvalid,
						title: window.t.translate('Wall'),
						content: window.t.translate(
							'The current game board state is not playable because there is a wall set on another wall.',
						),
						helper: [`${x}:${y}`, `${x1}:${y1}`],
						removeWall: wallArray,
					});
				}
				occupiedWallsMap.add(string);
			}
		}

		let occupiedFields = new Set<string>();

		occupiedFields.add(position2String(handledConfig.eye.position));

		handledConfig.startFields.forEach((field) => {
			const { occupiedFields: oFields, warnings } = this.checkFieldOccupation(
				field.position,
				handledConfig,
				occupiedFields,
				newWarnings,
				FieldsEnum.START,
			);
			occupiedFields = oFields;
			newWarnings = warnings;
		});

		handledConfig.checkPoints.forEach((field) => {
			const { occupiedFields: oFields, warnings } = this.checkFieldOccupation(
				field,
				handledConfig,
				occupiedFields,
				newWarnings,
				FieldsEnum.CHECKPOINT,
			);
			occupiedFields = oFields;
			newWarnings = warnings;
		});

		handledConfig.lembasFields.forEach((field) => {
			const { occupiedFields: oFields, warnings } = this.checkFieldOccupation(
				field.position,
				handledConfig,
				occupiedFields,
				newWarnings,
				FieldsEnum.LEMBAS,
			);
			occupiedFields = oFields;
			newWarnings = warnings;
		});

		handledConfig.riverFields.forEach((field) => {
			const { occupiedFields: oFields, warnings } = this.checkFieldOccupation(
				field.position,
				handledConfig,
				occupiedFields,
				newWarnings,
				FieldsEnum.RIVER,
			);
			occupiedFields = oFields;
			newWarnings = warnings;
		});

		handledConfig.holes.forEach((field) => {
			const { occupiedFields: oFields, warnings } = this.checkFieldOccupation(
				field,
				handledConfig,
				occupiedFields,
				newWarnings,
				FieldsEnum.HOLE,
			);
			occupiedFields = oFields;
			newWarnings = warnings;
		});

		return newWarnings;
	};

	/**
	 * Checks if a field is already occupied
	 * @param position
	 * @param config
	 * @param occupiedFields
	 * @param warnings
	 * @param type
	 */
	checkFieldOccupation = (
		position: Position,
		config: BoardConfigInterface,
		occupiedFields: Set<string>,
		warnings: WarningsMap,
		type: FieldsEnum,
	): { occupiedFields: Set<string>; warnings: WarningsMap } => {
		const string = position2String(position);
		if (occupiedFields.has(string)) {
			warnings.set(_uniqueId('warning-'), {
				type: Warnings.configurationInvalid,
				title: window.t.translate('Occupation'),
				content: window.t.translate(
					'The current game board state is not valid, due to a field has the same position as another field.',
				),
				helper: [`${position[0]}:${position[1]}`],
				removeField: { position: position2BoardPosition(position), type },
			});
		} else {
			occupiedFields.add(string);
		}
		return { occupiedFields, warnings };
	};

	initLoadedConfiguration = (newConfig: BoardConfigInterface) => {
		this.setState({
			warnings: this.checkWarnings(newConfig),
			config: newConfig,
			fileSaved: true,
		});
	};

	/**
	 * Updates the configuration
	 * @param newConfig
	 */
	updateConfiguration = (newConfig: BoardConfigInterface) => {
		const newWidth = newConfig.width;
		const newHeight = newConfig.height;
		const { config, currentTool } = this.state;
		const { width, height } = config;
		let updatedConfiguration = newConfig;
		if (width !== newWidth || height !== newHeight) {
			updatedConfiguration = this.updateConfigurationDimensions(newWidth, newHeight, newConfig);
		}

		if (updatedConfiguration.startFields.length >= 6 && currentTool === FieldsEnum.START) {
			this.setState({ currentTool: null });
		}

		this.setState({
			warnings: this.checkWarnings(newConfig),
			config: updatedConfiguration,
			fileSaved: false,
		});
	};

	/**
	 * Updates the configuration dimensions
	 * @param newWidth
	 * @param newHeight
	 * @param newConfig
	 */
	updateConfigurationDimensions = (
		newWidth: number,
		newHeight: number,
		newConfig: BoardConfigInterface,
	): BoardConfigInterface => {
		newConfig.startFields = newConfig.startFields.filter(
			(field) => field.position[0] < newWidth && field.position[1] < newHeight,
		);
		newConfig.checkPoints = newConfig.checkPoints.filter((field) => field[0] < newWidth && field[1] < newHeight);
		newConfig.walls = newConfig.walls.filter(
			(field) => field[0][0] < newWidth && field[0][1] < newHeight && field[1][0] < newWidth && field[1][1] < newHeight,
		);
		newConfig.lembasFields = newConfig.lembasFields.filter(
			(field) => field.position[0] < newWidth && field.position[1] < newHeight,
		);
		newConfig.riverFields = newConfig.riverFields.filter(
			(field) => field.position[0] < newWidth && field.position[1] < newHeight,
		);
		newConfig.holes = newConfig.holes.filter((field) => field[0] < newWidth && field[1] < newHeight);
		return newConfig;
	};

	onTopMenuAction = (action: TopMenuActions) => {
		const { onClose, settings, onSettingsUpdate } = this.props;
		const { fileSaved } = this.state;
		switch (action) {
			case TopMenuActions.NEW:
				if (!fileSaved) {
					this.setState({ popup: 'newFileSaveCurrent' });
				} else {
					this.updateConfiguration(BoardConfiguratorV2.defaultBoard);
					this.setState({
						file: null,
						fileSaved: true,
					});
				}
				break;
			case TopMenuActions.NEW_FROM_RANDOM:
				if (!fileSaved) {
					this.setState({ popup: 'newRandomFileSaveCurrent' });
				} else {
					this.setState({ popup: 'newFromRandom' });
				}
				break;
			case TopMenuActions.OPEN:
				this.openConfiguration();
				break;
			case TopMenuActions.SAVE:
				this.saveConfig();
				break;
			case TopMenuActions.SAVE_AS:
				this.saveConfig(true);
				break;
			case TopMenuActions.SAVE_AS_PRESET:
				break;
			case TopMenuActions.CLOSE:
				if (!fileSaved) {
					this.setState({ popup: 'closeSaveCurrent' });
				} else {
					onClose();
				}
				break;
			case TopMenuActions.DARK_MODE:
				onSettingsUpdate({ ...settings, darkMode: !settings.darkMode });
				break;
			case TopMenuActions.OPEN_PRESET_FOLDER:
				window.electron.file.openPresetDir().catch(() => {
				});
				break;
			case TopMenuActions.SETTINGS:
				this.setState({ popup: 'settings' });
				break;
			case TopMenuActions.ZOOM_IN:
				this.zoomIn();
				break;
			case TopMenuActions.ZOOM_OUT:
				this.zoomOut();
				break;
			case TopMenuActions.ZOOM_RESET:
				this.setState({ mainEditorZoom: 1 });
				break;
			default:
				break;
		}
	};

	popup = (): React.JSX.Element | null => {
		const { popup, windowDimensions, newRiverPreset, config } = this.state;
		const { os, settings, onSettingsUpdate } = this.props;
		if (popup === 'closeSaveCurrent') {
			return (
				<ConfirmPopupV2
					title={window.t.translate('Close Board Configurator')}
					abortButtonText={window.t.translate('Cancel')}
					onAbort={() => {
						this.setState({ popup: null });
					}}
					confirmButtonText={window.t.translate('Discard')}
					onConfirm={() => {
						const { onClose } = this.props;
						onClose();
					}}
					windowDimensions={windowDimensions}
					os={os}
					topOffset
					settings={settings}
				>
					{window.t.translate('The current file has not yet been saved. Do you want to discard the current changes?')}
				</ConfirmPopupV2>
			);
		}
		if (popup === 'newFileSaveCurrent' || popup === 'newRandomFileSaveCurrent') {
			return (
				<ConfirmPopupV2
					title={window.t.translate('New Config')}
					abortButtonText={window.t.translate('Cancel')}
					onAbort={() => {
						this.setState({ popup: null });
					}}
					confirmButtonText={window.t.translate('Discard')}
					onConfirm={() => {
						if (popup === 'newRandomFileSaveCurrent') {
							this.setState({ popup: 'newFromRandom' });
						} else {
							this.updateConfiguration(BoardConfiguratorV2.defaultBoard);
							this.setState({
								popup: null,
								file: null,
								fileSaved: true,
							});
						}
					}}
					windowDimensions={windowDimensions}
					os={os}
					topOffset
					settings={settings}
				>
					{window.t.translate('The current file has not yet been saved. Do you want to discard the current changes?')}
				</ConfirmPopupV2>
			);
		}
		if (popup === 'settings') {
			return (
				<SettingsPopup
					settings={settings}
					onAbort={() => {
						this.setState({ popup: null });
					}}
					onConfirm={(newSettings) => {
						onSettingsUpdate(newSettings);
						this.setState({ popup: null });
					}}
					windowDimensions={windowDimensions}
					os={os}
					topOffset
				/>
			);
		}
		if (popup === 'newFromRandom') {
			return (
				<RandomBoardStartValuesDialogV2
					onAbort={() => {
						this.setState({ popup: null });
					}}
					settings={settings}
					onConfirm={(generator) => {
						this.updateConfiguration(generator.boardJSON);
						this.setState({
							file: null,
							fileSaved: false,
							popup: null,
						});
					}}
					windowDimensions={windowDimensions}
					os={os}
					topOffset
				/>
			);
		}
		if (popup === 'addRiverPreset') {
			if (newRiverPreset && config) {
				return (
					<AddRiverPresetConfirmPopup
						preset={newRiverPreset}
						onCancel={() => {
							this.setState({ popup: null, newRiverPreset: null });
						}}
						onConfirm={(position, adjustBoardSize, rotation) => {
							this.updateConfiguration(this.addRiverPreset(config, newRiverPreset, position, adjustBoardSize, rotation));
							this.setState({
								newRiverPreset: null,
								popup: null,
							});
						}}
						os={os}
						settings={settings}
						windowDimensions={windowDimensions}
						configuration={config}
					/>
				);
			}
			return null;
		}
		if (popup === 'loadingError') {
			return (
				<PopupV2
					title={window.t.translate('Error')}
					closeButtonText={window.t.translate('OK')}
					onClose={() => {
						this.setState({ popup: null });
					}}
					windowDimensions={windowDimensions}
					os={os}
					topOffset
					settings={settings}
				>
					<>
						<p>{window.t.translate('An error occurred while loading the file.')}</p>
						<p>{window.t.translate('Please check if the file is a valid game configuration.')}</p>
					</>
				</PopupV2>
			);
		}
		return null;
	};

	getTopMenuHeight = (darkMode: boolean) => {
		return darkMode ? 37 : 38;
	};

	onAddRiverPresetToBoard = (newRiverPreset: RiverPresetWithFile) => {
		this.setState({
			popup: 'addRiverPreset',
			newRiverPreset,
		});
	};

	/**
	 * Adds a river preset to the board
	 * @param config The current board configuration
	 * @param newRiverPreset The river preset to add
	 * @param position The position to add the river preset to
	 * @param adjustBoardSize Whether the board size should be adjusted to fit the river preset
	 * @param rotation The rotation of the river preset
	 */
	addRiverPreset = (
		config: BoardConfigInterface,
		newRiverPreset: RiverPresetWithFile,
		position: BoardPosition,
		adjustBoardSize: boolean,
		rotation: Rotation,
	): BoardConfigInterface => {

		let newConfig = config;
		let newRivers = newRiverPreset.data.map((river) => {
			const riverPosition = calculateRiverPresetFieldPositionWithRotation(river.position, rotation);
			return {
				position: [riverPosition.x + position.x, riverPosition.y + position.y],
				direction: rotateDirection(river.direction, rotation),
			};
		}) as PositionDirection[];
		let newWidth = config.width;
		let newHeight = config.height;
		if (!adjustBoardSize) {
			// remove all rivers that are outside the board
			newRivers = newRivers.filter((river) => river.position[0] < config.width && river.position[1] < config.height);
		} else {
			// adjust board size
			newRivers.forEach((river) => {
				newWidth = Math.max(newWidth, river.position[0] + 1);
				newHeight = Math.max(newHeight, river.position[1] + 1);
			});
		}
		// remove all fields that are on the new rivers
		newRivers.forEach((river) => {
			newConfig = removeCheckpoint(BoardGenerator.positionToBoardPosition(river.position), newConfig);
			newConfig = removeRiver(BoardGenerator.positionToBoardPosition(river.position), newConfig);
			newConfig = removeHole(BoardGenerator.positionToBoardPosition(river.position), newConfig);
			newConfig = removeLembasField(BoardGenerator.positionToBoardPosition(river.position), newConfig);
			newConfig = removeStartField(BoardGenerator.positionToBoardPosition(river.position), newConfig);
		});

		// remove rivers that are outside the board
		newRivers = newRivers.filter((river) => river.position[0] < newWidth && river.position[1] < newHeight);
		// remove rivers that are on the eye
		newRivers = newRivers.filter(
			(river) => !(river.position[0] === config.eye.position[0] && river.position[1] === config.eye.position[1]),
		);
		return {
			...newConfig,
			riverFields: [...newConfig.riverFields, ...newRivers],
			width: newWidth,
			height: newHeight,
		};
	};

	saveConfig = (forceNew = false) => {
		const { file, fileSaved, config } = this.state;

		if (forceNew) {
			window.electron.dialog
				.saveBoardConfig(JSON.stringify(config, null, 4))
				.then((savedFile) => {
					if (savedFile) {
						this.setState({
							file: savedFile,
							fileSaved: true,
						});
						return;
					}
					throw new Error('File not saved');
				})
				.catch(() => {
				});
		} else if (!fileSaved) {
			if (file) {
				window.electron.file.save(file.path, JSON.stringify(config, null, 4)).catch(() => {
				});
				this.setState({ fileSaved: true });
			} else {
				window.electron.dialog
					.saveBoardConfig(JSON.stringify(config, null, 4))
					.then((savedFile) => {
						if (savedFile) {
							this.setState({
								file: savedFile,
								fileSaved: true,
							});
							return;
						}
						throw new Error('File not saved');
					})
					.catch(() => {
					});
			}
		}
	};

	private zoomOut() {
		const { mainEditorZoom } = this.state;
		if (mainEditorZoom <= 0.1) {
			this.setState({ mainEditorZoom: 0.1 });
			return;
		}
		this.setState({ mainEditorZoom: mainEditorZoom - 0.1 });
	}

	openConfiguration() {
		window.electron.dialog
			.openBoardConfig()
			.then((loadedConfig) => {
				if (loadedConfig && isBoardConfiguration(loadedConfig.config)) {
					this.initLoadedConfiguration(loadedConfig.config);
					this.setState({
						file: loadedConfig,
						fileSaved: true,
					});
					return null;
				}
				this.setState({
					popup: 'loadingError',
				});
				return new Error('Config not loadable');
			})
			.catch(() => {
			});
	}

	private zoomIn() {
		const { mainEditorZoom } = this.state;
		if (mainEditorZoom >= 10) {
			this.setState({ mainEditorZoom: 10 });
			return;
		}
		this.setState({ mainEditorZoom: mainEditorZoom + 0.1 });
	}

	render() {
		const { os, settings } = this.props;
		const {
			windowDimensions,
			sidebars,
			currentTool,
			sideBarTabLeft,
			sideBarTabRight,
			config,
			mainEditorZoom,
			sideBarTabLeftConfigType,
			fieldInEdit,
			popup,
			fileSaved,
			file,
			warnings,
			riverPresets,
			boardPresets,
			defaultDirection,
		} = this.state;
		const topMenuHeight = this.getTopMenuHeight(settings.darkMode);
		const mainHeight = windowDimensions.height - (os === 'win32' ? 32 + topMenuHeight : topMenuHeight);
		const mainWidth = windowDimensions.width - (sidebars.left + sidebars.right);
		return (
			<section className='text-white font-lato dark:bg-muted-800 bg-muted-600'>
				<Dragger os={os}>
					{window.t.translate('Board-Configurator')}
					{' - '}
					{file ? file.path : window.t.translate('Unsaved File')}
					{fileSaved ? '' : ` *`}
				</Dragger>
				<div className={`${popup !== null && 'blur'} transition`}>
					<div
						className={`dark:bg-muted-800 bg-muted-500 dark:border-0 border-t border-muted-400 px-1 ${
							os === 'darwin' ? 'pl-20' : ''
						}`}
						style={{ width: `${windowDimensions.width}px` }}
					>
						<TopMenu onAction={this.onTopMenuAction} darkMode={settings.darkMode} />
					</div>
					<div
						className='flex flex-row border-t dark:border-muted-700 border-muted-400'
						style={{
							height: `${mainHeight}px`,
							maxHeight: `${mainHeight}px`,
						}}
					>
						<div
							className='dark:bg-muted-800 bg-muted-600'
							style={{
								width: `${sidebars.left}px`,
								maxWidth: `${sidebars.left}px`,
							}}
						>
							<LeftSidebar
								config={config}
								onConfigUpdate={(newConfig) => {
									this.updateConfiguration(newConfig);
								}}
								openTab={sideBarTabLeft}
								currentTool={currentTool}
								toolChange={(tool) => {
									if (tool === 'edit' && currentTool !== 'edit') {
										this.setState({
											currentTool: tool,
											fieldInEdit: null,
										});
									} else {
										this.setState({ currentTool: tool });
									}
								}}
								tabChange={(tab) => {
									this.setState({ sideBarTabLeft: tab });
								}}
								riverPresets={riverPresets}
								boardPresets={boardPresets}
								configType={sideBarTabLeftConfigType}
								fieldInEdit={fieldInEdit}
								settings={settings}
								onAddRiverPresetToBoard={(newRiverPreset) => {
									this.onAddRiverPresetToBoard(newRiverPreset);
								}}
								defaultDirection={defaultDirection}
								defaultDirectionChange={(newDefaultDirection) => {
									this.setState({ defaultDirection: newDefaultDirection });
								}}
							/>
						</div>
						<div
							className='dark:bg-black/40 bg-black/20 border-x dark:border-muted-700 border-muted-400'
							style={{
								width: `${mainWidth}px`,
								maxWidth: `${mainWidth}px`,
								height: `${mainHeight - 1}px`,
								maxHeight: `${mainHeight - 1}px`,
							}}
						>
							<MainEditor
								editorTool={currentTool}
								config={config}
								zoom={mainEditorZoom}
								onZoom={(zoom) => {
									this.setState({ mainEditorZoom: zoom });
								}}
								onFieldOrWallClick={this.handleOnFieldOrWallClick}
								fieldInEdit={fieldInEdit}
								onChangeToEdit={(position) => {
									if (position === null) {
										this.setState({ currentTool: null });
										return;
									}
									this.setState(
										{
											currentTool: 'edit',
										},
										() => {
											this.handleFieldEdit(position, config, true);
										},
									);
								}}
								file={file}
								fileSaved={fileSaved}
								os={os}
							/>
						</div>
						<div
							className='dark:bg-muted-800 bg-muted-600'
							style={{
								width: `${sidebars.right}px`,
								maxWidth: `${sidebars.right}px`,
							}}
						>
							<RightSidebar
								config={config}
								openTab={sideBarTabRight}
								tabChange={(tab) => {
									this.setState({ sideBarTabRight: tab });
								}}
								warnings={warnings}
								onFieldSelect={(position) => {
									this.setState({ fieldInEdit: position });
								}}
								windowDimensions={windowDimensions}
								settings={settings}
								os={os}
								onRemoveWall={(wall) => {
									this.updateConfiguration(
										removeWall(
											[
												{
													x: wall[0][0],
													y: wall[0][1],
												},
												{ x: wall[1][0], y: wall[1][1] },
											],
											config,
										),
									);
									if (fileSaved) {
										this.setState({
											fileSaved: false,
										});
									}
								}}
								onRemoveField={(fieldPosition) => {
									switch (fieldPosition.type) {
										case FieldsEnum.CHECKPOINT:
										case FieldsEnum.DESTINY_MOUNTAIN:
											this.updateConfiguration(removeCheckpoint(fieldPosition.position, config));
											break;
										case FieldsEnum.LEMBAS:
											this.updateConfiguration(removeLembasField(fieldPosition.position, config));
											break;
										case FieldsEnum.RIVER:
											this.updateConfiguration(removeRiver(fieldPosition.position, config));
											break;
										case FieldsEnum.START:
											this.updateConfiguration(removeStartField(fieldPosition.position, config));
											break;
										case FieldsEnum.HOLE:
											this.updateConfiguration(removeHole(fieldPosition.position, config));
											break;
										default:
											break;
									}
								}}
							/>
						</div>
					</div>
				</div>
				{this.popup()}
			</section>
		);
	}
}

export default BoardConfiguratorV2;
