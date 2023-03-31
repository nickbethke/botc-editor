import React from 'react';
import { VscCopy, VscJson, VscWarning } from 'react-icons/vsc';
import _uniqueId from 'lodash/uniqueId';
import { TbScreenShare } from 'react-icons/tb';
import html2canvas from 'html2canvas';
import MonacoEditor from 'react-monaco-editor';
import SidebarMenuItem from './SidebarMenuItem';
import BoardConfigInterface, { Position } from '../interfaces/BoardConfigInterface';
import Warning, { WarningsMap } from './Warning';
import { BoardPosition } from '../generator/interfaces/boardPosition';
import { SettingsInterface } from '../../../interfaces/SettingsInterface';
import { FieldsEnum } from '../generator/BoardGenerator';

/**
 * The board configuration right sidebar component properties
 */
type RightSidebarProps = {
	tabChange: (tab: RightSidebarOpenTab) => void;
	openTab: RightSidebarOpenTab;
	config: BoardConfigInterface;
	warnings: WarningsMap;
	onFieldSelect: (position: BoardPosition) => void;
	onRemoveWall: (position: Position[]) => void;
	onRemoveField: (field: { position: BoardPosition; type: FieldsEnum }) => void;
	windowDimensions: {
		width: number;
		height: number;
	};
	settings: SettingsInterface;
	os: NodeJS.Platform;
};
/**
 * The board configuration right sidebar open tab type
 */
export type RightSidebarOpenTab = 'warnings' | 'configPreview' | null;

/**
 * The board configuration right sidebar component
 */
class RightSidebar extends React.Component<RightSidebarProps, unknown> {
	/**
	 * Handles the tab change
	 * @param openTab
	 */
	handleOpenTabChange(openTab: RightSidebarOpenTab) {
		const { tabChange, openTab: currentOpenTab } = this.props;
		if (currentOpenTab === openTab) {
			tabChange(null);
		} else {
			tabChange(openTab);
		}
	}

	/**
	 * Determines the content of the right sidebar
	 */
	content() {
		const { openTab } = this.props;
		switch (openTab) {
			case 'warnings':
				return this.notifications();
			case 'configPreview':
				return this.configPreview();
			default:
				return null;
		}
	}

	/**
	 * Renders the notifications
	 */
	notifications() {
		const { warnings, onFieldSelect, onRemoveWall, onRemoveField } = this.props;
		return (
			<div className="flex flex-col h-full">
				<div className="p-2 border-b dark:border-muted-700 border-muted-400">
					{window.languageHelper.translate('Warnings')}
				</div>
				<div className="flex bg-muted-900/25 flex-col gap-1 flex-grow max-h-full overflow-y-auto">
					{Array.from(warnings).map((value) => (
						<Warning
							key={_uniqueId('sidebar-warning-')}
							title={value[1].title}
							content={value[1].content}
							helper={value[1].helper}
							fields={value[1].fields}
							onFieldSelect={onFieldSelect}
							removeWall={value[1].removeWall || null}
							removeField={value[1].removeField || null}
							onRemoveWall={(removeWall) => {
								if (value[1].removeWall) {
									onRemoveWall(removeWall);
								}
							}}
							onRemoveField={(removeField) => {
								if (value[1].removeField) {
									onRemoveField(removeField);
								}
							}}
						/>
					))}
				</div>
			</div>
		);
	}

	/**
	 * Renders the configuration preview
	 */
	configPreview() {
		const { config, windowDimensions, settings, os } = this.props;
		const windowsHeight = settings.darkMode ? 119 : 120;
		const notWindowsHeight = settings.darkMode ? 87 : 88;
		return (
			<div className="flex flex-col h-full w-full">
				<div className="p-2 w-full border-b dark:border-muted-700 border-muted-400 flex justify-between items-center">
					{window.languageHelper.translate('Configuration Preview')}
					<button
						className="px-2 py-1 rounded bg-muted-900/25 hover:bg-muted-100/10 flex items-center gap-2"
						type="button"
						onClick={() => {
							window.electron.clipboard.write(JSON.stringify(config, null, 4)).catch(() => {});
						}}
					>
						<VscCopy />
						{window.languageHelper.translate('Copy')}
					</button>
				</div>
				<div className="flex-grow bg-muted-900/25 relative w-[347px] overflow-y-auto">
					<MonacoEditor
						value={JSON.stringify(config, null, 4)}
						theme="vs-dark"
						language="json"
						width={347}
						height={windowDimensions.height - (os === 'win32' ? windowsHeight : notWindowsHeight)}
					/>
				</div>
			</div>
		);
	}

	/**
	 * Renders the right sidebar tab switch
	 * @param openTab
	 */
	tabSwitch(openTab: RightSidebarOpenTab) {
		const { warnings, config } = this.props;
		return (
			<>
				<SidebarMenuItem
					position="left"
					label={window.languageHelper.translate('Warnings')}
					open={openTab === 'warnings'}
					icon={<VscWarning className={warnings.size ? 'text-orange-400' : 'text-accent'} />}
					onClick={() => {
						this.handleOpenTabChange('warnings');
					}}
					shortCut={`${window.languageHelper.translate('Alt')}+-`}
				/>
				<SidebarMenuItem
					position="left"
					label={window.languageHelper.translate('Configuration Preview')}
					open={openTab === 'configPreview'}
					icon={<VscJson />}
					onClick={() => {
						this.handleOpenTabChange('configPreview');
					}}
					shortCut={`${window.languageHelper.translate('Alt')}++`}
				/>
				<SidebarMenuItem
					position="left"
					label={window.languageHelper.translate('Save as screenshot')}
					open={false}
					icon={<TbScreenShare />}
					onClick={async () => {
						const element = document.getElementById('main-editor-board-board');
						if (element) {
							const canvas = await html2canvas(element, {
								backgroundColor: null,
							});
							const image = canvas.toDataURL('image/png', 1.0);
							await window.electron.dialog.saveScreenShot(`${config.name}.png`, image);
						}
					}}
				/>
			</>
		);
	}

	/**
	 * Renders the right sidebar
	 */
	render() {
		const { openTab } = this.props;
		return (
			<div className="flex flex-row h-full">
				<div className={`flex-grow ${openTab ? 'border-r dark:border-muted-700 border-muted-400' : ''}`}>
					{this.content()}
				</div>
				<div className="h-full flex flex-col py-1">{this.tabSwitch(openTab)}</div>
			</div>
		);
	}
}

export default RightSidebar;
