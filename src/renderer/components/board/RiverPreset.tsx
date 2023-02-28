import React, { MouseEventHandler } from 'react';
import _uniqueId from 'lodash/uniqueId';
import { RiverPreset } from '../../../main/helper/PresetsLoader';
import ContextMenuItem, { ContextMenuDivider } from './ContextMenuItem';

type RiverPresetProps = {
	preset: RiverPreset;
	className: string;
	onContextMenu: (contextMenu: JSX.Element) => void;
	onUpdate: () => void;
};
type RiverPresetState = unknown;

class CRiverPreset extends React.Component<RiverPresetProps, RiverPresetState> {
	constructor(props: RiverPresetProps) {
		super(props);

		this.handleContextMenu = this.handleContextMenu.bind(this);
	}

	handleContextMenu: MouseEventHandler<HTMLButtonElement> = (event) => {
		const { onContextMenu } = this.props;
		onContextMenu(this.getPreview(event.clientX, event.clientY));
	};

	getPreview = (x: number, y: number): JSX.Element => {
		const { onUpdate, preset } = this.props;
		return (
			<div
				className="fixed bg-background-700 font-jetbrains flex flex-col p-2"
				style={{ top: `${y}px`, left: `${x}px` }}
			>
				<ContextMenuItem text="Vorschau" onClick={() => {}} />
				<ContextMenuDivider />
				<ContextMenuItem
					text="Datei öffnen"
					onClick={() => {
						window.electron.file.open(preset.file);
					}}
				/>
				<ContextMenuItem
					text="Preset Ordner öffnen"
					onClick={() => {
						window.electron.file.openDir(preset.file);
					}}
				/>
				<ContextMenuDivider />
				<ContextMenuItem text="Bearbeiten" onClick={() => {}} />
				<ContextMenuItem
					text="Löschen"
					onClick={() => {
						onUpdate();
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
				className="relative"
				onContextMenu={this.handleContextMenu}
			>
				<div className={className}>{preset.name}</div>
			</button>
		);
	}
}

export default CRiverPreset;
