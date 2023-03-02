import React from 'react';

type ContextMenuItemProps = {
	text: string;
	onClick: () => void;
};

class ContextMenuItem extends React.Component<ContextMenuItemProps, unknown> {
	constructor(props: ContextMenuItemProps) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick = () => {
		const { onClick } = this.props;
		onClick();
	};

	render() {
		const { text } = this.props;
		return (
			<button
				type="button"
				className="p-2 text-left hover:bg-accent/25 text-sm"
				onClick={this.handleClick}
			>
				{text}
			</button>
		);
	}
}

export function ContextMenuDivider() {
	return <div className="border-b border-white/25 m-2" />;
}

export default ContextMenuItem;
