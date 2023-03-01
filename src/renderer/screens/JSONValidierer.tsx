import React, { ReactElement } from 'react';
import { BiChevronLeft } from 'react-icons/bi';
import MonacoEditor, { monaco } from 'react-monaco-editor';
import Mousetrap from 'mousetrap';
import { DefinedError } from 'ajv';
import { ParsedPath } from 'path';
import { VscFile, VscNewFile, VscSave } from 'react-icons/vsc';
import { ProgressBar } from 'react-loader-spinner';
import ConfirmPopup from '../components/popups/ConfirmPopup';
import BoardConfigValidator from '../helper/BoardConfigValidator';
import BoardConfigInterface from '../components/interfaces/BoardConfigInterface';
import Popup from '../components/popups/Popup';
import PartieConfigValidator from '../helper/PartieConfigValidator';
import PartieConfigInterface from '../components/interfaces/PartieConfigInterface';
import KeyCode = monaco.KeyCode;
import KeyMod = monaco.KeyMod;

type JSONValidatorProps = {
	onClose: () => void;
};
type JSONValidatorState = {
	popup: JSX.Element | null;
	code: string;
	codeError: string;
	type: 'board' | 'partie';
	window: { width: number; height: number };
	consoleOutput: string[];
	currentFile: { parsed: ParsedPath; path: string } | null;
	fileHasBeenEdited: boolean;
};

class JSONValidierer extends React.Component<
	JSONValidatorProps,
	JSONValidatorState
