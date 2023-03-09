import React from 'react';
import { VscChevronRight } from 'react-icons/vsc';

type TopMenuSubItemCollapsableProps = {
	label: string;
	children: string | JSX.Element | JSX.Element[];
};
type TopMenuSubItemCollapsableState = {
	open: boolean;
};

class TopMenuSubItemCollapsable extends React.Component<
	TopMenuSubItemCollapsableProps,
	TopMenuSubItemCollapsableState
> {
	constructor(props: TopMenuSubItemCollapsableProps) {
		super(props);
		this.state = { open: false };
	}

	render() {
		const { label, children } = this.props;
		const { open } = this.state;
		return (
			<div
				className="pl-8 pr-2 py-1 dark:bg-muted-800 bg-muted-500 dark:hover:bg-muted-700 hover:bg-muted-400 hover:cursor-pointer transition transition-colors gap-4 relative flex justify-between items-center"
				onMouseEnter={() => {
					this.setState({ open: true });
				}}
				onMouseLeave={() => {
					this.setState({ open: false });
				}}
			>
				<span>{label}</span> <VscChevronRight />
				<div
					className={`${
						open ? 'block' : 'hidden'
					} flex flex-col justify-start absolute -top-[0.57rem] left-full dark:bg-muted-800 bg-muted-500 w-fit whitespace-nowrap rounded-b py-2 border dark:border-muted-700 border-muted-200 hover:cursor-pointer dark:border z-50`}
				>
					{children}
				</div>
			</div>
		);
	}
}

export default TopMenuSubItemCollapsable;
