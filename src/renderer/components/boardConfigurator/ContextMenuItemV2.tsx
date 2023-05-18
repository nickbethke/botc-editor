import React from 'react';

/**
 * The context menu item properties
 */
type ContextMenuItemV2Props = {
	text: string | React.JSX.Element;
	onClick?: () => void | null | Promise<void>;
};

/**
 * The context menu item component
 */
class ContextMenuItemV2 extends React.Component<ContextMenuItemV2Props, unknown> {
	constructor(props: ContextMenuItemV2Props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	static get defaultProps() {
		return {
			onClick: null,
		};
	}

	/**
	 * Handles the click event
	 */
	handleClick = () => {
		const { onClick } = this.props;
		if (onClick) {
			onClick();
		}
	};

	/**
	 * Renders the component
	 */
	render() {
		const { text, onClick } = this.props;
		return (
			<button
				type="button"
				className={`px-2 py-1 text-left text-sm ${onClick !== null ? 'hover:bg-muted/25' : ''}`}
				onClick={this.handleClick}
			>
				{text}
			</button>
		);
	}
}

/**
 * The context menu divider component
 * @constructor
 */
export function ContextMenuDividerV2() {
	return <div className="border-b dark:border-muted-600 border-muted-400 m-1" />;
}

export default ContextMenuItemV2;
