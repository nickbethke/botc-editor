import React from 'react';

/**
 * The context menu component properties
 */
type ContextMenuV2Props = {
	children: string | React.JSX.Element | React.JSX.Element[] | null;
	position: {
		y: number;
		x: number;
	};
};

/**
 * The context menu component
 * @param props
 * @constructor
 */
function ContextMenuV2(props: ContextMenuV2Props) {
	const { position, children } = props;
	return (
		<div
			className="fixed dark:bg-muted-700 bg-muted-600 flex flex-col p-1 rounded z-50"
			style={{ top: `${position.y}px`, left: `${position.x}px` }}
		>
			{children instanceof Array ? children.map((child) => child) : children}
		</div>
	);
}

export default ContextMenuV2;
