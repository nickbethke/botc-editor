import React from 'react';
import { VscWarning } from 'react-icons/vsc';
import SidebarMenuItem from './SidebarMenuItem';

type RightSidebarProps = {
	tabChange: (tab: RightSidebarOpenTab) => void;
	openTab: RightSidebarOpenTab;
};

export type RightSidebarOpenTab = 'warnings' | null;

class RightSidebar extends React.Component<RightSidebarProps, unknown> {
	content = () => {
		const { openTab } = this.props;
		switch (openTab) {
			case 'warnings':
				return this.notifications();
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
					label={window.languageHelper.translate('Warnings')}
					open={openTab === 'warnings'}
					icon={<VscWarning />}
					onClick={() => {
						this.handleOpenTabChange('warnings');
					}}
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
