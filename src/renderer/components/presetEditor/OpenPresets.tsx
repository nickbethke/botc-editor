import React, { useState } from 'react';
import SortableList, { SortableItem, SortableKnob } from 'react-easy-sort';
import _uniqueId from 'lodash/uniqueId';
import { VscGripper } from 'react-icons/vsc';
import { isEqual } from 'lodash';
import RiverPresetFile from './RiverPresetFile';
import EditorCache from './EditorCache';

type OpenPresetsProps = {
	editorCache: EditorCache;
	currentFile: null | string;
	onContextMenu: (contextMenu: React.JSX.Element | null) => unknown;
	onCurrentFileChange: (file: string) => void;
	onCloseOpenPreset: (file: string) => void;
	openTabsOrder: Map<string, number>;

	onUpdate: (openTabsOrder: Map<string, number>) => void;
};
function OpenPresets(props: OpenPresetsProps) {
	const { openTabsOrder, onCloseOpenPreset, editorCache, onCurrentFileChange, currentFile, onContextMenu, onUpdate } =
		props;
	const tabsArray = Array.from(openTabsOrder, ([file, order]) => ({ file, order }));
	const [items, setItems] = useState(tabsArray);
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
		const newMap: Map<string, number> = new Map();
		for (const element of helperArray) {
			const item = element;
			newMap.set(item.file, item.order);
		}
		onUpdate(newMap);
	};
	if (!isEqual(tabsArray, items)) {
		setItems(tabsArray);
	}

	return (
		<SortableList
			lockAxis="x"
			onSortEnd={onSortEnd}
			className="flex max-w-full overflow-x-auto overflow-y-hidden open-file-list"
			customHolderRef={ref}
			draggedItemClassName="text-white shadow"
		>
			{items.map((item) => {
				const preset = editorCache.getFile(item.file);
				if (preset) {
					return (
						<SortableItem key={_uniqueId()}>
							<div className="relative flex items-center justify-between h-full">
								<SortableKnob>
									<div className="text-white text-2xl cursor-grabbing">
										<VscGripper />
									</div>
								</SortableKnob>
								<RiverPresetFile
									currentFile={currentFile}
									fileName={item.file}
									onCurrentFileChange={onCurrentFileChange}
									onCloseOpenPreset={onCloseOpenPreset}
									edited={preset.edited}
									onContextMenu={onContextMenu}
								/>
								{currentFile === item.file ? <div className="w-full h-1 bg-accent absolute bottom-0 left-0" /> : null}
							</div>
						</SortableItem>
					);
				}
				return null;
			})}
		</SortableList>
	);
}

export default OpenPresets;
