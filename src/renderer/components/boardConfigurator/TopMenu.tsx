import React from 'react';
import TopMenuItem, { TopMenuSeparator } from './TopMenuItem';
import TopMenuItemCollapsable from './TopMenuItemCollapsable';
import destinyMountainImage from '../../../../assets/textures/schicksalsberg.png';
import TopMenuSubItemCollapsable from './TopMenuSubItemCollapsable';
import { VscColorMode, VscFolder, VscFolderOpened, VscGoToFile, VscNewFile, VscSave, VscSaveAs } from 'react-icons/vsc';
import { ExitIcon, FilePlusIcon, GearIcon, Half2Icon, ZoomInIcon, ZoomOutIcon } from '@radix-ui/react-icons';
import { FaRandom } from 'react-icons/fa';

/**
 * The board configurator top menu actions
 */
export enum TopMenuActions {
	NEW,
	NEW_FROM_RANDOM,
	OPEN,
	OPEN_PRESET_FOLDER,
	SAVE,
	SAVE_AS_CONFIG,
	SAVE_AS_PRESET,
	CLOSE,
	DARK_MODE,
	SETTINGS,
	ZOOM_RESET,
	ZOOM_IN,
	ZOOM_OUT,
	SAVE_AS,
}

/**
 * The board configurator top menu component properties
 */
type TopMenuProps = {
	onAction: (action: TopMenuActions) => void;
	darkMode: boolean;
};

/**
 * The board configurator top menu component
 * @param props
 * @constructor
 */
function TopMenu(props: TopMenuProps) {
	const { onAction, darkMode } = props;
	return (
		<div className="text-[14px] flex items-center">
			<img className="h-6 ml-2 mr-4" src={destinyMountainImage} alt={window.t.translate('Logo')} />
			<TopMenuItemCollapsable label={window.t.translate('File')}>
				<TopMenuSubItemCollapsable label={window.t.translate('New')}>
					<TopMenuItem
						className="text-left"
						action={TopMenuActions.NEW}
						onAction={onAction}
						icon={<FilePlusIcon />}
						label={window.t.translate('Empty')}
						type="default"
					/>
					<TopMenuItem
						className="text-left"
						action={TopMenuActions.NEW_FROM_RANDOM}
						onAction={onAction}
						icon={<FaRandom />}
						label={`${window.t.translate('Random')}...`}
						type="default"
					/>
				</TopMenuSubItemCollapsable>
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.OPEN}
					onAction={onAction}
					icon={<VscFolder />}
					label={`${window.t.translate('Open')}...`}
					shortCut={`${window.t.translate('Ctrl')}+O`}
					type="default"
				/>
				<TopMenuSeparator />
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.SAVE}
					onAction={onAction}
					icon={<VscSave />}
					label={`${window.t.translate('Save')}...`}
					shortCut={`${window.t.translate('Ctrl')}+S`}
					type="default"
				/>
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.SAVE_AS}
					onAction={onAction}
					label={`${window.t.translate('Save as')}...`}
					shortCut={`${window.t.translate('Ctrl')}+${window.t.translate('Shift')}+S`}
					type="default"
				/>
				<TopMenuSeparator />
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.OPEN_PRESET_FOLDER}
					onAction={onAction}
					icon={<VscFolderOpened />}
					label={`${window.t.translate('Open Presets Folder')}...`}
					type="default"
				/>
				<TopMenuSeparator />
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.SETTINGS}
					onAction={onAction}
					icon={<GearIcon />}
					label={`${window.t.translate('Settings')}...`}
					shortCut={`${window.t.translate('Ctrl')}+Alt+S`}
					type="default"
				/>
				<TopMenuSeparator />
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.CLOSE}
					icon={<ExitIcon />}
					onAction={onAction}
					label={window.t.translate('Close')}
					type="default"
				/>
			</TopMenuItemCollapsable>
			<TopMenuItemCollapsable label={window.t.translate('View')}>
				<TopMenuSubItemCollapsable label={window.t.translate('Zoom')}>
					<TopMenuItem
						className="text-left"
						action={TopMenuActions.ZOOM_RESET}
						onAction={onAction}
						label="100%"
						shortCut={`${window.t.translate('Ctrl')}+Enter`}
						type="default"
					/>
					<TopMenuItem
						className="text-left"
						action={TopMenuActions.ZOOM_IN}
						onAction={onAction}
						icon={<ZoomInIcon />}
						label={window.t.translate('Zoom in')}
						shortCut={`${window.t.translate('Ctrl')}++`}
						type="default"
					/>
					<TopMenuItem
						className="text-left"
						action={TopMenuActions.ZOOM_OUT}
						onAction={onAction}
						icon={<ZoomOutIcon />}
						label={window.t.translate('Zoom out')}
						shortCut={`${window.t.translate('Ctrl')}+-`}
						type="default"
					/>
				</TopMenuSubItemCollapsable>
			</TopMenuItemCollapsable>
			<div className="ml-auto flex items-center mr-1">
				<TopMenuItem
					className="text-left bg-muted"
					action={TopMenuActions.DARK_MODE}
					onAction={onAction}
					icon={
						<VscColorMode className={`${darkMode ? 'rotate-0' : 'rotate-180'} transition-all transform-gpu text-lg`} />
					}
					label={null}
					type="default"
				/>
			</div>
		</div>
	);
}

export default TopMenu;
