import React, { ReactElement } from 'react';
import MonacoEditor, { monaco } from 'react-monaco-editor';
import Mousetrap from 'mousetrap';
import { DefinedError } from 'ajv';
import { ParsedPath } from 'path';
import { VscColorMode, VscFolder, VscNewFile, VscSave, VscVersions } from 'react-icons/vsc';
import { ProgressBar } from 'react-loader-spinner';
import _uniqueId from 'lodash/uniqueId';
import BoardConfigValidator from '../helper/BoardConfigValidator';
import BoardConfigInterface from '../components/interfaces/BoardConfigInterface';
import PartieConfigValidator from '../helper/PartieConfigValidator';
import PartieConfigInterface from '../components/interfaces/PartieConfigInterface';
import { SettingsInterface } from '../../interfaces/SettingsInterface';
import TopMenuItem, { TopMenuSeparator } from '../components/boardConfigurator/TopMenuItem';
import SelectComponent from '../components/Select';
import destinyMountainImage from '../../../assets/textures/schicksalsberg.png';
import TopMenuItemCollapsable from '../components/boardConfigurator/TopMenuItemCollapsable';
import PopupV2 from '../components/boardConfigurator/PopupV2';
import ConfirmPopupV2 from '../components/boardConfigurator/ConfirmPopupV2';
import FilePathComponent from '../components/FilePathComponent';
import KeyCode = monaco.KeyCode;
import KeyMod = monaco.KeyMod;
import { JsonViewer } from '@textea/json-viewer';
import SettingsPopup from '../components/popups/SettingsPopup';

type JsonValidatorProps = {
	onClose: () => void;
	os: NodeJS.Platform;
	settings: SettingsInterface;
	onSettingsUpdated: (settings: SettingsInterface) => void;
};
type JsonValidatorState = {
	popup: JSX.Element | null;
	code: string;
	codeError: string;
	type: 'board' | 'partie';
	consoleOutput: string[];
	currentFile: { parsed: ParsedPath; path: string } | null;
	fileHasBeenEdited: boolean;
	windowDimensions: {
		width: number;
		height: number;
	};
};

class JsonValidator extends React.Component<JsonValidatorProps, JsonValidatorState> {
	/**
	 * Add a zero to a number if it is smaller than 10
	 * @param number
	 */
	private static numberAddZero = (number: number): string => {
		if (number < 10) {
			return `0${number}`;
		}
		return `${number}`;
	};

