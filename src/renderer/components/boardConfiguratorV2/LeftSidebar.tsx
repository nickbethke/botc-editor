import React from 'react';
import {
	VscCircleLargeOutline,
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
import { FieldsEnum } from '../generator/BoardGenerator';
import SidebarMenuItem, { SidebarMenuItemSeparator } from './SidebarMenuItem';

type LeftSidebarProps = {
	toolChange: (tool: LeftSidebarCurrentTool) => void;
	tabChange: (tab: LeftSidebarOpenTab) => void;
	currentTool: LeftSidebarCurrentTool;
	openTab: LeftSidebarOpenTab;
};

export type LeftSidebarOpenTab =
	| 'presets'
	| 'settings'
	| 'checkpointOrder'
	| null;
export type LeftSidebarCurrentTool = FieldsEnum | 'delete';

class LeftSidebar extends React.Component<LeftSidebarProps, unknown> {
	content = () => {
		const { openTab } = this.props;
		switch (openTab) {
			case 'presets':
				return this.presets();
			case 'settings':
				return this.settings();
			case 'checkpointOrder':
				return this.checkpointOrder();
			default:
				return null;
		}
	};

	settings = () => {
		return (
			<div className="flex flex-col">
				<div className="p-2 border-b dark:border-muted-700 border-muted-400">
					{window.languageHelper.translate('Settings')}
				</div>
			</div>
		);
	};

	checkpointOrder = () => {
		return (
			<div className="flex flex-col">
				<div className="p-2 border-b dark:border-muted-700 border-muted-400">
					{window.languageHelper.translate('Checkpoint Order')}
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

	handleCurrentToolChange = (currentTool: LeftSidebarCurrentTool) => {
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

	private toolSelection(currentTool: LeftSidebarCurrentTool) {
		return (
			<>
				<SidebarMenuItem
					label={window.languageHelper.translate('Start')}
					open={currentTool === FieldsEnum.START}
					icon={<VscHome />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.START);
					}}
				/>
				<SidebarMenuItem
					label={window.languageHelper.translate('Checkpoint')}
					open={currentTool === FieldsEnum.CHECKPOINT}
					icon={<VscPass />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.CHECKPOINT);
					}}
				/>
				<SidebarMenuItem
					label={window.languageHelper.translate('Saurons Eye')}
					open={currentTool === FieldsEnum.EYE}
					icon={<VscEye />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.EYE);
					}}
				/>
				<SidebarMenuItem
					label={window.languageHelper.translate('Lembas Field')}
					open={currentTool === FieldsEnum.LEMBAS}
					icon={<MdOutlineFastfood />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.LEMBAS);
					}}
				/>
				<SidebarMenuItem
					label={window.languageHelper.translate('River Field')}
					open={currentTool === FieldsEnum.RIVER}
					icon={<BiWater />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.RIVER);
					}}
				/>
				<SidebarMenuItem
					label={window.languageHelper.translate('Hole')}
					open={currentTool === FieldsEnum.HOLE}
					icon={<VscCircleLargeOutline />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.HOLE);
					}}
				/>
				<SidebarMenuItemSeparator />
				<SidebarMenuItem
					label={window.languageHelper.translate('Wall')}
					open={currentTool === FieldsEnum.WALL}
					icon={<MdBorderStyle />}
					onClick={() => {
						this.handleCurrentToolChange(FieldsEnum.WALL);
					}}
				/>
				<SidebarMenuItemSeparator />
				<SidebarMenuItem
					label={window.languageHelper.translate('Delete')}
					open={currentTool === 'delete'}
					icon={<VscTrash />}
					onClick={() => {
						this.handleCurrentToolChange('delete');
					}}
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
				/>
				<SidebarMenuItem
					label={window.languageHelper.translate('Checkpoint Order')}
					open={openTab === 'checkpointOrder'}
					icon={<VscListOrdered />}
					onClick={() => {
						this.handleOpenTabChange('checkpointOrder');
					}}
				/>
				<SidebarMenuItem
					label={window.languageHelper.translate('Presets')}
					open={openTab === 'presets'}
					icon={<VscFolder />}
					onClick={() => {
						this.handleOpenTabChange('presets');
					}}
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
