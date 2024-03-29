import React from 'react';
import { ChevronRightIcon } from '@radix-ui/react-icons';

/**
 * The board configuration top menu subitem collapsable component properties
 */
type TopMenuSubItemCollapsableProps = {
	label: string;
	children: string | React.JSX.Element | React.JSX.Element[];
};
/**
 * The board configuration top menu subitem collapsable component state properties
 */
type TopMenuSubItemCollapsableState = {
	open: boolean;
};

/**
 * The board configuration top menu subitem collapsable component
 */
class TopMenuSubItemCollapsable extends React.Component<
	TopMenuSubItemCollapsableProps,
	TopMenuSubItemCollapsableState
> {
	constructor(props: TopMenuSubItemCollapsableProps) {
		super(props);
		this.state = { open: false };
	}

	/**
	 * Renders the component
	 */
	render() {
		const { label, children } = this.props;
		const { open } = this.state;
		return (
			<div
				className="pl-8 pr-2 py-1 dark:bg-muted-800 bg-muted-500 dark:hover:bg-muted-700 hover:bg-muted-400 hover:cursor-pointer transition-colors gap-4 relative flex justify-between items-center"
				onMouseEnter={() => {
					this.setState({ open: true });
				}}
				onMouseLeave={() => {
					this.setState({ open: false });
				}}
			>
				<span>{label}</span> <ChevronRightIcon />
				<div
					className={`${
						open ? 'block' : 'hidden'
					} flex flex-col justify-start absolute -top-[0.57rem] left-full dark:bg-muted-800 bg-muted-500 w-fit whitespace-nowrap rounded-b py-2 border dark:border-muted-700 border-muted-200 hover:cursor-pointer dark:border z-50`}
				>
					{children || null}
				</div>
			</div>
		);
	}
}

export default TopMenuSubItemCollapsable;
