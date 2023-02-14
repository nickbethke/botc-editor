import React, { useState } from 'react';
import { arrayMoveImmutable } from 'array-move';
import SortableList, { SortableItem, SortableKnob } from 'react-easy-sort';
import { BsChevronBarExpand } from 'react-icons/bs';
import Checkpoint from '../../../generator/fields/checkpoint';
import { BoardPosition } from '../../../generator/interfaces/boardPosition';

const CheckpointSortable = (props: {
	checkpoints: Array<Checkpoint>;
	onUpdate: (checkpoints: Array<Checkpoint>) => void;
	onSelect: (position: BoardPosition) => void;
}) => {
	const { checkpoints, onUpdate, onSelect } = props;
	const [items, setItems] = useState(checkpoints);
	const ref = React.createRef<HTMLDivElement>();
	const onSortEnd = (oldIndex: number, newIndex: number) => {
		const newCheckpointOrder = arrayMoveImmutable(
			items,
			oldIndex,
			newIndex
		);
		const helperArray = [];
		for (let i = 0; i < newCheckpointOrder.length; i += 1) {
			const checkpoint = newCheckpointOrder[i];
			const { position } = checkpoint;
			helperArray[i] = new Checkpoint(position, i);
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
				items.length > 0 ? 'p-2 border' : ''
			} flex flex-col gap-2`}
			draggedItemClassName="dragged text-white"
			customHolderRef={ref}
		>
			{items.map((item) => {
				const checkpoint = item;
				const text = `Checkpoint [${checkpoint.position.y}, ${checkpoint.position.x}]`;
				return (
					<SortableItem key={item.order}>
						<div
							role="presentation"
							className="relative item border p-2 font-mono flex items-center gap-2 cursor-pointer bg-white/25"
							onDoubleClick={() => {
								onSelect(item.position);
							}}
						>
							<SortableKnob>
								<div className="text-white text-2xl cursor-grabbing">
									<BsChevronBarExpand />
								</div>
							</SortableKnob>
							<span className="flex-grow">
								{item.order + 1}. {text}
							</span>
						</div>
					</SortableItem>
				);
			})}
		</SortableList>
	);
};
export default CheckpointSortable;
