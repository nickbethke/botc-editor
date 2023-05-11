import React from 'react';
import Mousetrap from 'mousetrap';
import _uniqueId from 'lodash/uniqueId';
import { VscColorMode, VscNewFile } from 'react-icons/vsc';
import { SettingsInterface } from '../../interfaces/SettingsInterface';
import { RiverPreset, RiverPresetDirection, RiverPresetWithFile } from '../../main/helper/PresetsLoader';
import { BoardPosition } from '../components/generator/interfaces/BoardPosition';
import AStarRiverPreset from '../components/presetEditor/AStar';
import PresetEditSidebar from '../components/presetEditor/PresetEditSidebar';
import { getBoardMaxDimension, removeRiver } from '../components/presetEditor/Helper';
import EditorCache from '../components/presetEditor/EditorCache';
import PromptPopupV2 from '../components/boardConfigurator/PromptPopupV2';
import PresetEditorMain from '../components/presetEditor/PresetEditorMain';
import ConfirmPopupV2 from '../components/boardConfigurator/ConfirmPopupV2';
import destinyMountainImage from '../../../assets/textures/schicksalsberg.png';
import SidebarMenuItem from '../components/boardConfigurator/SidebarMenuItem';
import TopMenuItem, { TopMenuSeparator } from '../components/boardConfigurator/TopMenuItem';
import TopMenuItemCollapsable from '../components/boardConfigurator/TopMenuItemCollapsable';
import { TopMenuActions } from '../components/boardConfigurator/TopMenu';
import Dragger from '../components/Dragger';

type PresetEditorPopupType = null | JSX.Element;

type RiverPresetEditorProps = {
	os: NodeJS.Platform;
	onClose: () => void;
	settings: SettingsInterface;
	onSettingsUpdate: (settings: SettingsInterface) => void;
};
export type RiverPresetEditorTools = null | 'delete';

type RiverPresetEditorState = {
	popup: PresetEditorPopupType;
	windowDimensions: { width: number; height: number };
	config: RiverPreset | null;
	contextMenu: null | JSX.Element;
	lastSetDirection: RiverPresetDirection;
	files: RiverPresetWithFile[];
	currentFile: null | string;
	fileSep: string;
	currentTool: RiverPresetEditorTools;
	editorCache: EditorCache;
	openTabsOrder: Map<string, number>;
	isLoadingPresets: boolean;
};

class RiverPresetEditor extends React.Component<RiverPresetEditorProps, RiverPresetEditorState> {
	private defaultRiverPreset: RiverPreset = {
		width: 1,
		height: 1,
		name: 'River Preset',
		data: [{ position: [0, 0], direction: 'SOUTH' }],
	};

	constructor(props: RiverPresetEditorProps) {
		super(props);
		this.state = {
			popup: null,
			windowDimensions: {
				width: window.innerWidth,
				height: window.innerHeight,
			},
			config: null,
			contextMenu: null,
			lastSetDirection: 'NORTH',
			files: [],
			currentFile: null,
			fileSep: props.os === 'win32' ? '\\' : '/',
			currentTool: null,
			editorCache: new EditorCache(),
			openTabsOrder: new Map(),
			isLoadingPresets: true,
		};
	}

	componentDidMount() {
		window.addEventListener('resize', this.handleResize);

		Mousetrap.bind(['down', 's'], () => {
			this.setState({ lastSetDirection: 'SOUTH', currentTool: null });
		});
		Mousetrap.bind(['up', 'w'], () => {
			this.setState({ lastSetDirection: 'NORTH', currentTool: null });
		});
		Mousetrap.bind(['left', 'a'], () => {
			this.setState({ lastSetDirection: 'WEST', currentTool: null });
		});
		Mousetrap.bind(['right', 'd'], () => {
			this.setState({ lastSetDirection: 'EAST', currentTool: null });
		});
		Mousetrap.bind(['ctrl+s', 'command+s'], () => {
			this.saveCurrentPreset();
		});
		Mousetrap.bind(['ctrl+d', 'command+d'], () => {
			const { currentTool } = this.state;
			this.setState({ currentTool: currentTool === 'delete' ? null : 'delete' });
		});
		Mousetrap.bind(['ctrl+n', 'command+n'], () => {
			this.newFile().catch(() => {});
		});
		this.onFileUpdate();
	}

