import { Component } from 'react';
import _uniqueId from 'lodash/uniqueId';
import { BoardPresetWithFile, RiverPresetWithFile } from '../../../main/helper/PresetsLoader';
import { getDirectionArrow } from '../presetEditor/RiverFieldPreset';

type PresetViewProps = {
	riverPresets: Array<RiverPresetWithFile>;
	boardPresets: Array<BoardPresetWithFile>;
};
type PresetViewState = {
	open: 'riverPresets' | 'boardPresets';
	activePreset: string | null;
};

export default class PresetView extends Component<PresetViewProps, PresetViewState> {
	constructor(props: PresetViewProps) {
		super(props);
		this.state = {
			open: 'riverPresets',
			activePreset: null,
		};
	}

	previewRiverPreset = (riverPreset: RiverPresetWithFile | undefined) => {
		if (riverPreset) {
			const board: JSX.Element[][] = [];
			for (let x = 0; x < riverPreset.width; x += 1) {
				const row: JSX.Element[] = [];
				for (let y = 0; y < riverPreset.height; y += 1) {
					const river = riverPreset?.data.filter((r) => r.position[0] === x && r.position[1] === y);
					const isRiver = river.length > 0;
					row.push(
						<div
							className={`w-3.5 h-3.5 ${
								isRiver ? 'isRiver' : 'bg-white/5'
							} border border dark:border-muted-700 border-muted-400 text-[10px] flex justify-center items-center`}
						>
							{isRiver ? getDirectionArrow(river[0].direction) : null}
						</div>
					);
				}
				board.push(row);
			}
			return (
				<div className="flex flex-col justify-center items-center">
					<div className="flex flex-col items-center justify-center text-[12px]">
						<p>{riverPreset.name}</p>
					</div>
					<div className="flex">
						{board.map((row) => (
							<div className="flex flex-col">{row.map((cell) => cell)}</div>
						))}
					</div>
					<div className="flex flex-col items-center justify-center text-[12px]">
						<p>
							{riverPreset.width}x{riverPreset.height}
						</p>
					</div>
				</div>
			);
		}
		return null;
	};

	render() {
		const { riverPresets, boardPresets } = this.props;
		const { open, activePreset } = this.state;
		return (
			<div>
				<div className="flex justify-around items-center border-b dark:border-muted-700 border-muted-400 preset-view-switch">
					<button
						type="button"
						onClick={() => this.setState({ open: 'riverPresets' })}
						className={`border-r dark:border-muted-700 border-muted-400 w-full p-2 ${
							open === 'riverPresets' ? 'active' : ''
						}`}
					>
						{window.languageHelper.translate('River Presets')}
					</button>
					<button
						type="button"
						onClick={() => this.setState({ open: 'boardPresets' })}
						className={`w-full p-2 ${open === 'boardPresets' ? 'active' : ''}`}
					>
						{window.languageHelper.translate('Board Presets')}
					</button>
				</div>
				<div
					className={`flex justify-center dark:bg-muted-700 transition transition-all ${
						activePreset
							? 'h-fit opacity-100 m-2 border dark:border-muted-700 border-muted-400 p-2'
							: 'opacity-0 h-0 p-0 m-0'
					}`}
				>
					{open === 'riverPresets'
						? this.previewRiverPreset(
								riverPresets.find((preset) => {
									return preset.file.base === activePreset;
								})
						  )
						: null}
				</div>
				<div className="grid grid-cols-2 items-stretch gap-1 m-2 border dark:border-muted-700 border-muted-400 p-2">
					{open === 'riverPresets' ? (
						<>
							{riverPresets.map((preset) => (
								<button
									type="button"
									key={_uniqueId()}
									className={`p-2 flex flex-col w-full ${activePreset === preset.file.base ? 'bg-white/10' : ''}`}
									onClick={() => {
										if (activePreset === preset.file.base) {
											this.setState({ activePreset: null });
										} else {
											this.setState({ activePreset: preset.file.base });
										}
									}}
								>
									<p className={activePreset === preset.file.base ? 'text-accent-300' : ''}>{preset.name}</p>
									<p className="text-[10px] text-white/50">{preset.file.base}</p>
								</button>
							))}
						</>
					) : (
						<>
							{boardPresets.map((preset) => (
								<button
									type="button"
									key={_uniqueId()}
									className="p-2 flex flex-col"
									onClick={() => {
										this.setState({ activePreset: preset.file.base });
									}}
								>
									<p>{preset.name}</p>
									<p className="text-[10px] text-white/50">{preset.file.base}</p>
								</button>
							))}
						</>
					)}
				</div>
			</div>
		);
	}
}
