import React from 'react';
import { TopMenuActions } from './TopMenu';

/**
 * The top menu item component properties
 */
type TopMenuItemProps =
	| {
	type: 'default';
	action: TopMenuActions;
	onAction: (action: TopMenuActions) => void;
	label: string | JSX.Element | null;
	className?: string;
	icon?: null | JSX.Element;
	shortCut?: string;
}
	| {
	type: 'none';
	action?: null;
	onAction?: () => void;
	label: string | JSX.Element | null;
	className?: string;
	icon?: null | JSX.Element;
	shortCut?: string;
};

/**
 * The top menu item component
 * @param props
 * @constructor
 */
function TopMenuItem(props: TopMenuItemProps) {
	const { onAction, action, label, className, icon, shortCut, type } = props;
	return (
		<button
			type='button'
			className={`${icon ? 'px-2' : 'pl-8 pr-2'} ${className} py-1 dark:bg-muted-800 bg-muted-500 ${
				onAction ? 'dark:hover:bg-muted-700 hover:bg-muted-400' : ''
			} transition-colors flex items-center gap-2`}
			onClick={() => {
				if (type === 'none' && typeof onAction === 'function') onAction();
				if (type === 'default') onAction(action);
			}}
		>
			{icon}
			{label}
			{shortCut && (
				<span
					className='ml-4 mr-2 dark:text-muted-50/50 text-muted-50 tracking-wider grow text-right'>{shortCut}</span>
			)}
		</button>
	);
}

/**
 * The top menu item component default properties
 */
TopMenuItem.defaultProps = {
	className: '',
	icon: null,
	shortCut: null,
	type: 'default',
};

/**
 * The top menu separator component
 * @constructor
 */
export function TopMenuSeparator() {
	return <hr className='dark:border-muted-600 border-muted-300 my-2' />;
}

export default TopMenuItem;
