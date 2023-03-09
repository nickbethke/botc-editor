import React from 'react';
import { VscCopy, VscJson, VscWarning } from 'react-icons/vsc';
import SidebarMenuItem from './SidebarMenuItem';
import BoardConfigInterface from '../interfaces/BoardConfigInterface';

type RightSidebarProps = {
	tabChange: (tab: RightSidebarOpenTab) => void;
	openTab: RightSidebarOpenTab;
	config: BoardConfigInterface;
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
		return (
			<div className="flex flex-col">
				<div className="p-2 border-b dark:border-muted-700 border-muted-400">
					{window.languageHelper.translate('Warnings')}
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
							window.electron.clipboard.write(
								JSON.stringify(config, null, 4)
							);
						}}
					>
						<VscCopy />
						{window.languageHelper.translate('Copy')}
					</button>
				</div>
				<div className="flex-grow bg-muted-900/25 relative p-2 w-[347px] overflow-x-auto">
					<pre className="h-full font-jetbrains user-select text-sm">
						{JSON.stringify(config, null, 4)}
					</pre>
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
		return (
			<>
				<SidebarMenuItem
					right
					label={window.languageHelper.translate('Warnings')}
					open={openTab === 'warnings'}
					icon={<VscWarning />}
					onClick={() => {
						this.handleOpenTabChange('warnings');
					}}
					shortCut={`${window.languageHelper.translate('Alt')}+-`}
				/>
				<SidebarMenuItem
					right
					label={window.languageHelper.translate(
						'Configuration Preview'
					)}
					open={openTab === 'configPreview'}
					icon={<VscJson />}
					onClick={() => {
						this.handleOpenTabChange('configPreview');
					}}
					shortCut={`${window.languageHelper.translate('Alt')}++`}
				/>
			</>
		);
	}

	render() {
		const { openTab } = this.props;
		return (
			<div className="flex flex-row h-full">
				<div
					className={`flex-grow ${
						openTab
							? 'border-r dark:border-muted-700 border-muted-400'
							: ''
					}`}
				>
					{this.content()}
				</div>
				<div className="h-full flex flex-col py-1">
					{this.tabSwitch(openTab)}
				</div>
			</div>
		);
	}
}

export default RightSidebar;
