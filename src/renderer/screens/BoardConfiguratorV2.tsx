import React from 'react';
import Mousetrap from 'mousetrap';
import { ParsedPath } from 'path';
import _uniqueId from 'lodash/uniqueId';
import { monaco } from 'react-monaco-editor';
import TopMenu, { TopMenuActions } from '../components/boardConfigurator/TopMenu';
import BoardConfigInterface from '../components/interfaces/BoardConfigInterface';
import LeftSidebar, { LeftSidebarConfigType, LeftSidebarOpenTab } from '../components/boardConfigurator/LeftSidebar';
import { FieldsEnum } from '../components/generator/BoardGenerator';
import RightSidebar, { RightSidebarOpenTab } from '../components/boardConfigurator/RightSidebar';
import MainEditor, { FieldTypeOnClick } from '../components/boardConfigurator/MainEditor';
import {
	BoardPosition,
	boardPosition2String,
	wallBoardPosition2String,
	wallBoardPosition2WallPosition,
	wallConfig2Map,
} from '../components/generator/interfaces/boardPosition';
import {
	addCheckpoint,
	addHole,
	addLembasField,
	addRiver,
	addStartField,
	getFieldType,
	moveSauronsEye,
	removeCheckpoint,
	removeHole,
	removeLembasField,
	removeRiver,
	removeStartField,
	removeWall,
} from '../components/boardConfigurator/HelperFunctions';
import ConfirmPopupV2 from '../components/boardConfigurator/ConfirmPopupV2';
import { SettingsInterface } from '../../interfaces/SettingsInterface';
import SettingsPopup from '../components/popups/SettingsPopup';
import RandomBoardStartValuesDialogV2 from '../components/popups/RandomBoardStartValuesDialogV2';
import AStar from '../components/generator/helper/AStar';
import { Warnings, WarningsMap } from '../components/boardConfigurator/Warning';
import { BoardPresetWithFile, RiverPresetWithFile } from '../../main/helper/PresetsLoader';

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
	.catch(() => {});

export type EditorToolType = FieldsEnum | 'delete' | 'edit' | null;
type EditorPopupType =
	| null
	| 'newFileSaveCurrent'
	| 'closeSaveCurrent'
	| 'settings'
	| 'newFromRandom'
	| 'newRandomFileSaveCurrent';

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
};

class BoardConfiguratorV2 extends React.Component<BoardConfiguratorV2Props, BoardConfiguratorV2State> {
	static defaultBoard: BoardConfigInterface = {
		height: 2,
		width: 2,
		name: 'Default Board',
		checkPoints: [],
		startFields: [],
		eye: { position: [0, 0], direction: 'NORTH' },
		lembasFields: [],
		riverFields: [],
		holes: [],
		walls: [],
	};

	// TODO: Update on Size change
	// TODO: random
	// TODO: Loading
	// TODO: Warnings
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
		Mousetrap.bind(['command+o', 'ctrl+o'], () => {
			this.openConfiguration();
		});

		const { fieldInEdit, config } = this.state;
		if (fieldInEdit) {
			Mousetrap.bind('up', () => {
				if (fieldInEdit && fieldInEdit.y > 0) {
					this.handleFieldEdit({ y: fieldInEdit.y - 1, x: fieldInEdit.x }, config);
				}
			});
			Mousetrap.bind('down', () => {
				if (fieldInEdit && fieldInEdit.y < config.height - 1) {
					this.handleFieldEdit({ y: fieldInEdit.y + 1, x: fieldInEdit.x }, config);
				}
			});
			Mousetrap.bind('left', () => {
				if (fieldInEdit && fieldInEdit.x > 0) {
					this.handleFieldEdit({ y: fieldInEdit.y, x: fieldInEdit.x - 1 }, config);
				}
			});
			Mousetrap.bind('right', () => {
				if (fieldInEdit && fieldInEdit.x < config.width - 1) {
					this.handleFieldEdit({ y: fieldInEdit.y, x: fieldInEdit.x + 1 }, config);
				}
			});
		}

		window.addEventListener('resize', () => {
			this.setState({
				windowDimensions: {
					width: window.innerWidth,
					height: window.innerHeight,
				},
			});
		});

