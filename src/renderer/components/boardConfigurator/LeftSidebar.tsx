import React from 'react';
import {
	VscCircleLargeOutline,
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
import BoardConfigInterface, {
	DirectionEnum,
} from '../interfaces/BoardConfigInterface';
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

type LeftSidebarProps = {
	toolChange: (tool: EditorToolType) => void;
	tabChange: (tab: LeftSidebarOpenTab) => void;
	currentTool: EditorToolType;
	openTab: LeftSidebarOpenTab;
	config: BoardConfigInterface;
	onConfigUpdate: (config: BoardConfigInterface) => void;
	configType: LeftSidebarConfigType;
	fieldInEdit: BoardPosition | null;
};

export type LeftSidebarOpenTab =
	| 'presets'
	| 'settings'
	| 'checkpointOrder'
	| null;
export type LeftSidebarConfigType = 'global' | 'amount' | 'direction';

class LeftSidebar extends React.Component<LeftSidebarProps, unknown> {
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

	settingsDirection = () => {
		const { config, fieldInEdit } = this.props;
		if (fieldInEdit) {
			const directionField = getDirectionFieldConfig(fieldInEdit, config);
			return (
				<div className="flex flex-col">
					<div className="p-2 border-y dark:border-muted-700 border-muted-400">
						{window.languageHelper.translate('Direction')}
					</div>
					<div className="p-4 flex flex-col gap-4">
						<select
							id="select-direction"
							className="bg-transparent border-b-2 text-lg px-4 py-2 w-full"
							value={DirectionHelper.stringToDirEnum(
								directionField?.direction || 'NORTH'
							)}
							onChange={(event) => {
								this.onDirectionChange(event);
							}}
						>
							<option value={DirectionEnum.NORTH}>
								{window.languageHelper.translate('North')}
							</option>
							<option value={DirectionEnum.EAST}>
								{window.languageHelper.translate('East')}
							</option>
							<option value={DirectionEnum.SOUTH}>
								{window.languageHelper.translate('South')}
							</option>
							<option value={DirectionEnum.WEST}>
								{window.languageHelper.translate('West')}
							</option>
						</select>
					</div>
				</div>
			);
		}
		return null;
	};

	onDirectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const { config, onConfigUpdate, fieldInEdit } = this.props;
		if (fieldInEdit) {
			const type = getFieldType(fieldInEdit, config);
			const direction = Number.parseInt(
				event.target.value,
				10
			) as DirectionEnum;

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
				onConfigUpdate(
					updateRiverFieldDirection(config, fieldInEdit, direction)
				);
			}
			if (type === FieldsEnum.START) {
				onConfigUpdate(
					updateStartFieldDirection(config, fieldInEdit, direction)
				);
			}
		}
	};

	settingsAmount = () => {
		const { config, onConfigUpdate, fieldInEdit } = this.props;
		if (fieldInEdit) {
			const amountField = getLembasFieldConfig(fieldInEdit, config);
			return (
				<div className="flex flex-col">
					<div className="p-2 border-y dark:border-muted-700 border-muted-400">
						{window.languageHelper.translate('Amount')}
					</div>
					<div className="p-4 flex flex-col gap-4">
						<InputLabel
							type="range"
							value={amountField ? amountField.amount : 0}
							min={0}
							max={20}
							onChange={(value) => {
								onConfigUpdate(
									updateLembasFieldAmount(
										config,
										fieldInEdit,
										value
									)
								);
							}}
						/>
					</div>
				</div>
			);
		}
		return null;
	};

	settingsGlobal = () => {
		const { config, onConfigUpdate } = this.props;
		return (
			<div className="flex flex-col">
				<div className="p-2 border-b dark:border-muted-700 border-muted-400">
					{window.languageHelper.translate('Global Settings')}
				</div>
				<div className="p-4 flex flex-col gap-4">
					<InputLabel
						type="text"
						label={window.languageHelper.translate('Board Name')}
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
						label={window.languageHelper.translate('Board Width')}
						value={config.width}
						min={2}
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
						label={window.languageHelper.translate('Board Height')}
						value={config.height}
						min={2}
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

	checkpointOrder = () => {
		const { config, onConfigUpdate } = this.props;
		return (
			<div className="flex flex-col">
				<div className="p-2 border-b dark:border-muted-700 border-muted-400">
					{window.languageHelper.translate('Checkpoint Order')}
				</div>
				<div className="p-4 flex flex-col gap-4">
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

	presets = () => {
		return (
			<div className="flex flex-col">
				<div className="p-2 border-b dark:border-muted-700 border-muted-400">
					{window.languageHelper.translate('Presets')}
				</div>
			</div>
		);
	};

	handleCurrentToolChange = (currentTool: EditorToolType) => {
		const { toolChange } = this.props;
		toolChange(currentTool);
	};

	handleOpenTabChange = (openTab: LeftSidebarOpenTab) => {
		const { tabChange, openTab: currentOpenTab } = this.props;
		if (currentOpenTab === openTab) {
			tabChange(null);
		} else {
			tabChange(openTab);
		}
	};

	private toolSelection(currentTool: EditorToolType) {
		return (
			<>
				<SidebarMenuItem
					label={window.languageHelper.translate('Mouse')}
					open={currentTool === null}
					icon={<BsCursor />}
					onClick={() => {
						this.handleCurrentToolChange(null);
					}}
					shortCut={`${window.languageHelper.translate('Ctrl')}+0`}
				/>
				<SidebarMenuItem
					label={window.languageHelper.translate('Edit Field')}
					open={currentTool === 'edit'}
					icon={<VscEdit />}
					onClick={() => {
						this.handleCurrentToolChange('edit');
					}}
					shortCut={`${window.languageHelper.translate('Ctrl')}+E`}
				/>
				<SidebarMenuItem
					label={window.languageHelper.translate('Delete')}
					open={currentTool === 'delete'}
					icon={<VscTrash />}
					onClick={() => {
						this.handleCurrentToolChange('delete');
					}}
					shortCut={`${window.languageHelper.translate('Ctrl')}+D`}
				/>
				<SidebarMenuItemSeparator />

				<SidebarMenuItem
					label={window.languageHelper.translate('Start')}
					open={currentTool === FieldsEnum.START}
					icon={<VscHome />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.START);
					}}
					shortCut={`${window.languageHelper.translate('Ctrl')}+1`}
				/>
				<SidebarMenuItem
					label={window.languageHelper.translate('Checkpoint')}
					open={currentTool === FieldsEnum.CHECKPOINT}
					icon={<VscPass />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.CHECKPOINT);
					}}
					shortCut={`${window.languageHelper.translate('Ctrl')}+2`}
				/>
				<SidebarMenuItem
					label={window.languageHelper.translate('Saurons Eye')}
					open={currentTool === FieldsEnum.EYE}
					icon={<VscEye />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.EYE);
					}}
					shortCut={`${window.languageHelper.translate('Ctrl')}+3`}
				/>
				<SidebarMenuItem
					label={window.languageHelper.translate('Lembas Field')}
					open={currentTool === FieldsEnum.LEMBAS}
					icon={<MdOutlineFastfood />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.LEMBAS);
					}}
					shortCut={`${window.languageHelper.translate('Ctrl')}+4`}
				/>
				<SidebarMenuItem
					label={window.languageHelper.translate('River Field')}
					open={currentTool === FieldsEnum.RIVER}
					icon={<BiWater />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.RIVER);
					}}
					shortCut={`${window.languageHelper.translate('Ctrl')}+5`}
				/>
				<SidebarMenuItem
					label={window.languageHelper.translate('Hole')}
					open={currentTool === FieldsEnum.HOLE}
					icon={<VscCircleLargeOutline />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.HOLE);
					}}
					shortCut={`${window.languageHelper.translate('Ctrl')}+6`}
				/>
				<SidebarMenuItemSeparator />
				<SidebarMenuItem
					label={window.languageHelper.translate('Wall Tool')}
					open={currentTool === FieldsEnum.WALL}
					icon={<MdBorderStyle />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.WALL);
					}}
					shortCut={`${window.languageHelper.translate('Ctrl')}+7`}
				/>
			</>
		);
	}

	private tabSwitch(openTab: LeftSidebarOpenTab) {
		return (
			<>
				<SidebarMenuItem
					label={window.languageHelper.translate('Settings')}
					open={openTab === 'settings'}
					icon={<VscSettings />}
					onClick={() => {
						this.handleOpenTabChange('settings');
					}}
					shortCut="Alt+1"
				/>
				<SidebarMenuItem
					label={window.languageHelper.translate('Checkpoint Order')}
					open={openTab === 'checkpointOrder'}
					icon={<VscListOrdered />}
					onClick={() => {
						this.handleOpenTabChange('checkpointOrder');
					}}
					shortCut="Alt+2"
				/>
				<SidebarMenuItem
					label={window.languageHelper.translate('Presets')}
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
