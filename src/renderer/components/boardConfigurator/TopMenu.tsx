import React from 'react';
import { VscColorMode, VscNewFile, VscSettingsGear, VscZoomIn, VscZoomOut } from 'react-icons/vsc';
import TopMenuItem, { TopMenuSeparator } from './TopMenuItem';
import TopMenuItemCollapsable from './TopMenuItemCollapsable';
import destinyMountainImage from '../../../../assets/textures/schicksalsberg.png';
import TopMenuSubItemCollapsable from './TopMenuSubItemCollapsable';

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
						icon={<VscNewFile />}
						label={window.t.translate('Empty')}
						type="default"
					/>
					<TopMenuItem
						className="text-left"
						action={TopMenuActions.NEW_FROM_RANDOM}
						onAction={onAction}
						label={`${window.t.translate('Random')}...`}
						type="default"
					/>
				</TopMenuSubItemCollapsable>
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.OPEN}
					onAction={onAction}
					label={`${window.t.translate('Open')}...`}
					shortCut={`${window.t.translate('Ctrl')}+O`}
					type="default"
				/>
				<TopMenuSeparator />
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.SAVE}
					onAction={onAction}
					label={`${window.t.translate('Save')}...`}
					shortCut={`${window.t.translate('Ctrl')}+S`}
					type="default"
				/>
				<TopMenuSubItemCollapsable label={window.t.translate('Save as')}>
					<TopMenuItem
						className="text-left"
						action={TopMenuActions.SAVE}
						onAction={onAction}
						label={`${window.t.translate('Configuration')}...`}
						type="default"
					/>
					<TopMenuItem
						className="text-left"
						action={TopMenuActions.SAVE_AS_PRESET}
						onAction={onAction}
						label={`${window.t.translate('Preset')}...`}
						type="default"
					/>
				</TopMenuSubItemCollapsable>
				<TopMenuSeparator />
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.OPEN_PRESET_FOLDER}
					onAction={onAction}
					label={`${window.t.translate('Open Presets Folder')}...`}
					type="default"
				/>
				<TopMenuSeparator />
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.SETTINGS}
					onAction={onAction}
					icon={<VscSettingsGear />}
					label={`${window.t.translate('Settings')}...`}
					shortCut={`${window.t.translate('Ctrl')}+Alt+S`}
					type="default"
				/>
				<TopMenuSeparator />
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.CLOSE}
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
						icon={<VscZoomIn />}
						label={window.t.translate('Zoom in')}
						shortCut={`${window.t.translate('Ctrl')}++`}
						type="default"
					/>
					<TopMenuItem
						className="text-left"
						action={TopMenuActions.ZOOM_OUT}
						onAction={onAction}
						icon={<VscZoomOut />}
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
						<VscColorMode
							title={window.t.translate('Dark Mode')}
							className={`${darkMode ? '' : 'rotate-180'} transition-all transform-gpu text-lg`}
						/>
					}
					label={null}
					type="default"
				/>
			</div>
		</div>
	);
}

export default TopMenu;
