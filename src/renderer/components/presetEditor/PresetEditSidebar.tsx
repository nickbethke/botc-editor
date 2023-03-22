import { VscFile, VscNewFile } from 'react-icons/vsc';
import React from 'react';
import _uniqueId from 'lodash/uniqueId';
import { TailSpin } from 'react-loader-spinner';
import { ParsedPath } from 'path';
import SidebarMenuItem from '../boardConfigurator/SidebarMenuItem';
import ContextMenuV2 from '../boardConfigurator/ContextMenuV2';
import ContextMenuItemV2, { ContextMenuDividerV2 } from '../boardConfigurator/ContextMenuItemV2';
import { RiverPresetWithFile } from '../../../main/helper/PresetsLoader';

type PresetEditSidebarProps = {
	windowDimensions: { width: number; height: number };
	os: NodeJS.Platform;
	currentFile: null | string;
	files: RiverPresetWithFile[];
	fileSep: string;
	isLoadingPresets: boolean;

	onOpenFile: (preset: RiverPresetWithFile, file: string) => void;
	onContextMenu: (contextMenu: JSX.Element | null) => void;
	onNewFile: () => void;
	onDeletePreset: (fullPath: string, file: string) => void;
	onRenamePreset: (fullPath: ParsedPath) => void;
};

class PresetEditSidebar extends React.Component<PresetEditSidebarProps, unknown> {
	renderFiles = () => {
		const { currentFile, files, onOpenFile, onContextMenu, fileSep, onDeletePreset, onRenamePreset } = this.props;
		return files.map((riverPresetWithFile) => (
			<button
				key={_uniqueId()}
				type="button"
				className={`text-sm flex items-center gap-2 px-2 py-1 rounded hover:dark:bg-muted-600 max-w-[367px] ${
					currentFile === riverPresetWithFile.file.base
						? 'dark:bg-muted-700 bg-muted-400 hover:bg-muted-400'
						: 'hover:bg-muted-500'
				}`}
				onClick={() => {
					const clone = structuredClone(riverPresetWithFile);
					onOpenFile(clone, riverPresetWithFile.file.base);
				}}
				onContextMenu={(event) => {
					onContextMenu(
						<ContextMenuV2 position={{ x: event.clientX, y: event.clientY }}>
							<ContextMenuItemV2
								text={window.languageHelper.translate('Rename')}
								onClick={() => {
									onRenamePreset(riverPresetWithFile.file);
								}}
							/>
							<ContextMenuDividerV2 />
							<ContextMenuItemV2
								text={window.languageHelper.translate('Delete')}
								onClick={() => {
									onDeletePreset(
										riverPresetWithFile.file.dir + fileSep + riverPresetWithFile.file.base,
										riverPresetWithFile.file.base
									);
								}}
							/>
						</ContextMenuV2>
					);
				}}
			>
				<VscFile />
				<span className="whitespace-nowrap">{riverPresetWithFile.file.base}</span>
				<span className="dark:text-muted-300 text-muted-50 truncate text-ellipsis">{riverPresetWithFile.name}</span>
			</button>
		));
	};

	render() {
		const { windowDimensions, os, onNewFile, isLoadingPresets } = this.props;
		const winHeight = 123;
		return (
			<div className="h-full max-w-[450px] w-[450px] flex flex-col">
				<div className="border-y border-r dark:border-muted-700 border-muted-400 dark:bg-muted-800 flex w-full">
					<SidebarMenuItem
						label={window.languageHelper.translate('New Preset')}
						open={false}
						icon={<VscNewFile />}
						onClick={onNewFile}
						position="bottom"
					/>
					{isLoadingPresets ? (
						<div className="ml-auto">
							<SidebarMenuItem
								label={window.languageHelper.translate('Loading...')}
								open={false}
								icon={<TailSpin height={20} width={20} color="#ffffff" />}
								onClick={onNewFile}
								position="bottom"
							/>
						</div>
					) : null}
				</div>
				<div
					className="flex flex-col gap-1 p-4 dark:bg-[#1e1e1e] bg-muted-700 text-white grow overflow-y-auto border-r dark:border-muted-700 border-muted-400"
					style={{ height: windowDimensions.height - (os === 'win32' ? winHeight : 41) }}
				>
					{isLoadingPresets ? (
						<TailSpin wrapperClass="h-full flex items-center justify-center" height={40} width={40} color="#ffffff" />
					) : (
						this.renderFiles()
					)}
				</div>
			</div>
		);
	}
}

export default PresetEditSidebar;
