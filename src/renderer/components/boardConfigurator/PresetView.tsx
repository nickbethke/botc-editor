import { Component } from 'react';
import _uniqueId from 'lodash/uniqueId';
import { VscAdd } from 'react-icons/vsc';
import { BoardPresetWithFile, RiverPresetWithFile } from '../../../main/helper/PresetsLoader';
import { getDirectionArrow } from '../presetEditor/RiverFieldPreset';
import ContextMenuV2 from './ContextMenuV2';
import ContextMenuItemV2 from './ContextMenuItemV2';
import Button from '../Button';

/**
 * The preset view component properties
 */
type PresetViewProps = {
	riverPresets: Array<RiverPresetWithFile>;
	boardPresets: Array<BoardPresetWithFile>;
	onAddRiverPresetToBoard: (newRiverPreset: RiverPresetWithFile) => void;
};
/**
 * The preset view component state properties
 */
type PresetViewState = {
	open: 'riverPresets' | 'boardPresets';
	activePreset: string | null;
	contextMenu: JSX.Element | null;
	windowDimensions: { width: number; height: number };
};
/**
 * The preset view component
 */
export default class PresetView extends Component<PresetViewProps, PresetViewState> {
	constructor(props: PresetViewProps) {
		super(props);
		this.state = {
			open: 'riverPresets',
			activePreset: null,
			contextMenu: null,
			windowDimensions: { width: window.innerWidth, height: window.innerHeight },
		};
	}

	/**
	 * Fires when the component is mounted
	 */
	componentDidMount() {
		window.addEventListener('resize', this.resizeListener);
		window.addEventListener('click', this.clickListener);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.resizeListener);
		window.removeEventListener('click', this.clickListener);
	}

	resizeListener = () => {
		this.setState({
			windowDimensions: { width: window.innerWidth, height: window.innerHeight },
		});
	};

	clickListener = () => {
		this.setState({
			contextMenu: null,
		});
	};

	/**
	 * Renders the preset preview
	 * @param riverPreset
	 */
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
							key={_uniqueId()}
							className={`w-3.5 h-3.5 ${
								isRiver ? 'isRiver' : 'bg-white/5'
							} border dark:border-muted-700 border-muted-400 text-[10px] flex justify-center items-center`}
						>
							{isRiver ? getDirectionArrow(river[0].direction) : null}
						</div>
					);
				}
				board.push(row);
			}
			return (
				<div className="flex flex-col h-full">
					<div className="grow flex flex-col justify-center items-center">
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
					<div className="flex items-center justify-center text-sm">
						<Button
							className="dark:bg-slate-600 dark:hover:bg-slate-700"
							onClick={() => {
								const { onAddRiverPresetToBoard } = this.props;
								onAddRiverPresetToBoard(riverPreset);
							}}
							size="sm"
						>
							<VscAdd />
							<p className="whitespace-nowrap">{window.t.translate('Add to board')}</p>
						</Button>
					</div>
				</div>
			);
		}
		return null;
	};

	/**
	 * Renders the preset view component
	 */
	render() {
		const { riverPresets, boardPresets } = this.props;
		const { open, activePreset, contextMenu, windowDimensions } = this.state;
		return (
			<div>
				<div className="flex justify-around items-center border-b dark:border-muted-700 border-muted-400 preset-view-switch">
					<button
						type="button"
						onClick={() => {
							const { open } = this.state;
							if (open === 'boardPresets') {
								this.setState({ open: 'riverPresets', activePreset: null });
							}
						}}
						className={`border-r dark:border-muted-700 border-muted-400 w-full p-2 ${
							open === 'riverPresets' ? 'active' : ''
						}`}
					>
						{window.t.translate('River Presets')}
					</button>
					<button
						type="button"
						onClick={() => {
							const { open } = this.state;
							if (open === 'riverPresets') {
								this.setState({ open: 'boardPresets', activePreset: null });
							}
						}}
						className={`w-full p-2 ${open === 'boardPresets' ? 'active' : ''}`}
					>
						{window.t.translate('Board Presets')}
					</button>
				</div>
				<div
					className={`flex justify-center dark:bg-muted-700 bg-muted-500 transition-all overflow-hidden ${
						activePreset
							? 'h-[364px] opacity-100 m-2 border dark:border-muted-700 border-muted-400 p-2'
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
				<div
					className="grid grid-cols-2 items-stretch gap-1 m-2 border dark:border-muted-700 border-muted-400 p-2 overflow-x-auto transition-all"
					style={{ maxHeight: windowDimensions.height - (138 + (activePreset ? 372 : 0)) }}
				>
					{open === 'riverPresets' ? (
						<>
							{riverPresets.map((preset) => (
								<div
									role="presentation"
									key={_uniqueId()}
									className={`p-2 flex flex-col w-full hover:cursor-pointer ${
										activePreset === preset.file.base ? 'bg-white/10 shadow' : ' hover:bg-white/5'
									}`}
									onClick={() => {
										if (activePreset === preset.file.base) {
											this.setState({ activePreset: null });
										} else {
											this.setState({ activePreset: preset.file.base });
										}
									}}
									onContextMenu={(event) => {
										this.setState({
											contextMenu: (
												<ContextMenuV2 position={{ x: event.clientX, y: event.clientY }}>
													<ContextMenuItemV2
														text={`${window.t.translate('Open preset')}...`}
														onClick={async () => {
															await window.electron.file.openExternal(`${preset.file.dir}/${preset.file.base}`);
														}}
													/>
												</ContextMenuV2>
											),
										});
									}}
								>
									<p className={activePreset === preset.file.base ? 'text-accent-300' : ''}>{preset.name}</p>
									<p className="text-[10px] text-white/50">{preset.file.base}</p>
								</div>
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
				{contextMenu}
			</div>
		);
	}
}
