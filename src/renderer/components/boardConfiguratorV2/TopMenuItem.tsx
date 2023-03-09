import React from 'react';
import { TopMenuActions } from './TopMenu';

type TopMenuItemProps = {
	onAction: (action: TopMenuActions) => void;
	action: TopMenuActions;
	label: string | JSX.Element | null;
	className?: string;
	icon?: null | JSX.Element;
	shortCut?: string;
};
const defaultProps = {
	className: '',
	icon: null,
	shortCut: null,
};

function TopMenuItem(props: TopMenuItemProps) {
	const { onAction, action, label, className, icon, shortCut } = props;
	return (
		<button
			type="button"
			className={`${
				icon ? 'px-2' : 'pl-8 pr-2'
			} ${className} py-1 dark:bg-muted-800 bg-muted-500 dark:hover:bg-muted-700 hover:bg-muted-400 transition transition-colors flex items-center gap-2`}
			onClick={() => {
				onAction(action);
			}}
		>
			{icon}
			{label}
			{shortCut && (
				<span className="ml-4 mr-2 dark:text-muted-50/50 text-muted-50 tracking-wider grow text-right">
					{shortCut}
				</span>
			)}
		</button>
	);
}

export function TopMenuSeparator() {
	return <hr className="dark:border-muted-600 border-muted-300 my-2" />;
}

TopMenuItem.defaultProps = defaultProps;
export default TopMenuItem;
