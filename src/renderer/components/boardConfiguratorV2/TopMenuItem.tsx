import React from 'react';
import { TopMenuActions } from './TopMenu';

type TopMenuItemProps = {
	onAction: (action: TopMenuActions) => void;
	action: TopMenuActions;
	label: string | JSX.Element;
	className?: string;
	icon?: null | JSX.Element;
};
const defaultProps = {
	className: '',
	icon: null,
};

function TopMenuItem(props: TopMenuItemProps) {
	const { onAction, action, label, className, icon } = props;
	return (
		<button
			type="button"
			className={`px-4 py-1 dark:bg-muted-800 bg-muted-400 dark:hover:bg-muted-700 hover:bg-muted-300 transition transition-colors flex items-center gap-2 ${className}`}
			onClick={() => {
				onAction(action);
			}}
		>
			{icon}
			{label}
		</button>
	);
}

export function TopMenuSeparator() {
	return <hr className="m-2 dark:border-muted border-muted-200" />;
}

TopMenuItem.defaultProps = defaultProps;
export default TopMenuItem;
