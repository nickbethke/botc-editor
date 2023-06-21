import React from 'react';
import {
	VscArrowDown,
	VscArrowLeft,
	VscArrowRight,
	VscArrowUp,
	VscCircleLarge,
	VscEdit,
	VscEye,
	VscFolder,
	VscHome,
	VscListOrdered,
	VscPass,
	VscSettings,
	VscTrash,
} from 'react-icons/vsc';
import { MdBorderStyle, MdOutlineFastfood } from 'react-icons/md';
import { BiWater } from 'react-icons/bi';
import { BsCursor } from 'react-icons/bs';
import Mousetrap from 'mousetrap';
import { GiEagleHead } from 'react-icons/gi';
import { FieldsEnum } from '../../generator/BoardGenerator';
import SidebarMenuItem, { SidebarMenuItemSeparator } from '../SidebarMenuItem';
import BoardConfigInterface, { Direction, DirectionEnum } from '../../../../interfaces/BoardConfigInterface';
import InputLabel from '../../InputLabel';
import { EditorToolType } from '../../../screens/BoardConfiguratorV2';
import { BoardPosition } from '../../generator/interfaces/BoardPosition';
import {
	getDirectionFieldConfig,
	getFieldType,
	getLembasFieldConfig,
	getNextDirection,
	updateLembasFieldAmount,
	updateRiverFieldDirection,
	updateStartFieldDirection,
} from '../HelperFunctions';
import DirectionHelper from '../../generator/helper/DirectionHelper';
import CheckpointSortableV2 from '../CheckpointSortableV2';
import { SettingsInterface } from '../../../../interfaces/SettingsInterface';
import { BoardPresetWithFile, RiverPresetWithFile } from '../../../../main/helper/PresetsLoader';
import PresetView from '../PresetView';
import SelectComponent from '../../Select';

/**
 * The board configurator left sidebar open tab type
 */
export type LeftSidebarOpenTab = 'presets' | 'settings' | 'checkpointOrder' | null;
/**
 * The board configurator left sidebar config type
 */
export type LeftSidebarConfigType = 'global' | 'amount' | 'direction';

/**
 * The board configurator left sidebar properties
 */
type LeftSidebarProps = {
	defaultDirection: Direction;
	currentTool: EditorToolType;
	openTab: LeftSidebarOpenTab;
	config: BoardConfigInterface;
	configType: LeftSidebarConfigType;
	fieldInEdit: BoardPosition | null;
	settings: SettingsInterface;
	riverPresets: Array<RiverPresetWithFile>;
	boardPresets: Array<BoardPresetWithFile>;

	onAddRiverPresetToBoard: (newRiverPreset: RiverPresetWithFile) => void;
	toolChange: (tool: EditorToolType) => void;
	tabChange: (tab: LeftSidebarOpenTab) => void;
	onConfigUpdate: (config: BoardConfigInterface) => void;
	defaultDirectionChange: (direction: Direction) => void;
};

/**
 * The board configurator left sidebar component
 */
class LeftSidebar extends React.Component<LeftSidebarProps, unknown> {
	/**
	 * Determines what content to display in the left sidebar
	 */
	content = () => {
		const { openTab } = this.props;
		switch (openTab) {
			case 'settings':
				return this.settings();
			case 'checkpointOrder':
				return this.checkpointOrder();
			case 'presets':
				return this.presets();
			default:
				return null;
		}
	};

	/**
	 * Determines what settings content to display in the left sidebar
	 */
	settings = () => {
		const { configType } = this.props;

		if (configType === 'direction') {
			Mousetrap.bind(['ctrl+up', 'ctrl+w'], () => this.onDirectionChange(DirectionEnum.NORTH));
			Mousetrap.bind(['ctrl+right', 'ctrl+d'], () => this.onDirectionChange(DirectionEnum.EAST));
			Mousetrap.bind(['ctrl+down', 'ctrl+s'], () => this.onDirectionChange(DirectionEnum.SOUTH));
			Mousetrap.bind(['ctrl+left', 'ctrl+a'], () => this.onDirectionChange(DirectionEnum.WEST));
		}

		switch (configType) {
			case 'global':
				return this.settingsGlobal();
			case 'direction':
				return (
					<>
						{this.settingsGlobal()}
						{this.settingsDirection()}
					</>
				);
			case 'amount':
				return (
					<>
						{this.settingsGlobal()}
						{this.settingsAmount()}
					</>
				);
			default:
				return null;
		}
	};

