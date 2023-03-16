import React from 'react';

function ContextMenuV2(props: {
	position: {
		y: number;
		x: number;
	};
	children: string | JSX.Element | JSX.Element[] | null;
}) {
	const { position, children } = props;
	return (
		<div
			className="fixed bg-muted-700 flex flex-col p-1 rounded"
			style={{ top: `${position.y}px`, left: `${position.x}px` }}
		>
			{children}
		</div>
	);
}

export default ContextMenuV2;
