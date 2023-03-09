import React from 'react';
import Mousetrap from 'mousetrap';
import TopMenu, {
	TopMenuActions,
} from '../components/boardConfiguratorV2/TopMenu';
import BoardConfigInterface from '../components/interfaces/BoardConfigInterface';
import LeftSidebar, {
	LeftSidebarConfigType,
	LeftSidebarOpenTab,
} from '../components/boardConfiguratorV2/LeftSidebar';
import { FieldsEnum } from '../components/generator/BoardGenerator';
import RightSidebar, {
	RightSidebarOpenTab,
} from '../components/boardConfiguratorV2/RightSidebar';
import MainEditor, {
	FieldTypeOnClick,
} from '../components/boardConfiguratorV2/MainEditor';
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
} from '../components/boardConfiguratorV2/HelperFunctions';
import ConfirmPopupV2 from '../components/boardConfiguratorV2/ConfirmPopupV2';

export type EditorToolType = FieldsEnum | 'delete' | 'edit';

type BoardConfiguratorV2Props = {
	os: NodeJS.Platform;
	onClose: () => void;
	config?: BoardConfigInterface;
};
type BoardConfiguratorV2State = {
	windowDimensions: {
		width: number;
		height: number;
	};
	sidebars: { left: number; right: number };
	darkMode: boolean;
	popup: null | 'newFileSaveCurrent';
	popupPosition: { x: number; y: number };
	popupDimension: { width: number; height: number };
	currentTool: EditorToolType;
	sideBarTabLeft: LeftSidebarOpenTab;
	sideBarTabLeftConfigType: LeftSidebarConfigType;
	sideBarTabRight: RightSidebarOpenTab;
	config: BoardConfigInterface;
	mainEditorZoom: number;
	fieldInEdit: BoardPosition | null;
};

class BoardConfiguratorV2 extends React.Component<
	BoardConfiguratorV2Props,
	BoardConfiguratorV2State
