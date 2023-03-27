import React from 'react';

/**
 * The context menu component properties
 */
type ContextMenuV2Props = {
	position: {
		y: number;
		x: number;
	};
	children: string | JSX.Element | JSX.Element[] | null;
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
			{children}
		</div>
	);
}

export default ContextMenuV2;