	componentWillUnmount() {
		Mousetrap.unbind(['down', 's']);
		Mousetrap.unbind(['up', 'w']);
		Mousetrap.unbind(['left', 'a']);
		Mousetrap.unbind(['right', 'd']);
		Mousetrap.unbind(['ctrl+s', 'command+s']);
		Mousetrap.unbind(['ctrl+d', 'command+d']);
		Mousetrap.unbind(['ctrl+n', 'command+n']);
		window.removeEventListener('resize', this.handleResize);
	}

	handleResize = () => {
		this.setState({
			windowDimensions: {
				width: window.innerWidth,
				height: window.innerHeight,
			},
		});
	};

	componentDidUpdate() {
		const { config } = this.state;
		if (config) {
			const dimensionMax = getBoardMaxDimension(config);
			if (config.height < dimensionMax.height || config.width < dimensionMax.width) {
				this.setState({ config: { ...config, width: dimensionMax.width, height: dimensionMax.height } });
			}
		}
	}

	saveCurrentPreset = () => {
		const { currentFile, editorCache } = this.state;

		if (currentFile) {
			const toSave = editorCache.getFile(currentFile);
			if (toSave && toSave.edited) {
				window.electron.file
					.savePreset(currentFile, JSON.stringify(editorCache.getPreset(currentFile), null, 4))
					.then(() => {
						editorCache.updateFile(currentFile, toSave.preset, false);
						this.setState({ editorCache });
						return this.onFileUpdate();
					})
					.catch(() => {});
			}
		}
	};

	onContextMenu = (contextMenu: JSX.Element | null) => {
		this.setState({ contextMenu });
		if (contextMenu) {
			document.addEventListener(
				'click',
				() => {
					if (contextMenu) {
						this.setState({ contextMenu: null });
					}
				},
				{ once: true }
			);
		}
	};

	addRiver = (neighbor: BoardPosition) => {
		const { config, lastSetDirection } = this.state;
		if (config) {
			const { data } = config;
			data.push({ position: [neighbor.x, neighbor.y], direction: lastSetDirection });
			this.onPresetUpdate({
				...config,
				data,
			});
		}
	};

	onPresetUpdate = (config: RiverPreset, setAsEdited = true, doSearch = true) => {
		const { editorCache, currentFile } = this.state;
		if (currentFile) {
			if (doSearch) {
				const search = new AStarRiverPreset(config);
				let newConfig = config;
				search.toBeRemoved.forEach((remove) => {
					newConfig = removeRiver(remove, newConfig);
				});
				editorCache.updatePreset(currentFile, newConfig, setAsEdited);

				let minWidth = 1;
				let minHeight = 1;
				newConfig.data.forEach((river) => {
					minWidth = Math.min(minWidth, river.position[0]);
					minHeight = Math.min(minHeight, river.position[1]);
				});
				newConfig.width = minWidth;
				newConfig.height = minHeight;

				this.setState({
					config: newConfig,
					editorCache,
				});
			} else {
				editorCache.updatePreset(currentFile, config, setAsEdited);
				this.setState({
					config,
					editorCache,
				});
			}
		}
	};

	onFileUpdate = (callback?: () => void) => {
		this.setState({ isLoadingPresets: true });
		window.electron.load
			.riverPresets()
			.then((riverPresets) => {
				const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
				riverPresets.sort((a, b) => {
					return collator.compare(a.file.base, b.file.base);
				});
				return this.setState(
					{
						files: riverPresets,
						isLoadingPresets: false,
					},
					() => {
						if (callback && typeof callback === 'function') {
							// eslint-disable-next-line promise/no-callback-in-promise
							callback();
						}
					}
				);
			})
			.catch(() => {});
	};

