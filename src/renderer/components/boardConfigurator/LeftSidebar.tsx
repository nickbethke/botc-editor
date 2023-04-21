import React from 'react';
import {
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
import { FieldsEnum } from '../generator/BoardGenerator';
import SidebarMenuItem, { SidebarMenuItemSeparator } from './SidebarMenuItem';
import BoardConfigInterface, { DirectionEnum } from '../interfaces/BoardConfigInterface';
import InputLabel from '../InputLabel';
import { EditorToolType } from '../../screens/BoardConfiguratorV2';
import { BoardPosition } from '../generator/interfaces/boardPosition';
import {
	getDirectionFieldConfig,
	getFieldType,
	getLembasFieldConfig,
	updateLembasFieldAmount,
	updateRiverFieldDirection,
	updateStartFieldDirection,
} from './HelperFunctions';
import DirectionHelper from '../generator/helper/DirectionHelper';
import CheckpointSortableV2 from './CheckpointSortableV2';
import { SettingsInterface } from '../../../interfaces/SettingsInterface';
import { BoardPresetWithFile, RiverPresetWithFile } from '../../../main/helper/PresetsLoader';
import PresetView from './PresetView';

/**
 * The board configurator left sidebar properties
 */
type LeftSidebarProps = {
	toolChange: (tool: EditorToolType) => void;
	tabChange: (tab: LeftSidebarOpenTab) => void;
	currentTool: EditorToolType;
	openTab: LeftSidebarOpenTab;
	config: BoardConfigInterface;
	onConfigUpdate: (config: BoardConfigInterface) => void;
	configType: LeftSidebarConfigType;
	fieldInEdit: BoardPosition | null;
	settings: SettingsInterface;
	riverPresets: Array<RiverPresetWithFile>;
	boardPresets: Array<BoardPresetWithFile>;
	onAddRiverPresetToBoard: (newRiverPreset: RiverPresetWithFile) => void;
};
/**
 * The board configurator left sidebar open tab type
 */
export type LeftSidebarOpenTab = 'presets' | 'settings' | 'checkpointOrder' | null;
/**
 * The board configurator left sidebar config type
 */
export type LeftSidebarConfigType = 'global' | 'amount' | 'direction';

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
					<div className="p-2 border-y dark:border-muted-700 border-muted-400">
						{window.translationHelper.translate('Direction')}
					</div>
					<div className="p-4 flex flex-col gap-4">
						<select
							id="select-direction"
							className="bg-transparent border-b-2 text-lg px-4 py-2 w-full"
							value={DirectionHelper.directionToDirEnum(directionField?.direction || 'NORTH')}
							onChange={(event) => {
								this.onDirectionChange(event);
							}}
						>
							<option value={DirectionEnum.NORTH}>{window.translationHelper.translate('North')}</option>
							<option value={DirectionEnum.EAST}>{window.translationHelper.translate('East')}</option>
							<option value={DirectionEnum.SOUTH}>{window.translationHelper.translate('South')}</option>
							<option value={DirectionEnum.WEST}>{window.translationHelper.translate('West')}</option>
						</select>
					</div>
				</div>
			);
		}
		return null;
	};

	/**
	 * Handle direction change
	 * @param event
	 */
	onDirectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const { config, onConfigUpdate, fieldInEdit } = this.props;
		if (fieldInEdit) {
			const type = getFieldType(fieldInEdit, config);
			const direction = Number.parseInt(event.target.value, 10) as DirectionEnum;

			if (type === FieldsEnum.EYE) {
				onConfigUpdate({
					...config,
					eye: {
						...config.eye,
						direction: DirectionHelper.dirEnumToString(direction),
					},
				});
			}
			if (type === FieldsEnum.RIVER) {
				onConfigUpdate(updateRiverFieldDirection(config, fieldInEdit, direction));
			}
			if (type === FieldsEnum.START) {
				onConfigUpdate(updateStartFieldDirection(config, fieldInEdit, direction));
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
					<div className="p-2 border-y dark:border-muted-700 border-muted-400">
						{window.translationHelper.translate('Amount')}
					</div>
					<div className="p-4 flex flex-col gap-4">
						<InputLabel
							label={window.translationHelper.translate('Lembas amount')}
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
		const { config, onConfigUpdate } = this.props;
		return (
			<div className="flex flex-col">
				<div className="p-2 border-b dark:border-muted-700 border-muted-400">
					{window.translationHelper.translate('Global Settings')}
				</div>
				<div className="p-4 flex flex-col gap-4">
					<InputLabel
						type="text"
						label={window.translationHelper.translate('Board Name')}
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
						label={window.translationHelper.translate('Board Width')}
						value={config.width}
						min={Math.max(config.eye.position[0] + 1, 2)}
						max={20}
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
						label={window.translationHelper.translate('Board Height')}
						value={config.height}
						min={Math.max(config.eye.position[1] + 1, 2)}
						max={20}
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
					{window.translationHelper.translate('Checkpoint Order')}
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
				<div className="p-2 border-b dark:border-muted-700 border-muted-400">
					{window.translationHelper.translate('Presets')}
				</div>
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
	};

	/**
	 * Renders the left sidebar tool selection
	 * @param currentTool
	 * @private
	 */
	private toolSelection(currentTool: EditorToolType) {
		return (
			<>
				<SidebarMenuItem
					label={window.translationHelper.translate('Mouse')}
					open={currentTool === null}
					icon={<BsCursor />}
					onClick={() => {
						this.handleCurrentToolChange(null);
					}}
					shortCut={`${window.translationHelper.translate('Ctrl')}+0`}
				/>
				<SidebarMenuItem
					label={window.translationHelper.translate('Edit Field')}
					open={currentTool === 'edit'}
					icon={<VscEdit />}
					onClick={() => {
						this.handleCurrentToolChange('edit');
					}}
					shortCut={`${window.translationHelper.translate('Ctrl')}+E`}
				/>
				<SidebarMenuItem
					label={window.translationHelper.translate('Delete')}
					open={currentTool === 'delete'}
					icon={<VscTrash />}
					onClick={() => {
						this.handleCurrentToolChange('delete');
					}}
					shortCut={`${window.translationHelper.translate('Ctrl')}+D`}
				/>
				<SidebarMenuItemSeparator />

				<SidebarMenuItem
					label={window.translationHelper.translate('Start')}
					open={currentTool === FieldsEnum.START}
					icon={<VscHome />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.START);
					}}
					shortCut={`${window.translationHelper.translate('Ctrl')}+1`}
				/>
				<SidebarMenuItem
					label={window.translationHelper.translate('Checkpoint')}
					open={currentTool === FieldsEnum.CHECKPOINT}
					icon={<VscPass />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.CHECKPOINT);
					}}
					shortCut={`${window.translationHelper.translate('Ctrl')}+2`}
				/>
				<SidebarMenuItem
					label={window.translationHelper.translate('Saurons Eye')}
					open={currentTool === FieldsEnum.EYE}
					icon={<VscEye />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.EYE);
					}}
					shortCut={`${window.translationHelper.translate('Ctrl')}+3`}
				/>
				<SidebarMenuItem
					label={window.translationHelper.translate('Lembas Field')}
					open={currentTool === FieldsEnum.LEMBAS}
					icon={<MdOutlineFastfood />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.LEMBAS);
					}}
					shortCut={`${window.translationHelper.translate('Ctrl')}+4`}
				/>
				<SidebarMenuItem
					label={window.translationHelper.translate('River Field')}
					open={currentTool === FieldsEnum.RIVER}
					icon={<BiWater />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.RIVER);
					}}
					shortCut={`${window.translationHelper.translate('Ctrl')}+5`}
				/>
				<SidebarMenuItem
					label={window.translationHelper.translate('Hole')}
					open={currentTool === FieldsEnum.HOLE}
					icon={<VscCircleLarge />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.HOLE);
					}}
					shortCut={`${window.translationHelper.translate('Ctrl')}+6`}
				/>
				<SidebarMenuItemSeparator />
				<SidebarMenuItem
					label={window.translationHelper.translate('Wall Tool')}
					open={currentTool === FieldsEnum.WALL}
					icon={<MdBorderStyle />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.WALL);
					}}
					shortCut={`${window.translationHelper.translate('Ctrl')}+7`}
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
					label={window.translationHelper.translate('Settings')}
					open={openTab === 'settings'}
					icon={<VscSettings />}
					onClick={() => {
						this.handleOpenTabChange('settings');
					}}
					shortCut="Alt+1"
				/>
				<SidebarMenuItem
					label={window.translationHelper.translate('Checkpoint Order')}
					open={openTab === 'checkpointOrder'}
					icon={<VscListOrdered />}
					onClick={() => {
						this.handleOpenTabChange('checkpointOrder');
					}}
					shortCut="Alt+2"
				/>
				<SidebarMenuItem
					label={window.translationHelper.translate('Presets')}
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
