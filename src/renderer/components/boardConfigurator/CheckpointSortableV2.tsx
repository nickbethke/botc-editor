import React from 'react';
import SortableList, { SortableItem, SortableKnob } from 'react-easy-sort';
import { BoardPosition } from '../generator/interfaces/BoardPosition';
import { Position } from '../../../interfaces/BoardConfigInterface';

/**
 * the properties of the checkpoint sortable component
 */
type CheckpointSortableV2Props = {
	checkpoints: Array<Position>;
	onSelect: (position: BoardPosition) => void;
	onUpdate: (checkpoints: Array<Position>) => void;
};
type CheckpointSortableV2State = {
	items: Position[];
};

/**
 * the checkpoint sortable component
 * @param props
 * @constructor
 */
class CheckpointSortableV2 extends React.Component<CheckpointSortableV2Props, CheckpointSortableV2State> {
	/**
	 * @param array
	 * @param fromIndex
	 * @param toIndex
	 */
	static arrayMoveMutable<T>(array: T[], fromIndex: number, toIndex: number) {
		const startIndex = fromIndex < 0 ? array.length + fromIndex : fromIndex;

		if (startIndex >= 0 && startIndex < array.length) {
			const endIndex = toIndex < 0 ? array.length + toIndex : toIndex;

			const [item] = array.splice(fromIndex, 1);
			array.splice(endIndex, 0, item);
		}
	}

	/**
	 * @param array
	 * @param fromIndex
	 * @param toIndex
	 */
	static arrayMoveImmutable<T>(array: T[], fromIndex: number, toIndex: number): T[] {
		const nArray = [...array];
		CheckpointSortableV2.arrayMoveMutable(nArray, fromIndex, toIndex);
		return nArray;
	}

	ref = React.createRef<HTMLDivElement>();

	constructor(props: CheckpointSortableV2Props) {
		super(props);
		this.state = {
			items: props.checkpoints,
		};
	}

	componentDidMount() {
		const { checkpoints } = this.props;
		this.setState({ items: checkpoints });
	}

	/**
	 * the function to sort the checkpoints
	 * @param items
	 * @param oldIndex
	 * @param newIndex
	 */
	onSortEnd(items: Position[], oldIndex: number, newIndex: number) {
		const { onUpdate } = this.props;
		const newCheckpointOrder: Position[] = CheckpointSortableV2.arrayMoveImmutable(items, oldIndex, newIndex);
		const helperArray: Position[] = [];
		for (let i = 0; i < newCheckpointOrder.length; i += 1) {
			helperArray[i] = newCheckpointOrder[i];
		}
		this.setState({ items: helperArray });
		onUpdate(helperArray);
	}

	render() {
		const { onSelect } = this.props;
		const { items } = this.state;

		return (
			<SortableList
				onSortEnd={(oldIndex, newIndex) => {
					this.onSortEnd(items, oldIndex, newIndex);
				}}
				className={`${
					items.length > 0 && 'p-2 border dark:border-muted-700 border-muted-400'
				} grid grid-cols-2 gap-2 text-[14px]`}
				draggedItemClassName="dragged text-white bg-muted"
				customHolderRef={this.ref}
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
									<>
										<div className="text-white text-xl cursor-grabbing">
											<div className={`${order === items.length ? 'isDestinyMountain' : 'isCheckpoint'} w-6 h-6`} />
										</div>
										<span className="flex-grow">{text}</span>
									</>
								</SortableKnob>
							</div>
						</SortableItem>
					);
				})}
			</SortableList>
		);
	}
}

export default CheckpointSortableV2;
