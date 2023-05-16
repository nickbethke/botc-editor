import { ChevronDownIcon } from '@radix-ui/react-icons';
import React from 'react';

/**
 * The board configuration top menu item collapsable component properties
 */
type TopMenuItemCollapsableProps = {
	label: string;
	children: string | JSX.Element | JSX.Element[];
};
/**
 * The board configuration top menu item collapsable component state properties
 */
type TopMenuItemCollapsableState = {
	open: boolean;
};

/**
 * The board configuration top menu item collapsable component
 */
class TopMenuItemCollapsable extends React.Component<TopMenuItemCollapsableProps, TopMenuItemCollapsableState> {
	constructor(props: TopMenuItemCollapsableProps) {
		super(props);
		this.state = {open: false};
	}

	/**
	 * Renders the component
	 */
	render() {
		const {label, children} = this.props;
		const {open} = this.state;
		return (
			<div
				className="px-2 py-2 dark:hover:bg-muted-700 hover:bg-muted-400 hover:cursor-pointer transition-colors relative flex gap-2 items-center"
				onMouseEnter={() => {
					this.setState({open: true});
				}}
				onMouseLeave={() => {
					this.setState({open: false});
				}}
			>
				<span>{label}</span> <ChevronDownIcon/>
				<div
					className={`${
						open ? 'block' : 'hidden'
					} flex flex-col justify-start absolute top-full left-0 dark:bg-muted-800 bg-muted-500 w-fit whitespace-nowrap rounded-b py-2 border dark:border-muted-700 border-muted-200 hover:cursor-pointer dark:border z-50`}
				>
					{children}
				</div>
			</div>
		);
	}
}

export default TopMenuItemCollapsable;