> {
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
		this.state = {
			windowDimensions: {
				width: window.innerWidth,
				height: window.innerHeight,
			},
			sidebars: {
				left: 52,
				right: 52,
			},
			darkMode: true,
			popup: null,
			popupPosition: {
				x: window.innerWidth / 2,
				y: window.innerHeight / 2,
			},
			popupDimension: {
				width: 0,
				height: 0,
			},
			currentTool: FieldsEnum.START,
			sideBarTabLeft: null,
			sideBarTabLeftConfigType: 'global',
			sideBarTabRight: null,
			config: props.config || BoardConfiguratorV2.defaultBoard,
			mainEditorZoom: 1,
			fieldInEdit: null,
		};
		this.addEventListeners = this.addEventListeners.bind(this);
		this.onTopMenuAction = this.onTopMenuAction.bind(this);
		this.handleOnFieldOrWallClick =
			this.handleOnFieldOrWallClick.bind(this);
		document.querySelector('html')?.classList.add('dark');
	}

	static get defaultProps() {
		return { config: BoardConfiguratorV2.defaultBoard };
	}

	componentDidUpdate(
		prevProps: Readonly<BoardConfiguratorV2Props>,
		prevState: Readonly<BoardConfiguratorV2State>
	) {
		const {
			darkMode,
			sideBarTabLeft,
			sidebars,
			sideBarTabRight,
			currentTool,
			popupPosition,
			windowDimensions,
			popupDimension,
			popup,
		} = this.state;
		const { os } = this.props;
		const {
			sideBarTabLeft: preSideBarTabLeft,
			sideBarTabRight: preSideBarTabRight,
			currentTool: preTool,
			popup: prePopup,
		} = prevState;
		const html = document.querySelector('html');
		if (darkMode) {
			html?.classList.add('dark');
		} else {
			html?.classList.remove('dark');
		}
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
			console.log('Switch from Edit');
			this.setState({
				sideBarTabLeftConfigType: 'global',
				fieldInEdit: null,
			});
		}
		if (popupPosition.x < 0) {
			this.setState({ popupPosition: { x: 0, y: popupPosition.y } });
		}
		if (popupPosition.y < (os === 'win32' ? 32 : 0)) {
			this.setState({
				popupPosition: {
					x: popupPosition.x,
					y: os === 'win32' ? 32 : 0,
				},
			});
		}
		if (popupPosition.x + popupDimension.width > windowDimensions.width) {
			this.setState({
				popupPosition: {
					x: windowDimensions.width - popupDimension.width,
					y: popupPosition.y,
				},
			});
		}
		if (popupPosition.y + popupDimension.height > windowDimensions.height) {
			this.setState({
				popupPosition: {
					x: popupPosition.x,
					y: windowDimensions.height - popupDimension.height,
				},
			});
		}
		if (prePopup !== popup) {
			this.setState({
				popupPosition: {
					x: window.innerWidth / 2,
					y: window.innerHeight / 2,
				},
			});
		}
	}

	handleOnFieldOrWallClick: FieldTypeOnClick = (type, position) => {
		const { currentTool, config } = this.state;
		console.log(
			`Placing: ${
				currentTool === 'delete' || currentTool === 'edit'
					? currentTool
					: FieldsEnum[currentTool]
			}`,
			'Position',
			position
		);
		if (type === 'field') {
			this.handleFieldPlacement(
				position as BoardPosition,
				config,
				currentTool
			);
		} else if (type === 'wall') {
			this.handleWallPlacement(
				position as [BoardPosition, BoardPosition],
				config,
				currentTool
			);
		}
	};

	private handleFieldPlacement(
		position: BoardPosition,
		config: BoardConfigInterface,
		currentTool: EditorToolType
	) {
		if (currentTool === 'delete') {
			this.handleFieldDelete(position, config);
		} else if (currentTool === 'edit') {
			this.handleFieldEdit(position, config);
		} else {
			this.handleFieldPlacing(position, config, currentTool);
		}
	}

	private handleFieldDelete(
		position: BoardPosition,
		config: BoardConfigInterface
	) {
		const type = getFieldType(position, config);
		switch (type) {
			case FieldsEnum.EYE:
				break;
			case FieldsEnum.CHECKPOINT:
				this.setState({ config: removeCheckpoint(position, config) });
				break;
			case FieldsEnum.START:
				this.setState({ config: removeStartField(position, config) });
				break;
			case FieldsEnum.LEMBAS:
				this.setState({ config: removeLembasField(position, config) });
				break;
			case FieldsEnum.RIVER:
				this.setState({ config: removeRiver(position, config) });
				break;
			case FieldsEnum.HOLE:
				this.setState({ config: removeHole(position, config) });
				break;
			default:
				break;
		}
	}

	private handleFieldEdit(
		position: BoardPosition,
		config: BoardConfigInterface
	) {
		const positionString = boardPosition2String(position);

		const { fieldInEdit } = this.state;
		if (
			fieldInEdit &&
			positionString === boardPosition2String(fieldInEdit)
		) {
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

	private handleFieldPlacing(
		position: BoardPosition,
		config: BoardConfigInterface,
		currentTool: FieldsEnum
	) {
		switch (currentTool) {
			case FieldsEnum.EYE:
				this.setState({ config: moveSauronsEye(position, config) });
				break;
			case FieldsEnum.CHECKPOINT:
				this.setState({ config: addCheckpoint(position, config) });
				break;
			case FieldsEnum.START:
				this.setState({ config: addStartField(position, config) });
				break;
			case FieldsEnum.LEMBAS:
				this.setState({ config: addLembasField(position, config) });
				break;
			case FieldsEnum.RIVER:
				this.setState({ config: addRiver(position, config) });
				break;
			case FieldsEnum.HOLE:
				this.setState({ config: addHole(position, config) });
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
				this.setState({
					config: {
						...config,
						walls: [
							...config.walls,
							wallBoardPosition2WallPosition(position),
						],
					},
				});
			}
			if (wallMap.get(positionString)) {
				this.setState({
					config: removeWall(position, config),
				});
			}
		}
		if (currentTool === 'delete' && !!wallMap.get(positionString)) {
			this.setState({
				config: removeWall(position, config),
			});
		}
	}

	onTopMenuAction = (action: TopMenuActions) => {
		const { onClose } = this.props;
		const { darkMode } = this.state;
		switch (action) {
			case TopMenuActions.NEW:
				this.setState({ popup: 'newFileSaveCurrent' });
				break;
			case TopMenuActions.OPEN:
				break;
			case TopMenuActions.SAVE:
				break;
			case TopMenuActions.SAVE_AS_PRESET:
				break;
			case TopMenuActions.CLOSE:
				onClose();
				break;
			case TopMenuActions.DARK_MODE:
				this.setState({ darkMode: !darkMode });
				break;
			case TopMenuActions.OPEN_PRESET_FOLDER:
				window.electron.file.openPresetDir();
				break;
			case TopMenuActions.PREFERENCES:
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
		const { popup, popupPosition } = this.state;
		const { os } = this.props;
		switch (popup) {
			case 'newFileSaveCurrent':
				return (
					<ConfirmPopupV2
						title={window.languageHelper.translate('New Config')}
						abortButtonText={window.languageHelper.translate(
							'Cancel'
						)}
						onAbort={() => {
							this.setState({ popup: null });
						}}
						confirmButtonText={window.languageHelper.translate(
							'Discard'
						)}
						onConfirm={() => {
							this.setState({
								popup: null,
								config: BoardConfiguratorV2.defaultBoard,
							});
						}}
						position={popupPosition}
						onPositionChange={(position, callback) => {
							this.setState(
								{ popupPosition: position },
								callback
							);
						}}
						onDimensionChange={(dimension) => {
							this.setState({ popupDimension: dimension });
						}}
						os={os}
					>
						{window.languageHelper.translate(
							'The current file has not yet been saved. Do you want to discard the current changes?'
						)}
					</ConfirmPopupV2>
				);
			default:
				return null;
		}
	};

	getTopMenuHeight = (darkMode: boolean) => {
		return darkMode ? 37 : 38;
	};

	private zoomOut() {
		const { mainEditorZoom } = this.state;
		if (mainEditorZoom <= 0.1) {
			this.setState({ mainEditorZoom: 0.1 });
			return;
		}
		this.setState({ mainEditorZoom: mainEditorZoom - 0.1 });
	}

	private addEventListeners() {
		Mousetrap.bind('alt+1', () => {
			const { sideBarTabLeft } = this.state;
			this.setState({
				sideBarTabLeft:
					sideBarTabLeft === 'settings' ? null : 'settings',
			});
		});
		Mousetrap.bind('alt+2', () => {
			const { sideBarTabLeft } = this.state;
			this.setState({
				sideBarTabLeft:
					sideBarTabLeft === 'checkpointOrder'
						? null
						: 'checkpointOrder',
			});
		});
		Mousetrap.bind('alt+3', () => {
			const { sideBarTabLeft } = this.state;
			this.setState({
				sideBarTabLeft: sideBarTabLeft === 'presets' ? null : 'presets',
			});
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
				sideBarTabRight:
					sideBarTabRight === 'warnings' ? null : 'warnings',
			});
		});
		Mousetrap.bind('alt++', () => {
			const { sideBarTabRight } = this.state;
			this.setState({
				sideBarTabRight:
					sideBarTabRight === 'configPreview'
						? null
						: 'configPreview',
			});
		});

		Mousetrap.bind('ctrl+shift+d', () => {
			const { darkMode } = this.state;
			this.setState({
				darkMode: !darkMode,
			});
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
		const { fieldInEdit, config } = this.state;
		if (fieldInEdit) {
			Mousetrap.bind('up', () => {
				if (fieldInEdit && fieldInEdit.y > 0) {
					this.handleFieldEdit(
						{ y: fieldInEdit.y - 1, x: fieldInEdit.x },
						config
					);
				}
			});
			Mousetrap.bind('down', () => {
				if (fieldInEdit && fieldInEdit.y < config.height - 1) {
					this.handleFieldEdit(
						{ y: fieldInEdit.y + 1, x: fieldInEdit.x },
						config
					);
				}
			});
			Mousetrap.bind('left', () => {
				if (fieldInEdit && fieldInEdit.x > 0) {
					this.handleFieldEdit(
						{ y: fieldInEdit.y, x: fieldInEdit.x - 1 },
						config
					);
				}
			});
			Mousetrap.bind('right', () => {
				if (fieldInEdit && fieldInEdit.x < config.width - 1) {
					this.handleFieldEdit(
						{ y: fieldInEdit.y, x: fieldInEdit.x + 1 },
						config
					);
				}
			});
		}

		window.addEventListener(
			'resize',
			() => {
				this.setState({
					windowDimensions: {
						width: window.innerWidth,
						height: window.innerHeight,
					},
					popupPosition: {
						x: window.innerWidth / 2,
						y: window.innerHeight / 2,
					},
				});
			},
			{ once: true }
		);
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
		const { os } = this.props;
		const {
			windowDimensions,
			sidebars,
			darkMode,
			currentTool,
			sideBarTabLeft,
			sideBarTabRight,
			config,
			mainEditorZoom,
			sideBarTabLeftConfigType,
			fieldInEdit,
			popup,
		} = this.state;
		this.addEventListeners();
		const topMenuHeight = this.getTopMenuHeight(darkMode);
		const mainHeight =
			windowDimensions.height -
			(os === 'win32' ? 32 + topMenuHeight : topMenuHeight);
		const mainWidth =
			windowDimensions.width - (sidebars.left + sidebars.right);
		return (
			<section className="text-white font-lato dark:bg-muted-800 bg-muted-600">
				<div
					className={`${
						popup !== null ? 'blur' : ''
					} transition transition-[filter]`}
				>
					{os === 'win32' ? (
						<div className="dragger w-[100vw] h-8 bg-muted flex items-center px-2 text-sm">
							{window.languageHelper.translate(
								'Board Configurator'
							)}
						</div>
					) : null}
					<div
						className={`dark:bg-muted-800 bg-muted-500 dark:border-0 border-t border-muted-400 px-1 ${
							os === 'darwin' ? 'pl-24' : ''
						}`}
						style={{ width: `${windowDimensions.width}px` }}
					>
						<TopMenu
							onAction={this.onTopMenuAction}
							darkMode={darkMode}
						/>
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
									this.setState({ config: newConfig });
								}}
								openTab={sideBarTabLeft}
								currentTool={currentTool}
								toolChange={(tool) => {
									this.setState({ currentTool: tool });
								}}
								tabChange={(tab) => {
									this.setState({ sideBarTabLeft: tab });
								}}
								configType={sideBarTabLeftConfigType}
								fieldInEdit={fieldInEdit}
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
								onFieldOrWallClick={
									this.handleOnFieldOrWallClick
								}
								fieldInEdit={fieldInEdit}
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
