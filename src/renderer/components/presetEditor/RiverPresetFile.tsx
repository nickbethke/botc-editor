import { VscClose, VscJson } from 'react-icons/vsc';
import React from 'react';
import ContextMenuV2 from '../boardConfigurator/ContextMenuV2';
import ContextMenuItemV2 from '../boardConfigurator/ContextMenuItemV2';

type RiverPresetFileProps = {
	currentFile: null | string;
	fileName: string;
	onCurrentFileChange: (file: string) => void;
	onCloseOpenPreset: (file: string) => void;
	edited: boolean;
	onContextMenu: (contextMenu: JSX.Element | null) => unknown;
};
type RiverPresetFileState = {
	hover: boolean;
};

class RiverPresetFile extends React.Component<RiverPresetFileProps, RiverPresetFileState> {
	constructor(props: RiverPresetFileProps) {
		super(props);
		this.state = {
			hover: false,
		};
	}

	genContextMenu = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		const { onCloseOpenPreset, fileName } = this.props;
		return (
			<ContextMenuV2 position={{ x: event.clientX, y: event.clientY }}>
				<ContextMenuItemV2
					text={window.languageHelper.translate('Close')}
					onClick={() => {
						onCloseOpenPreset(fileName);
					}}
				/>
			</ContextMenuV2>
		);
	};

	render() {
		const { currentFile, fileName, onCurrentFileChange, onCloseOpenPreset, edited, onContextMenu } = this.props;
		const { hover } = this.state;
		return (
			<button
				type="button"
				className={`relative h-full px-2 py-2 flex items-center justify-between gap-4 hover:bg-white/5 `}
				onClick={() => {
					onCurrentFileChange(fileName);
				}}
				onMouseEnter={() => {
					this.setState({ hover: true });
				}}
				onMouseLeave={() => {
					this.setState({ hover: false });
				}}
				onContextMenu={(event) => {
					onContextMenu(this.genContextMenu(event));
				}}
			>
				<div className="flex justify-center items-center gap-1">
					<VscJson />
					<span className="font-light text-sm whitespace-nowrap">
						{fileName}
						{edited ? ' *' : ''}
					</span>
				</div>
				{hover || currentFile === fileName ? (
					<VscClose
						className="hover:bg-white/5"
						onClick={() => {
							onCloseOpenPreset(fileName);
						}}
					/>
				) : (
					<div className="w-4 h-8" />
				)}
			</button>
		);
	}
}

export default RiverPresetFile;