	/**
	 * Renders the direction settings content
	 */
	settingsDirection = () => {
		const { config, fieldInEdit } = this.props;
		if (fieldInEdit) {
			const directionField = getDirectionFieldConfig(fieldInEdit, config);
			return (
				<div className="flex flex-col">
					<div className="p-2 border-y dark:border-muted-700 border-muted-400">{window.t.translate('Direction')}</div>
					<div className="p-4 flex flex-col gap-4">
						<SelectComponent<DirectionEnum>
							containerClassName="border-b dark:border-muted-700 border-muted-400"
							value={DirectionHelper.string2DirEnum(directionField?.direction || 'NORTH')}
							onChange={(value) => {
								this.onDirectionChange(value);
							}}
							options={[
								{
									value: DirectionEnum.NORTH,
									text: window.t.translate('North'),
									icon: <VscArrowUp />,
								},
								{
									value: DirectionEnum.EAST,
									text: window.t.translate('East'),
									icon: <VscArrowRight />,
								},
								{
									value: DirectionEnum.SOUTH,
									text: window.t.translate('South'),
									icon: <VscArrowDown />,
								},
								{
									value: DirectionEnum.WEST,
									text: window.t.translate('West'),
									icon: <VscArrowLeft />,
								},
							]}
						/>
						<small>
							{window.t.translate(
								'You can also use Ctrl + arrow keys and Ctrl+W, Ctrl+A, Ctrl+S, Ctrl+D to change the direction'
							)}
						</small>
					</div>
				</div>
			);
		}
		return null;
	};

	/**
	 * Handle direction change
	 * @param value
	 */
	onDirectionChange = (value: DirectionEnum) => {
		const { config, onConfigUpdate, fieldInEdit } = this.props;
		if (fieldInEdit) {
			const type = getFieldType(fieldInEdit, config);

			if (type === FieldsEnum.EYE) {
				onConfigUpdate({
					...config,
					eye: {
						...config.eye,
						direction: DirectionHelper.dirEnumToString(value),
					},
				});
			}
			if (type === FieldsEnum.RIVER) {
				onConfigUpdate(updateRiverFieldDirection(config, fieldInEdit, value));
			}
			if (type === FieldsEnum.START) {
				onConfigUpdate(updateStartFieldDirection(config, fieldInEdit, value));
			}
		}
	};

	/**
	 * Renders the amount settings content
	 */
	settingsAmount = () => {
		const { config, onConfigUpdate, fieldInEdit } = this.props;
		if (fieldInEdit) {
			const amountField = getLembasFieldConfig(fieldInEdit, config);
			return (
				<div className="flex flex-col">
					<div className="p-2 border-y dark:border-muted-700 border-muted-400">{window.t.translate('Amount')}</div>
					<div className="p-4 flex flex-col gap-4">
						<InputLabel
							label={window.t.translate('Lembas amount')}
							type="range"
							value={amountField ? amountField.amount : 0}
							min={0}
							max={20}
							onChange={(value) => {
								onConfigUpdate(updateLembasFieldAmount(config, fieldInEdit, value));
							}}
						/>
					</div>
				</div>
			);
		}
		return null;
	};

	/**
	 * Renders the global settings content
	 */
	settingsGlobal = () => {
		const { config, onConfigUpdate, settings } = this.props;
		return (
			<div className="flex flex-col">
				<div className="p-2 border-b dark:border-muted-700 border-muted-400">
					{window.t.translate('Global Settings')}
				</div>
				<div className="p-4 flex flex-col gap-4">
					<InputLabel
						type="text"
						label={window.t.translate('Board Name')}
						value={config.name}
						onChange={(name) => {
							const newConfig = {
								...config,
								name,
							};
							onConfigUpdate(newConfig);
						}}
					/>
					<InputLabel
						type="range"
						label={window.t.translate('Board Width')}
						value={config.width}
						min={Math.max(config.eye.position[0] + 1, 2)}
						max={settings.defaultValues.maxBoardSize}
						onChange={(width) => {
							const newConfig = {
								...config,
								width,
							};
							onConfigUpdate(newConfig);
						}}
					/>
					<InputLabel
						type="range"
						label={window.t.translate('Board Height')}
						value={config.height}
						min={Math.max(config.eye.position[1] + 1, 2)}
						max={settings.defaultValues.maxBoardSize}
						onChange={(height) => {
							const newConfig = {
								...config,
								height,
							};
							onConfigUpdate(newConfig);
						}}
					/>
				</div>
			</div>
		);
	};

