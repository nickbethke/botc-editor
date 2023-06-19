import React from 'react';
import { VscCheck } from 'react-icons/vsc';
import { DirectionArrows } from '../boardConfigurator/MainEditor';
import ContextMenuV2 from '../boardConfigurator/ContextMenuV2';
import ContextMenuItemV2, { ContextMenuDividerV2 } from '../boardConfigurator/ContextMenuItemV2';
import { Direction } from '../../../interfaces/BoardConfigInterface';

type RiverFieldPresetProps = {
	field: {
		position: [number, number];
		direction: Direction;
	};
	onDirectionChange: (direction: Direction, position: [number, number]) => void;
	onContextMenu: (contextMenu: React.JSX.Element) => void;
	onClick: (position: [number, number]) => void;
};

export function getDirectionArrow(direction: Direction): React.JSX.Element {
	switch (direction) {
		case 'NORTH':
			return DirectionArrows[0];
		case 'EAST':
			return DirectionArrows[1];
		case 'SOUTH':
			return DirectionArrows[2];
		case 'WEST':
			return DirectionArrows[3];
		default:
			return DirectionArrows[0];
	}
}

class RiverFieldPreset extends React.Component<RiverFieldPresetProps, unknown> {
	constructor(props: RiverFieldPresetProps) {
		super(props);
		this.showContextMenu = this.showContextMenu.bind(this);
	}

	showContextMenu: React.MouseEventHandler<HTMLButtonElement> = (event) => {
		const { field, onContextMenu } = this.props;

		onContextMenu(
			<ContextMenuV2 position={{ x: event.clientX, y: event.clientY }}>
				<ContextMenuItemV2
					text={
						<div className="flex gap-2">
							<span>{window.t.translate('Position')}:</span>
							<span>
								[{field.position[0]}, {field.position[1]}]
							</span>
						</div>
					}
				/>
				<ContextMenuDividerV2 />
				<ContextMenuItemV2
					text={
						<button type="button" className="flex gap-4 items-center justify-between">
							<span>{window.t.translate('North')}</span>
							{field.direction === 'NORTH' ? <VscCheck /> : null}
						</button>
					}
					onClick={() => {
						this.changeDirection('NORTH');
					}}
				/>
				<ContextMenuItemV2
					text={
						<button type="button" className="flex gap-4 items-center justify-between">
							<span>{window.t.translate('East')}</span>
							{field.direction === 'EAST' ? <VscCheck /> : null}
						</button>
					}
					onClick={() => {
						this.changeDirection('EAST');
					}}
				/>
				<ContextMenuItemV2
					text={
						<button type="button" className="flex gap-4 items-center justify-between">
							<span>{window.t.translate('South')}</span>
							{field.direction === 'SOUTH' ? <VscCheck /> : null}
						</button>
					}
					onClick={() => {
						this.changeDirection('SOUTH');
					}}
				/>
				<ContextMenuItemV2
					text={
						<button type="button" className="flex gap-4 items-center justify-between">
							<span>{window.t.translate('West')}</span>
							{field.direction === 'WEST' ? <VscCheck /> : null}
						</button>
					}
					onClick={() => {
						this.changeDirection('WEST');
					}}
				/>
			</ContextMenuV2>
		);
	};

	private changeDirection = (direction: Direction) => {
		const { onDirectionChange, field } = this.props;
		onDirectionChange(direction, field.position);
	};

	render() {
		const { field, onClick } = this.props;
		return (
			<button
				type="button"
				className="relative dark:bg-blue-600 bg-blue-400 xl:min-w-8 xl:w-8 xl:h-8 min-w-7 w-7 h-7 flex items-center justify-center outline outline-1 dark:outline-muted-700 outline-muted-500"
				onContextMenu={this.showContextMenu}
				onClick={() => {
					onClick(field.position);
				}}
			>
				{getDirectionArrow(field.direction)}
			</button>
		);
	}
}

export default RiverFieldPreset;
