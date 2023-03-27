import _uniqueId from 'lodash/uniqueId';
import React from 'react';

/**
 * The sidebar menu item properties
 */
type SidebarMenuItemProps = {
	label: string;
	open: boolean;
	icon?: JSX.Element | null;
	onClick: () => void;
	shortCut?: string;
	position?: 'top' | 'bottom' | 'left' | 'right';
};
/**
 * The sidebar menu item state properties
 */
type SidebarMenuItemState = {
	hover: boolean;
};

/**
 * The sidebar menu item component
 */
class SidebarMenuItem extends React.Component<SidebarMenuItemProps, SidebarMenuItemState> {
	static get defaultProps() {
		return {
			shortCut: null,
			position: 'right',
			icon: null,
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

	positionClassName = () => {
		const { position } = this.props;
		switch (position) {
			case 'right':
				return 'translate-x-1 left-full';
			case 'top':
				return '-top-4 left-0';
			case 'bottom':
				return 'top-full translate-y-1 left-0';
			case 'left':
				return '-translate-x-1 right-full';
			default:
				return 'translate-x-1 left-full';
		}
	};

	render() {
		const { label, open, icon, onClick, shortCut, position } = this.props;
		const { hover } = this.state;
		const key = _uniqueId('sidebar-menu-item-');

		const positionClassName = this.positionClassName();

		return (
			<button
				key={key}
				type="button"
				className={`relative my-1 mx-2 rounded-lg p-2 transition transition-colors ${icon ? 'text-xl' : ''} ${
					open ? 'bg-white/20' : 'hover:bg-white/10'
				}`}
				onClick={onClick}
				onFocus={this.handleOnHover}
				onMouseEnter={this.handleOnHover}
				onBlur={this.handleOnHoverEnd}
				onMouseLeave={this.handleOnHoverEnd}
			>
				{icon ?? label}
				{icon ? (
					<div
						className={`absolute top-1/2 -translate-y-1/2 ${positionClassName} text-sm dark:bg-muted-700 bg-muted shadow drop-shadow py-1 px-2 rounded w-fit whitespace-nowrap z-50 ${
							hover ? 'block' : 'hidden'
						}`}
					>
						{shortCut ? (
							<div className={`flex gap-2 items-center ${position === 'right' && 'flex-row-reverse'}`}>
								<span>{label}</span>
								<span className="dark:text-muted-50/50 text-muted-50 tracking-wider">{shortCut}</span>
							</div>
						) : (
							label
						)}
					</div>
				) : null}
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