		window.electron.load
			.riverPresets()
			.then((riverPresets) => {
				this.setState({
					riverPresets,
				});
				return null;
			})
			.catch(() => {});
	}

	componentDidUpdate(prevProps: Readonly<BoardConfiguratorV2Props>, prevState: Readonly<BoardConfiguratorV2State>) {
		const { sideBarTabLeft, sidebars, sideBarTabRight, currentTool } = this.state;
		const { sideBarTabLeft: preSideBarTabLeft, sideBarTabRight: preSideBarTabRight, currentTool: preTool } = prevState;
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
				this.onConfigUpdate(removeCheckpoint(position, config));
				break;
			case FieldsEnum.START:
				this.onConfigUpdate(removeStartField(position, config));
				break;
			case FieldsEnum.LEMBAS:
				this.onConfigUpdate(removeLembasField(position, config));
				break;
			case FieldsEnum.RIVER:
				this.onConfigUpdate(removeRiver(position, config));
				break;
			case FieldsEnum.HOLE:
				this.onConfigUpdate(removeHole(position, config));
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
				case FieldsEnum.EYE:
					this.setState({
						fieldInEdit: position,
						sideBarTabLeftConfigType: 'direction',
						sideBarTabLeft: 'settings',
					});
					break;
				case FieldsEnum.CHECKPOINT:
					this.setState({
						fieldInEdit: position,
						sideBarTabLeftConfigType: 'global',
						sideBarTabLeft: 'checkpointOrder',
					});
					break;
				case FieldsEnum.START:
					this.setState({
						fieldInEdit: position,
						sideBarTabLeftConfigType: 'direction',
						sideBarTabLeft: 'settings',
					});
					break;
				case FieldsEnum.LEMBAS:
					this.setState({
						fieldInEdit: position,
						sideBarTabLeftConfigType: 'amount',
						sideBarTabLeft: 'settings',
					});
					break;
				case FieldsEnum.RIVER:
					this.setState({
						fieldInEdit: position,
						sideBarTabLeftConfigType: 'direction',
						sideBarTabLeft: 'settings',
					});
					break;
				case FieldsEnum.HOLE:
					this.setState({
						fieldInEdit: position,
						sideBarTabLeftConfigType: 'global',
					});
					break;
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
		switch (currentTool) {
			case FieldsEnum.EYE:
				this.onConfigUpdate(moveSauronsEye(position, config));
				break;
			case FieldsEnum.CHECKPOINT:
				this.onConfigUpdate(addCheckpoint(position, config));
				break;
			case FieldsEnum.START:
				this.onConfigUpdate(addStartField(position, config));
				break;
			case FieldsEnum.LEMBAS:
				this.onConfigUpdate(addLembasField(position, config));
				break;
			case FieldsEnum.RIVER:
				this.onConfigUpdate(addRiver(position, config));
				break;
			case FieldsEnum.HOLE:
				this.onConfigUpdate(addHole(position, config));
				break;
			default:
				break;
		}
	}

	private handleWallPlacement(
		position: [BoardPosition, BoardPosition],
		config: BoardConfigInterface,
		currentTool: EditorToolType
	) {
		const positionString = wallBoardPosition2String(position);
		const wallMap = wallConfig2Map(config.walls);
		if (currentTool === FieldsEnum.WALL) {
			if (!wallMap.get(positionString)) {
				this.onConfigUpdate({
					...config,
					walls: [...config.walls, wallBoardPosition2WallPosition(position)],
				});
			}
			if (wallMap.get(positionString)) {
				this.onConfigUpdate(removeWall(position, config));
			}
		}
		if (currentTool === 'delete' && !!wallMap.get(positionString)) {
			this.onConfigUpdate(removeWall(position, config));
		}
	}

	checkWarnings = (startConfig?: BoardConfigInterface): WarningsMap => {
		let handledConfig;
		if (startConfig) {
			handledConfig = startConfig;
		} else {
			const { config } = this.state;
			handledConfig = config;
		}
		const newWarnings: WarningsMap = new Map();
		const { result, errors } = AStar.checkBoardConfig(handledConfig);
		if (!result) {
			for (let i = 0; i < errors.length; i += 1) {
				const error = errors[i];
				if (error.start && error.end) {
					newWarnings.set(_uniqueId('warning-'), {
						type: Warnings.pathImpossible,
						title: window.languageHelper.translate('Pathfinding'),
						content: window.languageHelper.translateVars(
							'The current board state is not playable, because {0} to {1} has no valid path.',
							[`[${error.start.x}, ${error.start.y}]`, `[${error.end.x}, ${error.end.y}]`]
						),
						fields: [error.start, error.end],
					});
				} else {
					newWarnings.set(_uniqueId('warning-'), {
						type: Warnings.pathImpossible,
						title: window.languageHelper.translate('Pathfinding'),
						content: window.languageHelper.translate('The current board state is not playable.'),
					});
				}
			}
		}

		if (handledConfig.startFields.length < 2) {
			newWarnings.set(_uniqueId('warning-'), {
				type: Warnings.configurationInvalid,
				title: window.languageHelper.translate('Start fields'),
				content: window.languageHelper.translate(
					'The current game board state is not playable because there are not enough starting spaces.'
				),
				helper: [window.languageHelper.translateVars('Minimum {0}', ['2'])],
			});
		} else if (handledConfig.startFields.length > 6) {
			newWarnings.set(_uniqueId('warning-'), {
				type: Warnings.configurationInvalid,
				title: window.languageHelper.translate('Start fields'),
				content: window.languageHelper.translate(
					'The current game board state is invalid because there are too many starting spaces.'
				),
				helper: [window.languageHelper.translateVars('Maximum {0}', ['6'])],
			});
		}

		if (handledConfig.checkPoints.length < 2) {
			newWarnings.set(_uniqueId('warning-'), {
				type: Warnings.configurationInvalid,
				title: window.languageHelper.translate('Checkpoints'),
				content: window.languageHelper.translate(
					'The current game board state is not playable because there are not enough checkpoints.'
				),
				helper: [window.languageHelper.translateVars('Minimum {0}', ['2'])],
			});
		}

		return newWarnings;
	};

	onConfigUpdate = (newConfig: BoardConfigInterface) => {
		const newWidth = newConfig.width;
		const newHeight = newConfig.height;
		const { config } = this.state;
		const { width, height } = config;
		if (width !== newWidth || height !== newHeight) {
			newConfig.startFields = newConfig.startFields.filter(
				(field) => field.position[0] < newWidth && field.position[1] < newHeight
			);
			newConfig.checkPoints = newConfig.checkPoints.filter((field) => field[0] < newWidth && field[1] < newHeight);
			newConfig.walls = newConfig.walls.filter(
				(field) =>
					field[0][0] < newWidth && field[0][1] < newHeight && field[1][0] < newWidth && field[1][1] < newHeight
			);
			newConfig.lembasFields = newConfig.lembasFields.filter(
				(field) => field.position[0] < newWidth && field.position[1] < newHeight
			);
			newConfig.riverFields = newConfig.riverFields.filter(
				(field) => field.position[0] < newWidth && field.position[1] < newHeight
			);
			newConfig.holes = newConfig.holes.filter((field) => field[0] < newWidth && field[1] < newHeight);
		}
		this.setState({
			warnings: this.checkWarnings(newConfig),
			config: newConfig,
		});
	};

	onTopMenuAction = async (action: TopMenuActions) => {
		const { onClose, settings, onSettingsUpdate } = this.props;
		const { config, fileSaved } = this.state;
		switch (action) {
			case TopMenuActions.NEW:
				if (!fileSaved) {
					this.setState({ popup: 'newFileSaveCurrent' });
				} else {
					this.onConfigUpdate(BoardConfiguratorV2.defaultBoard);
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
				await this.saveConfig();
				break;
			case TopMenuActions.SAVE_AS_CONFIG:
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
					.catch(() => {});
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
				window.electron.file.openPresetDir().catch(() => {});
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

	popup = (): JSX.Element | null => {
		const { popup, windowDimensions } = this.state;
		const { os, settings, onSettingsUpdate } = this.props;
		switch (popup) {
			case 'closeSaveCurrent':
				return (
					<ConfirmPopupV2
						title={window.languageHelper.translate('Close Board Configurator')}
						abortButtonText={window.languageHelper.translate('Cancel')}
						onAbort={() => {
							this.setState({ popup: null });
						}}
						confirmButtonText={window.languageHelper.translate('Discard')}
						onConfirm={() => {
							const { onClose } = this.props;
							onClose();
						}}
						windowDimensions={windowDimensions}
						os={os}
						topOffset
						settings={settings}
					>
						{window.languageHelper.translate(
							'The current file has not yet been saved. Do you want to discard the current changes?'
						)}
					</ConfirmPopupV2>
				);
			case 'newFileSaveCurrent':
			case 'newRandomFileSaveCurrent':
				return (
					<ConfirmPopupV2
						title={window.languageHelper.translate('New Config')}
						abortButtonText={window.languageHelper.translate('Cancel')}
						onAbort={() => {
							this.setState({ popup: null });
						}}
						confirmButtonText={window.languageHelper.translate('Discard')}
						onConfirm={() => {
							if (popup === 'newRandomFileSaveCurrent') {
								this.setState({ popup: 'newFromRandom' });
							} else {
								this.onConfigUpdate(BoardConfiguratorV2.defaultBoard);
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
						{window.languageHelper.translate(
							'The current file has not yet been saved. Do you want to discard the current changes?'
						)}
					</ConfirmPopupV2>
				);
			case 'settings':
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
			case 'newFromRandom':
				return (
					<RandomBoardStartValuesDialogV2
						onAbort={() => {
							this.setState({ popup: null });
						}}
						settings={settings}
						onConfirm={(generator) => {
							this.onConfigUpdate(generator.boardJSON);
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
			default:
				return null;
		}
	};

	getTopMenuHeight = (darkMode: boolean) => {
		return darkMode ? 37 : 38;
	};

	private openConfiguration() {
		window.electron.dialog
			.openBoardConfig()
			.then((loadedConfig) => {
				if (loadedConfig) {
					this.onConfigUpdate(loadedConfig.config);
					this.setState({
						file: loadedConfig,
						fileSaved: true,
					});
					return null;
				}
				return new Error('Config not loadable');
			})
			.catch(() => {});
	}

	private zoomOut() {
		const { mainEditorZoom } = this.state;
		if (mainEditorZoom <= 0.1) {
			this.setState({ mainEditorZoom: 0.1 });
			return;
		}
		this.setState({ mainEditorZoom: mainEditorZoom - 0.1 });
	}

	private saveConfig() {
		const { file, fileSaved, config } = this.state;
		if (!fileSaved) {
			if (file) {
				window.electron.file.save(file.path, JSON.stringify(config, null, 4)).catch(() => {});
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
					.catch(() => {});
			}
		}
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
		} = this.state;
		const topMenuHeight = this.getTopMenuHeight(settings.darkMode);
		const mainHeight = windowDimensions.height - (os === 'win32' ? 32 + topMenuHeight : topMenuHeight);
		const mainWidth = windowDimensions.width - (sidebars.left + sidebars.right);
		return (
			<section className="text-white font-lato dark:bg-muted-800 bg-muted-600">
				{os === 'win32' ? (
					<div className="dragger w-[100vw] h-8 bg-muted flex items-center px-2 text-sm">
						{window.languageHelper.translate('Board-Configurator')}
						{' - '}
						{file ? file.path : window.languageHelper.translate('Unsaved File')}
						{fileSaved ? '' : ` *`}
					</div>
				) : (
					<div className="fixed top-0 right-0 dragger h-8" style={{ width: window.innerWidth - 285 }} />
				)}
				<div className={`${popup !== null && 'blur'} transition transition-[filter]`}>
					<div
						className={`dark:bg-muted-800 bg-muted-500 dark:border-0 border-t border-muted-400 px-1 ${
							os === 'darwin' ? 'pl-20' : ''
						}`}
						style={{ width: `${windowDimensions.width}px` }}
					>
						<TopMenu onAction={this.onTopMenuAction} darkMode={settings.darkMode} />
					</div>
					<div
						className="flex flex-row border-t dark:border-muted-700 border-muted-400"
						style={{
							height: `${mainHeight}px`,
							maxHeight: `${mainHeight}px`,
						}}
					>
						<div
							className="dark:bg-muted-800 bg-muted-600"
							style={{
								width: `${sidebars.left}px`,
								maxWidth: `${sidebars.left}px`,
							}}
						>
							<LeftSidebar
								config={config}
								onConfigUpdate={(newConfig) => {
									this.onConfigUpdate(newConfig);
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
							/>
						</div>
						<div
							className="dark:bg-black/40 bg-black/20 border-x dark:border-muted-700 border-muted-400"
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
									this.setState(
										{
											currentTool: 'edit',
										},
										() => {
											this.handleFieldEdit(position, config, true);
										}
									);
								}}
								file={file}
								fileSaved={fileSaved}
								fileSep={os === 'win32' ? '\\' : '/'}
							/>
						</div>
						<div
							className="dark:bg-muted-800 bg-muted-600"
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
