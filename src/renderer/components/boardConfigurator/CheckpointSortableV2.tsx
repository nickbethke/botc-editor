import React, { useState } from 'react';
import SortableList, { SortableItem, SortableKnob } from 'react-easy-sort';
import { BoardPosition } from '../generator/interfaces/boardPosition';
import { Position } from '../interfaces/BoardConfigInterface';

type CheckpointSortableV2Props = {
	checkpoints: Array<Position>;
	onUpdate: (checkpoints: Array<Position>) => void;
	onSelect: (position: BoardPosition) => void;
};
const CheckpointSortableV2 = (props: CheckpointSortableV2Props) => {
	const { checkpoints, onUpdate, onSelect } = props;
	const [items, setItems] = useState(checkpoints);
	const ref = React.createRef<HTMLDivElement>();

	function arrayMoveMutable<T>(array: T[], fromIndex: number, toIndex: number) {
		const startIndex = fromIndex < 0 ? array.length + fromIndex : fromIndex;

		if (startIndex >= 0 && startIndex < array.length) {
			const endIndex = toIndex < 0 ? array.length + toIndex : toIndex;

			const [item] = array.splice(fromIndex, 1);
			array.splice(endIndex, 0, item);
		}
	}

	function arrayMoveImmutable<T>(array: T[], fromIndex: number, toIndex: number): T[] {
		const nArray = [...array];
		arrayMoveMutable(nArray, fromIndex, toIndex);
		return nArray;
	}

	const onSortEnd = (oldIndex: number, newIndex: number) => {
		const newCheckpointOrder = arrayMoveImmutable(items, oldIndex, newIndex);
		const helperArray = [];
		for (let i = 0; i < newCheckpointOrder.length; i += 1) {
			helperArray[i] = newCheckpointOrder[i];
		}
		setItems(helperArray);
		onUpdate(helperArray);
	};

	if (checkpoints !== items) {
		setItems(checkpoints);
	}

	return (
		<SortableList
			onSortEnd={onSortEnd}
			className={`${
				items.length > 0 && 'p-2 border dark:border-muted-700 border-muted-400'
			} grid grid-cols-2 gap-2 text-[14px]`}
			draggedItemClassName="dragged text-white bg-muted"
			customHolderRef={ref}
		>
			{items.map((item, index) => {
				const [x, y] = item;
				const order = index + 1;
				const text = (
					<div className="flex gap-2 items-center justify-around">
						<span>{order < 10 ? `0${order}` : order}.</span>
						<span>
							[{x}, {y}]
						</span>
					</div>
				);
				return (
					<SortableItem key={order}>
						<div
							role="presentation"
							className="relative item border dark:border-muted-700 border-muted-400 p-1 flex items-center gap-2 cursor-pointer bg-muted-700"
							onDoubleClick={() => {
								onSelect({ x, y });
							}}
						>
							<SortableKnob>
								<div className="text-white text-xl cursor-grabbing">
									<div className={`${order === items.length ? 'isDestinyMountain' : 'isCheckpoint'} w-6 h-6`} />
								</div>
							</SortableKnob>
							<span className="flex-grow">{text}</span>
						</div>
					</SortableItem>
				);
			})}
		</SortableList>
	);
};
export default CheckpointSortableV2;
