import React, { MouseEventHandler } from 'react';
import _uniqueId from 'lodash/uniqueId';
import { RiverPreset } from '../../../main/helper/PresetsLoader';
import ContextMenuItem, { ContextMenuDivider } from './ContextMenuItem';
import ConfirmPopup from '../popups/ConfirmPopup';
import Popup from '../popups/Popup';

type RiverPresetProps = {
	preset: RiverPreset;
	className: string;
	onContextMenu: (contextMenu: JSX.Element) => void;
	onUpdate: () => void;
	onPopup: (popup: JSX.Element | null) => void;
};
type RiverPresetState = unknown;

class CRiverPreset extends React.Component<RiverPresetProps, RiverPresetState> {
	constructor(props: RiverPresetProps) {
		super(props);

		this.handleContextMenu = this.handleContextMenu.bind(this);
		this.handleDragStart = this.handleDragStart.bind(this);
		this.handleDragEnd = this.handleDragEnd.bind(this);
	}

	handleContextMenu: MouseEventHandler<HTMLButtonElement> = (event) => {
		const { onContextMenu } = this.props;
		onContextMenu(this.getContextMenu(event.clientX, event.clientY));
	};

	handleDragStart: React.DragEventHandler<HTMLButtonElement> = () => {
		console.log('START_PRESET_DRAG');
	};

	handleDragEnd: React.DragEventHandler<HTMLButtonElement> = () => {
		console.log('END_PRESET_DRAG');
	};

	getContextMenu = (x: number, y: number): JSX.Element => {
		const { onUpdate, preset, onPopup } = this.props;
		return (
			<div
				className="fixed bg-background-700 font-jetbrains flex flex-col p-2 m-4"
				style={{ top: `${y}px`, left: `${x}px` }}
			>
				<ContextMenuItem
					text="Vorschau"
					onClick={() => {
						onPopup(
							<Popup
								label="Preset Vorschau"
								content={<div />}
								onClose={() => {
									onPopup(null);
								}}
							/>
						);
					}}
				/>
				<ContextMenuDivider />
				<ContextMenuItem
					text="Datei öffnen"
					onClick={() => {
						window.electron.file.openExternal(preset.file);
					}}
				/>
				<ContextMenuItem
					text="Fluss Presets Ordner öffnen"
					onClick={() => {
						window.electron.file.openDir(preset.file);
					}}
				/>
				<ContextMenuDivider />
				<ContextMenuItem text="Bearbeiten" onClick={() => {}} />
				<ContextMenuItem
					text="Löschen"
					onClick={() => {
						onPopup(
							<ConfirmPopup
								label={`Preset ${preset.name} löschen?`}
								onConfirm={async () => {
									await window.electron.file.remove(
										preset.file
									);
									onUpdate();
								}}
								onAbort={() => {
									onPopup(null);
								}}
							/>
						);
					}}
				/>
			</div>
		);
	};

	render() {
		const { className, preset } = this.props;
		const id = _uniqueId('preset-element-');
		return (
			<button
				type="button"
				key={id}
				className="relative m-4 h-fit"
				onContextMenu={this.handleContextMenu}
				draggable
				onDragStart={this.handleDragStart}
				onDragEnd={this.handleDragEnd}
			>
				<div className={className}>{preset.name}</div>
			</button>
		);
	}
}

export default CRiverPreset;