	/**
	 * Renders the checkpoint order content
	 */
	checkpointOrder = () => {
		const { config, onConfigUpdate, settings } = this.props;
		const darkModeHeight = settings.darkMode ? 'calc(100vh - 111px)' : 'calc(100vh - 112px)';

		return (
			<div className="flex flex-col">
				<div className="p-2 border-b dark:border-muted-700 border-muted-400">
					{window.t.translate('Checkpoint Order')}
				</div>
				<div
					className="p-4 flex flex-col gap-4 overflow-y-auto"
					style={{
						maxHeight: darkModeHeight,
					}}
				>
					<CheckpointSortableV2
						checkpoints={config.checkPoints}
						onUpdate={(checkpoints) => {
							onConfigUpdate({
								...config,
								checkPoints: checkpoints,
							});
						}}
						onSelect={() => {}}
					/>
				</div>
			</div>
		);
	};

	/**
	 * Renders the presets content
	 */
	presets = () => {
		const { riverPresets, boardPresets, onAddRiverPresetToBoard } = this.props;
		return (
			<div className="flex flex-col">
				<div className="p-2 border-b dark:border-muted-700 border-muted-400">{window.t.translate('Presets')}</div>
				<div className="overflow-y-auto">
					<PresetView
						riverPresets={riverPresets}
						boardPresets={boardPresets}
						onAddRiverPresetToBoard={onAddRiverPresetToBoard}
					/>
				</div>
			</div>
		);
	};

	/**
	 * Handle the current tool changes
	 * @param currentTool
	 */
	handleCurrentToolChange = (currentTool: EditorToolType) => {
		const { toolChange } = this.props;
		toolChange(currentTool);
	};

	/**
	 * Handle the current tab changes
	 * @param openTab
	 */
	handleOpenTabChange = (openTab: LeftSidebarOpenTab) => {
		const { tabChange, openTab: currentOpenTab } = this.props;
		if (currentOpenTab === openTab) {
			tabChange(null);
		} else {
			tabChange(openTab);
		}
		if (openTab !== 'settings') {
			Mousetrap.unbind(['ctrl+up', 'ctrl+w']);
			Mousetrap.unbind(['ctrl+right', 'ctrl+d']);
			Mousetrap.unbind(['ctrl+down', 'ctrl+s']);
			Mousetrap.unbind(['ctrl+left', 'ctrl+a']);
		}
	};

