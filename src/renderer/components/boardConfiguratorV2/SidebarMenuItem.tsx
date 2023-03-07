import _uniqueId from 'lodash/uniqueId';
import React from 'react';

type SidebarMenuItemProps = {
	label: string;
	open: boolean;
	icon: JSX.Element;
	onClick: () => void;
};

function SidebarMenuItem(props: SidebarMenuItemProps) {
	const { label, open, icon, onClick } = props;
	const key = _uniqueId('sidebar-menu-item-');
	return (
		<button
			key={key}
			type="button"
			title={label}
			className={`my-1 mx-2 rounded-lg p-2 transition transition-colors text-xl ${
				open ? 'bg-white/20' : 'hover:bg-white/10'
			}`}
			onClick={onClick}
		>
			{icon}
		</button>
	);
}

export function SidebarMenuItemSeparator() {
	return (
		<hr className="border-t dark:border-muted-700 border-muted-400 mx-2 my-1" />
	);
}

export default SidebarMenuItem;