	constructor(props: JsonValidatorProps) {
		super(props);

		window.electron.schemas
			.party()
			.then((partieSchema) => {
				return monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
					validate: true,
					schemas: [
						{
							uri: '#',
							fileMatch: ['*'],
							schema: partieSchema,
						},
					],
				});
			})
			.catch(() => {});

		this.handleBackButton = this.handleBackButton.bind(this);
		this.backToHomeScreen = this.backToHomeScreen.bind(this);
		this.abortBackToHomeScreen = this.abortBackToHomeScreen.bind(this);
		this.openFile = this.openFile.bind(this);
		this.saveFile = this.saveFile.bind(this);
		this.changeType = this.changeType.bind(this);
		this.openNewFile = this.openNewFile.bind(this);

		this.state = {
			code: JSON.stringify({}, null, 4),
			codeError: '',
			popup: null,
			type: 'partie',
			consoleOutput: [],
			currentFile: null,
			fileHasBeenEdited: false,
			windowDimensions: {
				width: window.innerWidth,
				height: window.innerHeight,
			},
		};
	}

	componentDidMount() {
		Mousetrap.bind(['command+s', 'ctrl+s'], () => {
			this.saveFile().catch(() => {});
		});

		monaco.editor.addEditorAction({
			id: 'saveConfig',
			label: 'Save Config',
			// eslint-disable-next-line no-bitwise
			keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS],
			run: () => {
				this.saveFile().catch(() => {});
			},
		});

		monaco.editor.addEditorAction({
			id: 'openConfig',
			label: 'Open Config',
			// eslint-disable-next-line no-bitwise
			keybindings: [KeyMod.CtrlCmd | KeyCode.KeyO],
			run: () => {
				this.openFile().catch(() => {});
			},
		});
		window.addEventListener('resize', this.handleResize);
		this.onChange('{}').catch(() => {});
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
		Mousetrap.reset();
	}

	handleResize = () => {
		this.setState({
			windowDimensions: {
				width: window.innerWidth,
				height: window.innerHeight,
			},
		});
	};

	openSettings = (): void => {
		const { settings, onSettingsUpdated, os } = this.props;
		const { windowDimensions } = this.state;
		this.setState({
			popup: (
				<SettingsPopup
					settings={settings}
					onAbort={() => {
						this.setState({ popup: null });
					}}
					onConfirm={(settings: SettingsInterface) => {
						onSettingsUpdated(settings);
						this.setState({ popup: null });
					}}
					windowDimensions={windowDimensions}
					os={os}
				/>
			),
		});
	};

	componentDidUpdate(prevProps: Readonly<JsonValidatorProps>, prevState: Readonly<JsonValidatorState>) {
		const { type } = this.state;
		const { type: preType } = prevState;
		if (type !== preType) {
			if (type === 'board') {
				window.electron.schemas
					.board()
					.then((partieSchema) => {
						return monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
							validate: true,
							schemas: [
								{
									uri: '#',
									fileMatch: ['*'],
									schema: partieSchema,
								},
							],
						});
					})
					.catch(() => {});
			} else {
				window.electron.schemas
					.party()
					.then((partieSchema) => {
						return monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
							validate: true,
							schemas: [
								{
									uri: '#',
									fileMatch: ['*'],
									schema: partieSchema,
								},
							],
						});
					})
					.catch(() => {});
			}
		}
		const { code } = this.state;
		if (code === '{' || code === '}' || code === '') {
			this.setState({ code: '{}' });
		}
	}

	handleBackButton = () => {
		const { fileHasBeenEdited } = this.state;
		if (fileHasBeenEdited) {
			this.setState({ popup: this.leavePopup() });
		} else {
			const { onClose } = this.props;
			onClose();
		}
	};

	backToHomeScreen = () => {
		const { onClose } = this.props;
		onClose();
	};

	abortBackToHomeScreen = () => {
		this.setState({ popup: null });
	};

	onChange = async (newValue: string) => {
		const { type, consoleOutput } = this.state;
		this.setState({ consoleOutput: [] });
		try {
			const valid = await window.electron.validate(JSON.parse(newValue), type);
			if (typeof valid === 'string') {
				this.setState({
					codeError: valid,
				});
			} else {
				this.setState({
					codeError: '',
				});
			}
		} catch (error) {
			if (error instanceof Error) this.setState({ consoleOutput: [...consoleOutput, `${error.message}`] });
		}
		let validator;
		if (type === 'board') {
			try {
				validator = new BoardConfigValidator(JSON.parse(newValue) as BoardConfigInterface);
				this.setState({
					consoleOutput: validator.errors,
				});
			} catch (error) {
				if (error instanceof Error)
					this.setState({
						consoleOutput: [...consoleOutput, `${error.message}`],
					});
			}
		} else {
			try {
				validator = new PartieConfigValidator(JSON.parse(newValue) as PartieConfigInterface);
				this.setState({
					consoleOutput: validator.errors,
				});
			} catch (error) {
				if (error instanceof Error) {
					this.setState({
						consoleOutput: [...consoleOutput, `${error.message}`],
					});
				}
			}
		}
		this.setState({ code: newValue });
	};

	leavePopup = (): JSX.Element => {
		const { windowDimensions } = this.state;
		const { settings, os } = this.props;
		return (
			<ConfirmPopupV2
				title={window.t.translate('Close Validator')}
				onConfirm={this.backToHomeScreen}
				onAbort={this.abortBackToHomeScreen}
				confirmButtonText={window.t.translate('OK')}
				abortButtonText={window.t.translate('Cancel')}
				windowDimensions={windowDimensions}
				os={os}
				settings={settings}
			>
				{window.t.translate('There are unsaved changes. Are you sure you want to leave?')}
			</ConfirmPopupV2>
		);
	};

	newFileSavePreviousPopup = (): JSX.Element => {
		const { windowDimensions } = this.state;
		const { settings, os } = this.props;
		return (
			<ConfirmPopupV2
				title={window.t.translate('Save Config')}
				onConfirm={() => {
					this.saveFile()
						.then(() => {
							this.setState({
								popup: null,
								currentFile: null,
								fileHasBeenEdited: false,
								code: '{}',
							});
							return false;
						})
						.catch(() => {});
				}}
				onAbort={() => {
					this.setState({
						popup: null,
						currentFile: null,
						fileHasBeenEdited: false,
						code: '{}',
					});
				}}
				confirmButtonText={window.t.translate('Save')}
				abortButtonText={window.t.translate('Discard')}
				settings={settings}
				os={os}
				windowDimensions={windowDimensions}
			>
				{window.t.translate('There are unsaved changes. Are you sure you want to discard these changes?')}
			</ConfirmPopupV2>
		);
	};

	loadingPopup = (label?: string): JSX.Element => {
		const { windowDimensions } = this.state;
		const { settings, os } = this.props;
		return (
			<PopupV2
				title={label || window.t.translate('Open Configuration')}
				windowDimensions={windowDimensions}
				os={os}
				settings={settings}
				onClose={() => {
					this.setState({ popup: null });
				}}
				closeButtonText={window.t.translate('Close')}
			>
				<ProgressBar
					wrapperClass="text-center mx-auto justify-center"
					borderColor="#ffffff"
					barColor="#71C294"
					width="80"
				/>
			</PopupV2>
		);
	};

	openNewFile = () => {
		const { fileHasBeenEdited } = this.state;
		if (fileHasBeenEdited) {
			this.setState({ popup: this.newFileSavePreviousPopup() });
		} else {
			this.setState(
				{
					currentFile: null,
					fileHasBeenEdited: false,
					code: '{}',
				},
				async () => {
					const { code } = this.state;
					await this.onChange(code);
				}
			);
		}
	};

	openFile = async () => {
		this.setState({ popup: this.loadingPopup() });
		const file = await window.electron.dialog.openConfig();
		if (file) {
			try {
				const code = JSON.stringify(file.config, null, 4);

				this.setState(
					{
						codeError: '',
						popup: null,
						code: code,
						consoleOutput: [],
						currentFile: {
							parsed: file.parsedPath,
							path: file.path,
						},
						fileHasBeenEdited: false,
						type: this.predictIfConfigurationIsPartyConfiguration(file.config) ? 'partie' : 'board',
					},
					async () => {
						const { code } = this.state;
						await this.onChange(code);
					}
				);
			} catch (error) {
				if (error instanceof Error) this.setState({ consoleOutput: [...[error.message]] });
			}
		}
		this.setState({ popup: null });
	};

	predictIfConfigurationIsPartyConfiguration = (configuration: object) => {
		return (
			'maxRounds' in configuration ||
			'reviveRounds' in configuration ||
			'serverIngameDelay' in configuration ||
			'riverMoveCount' in configuration ||
			'cardSelectionTimeout' in configuration ||
			'characterChoiceTimeout' in configuration ||
			'shotLembas' in configuration ||
			'startLembas' in configuration
		);
	};

	saveFile = async () => {
		const { type, code, currentFile } = this.state;

		if (currentFile) {
			await window.electron.file.save(currentFile.path, code);
		} else {
			this.setState({
				popup: this.loadingPopup(window.t.translate('Save Configuration')),
			});
			let save;
			switch (type) {
				case 'board':
					save = await window.electron.dialog.saveBoardConfig(code);
					if (save) {
						this.setState({
							currentFile: {
								parsed: save.parsedPath,
								path: save.path,
							},
							fileHasBeenEdited: false,
						});
					}
					break;
				case 'partie':
				default:
					save = await window.electron.dialog.savePartieConfig(code);
					if (save) {
						this.setState({
							currentFile: {
								parsed: save.parsedPath,
								path: save.path,
							},
							fileHasBeenEdited: false,
						});
					}
					break;
			}
		}
		this.setState({ fileHasBeenEdited: false, popup: null });
	};

	changeType = (value: string) => {
		switch (value) {
			case 'board':
				this.setState({ type: 'board' }, async () => {
					const { code } = this.state;
					await this.onChange(code);
				});
				break;
			case 'partie':
			default:
				this.setState({ type: 'partie' }, async () => {
					const { code } = this.state;
					await this.onChange(code);
				});
		}
	};

	render = () => {
		const { popup, type, code, codeError, windowDimensions, consoleOutput, currentFile, fileHasBeenEdited } =
			this.state;
		const { os, settings, onSettingsUpdated } = this.props;
		const errorMsg = this.genErrorMsg(codeError);

		return (
			<div className="dark:bg-muted-800 bg-muted-500 text-white h-[100vh] w-[100vw]">
				{os === 'win32' ? (
					<div className="dragger w-[100vw] h-8 bg-muted flex items-center px-2 text-sm">
						{window.t.translate('Validator')}
						{` - `}
						{currentFile ? currentFile.parsed.base : window.t.translate('Unsaved Configuration')}
						{fileHasBeenEdited ? ' *' : ''}
					</div>
				) : (
					<div className="fixed top-0 right-0 dragger h-8 w-[100vw]" />
				)}
				<div className="flex flex-col w-full" style={{ height: windowDimensions.height - (os === 'win32' ? 32 : 0) }}>
					<div
						className={`flex text-white items-center  dark:border-0 border-t border-muted-400 ${
							os === 'darwin' ? 'pl-20' : ''
						} `}
					>
						<img className="h-6 ml-2 mr-4" src={destinyMountainImage} alt={window.t.translate('Logo')} />
						<TopMenuItemCollapsable label={window.t.translate('Validator')}>
							<TopMenuItem
								type="none"
								onAction={this.openNewFile}
								label={window.t.translate('New')}
								icon={<VscNewFile />}
							/>
							<TopMenuItem
								type="none"
								onAction={this.openFile}
								label={window.t.translate('Open')}
								icon={<VscFolder />}
							/>
							<TopMenuSeparator />
							<TopMenuItem
								type="none"
								onAction={this.saveFile}
								label={`${currentFile ? window.t.translate('Save') : window.t.translate('Save as')}...`}
								icon={<VscSave />}
							/>
							<TopMenuSeparator />
							<TopMenuItem type="none" onAction={this.openSettings} label={window.t.translate('Settings')} />
							<TopMenuSeparator />
							<TopMenuItem type="none" onAction={this.handleBackButton} label={window.t.translate('Close')} />
						</TopMenuItemCollapsable>
						<div className="flex items-center gap-4">
							<SelectComponent
								value={type}
								onChange={this.changeType}
								options={[
									{
										value: 'partie',
										text: window.t.translate('Party Configuration'),
									},
									{ value: 'board', text: window.t.translate('Board Configuration') },
								]}
							/>
							{currentFile ? (
								<FilePathComponent os={os} file={currentFile.parsed} edited={fileHasBeenEdited} />
							) : (
								<span className="italic">
									{window.t.translate('Unsaved Configuration')}
									{fileHasBeenEdited ? ' *' : ''}
								</span>
							)}
						</div>
						<div className="ml-auto flex items-center">
							<TopMenuItem
								type="none"
								onAction={() => {
									onSettingsUpdated({ ...settings, darkMode: !settings.darkMode });
								}}
								label={null}
								icon={
									<VscColorMode
										title={window.t.translate('Dark Mode')}
										className={`${settings.darkMode ? '' : 'rotate-180'} transition-all transform-gpu text-lg`}
									/>
								}
							/>
							<TopMenuItem type="none" label={`${window.t.translate('Version')}: 1.2.81`} icon={<VscVersions />} />
						</div>
					</div>
					<div className="grow relative h-full">
						<div>
							<MonacoEditor
								value={code}
								language="json"
								height={windowDimensions.height - (settings.darkMode ? 372 : 373)}
								width={windowDimensions.width}
								theme="vs-dark"
								onChange={async (value) => {
									await this.onChange(value);
									this.setState({ fileHasBeenEdited: true });
								}}
							/>
						</div>
						<div className="grid xl:grid-cols-4 grid-cols-2">
							<div className="w-full h-[300px] max-h-[300px] flex flex-col">
								<div className="text-white flex flex-col justify-center border-b border-gray-600 p-1">
									<div className="pl-4">{window.t.translate('Errors')}</div>
								</div>
								<div className="w-full text-white overflow-auto grow dark:bg-white/10 bg-white">
									<div className="h-full max-h-full pl-5 pt-2">
										<pre className="user-select">
											{consoleOutput.map((error) => (
												<p key={_uniqueId('console-output-')} className="dark:text-red-400 text-red-600 text-sm py-1">
													{error}
												</p>
											))}
										</pre>
									</div>
								</div>
							</div>
							<div className="w-full h-[300px] max-h-[300px] flex flex-col border-l border-gray-600 xl:col-span-3">
								<div className="text-white flex flex-col justify-center border-b border-gray-600 p-1">
									<div className="pl-4">{window.t.translate('JSON-Validation')}</div>
								</div>
								<div className="w-full dark:bg-white/10 bg-white dark:text-white text-slate-900 overflow-auto grow">
									<div className="h-full text-sm">
										{errorMsg ? (
											<div>{errorMsg.map((error) => error)}</div>
										) : (
											<div className="flex flex-col justify-center items-center h-full">
												<div className="text-2xl text-white">{window.t.translate('No Errors')}</div>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				{popup}
			</div>
		);
	};

	private genErrorMsg(codeError: string) {
		const { settings } = this.props;
		const errorMsg: ReactElement[] | null[] = [];
		if (codeError === '') {
			errorMsg[0] = null;
		} else if (codeError === 'validate') {
			errorMsg[0] = (
				<div key={_uniqueId()} className="pt-1">
					<span className="text-red-500">{window.t.translate('ERROR')}</span>
					<span className="text-white">: {window.t.translate('Invalid JSON')}</span>
				</div>
			);
		} else {
			try {
				let i = 0;
				const errors: DefinedError[] = JSON.parse(codeError);
				errors.forEach((e: DefinedError) => {
					errorMsg[i] = (
						<div
							key={_uniqueId()}
							className={`h-fit pl-2 flex gap-2 ${i < errors.length - 1 ? 'border-b dark:border-white/10' : ''} ${
								i % 2 === 1 ? 'bg-slate-100 dark:bg-gray-900/25' : ''
							}`}
						>
							<div className="border-r py-2 dark:border-white/10 pr-2 h-full my-auto">
								{JsonValidator.numberAddZero(i + 1)}
							</div>
							<div className="w-full">
								<JsonViewer
									key={_uniqueId()}
									value={e}
									theme={settings.darkMode ? 'dark' : 'light'}
									rootName={window.t.translate('Validation Error')}
									defaultInspectDepth={1}
								/>
							</div>
						</div>
					);

					i += 1;
				});
			} catch (error) {
				if (error instanceof Error) this.setState({ consoleOutput: [...[error.message]] });
			}
		}
		return errorMsg;
	}
}

export default JsonValidator;
