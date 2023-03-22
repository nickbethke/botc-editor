import React from 'react';
import { VscColorMode, VscNewFile, VscSettingsGear, VscZoomIn, VscZoomOut } from 'react-icons/vsc';
import TopMenuItem, { TopMenuSeparator } from './TopMenuItem';
import TopMenuItemCollapsable from './TopMenuItemCollapsable';
import destinyMountainImage from '../../../../assets/textures/schicksalsberg.png';
import TopMenuSubItemCollapsable from './TopMenuSubItemCollapsable';

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

type TopMenuProps = {
	onAction: (action: TopMenuActions) => void;
	darkMode: boolean;
};

function TopMenu(props: TopMenuProps) {
	const { onAction, darkMode } = props;
	return (
		<div className="text-[14px] flex items-center">
			<img className="h-6 ml-2 mr-4" src={destinyMountainImage} alt={window.languageHelper.translate('Logo')} />
			<TopMenuItemCollapsable label={window.languageHelper.translate('File')}>
				<TopMenuSubItemCollapsable label={window.languageHelper.translate('New')}>
					<TopMenuItem
						className="text-left"
						action={TopMenuActions.NEW}
						onAction={onAction}
						icon={<VscNewFile />}
						label={window.languageHelper.translate('Empty')}
						type="default"
					/>
					<TopMenuItem
						className="text-left"
						action={TopMenuActions.NEW_FROM_RANDOM}
						onAction={onAction}
						label={`${window.languageHelper.translate('Random')}...`}
						type="default"
					/>
				</TopMenuSubItemCollapsable>
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.OPEN}
					onAction={onAction}
					label={`${window.languageHelper.translate('Open')}...`}
					shortCut={`${window.languageHelper.translate('Ctrl')}+O`}
					type="default"
				/>
				<TopMenuSeparator />
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.SAVE}
					onAction={onAction}
					label={`${window.languageHelper.translate('Save')}...`}
					shortCut={`${window.languageHelper.translate('Ctrl')}+S`}
					type="default"
				/>
				<TopMenuSubItemCollapsable label={window.languageHelper.translate('Save as')}>
					<TopMenuItem
						className="text-left"
						action={TopMenuActions.SAVE}
						onAction={onAction}
						label={`${window.languageHelper.translate('Configuration')}...`}
						type="default"
					/>
					<TopMenuItem
						className="text-left"
						action={TopMenuActions.SAVE_AS_PRESET}
						onAction={onAction}
						label={`${window.languageHelper.translate('Preset')}...`}
						type="default"
					/>
				</TopMenuSubItemCollapsable>
				<TopMenuSeparator />
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.OPEN_PRESET_FOLDER}
					onAction={onAction}
					label={`${window.languageHelper.translate('Open Presets Folder')}...`}
					type="default"
				/>
				<TopMenuSeparator />
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.SETTINGS}
					onAction={onAction}
					icon={<VscSettingsGear />}
					label={`${window.languageHelper.translate('Settings')}...`}
					shortCut={`${window.languageHelper.translate('Ctrl')}+Alt+S`}
					type="default"
				/>
				<TopMenuSeparator />
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.CLOSE}
					onAction={onAction}
					label={window.languageHelper.translate('Close')}
					type="default"
				/>
			</TopMenuItemCollapsable>
			<TopMenuItemCollapsable label={window.languageHelper.translate('View')}>
				<TopMenuSubItemCollapsable label={window.languageHelper.translate('Zoom')}>
					<TopMenuItem
						className="text-left"
						action={TopMenuActions.ZOOM_RESET}
						onAction={onAction}
						label="100%"
						shortCut={`${window.languageHelper.translate('Ctrl')}+Enter`}
						type="default"
					/>
					<TopMenuItem
						className="text-left"
						action={TopMenuActions.ZOOM_IN}
						onAction={onAction}
						icon={<VscZoomIn />}
						label={window.languageHelper.translate('Zoom in')}
						shortCut={`${window.languageHelper.translate('Ctrl')}++`}
						type="default"
					/>
					<TopMenuItem
						className="text-left"
						action={TopMenuActions.ZOOM_OUT}
						onAction={onAction}
						icon={<VscZoomOut />}
						label={window.languageHelper.translate('Zoom out')}
						shortCut={`${window.languageHelper.translate('Ctrl')}+-`}
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
							title={window.languageHelper.translate('Dark Mode')}
							className={`${darkMode ? '' : 'rotate-180'} transition transition-all transform-gpu text-lg`}
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