	openFile = (preset: RiverPresetWithFile, file: string) => {
		const { editorCache, openTabsOrder } = this.state;
		const configClone = structuredClone(preset);
		if (!editorCache.fileExists(file)) {
			editorCache.addFile(configClone);
		}
		openTabsOrder.set(file, editorCache.size());
		this.setState({
			currentFile: file,
			editorCache,
			config: editorCache.getPreset(file),
			openTabsOrder,
		});
	};

	switchTab = (file: string) => {
		const { editorCache, currentFile } = this.state;
		const next = editorCache.getFile(file);
		if (next && currentFile !== file) {
			this.setState(
				{
					currentFile: file,
				},
				() => {
					const preset = {
						width: next.preset.width,
						height: next.preset.height,
						data: next.preset.data,
						name: next.preset.name,
					};
					this.onPresetUpdate(structuredClone(preset), next.edited);
				}
			);
		}
	};

	newFile = async () => {
		const taken: number[] = [];
		const { files } = this.state;
		const regex = /river-(\d*).json/gm;

		const str = files.map((file) => file.file.base).join('\n');
		let m;

		// eslint-disable-next-line no-cond-assign
		while ((m = regex.exec(str)) !== null) {
			// This is necessary to avoid infinite loops with zero-width matches
			if (m.index === regex.lastIndex) {
				regex.lastIndex += 1;
			}

			// The result can be accessed through the `m`-variable.
			m.forEach((match, groupIndex) => {
				if (groupIndex === 1) {
					taken.push(Number.parseInt(match, 10));
				}
			});
		}
		let newIndex = 1;
		let newIndexFound = false;
		for (let i = 1; i <= taken.length; i += 1) {
			if (!taken.includes(i)) {
				newIndex = i;
				newIndexFound = true;
			}
		}
		if (!newIndexFound) {
			newIndex = taken.length + 1;
		}
		await window.electron.file.savePreset(`river-${newIndex}.json`, JSON.stringify(this.defaultRiverPreset, null, 4));
		this.onFileUpdate();
	};

	onTopMenuAction = async (action: TopMenuActions) => {
		const { editorCache, openTabsOrder, windowDimensions } = this.state;
		const { onClose, os, settings } = this.props;
		switch (action) {
			case TopMenuActions.NEW:
				await this.newFile();
				break;
			case TopMenuActions.CLOSE:
				if (editorCache.hasUnsavedFiles()) {
					// TODO: Save Unsaved files prompt
					this.setState({
						popup: (
							<ConfirmPopupV2
								title={window.t.translate('Close River-Preset Editor')}
								abortButtonText={window.t.translate('Cancel')}
								onAbort={() => {
									this.setState({ popup: null });
								}}
								confirmButtonText={window.t.translate('Save and close')}
								onConfirm={() => {
									const unsavedFiles = editorCache.getUnsavedFiles();
									unsavedFiles.forEach((value) => {
										const currentFile = value.preset.file.base;
										window.electron.file
											.savePreset(currentFile, JSON.stringify(editorCache.getPreset(currentFile), null, 4))
											.then(() => {
												openTabsOrder.delete(currentFile);
												return editorCache.deleteFile(currentFile);
											})
											.catch(() => {});
									});
									this.setState({ editorCache, openTabsOrder, popup: null });
									onClose();
								}}
								windowDimensions={windowDimensions}
								os={os}
								settings={settings}
							>
								{window.t.translate('There are still unsaved changes. Do you want to save changes before closing?')}
							</ConfirmPopupV2>
						),
					});
				} else {
					onClose();
				}
				break;
			case TopMenuActions.SAVE:
				this.saveCurrentPreset();
				break;
			case TopMenuActions.OPEN_PRESET_FOLDER:
				await window.electron.file.openPresetDir();
				break;
			default:
				break;
		}
	};

