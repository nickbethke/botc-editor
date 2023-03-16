import _uniqueId from 'lodash/uniqueId';
import React from 'react';

type SidebarMenuItemProps = {
	label: string;
	open: boolean;
	icon: JSX.Element;
	onClick: () => void;
	shortCut?: string;
	right?: true;
};
type SidebarMenuItemState = {
	hover: boolean;
};

class SidebarMenuItem extends React.Component<
	SidebarMenuItemProps,
	SidebarMenuItemState
> {
	static get defaultProps() {
		return {
			shortCut: null,
			right: false,
		};
	}

	constructor(props: SidebarMenuItemProps) {
		super(props);
		this.state = { hover: false };
		this.handleOnHover = this.handleOnHover.bind(this);
		this.handleOnHoverEnd = this.handleOnHoverEnd.bind(this);
	}

	handleOnHover = () => {
		const { hover } = this.state;
		if (!hover) {
			this.setState({ hover: true });
			document.addEventListener(
				'click',
				() => {
					this.setState({ hover: false });
				},
				{ once: true }
			);
		}
	};

	handleOnHoverEnd = () => {
		const { hover } = this.state;
		if (hover) {
			this.setState({ hover: false });
		}
	};

	render() {
		const { label, open, icon, onClick, shortCut, right } = this.props;
		const { hover } = this.state;
		const key = _uniqueId('sidebar-menu-item-');
		return (
			<button
				key={key}
				type="button"
				className={`relative my-1 mx-2 rounded-lg p-2 transition transition-colors text-xl ${
					open ? 'bg-white/20' : 'hover:bg-white/10'
				}`}
				onClick={onClick}
				onFocus={this.handleOnHover}
				onMouseEnter={this.handleOnHover}
				onBlur={this.handleOnHoverEnd}
				onMouseLeave={this.handleOnHoverEnd}
			>
				{icon}
				<div
					className={`absolute top-1/2 -translate-y-1/2 ${
						right
							? '-translate-x-1 right-full'
							: 'translate-x-1 left-full'
					} text-sm dark:bg-muted-700 bg-muted py-1 px-2 rounded w-fit whitespace-nowrap z-50 ${
						hover ? 'block' : 'hidden'
					}`}
				>
					{shortCut ? (
						<div
							className={`flex gap-2 items-center ${
								right && 'flex-row-reverse'
							}`}
						>
							<span>{label}</span>
							<span className="dark:text-muted-50/50 text-muted-50 tracking-wider">
								{shortCut}
							</span>
						</div>
					) : (
						label
					)}
				</div>
			</button>
		);
	}
}

export function SidebarMenuItemSeparator() {
	return (
		<hr
			key={_uniqueId('sidebar-menu-item-separator-')}
			className="border-t dark:border-muted-700 border-muted-400 mx-2 my-1"
		/>
	);
}

export default SidebarMenuItem;
