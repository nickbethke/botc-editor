import { VscAdd, VscJson, VscTrash } from 'react-icons/vsc';
import _uniqueId from 'lodash/uniqueId';
import MonacoEditor from 'react-monaco-editor';
import React from 'react';
import RiverFieldPreset, { getDirectionArrow } from './RiverFieldPreset';
import SidebarMenuItem, { SidebarMenuItemSeparator } from '../boardConfigurator/SidebarMenuItem';
import { RiverPreset } from '../../../main/helper/PresetsLoader';
import { RiverPresetEditorTools } from '../../screens/RiverPresetEditor';
import { removeRiver } from './Helper';
import { BoardPosition } from '../generator/interfaces/BoardPosition';
import { SettingsInterface } from '../../../interfaces/SettingsInterface';
import OpenPresets from './OpenPresets';
import EditorCache from './EditorCache';
import InputLabel from '../InputLabel';
import { Direction } from '../../../interfaces/BoardConfigInterface';

type PresetEditorMainProps = {
	currentFile: null | string;
	currentTool: RiverPresetEditorTools;
	editorCache: EditorCache;
	lastSetDirection: Direction;
	config: RiverPreset | null;
	windowDimensions: { width: number; height: number };
	os: NodeJS.Platform;
	settings: SettingsInterface;

	onLastSetDirectionChange: (direction: Direction) => unknown;
	onToolChange: (tool: RiverPresetEditorTools) => unknown;
	onAddRiver: (position: BoardPosition, initial: boolean) => unknown;
	onContextMenu: (contextMenu: React.JSX.Element | null) => unknown;
	onPresetUpdate: (config: RiverPreset, doSearch?: boolean) => unknown;
	onCurrentFileChange: (file: string) => void;
	onCloseOpenPreset: (file: string) => void;
	openTabsOrder: Map<string, number>;
	onTabsOrderUpdate: (openTabsOrder: Map<string, number>) => void;
};

type PresetEditorMainState = {
	previewOpen: boolean;
	previewFull: boolean;
};

class PresetEditorMain extends React.Component<PresetEditorMainProps, PresetEditorMainState> {
	constructor(props: PresetEditorMainProps) {
		super(props);
		this.state = {
			previewOpen: false,
			previewFull: this.isPreviewFull(),
		};
	}

	componentDidMount() {
		window.addEventListener('resize', () => {
			this.setState({ previewFull: this.isPreviewFull() });
		});
	}

	isPreviewFull = () => {
		return window.innerWidth < 1630;
	};

	getNeighbors = (x: number, y: number): Array<BoardPosition> => {
		const neighbors: Array<BoardPosition> = [];

		if (x - 1 >= 0) {
			neighbors.push({ x: x - 1, y });
		}
		if (y - 1 >= 0) {
			neighbors.push({ x, y: y - 1 });
		}

		if (x + 1 < 20) {
			neighbors.push({ x: x + 1, y });
		}
		if (y + 1 < 20) {
			neighbors.push({ x, y: y + 1 });
		}
		return neighbors;
	};

	fieldSet = (position: [number, number]): boolean => {
		const { config } = this.props;
		if (config) {
			return (
				config.data.filter((field: { position: [number, number] }) => {
					return field.position[0] === position[0] && field.position[1] === position[1];
				}).length > 0
			);
		}
		return false;
	};

	generateBoard = () => {
		const { config, currentTool, onAddRiver, onContextMenu, onPresetUpdate } = this.props;
		const board: Array<Array<React.JSX.Element | null>> = [];

		for (let x = 0; x < 20; x += 1) {
			const row: Array<React.JSX.Element | null> = [];
			for (let y = 0; y < 20; y += 1) {
				row.push(
					<div
						key={_uniqueId()}
						className='xl:min-w-8 xl:w-8 xl:h-8 min-w-7 w-7 h-7 outline outline-1 dark:outline-muted-700 outline-muted-500'
					/>,
				);

			}
			board.push(row);
		}
		if (config) {
			config.data.forEach((value) => {
				const x = value.position[0];
				const y = value.position[1];
				const neighbors = this.getNeighbors(x, y);
				if (currentTool !== 'delete') {
					for (const neighbor of neighbors) {
						if (!this.fieldSet([neighbor.x, neighbor.y])) {
							board[neighbor.x][neighbor.y] = (
								<button
									key={_uniqueId()}
									type='button'
									className='relative xl:min-w-8 xl:w-8 xl:h-8 min-w-7 min-h-7 w-7 h-7 outline outline-1 dark:outline-muted-700 outline-muted-500 hover:bg-white/10 flex items-center justify-center'
									onClick={() => {
										onAddRiver(neighbor, false);
									}}
								>
									<VscAdd />
								</button>
							);
						}
					}
				}
				board[x][y] = (
					<RiverFieldPreset
						key={_uniqueId()}
						field={value}
						onDirectionChange={(direction, position) => {
							const newData = config.data.map((field) => {
								if (field.position[0] === position[0] && field.position[1] === position[1]) {
									return { ...field, direction };
								}
								return field;
							});
							onPresetUpdate({ ...config, data: newData });
						}}
						onContextMenu={onContextMenu}
						onClick={(position) => {
							if (currentTool === 'delete' && config.data.length > 1 && !(position[0] === 0 && position[1] === 0)) {
								onPresetUpdate(
									removeRiver(
										{
											x: position[0],
											y: position[1],
										},
										config,
									),
								);
							}
						}}
					/>
				);
			});
		}

		return board;
	};

