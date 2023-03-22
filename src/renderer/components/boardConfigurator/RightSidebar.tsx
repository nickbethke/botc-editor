import React from 'react';
import { VscCopy, VscJson, VscWarning } from 'react-icons/vsc';
import _uniqueId from 'lodash/uniqueId';
import { TbScreenShare } from 'react-icons/tb';
import html2canvas from 'html2canvas';
import SidebarMenuItem from './SidebarMenuItem';
import BoardConfigInterface from '../interfaces/BoardConfigInterface';
import Warning, { WarningsMap } from './Warning';
import { BoardPosition } from '../generator/interfaces/boardPosition';

type RightSidebarProps = {
	tabChange: (tab: RightSidebarOpenTab) => void;
	openTab: RightSidebarOpenTab;
	config: BoardConfigInterface;
	warnings: WarningsMap;
	onFieldSelect: (position: BoardPosition) => void;
};

export type RightSidebarOpenTab = 'warnings' | 'configPreview' | null;

class RightSidebar extends React.Component<RightSidebarProps, unknown> {
	content = () => {
		const { openTab } = this.props;
		switch (openTab) {
			case 'warnings':
				return this.notifications();
			case 'configPreview':
				return this.configPreview();
			default:
				return null;
		}
	};

	notifications = () => {
		const { warnings, onFieldSelect } = this.props;
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
						/>
					))}
				</div>
			</div>
		);
	};

	configPreview = () => {
		const { config } = this.props;
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
				<div className="flex-grow bg-muted-900/25 relative p-2 w-[347px] overflow-y-auto">
					<pre className="h-full font-jetbrains user-select text-sm">{JSON.stringify(config, null, 4)}</pre>
				</div>
			</div>
		);
	};

	handleOpenTabChange = (openTab: RightSidebarOpenTab) => {
		const { tabChange, openTab: currentOpenTab } = this.props;
		if (currentOpenTab === openTab) {
			tabChange(null);
		} else {
			tabChange(openTab);
		}
	};

	private tabSwitch(openTab: RightSidebarOpenTab) {
		const { warnings, config } = this.props;
		return (
			<>
				<SidebarMenuItem
					position="right"
					label={window.languageHelper.translate('Warnings')}
					open={openTab === 'warnings'}
					icon={<VscWarning className={warnings.size ? 'text-orange-400' : 'text-accent'} />}
					onClick={() => {
						this.handleOpenTabChange('warnings');
					}}
					shortCut={`${window.languageHelper.translate('Alt')}+-`}
				/>
				<SidebarMenuItem
					position="right"
					label={window.languageHelper.translate('Configuration Preview')}
					open={openTab === 'configPreview'}
					icon={<VscJson />}
					onClick={() => {
						this.handleOpenTabChange('configPreview');
					}}
					shortCut={`${window.languageHelper.translate('Alt')}++`}
				/>
				<SidebarMenuItem
					position="right"
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