	render() {
		const {
			popup,
			windowDimensions,
			config,
			contextMenu,
			files,
			currentFile,
			fileSep,
			currentTool,
			lastSetDirection,
			editorCache,
			openTabsOrder,
			isLoadingPresets,
		} = this.state;
		const { os, settings, onSettingsUpdate } = this.props;
		return (
			<section className="text-white font-lato dark:bg-muted-800 bg-muted-600 h-full">
				<Dragger os={os}>{window.t.translate('River-Preset Editor')}</Dragger>
				<div
					className={`text-[14px] flex items-center dark:bg-muted-800 bg-muted-500 dark:border-0 border-t border-muted-400 ${
						os === 'darwin' ? 'pl-20' : ''
					}`}
				>
					<img className="h-6 ml-2 mr-4" src={destinyMountainImage} alt={window.t.translate('Logo')} />
					<TopMenuItemCollapsable label={window.t.translate('File')}>
						<TopMenuItem
							className="text-left"
							action={TopMenuActions.NEW}
							onAction={this.onTopMenuAction}
							icon={<VscNewFile />}
							label={window.t.translate('New')}
							shortCut={`${window.t.translate('Ctrl')}+N`}
							type="default"
						/>
						<TopMenuSeparator />
						<TopMenuItem
							className="text-left"
							action={TopMenuActions.SAVE}
							onAction={this.onTopMenuAction}
							label={`${window.t.translate('Save')}...`}
							shortCut={`${window.t.translate('Ctrl')}+S`}
							type="default"
						/>
						<TopMenuSeparator />
						<TopMenuItem
							className="text-left"
							action={TopMenuActions.OPEN_PRESET_FOLDER}
							onAction={this.onTopMenuAction}
							label={`${window.t.translate('Open Presets Folder')}...`}
							type="default"
						/>
						<TopMenuSeparator />
						<TopMenuItem
							className="text-left"
							action={TopMenuActions.CLOSE}
							onAction={this.onTopMenuAction}
							label={window.t.translate('Close')}
							type="default"
						/>
					</TopMenuItemCollapsable>
					<div className="ml-auto">
						<SidebarMenuItem
							key={_uniqueId()}
							label={window.t.translate('Dark Mode')}
							open={false}
							icon={
								<VscColorMode
									title={window.t.translate('Dark Mode')}
									className={`${
										settings.darkMode ? 'rotate-0' : 'rotate-180'
									} transition-transform transform-gpu text-lg`}
								/>
							}
							position="left"
							onClick={() => {
								onSettingsUpdate({ ...settings, darkMode: !settings.darkMode });
							}}
						/>
					</div>
				</div>
				<div className={`${popup !== null ? 'blur' : ''} transition-[filter]`}>
					<div className="flex w-[100vw] h-full grow">
						<PresetEditSidebar
							windowDimensions={windowDimensions}
							isLoadingPresets={isLoadingPresets}
							os={os}
							currentFile={currentFile}
							files={files}
							fileSep={fileSep}
							onOpenFile={this.openFile}
							onContextMenu={this.onContextMenu}
							onNewFile={this.newFile}
							onDeletePreset={async (fullPath, file) => {
								editorCache.deleteFile(file);
								openTabsOrder.delete(file);
								await window.electron.file.remove(fullPath);
								this.onFileUpdate();
								if (currentFile === file) {
									this.setState({
										currentFile: null,
										config: null,
										popup: null,
										editorCache,
									});
								} else {
									this.setState({
										popup: null,
										editorCache,
									});
								}
							}}
							onRenamePreset={(fullPath) => {
								this.setState({
									popup: (
										<PromptPopupV2
											title={window.t.translate('Rename Preset')}
											abortButtonText={window.t.translate('Cancel')}
											onAbort={() => {
												this.setState({ popup: null });
											}}
											confirmButtonText={window.t.translate('Rename')}
											onConfirm={async (newName) => {
												const newFileName = `${newName}.json`;
												if (fullPath.base !== newFileName) {
													const newFileParsedPath = await window.electron.file.renamePreset(fullPath.base, newFileName);
													this.onFileUpdate(() => {
														if (editorCache.fileExists(fullPath.base)) {
															const oldFile = editorCache.getFile(fullPath.base);
															if (oldFile) {
																editorCache.deleteFile(fullPath.base);
																editorCache.addFile({
																	...oldFile?.preset,
																	file: newFileParsedPath,
																});
															}
														}
														const index = openTabsOrder.get(fullPath.base);
														if (index) {
															openTabsOrder.delete(fullPath.base);
															openTabsOrder.set(newFileName, index);
														}
														if (currentFile === fullPath.base) {
															this.setState({
																currentFile: newFileName,
															});
														}
														this.setState({ popup: null, openTabsOrder });
													});
												}
											}}
											input={{ type: 'text', startValue: fullPath.name }}
											windowDimensions={windowDimensions}
											os={os}
											settings={settings}
										/>
									),
								});
							}}
							settings={settings}
						/>
						<PresetEditorMain
							currentFile={currentFile}
							currentTool={currentTool}
							editorCache={editorCache}
							lastSetDirection={lastSetDirection}
							config={config}
							windowDimensions={windowDimensions}
							os={os}
							openTabsOrder={openTabsOrder}
							settings={settings}
							onLastSetDirectionChange={(direction) => {
								this.setState({ lastSetDirection: direction });
							}}
							onToolChange={(tool) => {
								this.setState({ currentTool: tool });
							}}
							onAddRiver={this.addRiver}
							onContextMenu={this.onContextMenu}
							onPresetUpdate={this.onPresetUpdate}
							onCurrentFileChange={(file) => {
								this.switchTab(file);
							}}
							onTabsOrderUpdate={(newOpenTabsOrder) => {
								this.setState({ openTabsOrder: newOpenTabsOrder });
							}}
							onCloseOpenPreset={(file) => {
								const toClose = editorCache.getFile(file);
								if (toClose) {
									if (toClose.edited) {
										this.setState({
											popup: (
												<ConfirmPopupV2
													title={window.t.translate('Close River Preset')}
													abortButtonText={window.t.translate('Cancel')}
													onAbort={() => {
														this.setState({ popup: null });
													}}
													confirmButtonText={window.t.translate('Save and close')}
													onConfirm={async () => {
														// TODO: Save
														if (toClose) {
															await window.electron.file.savePreset(
																file,
																JSON.stringify(editorCache.getPreset(file), null, 4)
															);
															editorCache.deleteFile(file);
															openTabsOrder.delete(file);
															if (file === currentFile) {
																this.setState({
																	editorCache,
																	currentFile: null,
																	config: null,
																	openTabsOrder,
																});
															} else {
																this.setState({ editorCache, openTabsOrder });
															}
														}
														this.setState({ popup: null });
														this.onFileUpdate();
													}}
													windowDimensions={windowDimensions}
													os={os}
													settings={settings}
												>
													{window.t.translate(
														'This file has not yet been saved. Do you want to save the current changes before closing?'
													)}
												</ConfirmPopupV2>
											),
										});
									} else {
										editorCache.deleteFile(file);
										openTabsOrder.delete(file);
										if (file === currentFile) {
											this.setState({
												editorCache,
												currentFile: null,
												config: null,
												openTabsOrder,
											});
										} else {
											this.setState({ editorCache, openTabsOrder });
										}
									}
								}
							}}
						/>
					</div>
				</div>
				{contextMenu}
				{popup}
			</section>
		);
	}
}

export default RiverPresetEditor;
