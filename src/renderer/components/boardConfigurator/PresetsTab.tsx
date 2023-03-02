import React from 'react';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import CBoardPreset from './BoardPreset';
import CRiverPreset from './RiverPreset';
import { BoardPreset, RiverPreset } from '../../../main/helper/PresetsLoader';

type PresetsTabProps = {
	presets: { rivers: RiverPreset[]; boards: BoardPreset[] };
	className: string;
	onContextMenu: (contextMenu: JSX.Element | null) => void;
	onUpdate: () => void;
	onPopup: (popup: JSX.Element | null) => void;
};
type PresetsTabState = {
	riversOpen: boolean;
	boardsOpen: boolean;
};

class PresetsTab extends React.Component<PresetsTabProps, PresetsTabState> {
	constructor(props: PresetsTabProps) {
		super(props);
		this.state = { boardsOpen: true, riversOpen: true };
	}

	render() {
		const { presets, className, onContextMenu, onUpdate, onPopup } =
			this.props;
		const { riversOpen, boardsOpen } = this.state;
		const presetsElements: {
			rivers: Array<JSX.Element>;
			boards: Array<JSX.Element>;
		} = {
			rivers: [],
			boards: [],
		};
		presets.rivers.forEach((preset) => {
			presetsElements.rivers.push(
				<CRiverPreset
					preset={preset}
					className={className}
					onContextMenu={(contextMenu) => {
						onContextMenu(contextMenu);
						document.addEventListener(
							'click',
							() => {
								onContextMenu(null);
							},
							{ once: true }
						);
					}}
					onUpdate={onUpdate}
					onPopup={(popup) => {
						onPopup(popup);
					}}
				/>
			);
		});
		presets.boards.forEach((preset) => {
			presetsElements.boards.push(
				<CBoardPreset
					preset={preset}
					className={className}
					onContextMenu={(contextMenu) => {
						onContextMenu(contextMenu);
						document.addEventListener(
							'click',
							() => {
								onContextMenu(null);
							},
							{ once: true }
						);
					}}
					onUpdate={onUpdate}
					onPopup={(popup) => {
						onPopup(popup);
					}}
				/>
			);
		});
		return (
			<>
				<button
					type="button"
					className="bg-background-700 p-4 flex flex-row justify-between items-center"
					onClick={() => {
						this.setState({ riversOpen: !riversOpen });
					}}
				>
					<div>Flüssen</div>
					{riversOpen ? <BsChevronUp /> : <BsChevronDown />}
				</button>
				<div
					className={`${
						riversOpen ? 'h-full' : 'h-0 overflow-hidden'
					} grid grid-cols-2 transition-all transition bg-white/10 border-gray-600 border-b`}
				>
					{presetsElements.rivers.map(
						(presetsElement) => presetsElement
					)}
				</div>
				<button
					type="button"
					className="bg-background-700 p-4 flex flex-row justify-between items-center"
					onClick={() => {
						this.setState({ boardsOpen: !boardsOpen });
					}}
				>
					<div>Boards</div>
					{boardsOpen ? <BsChevronUp /> : <BsChevronDown />}
				</button>
				<div
					className={`${
						boardsOpen ? 'h-full' : 'h-0 overflow-hidden'
					} grid grid-cols-2 transition-all transition bg-white/10`}
				>
					{presetsElements.boards.map(
						(presetsElement) => presetsElement
					)}
				</div>
			</>
		);
	}
}

export default PresetsTab;
