import React from 'react';
import { VscColorMode } from 'react-icons/vsc';
import TopMenuItem, { TopMenuSeparator } from './TopMenuItem';
import TopMenuItemCollapsable from './TopMenuItemCollapsable';

export enum TopMenuActions {
	NEW,
	NEW_FROM_RANDOM,
	OPEN,
	OPEN_PRESET_FOLDER,
	SAVE,
	SAVE_AS_PRESET,
	CLOSE,
	DARK_MODE,
}

type TopMenuProps = {
	onAction: (action: TopMenuActions) => void;
	darkMode: boolean;
};

function TopMenu(props: TopMenuProps) {
	const { onAction, darkMode } = props;
	return (
		<div className="text-[14px] flex">
			<TopMenuItemCollapsable
				label={window.languageHelper.translate('New')}
			>
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.NEW}
					onAction={onAction}
					label={window.languageHelper.translate('Empty')}
				/>
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.NEW_FROM_RANDOM}
					onAction={onAction}
					label={window.languageHelper.translate('from Random')}
				/>
			</TopMenuItemCollapsable>
			<TopMenuItemCollapsable
				label={window.languageHelper.translate('Open')}
			>
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.OPEN}
					onAction={onAction}
					label={window.languageHelper.translate(
						'Open Configuration'
					)}
				/>
				<TopMenuSeparator />
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.OPEN_PRESET_FOLDER}
					onAction={onAction}
					label={window.languageHelper.translate(
						'Open Presets Folder'
					)}
				/>
			</TopMenuItemCollapsable>
			<TopMenuItemCollapsable
				label={window.languageHelper.translate('Save')}
			>
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.SAVE}
					onAction={onAction}
					label={window.languageHelper.translate('as Configuration')}
				/>
				<TopMenuItem
					className="text-left"
					action={TopMenuActions.SAVE_AS_PRESET}
					onAction={onAction}
					label={window.languageHelper.translate('as Preset')}
				/>
			</TopMenuItemCollapsable>
			<div className="ml-auto flex items-center">
				<TopMenuItem
					action={TopMenuActions.CLOSE}
					onAction={onAction}
					label={window.languageHelper.translate('Close')}
				/>
				<TopMenuItem
					className="text-left bg-muted"
					action={TopMenuActions.DARK_MODE}
					onAction={onAction}
					label={
						<div
							className="flex justify-between items-center gap-2 text-lg"
							title={window.languageHelper.translate('Dark Mode')}
						>
							<VscColorMode
								className={`${
									darkMode ? '' : 'rotate-180'
								} transition transition-all transform-gpu`}
							/>
						</div>
					}
				/>
			</div>
		</div>
	);
}

export default TopMenu;
