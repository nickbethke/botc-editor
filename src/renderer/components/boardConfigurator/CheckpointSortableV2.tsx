import React, { useState } from 'react';
import SortableList, { SortableItem, SortableKnob } from 'react-easy-sort';
import { VscGripper } from 'react-icons/vsc';
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

	function arrayMoveMutable<T>(
		array: T[],
		fromIndex: number,
		toIndex: number
	) {
		const startIndex = fromIndex < 0 ? array.length + fromIndex : fromIndex;

		if (startIndex >= 0 && startIndex < array.length) {
			const endIndex = toIndex < 0 ? array.length + toIndex : toIndex;

			const [item] = array.splice(fromIndex, 1);
			array.splice(endIndex, 0, item);
		}
	}

	function arrayMoveImmutable<T>(
		array: T[],
		fromIndex: number,
		toIndex: number
	): T[] {
		const nArray = [...array];
		arrayMoveMutable(nArray, fromIndex, toIndex);
		return nArray;
	}

	const onSortEnd = (oldIndex: number, newIndex: number) => {
		const newCheckpointOrder = arrayMoveImmutable(
			items,
			oldIndex,
			newIndex
		);
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
			lockAxis="y"
			onSortEnd={onSortEnd}
			className={`${
				items.length > 0 &&
				'p-2 border dark:border-muted-700 border-muted-400'
			} flex flex-col gap-2 text-[14px]`}
			draggedItemClassName="dragged text-white bg-muted"
			customHolderRef={ref}
		>
			{items.map((item, index) => {
				const checkpoint = item;
				const x = checkpoint[0];
				const y = checkpoint[1];
				const order = index;
				const text = (
					<div className="flex gap-2 items-center">
						<span>
							{order + 1 < 10 ? `0${order + 1}` : order + 1}.
						</span>
						<span>Checkpoint</span>
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
								<div className="text-white text-2xl cursor-grabbing">
									<VscGripper />
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