	buildActiveFiles = (): React.JSX.Element => {
		const {
			editorCache,
			currentFile,
			onCurrentFileChange,
			onCloseOpenPreset,
			onContextMenu,
			openTabsOrder,
			onTabsOrderUpdate,
		} = this.props;
		return (
			<OpenPresets
				editorCache={editorCache}
				currentFile={currentFile}
				onContextMenu={onContextMenu}
				onCurrentFileChange={onCurrentFileChange}
				onCloseOpenPreset={onCloseOpenPreset}
				openTabsOrder={openTabsOrder}
				onUpdate={onTabsOrderUpdate}
			/>
		);
	};

	render() {
		const {
			currentTool,
			onToolChange,
			lastSetDirection,
			onLastSetDirectionChange,
			onPresetUpdate,
			config,
			windowDimensions,
			settings,
			os,
		} = this.props;
		const { previewOpen, previewFull } = this.state;
		const board = this.generateBoard();
		const winHeight = settings.darkMode ? 120 : 121;
		const otherHeight = settings.darkMode ? 88 : 89;
		const contentHeightStyle = windowDimensions.height - (os === 'win32' ? winHeight : otherHeight);
		const preViewOpenMainStyle = previewFull ? { width: '0' } : { width: 'calc(100vw - 956px)' };
		const previewOpenClass = previewFull ? 'w-full' : 'w-[450px]';
		return (
			<div className='dark:bg-muted-700 h-full flex flex-col grow' style={{ maxWidth: 'calc(100vw - 400px)' }}>
				<div
					className='border-y dark:border-muted-700 border-muted-400 dark:bg-muted-800 flex h-[46px]'
					style={{ maxWidth: 'calc(100vw - 400px)', width: 'calc(100vw - 400px)' }}
				>
					{this.buildActiveFiles()}
				</div>
				<div className='flex w-full' style={{ height: contentHeightStyle }}>
					<div className='border-r dark:border-muted-700 border-muted-400 dark:bg-muted-800 flex flex-col'>
						<SidebarMenuItem
							key={_uniqueId()}
							label={window.t.translate('Delete')}
							open={currentTool === 'delete'}
							icon={<VscTrash />}
							onClick={() => {
								if (currentTool === 'delete') {
									onToolChange(null);
								} else {
									onToolChange('delete');
								}
							}}
							shortCut={`${window.t.translate('Ctrl')}+D`}
							position='right'
						/>
						<SidebarMenuItemSeparator />
						<SidebarMenuItem
							key={_uniqueId()}
							label={window.t.translate('Direction')}
							open={false}
							icon={getDirectionArrow(lastSetDirection)}
							onClick={() => {
								if (currentTool === 'delete') {
									onToolChange(null);
								}
								switch (lastSetDirection) {
									case 'NORTH':
										onLastSetDirectionChange('EAST');
										break;
									case 'EAST':
										onLastSetDirectionChange('SOUTH');
										break;
									case 'SOUTH':
										onLastSetDirectionChange('WEST');
										break;
									case 'WEST':
										onLastSetDirectionChange('NORTH');
										break;
									default:
										break;
								}
							}}
							shortCut='W, A, S, D'
						/>
					</div>
					<div className='h-full flex flex-col'>
						<div
							className={`${
								previewOpen && previewFull ? 'opacity-0' : 'opacity-100'
							} grow overflow-x-hidden col-span-2 flex justify-center items-center grow dark:bg-muted-700 bg-muted-500 transition-all`}
							style={previewOpen ? preViewOpenMainStyle : { width: 'calc(100vw - 506px)' }}
						>
							<div className='p-4 w-fit h-fit dark:bg-muted-800 bg-muted-600 rounded'>
								<div className='flex outline outline-1 dark:outline-muted-700 outline-muted-500'>
									{board.map((row) => (
										<div key={_uniqueId()} className='flex flex-col'>
											{row.map((field) => field)}
										</div>
									))}
								</div>
							</div>
						</div>
						<div
							className={`${
								previewOpen && previewFull ? 'hidden w-0' : 'display w-full'
							} dark:bg-muted-800 bg-muted-600 p-2 transition-all`}
						>
							<InputLabel
								type='text'
								value={config ? config.name : ''}
								onChange={(value) => {
									if (config) {
										onPresetUpdate({ ...config, name: value });
									}
								}}
								small
							/>
						</div>
					</div>
					<div className={`transition-all overflow-x-hidden ${previewOpen ? previewOpenClass : 'w-0'}`}>
						<MonacoEditor
							value={config ? JSON.stringify(config, null, 4) : ''}
							width={previewFull ? window.innerWidth - 506 : 450}
							height={windowDimensions.height - (os === 'win32' ? winHeight : 88)}
							language='json'
							theme={settings.darkMode ? 'vs-dark' : 'vs'}
							onChange={(value) => {
								try {
									onPresetUpdate(JSON.parse(value));
								} catch (e) {
									//
								}
							}}
							options={{ readOnly: true }}
						/>
					</div>
					<div className='border-l dark:border-muted-700 border-muted-400 dark:bg-muted-800 flex flex-col'>
						<SidebarMenuItem
							key={_uniqueId()}
							label={window.t.translate('Code Preview')}
							open={previewOpen}
							icon={<VscJson />}
							onClick={() => {
								this.setState({ previewOpen: !previewOpen });
							}}
							shortCut={`${window.t.translate('Ctrl')}+D`}
							position='left'
						/>
					</div>
				</div>
			</div>
		);
	}
}

export default PresetEditorMain;