	/**
	 * Renders the left sidebar tool selection
	 * @param currentTool
	 * @private
	 */
	private toolSelection(currentTool: EditorToolType) {
		const { config, defaultDirection, defaultDirectionChange } = this.props;

		let directionArrow = <VscArrowRight />;
		if (defaultDirection === 'NORTH') {
			directionArrow = <VscArrowUp />;
		}
		if (defaultDirection === 'WEST') {
			directionArrow = <VscArrowLeft />;
		}
		if (defaultDirection === 'SOUTH') {
			directionArrow = <VscArrowDown />;
		}

		return (
			<>
				<SidebarMenuItem
					label={window.t.translate('Mouse')}
					open={currentTool === null}
					icon={<BsCursor />}
					onClick={() => {
						this.handleCurrentToolChange(null);
					}}
					shortCut={`${window.t.translate('Ctrl')}+0`}
				/>
				<SidebarMenuItem
					label={window.t.translate('Edit Field')}
					open={currentTool === 'edit'}
					icon={<VscEdit />}
					onClick={() => {
						this.handleCurrentToolChange('edit');
					}}
					shortCut={`${window.t.translate('Ctrl')}+E`}
				/>
				<SidebarMenuItem
					label={window.t.translate('Delete')}
					open={currentTool === 'delete'}
					icon={<VscTrash />}
					onClick={() => {
						this.handleCurrentToolChange('delete');
					}}
					shortCut={`${window.t.translate('Ctrl')}+D`}
				/>
				<SidebarMenuItemSeparator />
				<SidebarMenuItem
					label={window.t.translate('Default Direction')}
					open={false}
					icon={directionArrow}
					onClick={() => {
						defaultDirectionChange(getNextDirection(defaultDirection));
					}}
					shortCut="WASD"
				/>
				<SidebarMenuItemSeparator />
				<SidebarMenuItem
					label={window.t.translate('Start')}
					open={currentTool === FieldsEnum.START}
					icon={<VscHome />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.START);
					}}
					shortCut={`${window.t.translate('Ctrl')}+1`}
					disabled={config.startFields.length >= 6}
				/>
				<SidebarMenuItem
					label={window.t.translate('Checkpoint')}
					open={currentTool === FieldsEnum.CHECKPOINT}
					icon={<VscPass />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.CHECKPOINT);
					}}
					shortCut={`${window.t.translate('Ctrl')}+2`}
				/>
				<SidebarMenuItem
					label={window.t.translate('Saurons Eye')}
					open={currentTool === FieldsEnum.EYE}
					icon={<VscEye />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.EYE);
					}}
					shortCut={`${window.t.translate('Ctrl')}+3`}
				/>
				<SidebarMenuItem
					label={window.t.translate('Lembas Field')}
					open={currentTool === FieldsEnum.LEMBAS}
					icon={<MdOutlineFastfood />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.LEMBAS);
					}}
					shortCut={`${window.t.translate('Ctrl')}+4`}
				/>
				<SidebarMenuItem
					label={window.t.translate('River Field')}
					open={currentTool === FieldsEnum.RIVER}
					icon={<BiWater />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.RIVER);
					}}
					shortCut={`${window.t.translate('Ctrl')}+5`}
				/>
				<SidebarMenuItem
					label={window.t.translate('Hole')}
					open={currentTool === FieldsEnum.HOLE}
					icon={<VscCircleLarge />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.HOLE);
					}}
					shortCut={`${window.t.translate('Ctrl')}+6`}
				/>
				<SidebarMenuItem
					label={window.t.translate('Eagle Field')}
					open={currentTool === FieldsEnum.EAGLE}
					icon={<GiEagleHead />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.EAGLE);
					}}
					shortCut={`${window.t.translate('Ctrl')}+7`}
				/>
				<SidebarMenuItemSeparator />
				<SidebarMenuItem
					label={window.t.translate('Wall Tool')}
					open={currentTool === FieldsEnum.WALL}
					icon={<MdBorderStyle />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.WALL);
					}}
					shortCut={`${window.t.translate('Ctrl')}+8`}
				/>
			</>
		);
	}

	/**
	 * Renders the left sidebar tab switch
	 * @param openTab
	 * @private
	 */
	private tabSwitch(openTab: LeftSidebarOpenTab) {
		return (
			<>
				<SidebarMenuItem
					label={window.t.translate('Settings')}
					open={openTab === 'settings'}
					icon={<VscSettings />}
					onClick={() => {
						this.handleOpenTabChange('settings');
					}}
					shortCut="Alt+1"
				/>
				<SidebarMenuItem
					label={window.t.translate('Checkpoint Order')}
					open={openTab === 'checkpointOrder'}
					icon={<VscListOrdered />}
					onClick={() => {
						this.handleOpenTabChange('checkpointOrder');
					}}
					shortCut="Alt+2"
				/>
				<SidebarMenuItem
					label={window.t.translate('Presets')}
					open={openTab === 'presets'}
					icon={<VscFolder />}
					onClick={() => {
						this.handleOpenTabChange('presets');
					}}
					shortCut="Alt+3"
				/>
			</>
		);
	}

	/**
	 * Renders the left sidebar
	 */
	render() {
		const { currentTool, openTab } = this.props;
		return (
			<div className="flex flex-row h-full">
				<div className="h-full flex flex-col border-r dark:border-muted-700 border-muted-400 py-1">
					{this.tabSwitch(openTab)}
					<SidebarMenuItemSeparator />
					{this.toolSelection(currentTool)}
				</div>
				<div className="flex-grow">{this.content()}</div>
			</div>
		);
	}
}

export default LeftSidebar;