> {
	constructor(props: JSONValidatorProps) {
		super(props);
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
			window: { width: window.innerWidth, height: window.innerHeight },
			consoleOutput: [],
			currentFile: null,
			fileHasBeenEdited: false,
		};

		Mousetrap.bind(['command+s', 'ctrl+s'], () => {
			this.saveFile().catch(console.log);
		});

		monaco.editor.addEditorAction({
			id: 'saveConfig',
			label: 'Save Config',
			// eslint-disable-next-line no-bitwise
			keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS],
			run: () => {
				this.saveFile().then(console.log).catch(console.log);
			},
		});

		monaco.editor.addEditorAction({
			id: 'openConfig',
			label: 'Open Config',
			// eslint-disable-next-line no-bitwise
			keybindings: [KeyMod.CtrlCmd | KeyCode.KeyO],
			run: () => {
				this.openFile().then(console.log).catch(console.log);
			},
		});

		window.addEventListener('resize', () => {
			this.setState({
				window: {
					width: window.innerWidth,
					height: window.innerHeight,
				},
			});
		});
		this.onChange('{}');
	}

	handleBackButton = () => {
		this.setState({ popup: this.leavePopup() });
	};

	backToHomeScreen = () => {
		const { onClose } = this.props;
		onClose();
	};

	abortBackToHomeScreen = () => {
		this.setState({ popup: null });
	};

	onChange = async (newValue: string) => {
		const { type } = this.state;
		try {
			const valid = await window.electron.validate(
				JSON.parse(newValue),
				type
			);
			let validator;
			if (type === 'board') {
				validator = new BoardConfigValidator(
					JSON.parse(newValue) as BoardConfigInterface
				);
			} else {
				validator = new PartieConfigValidator(
					JSON.parse(newValue) as PartieConfigInterface
				);
			}
			if (typeof valid === 'string') {
				this.setState({
					codeError: valid,
					consoleOutput: [...validator.errors],
				});
			} else {
				this.setState({
					codeError: '',
					consoleOutput: [...validator.errors],
				});
			}
		} catch (error) {
			if (error instanceof Error)
				this.setState({ consoleOutput: [...[`${error.message}`]] });
		}
		this.setState({ code: newValue });
	};

	leavePopup = (): JSX.Element => {
		return (
			<ConfirmPopup
				label="Validator wirklich verlassen?"
				onConfirm={this.backToHomeScreen}
				onAbort={this.abortBackToHomeScreen}
			/>
		);
	};

	loadingPopup = (): JSX.Element => {
		return (
			<Popup
				label="Konfiguration öffnen"
				content={
					<ProgressBar
						wrapperClass="text-center mx-auto justify-center"
						borderColor="#ffffff"
						barColor="#71C294"
						width="80"
					/>
				}
				onClose={() => {}}
			/>
		);
	};

	// Todo: Ungespeicherte Änderungen verwerfen?
	openNewFile = () => {
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
	};

	openFile = async () => {
		this.setState({ popup: this.loadingPopup() });
		const file = await window.electron.dialog.openConfig();
		if (file) {
			try {
				this.setState(
					{
						codeError: '',
						popup: null,
						code: JSON.stringify(file.config, null, 4),
						consoleOutput: [],
						currentFile: {
							parsed: file.parsedPath,
							path: file.path,
						},
						fileHasBeenEdited: false,
					},
					async () => {
						const { code } = this.state;
						await this.onChange(code);
					}
				);
			} catch (error) {
				if (error instanceof Error)
					this.setState({ consoleOutput: [...[error.message]] });
			}
		}
		this.setState({ popup: null });
	};

	saveFile = async () => {
		const { type, code, currentFile } = this.state;
		if (currentFile) {
			await window.electron.file.save(currentFile.path, code);
		} else {
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
		this.setState({ fileHasBeenEdited: false });
	};

	changeType = async (e: React.ChangeEvent<HTMLSelectElement>) => {
		switch (e.target.value) {
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
		const {
			popup,
			type,
			code,
			codeError,
			window,
			consoleOutput,
			currentFile,
			fileHasBeenEdited,
		} = this.state;
		const errorMsg = this.genErrorMsg(codeError);

		return (
			<div>
				<div className="dragger absolute top-0 left-0 w-[100vw] h-8" />
				<div className="flex flex-col h-[100vh]">
					<div className="text-white w-[100vw]">
						<div className="m-8 flex flex-col gap-8 justify-start">
							<div className="flex flex-row justify-start gap-8">
								<BiChevronLeft
									className="text-4xl border border-white cursor-pointer hover:bg-accent-500"
									onClick={this.handleBackButton}
								/>
								<div className="text-4xl">Validierer</div>
							</div>
						</div>
					</div>
					<div className="flex text-white bg-background-900 border-y font-lato overflow-hidden">
						<button
							type="button"
							className="bg-accent-500/25 hover:bg-accent-500 text-lg p-2 flex flex-row justify-center items-center gap-2 border-r"
							onClick={this.openNewFile}
						>
							<VscNewFile /> Neu
						</button>
						{currentFile ? (
							<div
								className={currentFile ? 'border-r h-full' : ''}
							>
								<span
									className="text-lg p-2 h-full font-jetbrains flex flex-row justify-center items-center"
									title={currentFile?.path}
								>
									{currentFile?.parsed.base}
									{fileHasBeenEdited ? ' *' : ''}
								</span>
							</div>
						) : null}
						<button
							type="button"
							className="bg-accent-500/25 hover:bg-accent-500 text-lg p-2 flex flex-row justify-center items-center gap-2 border-r"
							onClick={this.openFile}
						>
							<VscFile /> Öffnen
						</button>
						<button
							type="button"
							className="bg-accent-500/25 hover:bg-accent-500 text-lg p-2 flex flex-row justify-center items-center gap-2 border-r"
							onClick={this.saveFile}
						>
							<VscSave /> Speichern
						</button>
						<p className="bg-accent-500/10 text-lg p-2 flex flex-row justify-center items-center gap-2">
							Type:
						</p>
						<div className="border-r">
							<select
								className="bg-accent-500/25 hover:bg-accent-500 text-lg p-2 flex flex-row justify-center items-center gap-2 border-r-4 border-transparent"
								onChange={this.changeType}
								value={type}
							>
								<option className="rounded-none" value="partie">
									Partie Konfiguration
								</option>
								<option className="rounded-none" value="board">
									Board Konfiguration
								</option>
							</select>
						</div>
					</div>
					<div className="grow relative h-full">
						<div className="bg-[#30344F]">
							<MonacoEditor
								value={code}
								language="json"
								height={window.height - (149 + 280)}
								width={window.width}
								theme="vs-dark"
								onChange={async (value) => {
									await this.onChange(value);
									this.setState({ fileHasBeenEdited: true });
								}}
							/>
						</div>
						<div className="grid xl:grid-cols-4 grid-cols-2">
							<div className="w-full h-[280px] max-h-[280px] flex flex-col font-jetbrains border-r xl:col-span-3">
								<div className="text-white flex flex-col justify-center border-b p-2">
									<div className="text-xl pl-4">
										JSON-Validation
									</div>
								</div>
								<div className="w-full bg-white/10 text-white overflow-auto grow">
									<div className="h-full max-h-full pl-2 user-select">
										{errorMsg}
									</div>
								</div>
							</div>
							<div className="w-full h-[280px] max-h-[280px] flex flex-col font-jetbrains border-r">
								<div className="text-white flex flex-col justify-center border-b p-2">
									<div className="text-xl pl-4">Errors</div>
								</div>
								<div className="w-full text-white overflow-auto grow bg-white/10">
									<div className="h-full max-h-full pl-6 pt-2">
										<pre className="user-select">
											{consoleOutput.map((error) => (
												<p className="text-red-500">
													{error}
												</p>
											))}
										</pre>
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
		const errorMsg: ReactElement[] | null[] = [];
		if (codeError === '') {
			errorMsg[0] = null;
		} else if (codeError === 'validate') {
			errorMsg[0] = (
				<div className="pt-1">
					<span className="text-red-500">ERROR: </span>Code konnte
					nicht validiert werden - kein valides JSON
				</div>
			);
		} else {
			try {
				let i = 0;
				JSON.parse(codeError).forEach((e: DefinedError) => {
					const instancePath =
						e.instancePath !== '' ? (
							<p className="font-black text-red-500 pt-1">
								{`${e.instancePath}`}&nbsp;
							</p>
						) : null;
					errorMsg[i] = (
						<div className="flex fex-cols" key={i}>
							<p className="mr-2 pr-2 border-r pt-1 no-user-select">
								{i + 1 < 10 ? `0${i + 1}` : i + 1}
							</p>
							<p className="font-black pt-1">
								{`${e.keyword.toUpperCase()}:`}&nbsp;
							</p>
							{instancePath}
							<p className="pt-1">{e.message}</p>
						</div>
					);
					i += 1;
				});
			} catch (error) {
				if (error instanceof Error)
					this.setState({ consoleOutput: [...[error.message]] });
			}
		}
		return errorMsg;
	}
}

export default JSONValidierer;
