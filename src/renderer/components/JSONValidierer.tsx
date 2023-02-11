import React, { ReactElement } from 'react';
import { BiChevronLeft } from 'react-icons/bi';
import { AiFillFolderOpen } from 'react-icons/ai';
import MonacoEditor, { monaco } from 'react-monaco-editor';
import { HiSaveAs } from 'react-icons/hi';
import Mousetrap from 'mousetrap';
import { DefinedError } from 'ajv';
import KeyCode = monaco.KeyCode;
import KeyMod = monaco.KeyMod;
import ConfirmPopup from './ConfirmPopup';
import App from '../App';

type JSONValidatorProps = {
	parentApp: App;
};
type JSONValidatorState = {
	popupLeave: boolean;
	code: string;
	codeError: string;
	type: 'board' | 'partie';
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

		this.state = {
			code: JSON.stringify({}, null, 4),
			codeError: '',
			popupLeave: false,
			type: 'partie',
		};

		Mousetrap.bind(['command+s', 'ctrl+s'], () => {
			// eslint-disable-next-line no-console
			this.saveFile().catch(console.log);
		});

		monaco.editor.addEditorAction({
			id: 'saveConfig',
			label: 'Save Config',
			// eslint-disable-next-line no-bitwise
			keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS],
			run: () => {
				// eslint-disable-next-line no-console
				this.saveFile().then(console.log).catch(console.log);
			},
		});

		monaco.editor.addEditorAction({
			id: 'openConfig',
			label: 'Open Config',
			// eslint-disable-next-line no-bitwise
			keybindings: [KeyMod.CtrlCmd | KeyCode.KeyO],
			run: () => {
				// eslint-disable-next-line no-console
				this.openFile().then(console.log).catch(console.log);
			},
		});
	}

	handleBackButton = () => {
		this.setState({ popupLeave: true });
	};

	backToHomeScreen = () => {
		const { parentApp } = this.props;
		parentApp.setState({ openScreen: 'home', openPopup: false });
	};

	abortBackToHomeScreen = () => {
		this.setState({ popupLeave: false });
	};

	onChange = async (newValue: string) => {
		const { type } = this.state;
		try {
			const valid = await window.electron.validate(
				JSON.parse(newValue),
				type
			);
			if (typeof valid === 'string') {
				this.setState({ codeError: valid });
			} else {
				this.setState({ codeError: '' });
			}
		} catch (error) {
			// eslint-disable-next-line no-console
			console.log(error);
		}
		this.setState({ code: newValue });
	};

	openFile = async () => {
		const json = await window.electron.dialog.openConfig();
		if (json) {
			try {
				this.setState(
					{
						codeError: '',
						popupLeave: false,
						code: JSON.stringify(json, null, 4),
					},
					async () => {
						const { code } = this.state;
						await this.onChange(code);
					}
				);
			} catch (e) {
				// eslint-disable-next-line no-console
				console.log(e);
			}
		}
	};

	saveFile = async () => {
		const { type, code } = this.state;
		switch (type) {
			case 'board':
				await window.electron.dialog.saveBoardConfig(code);
				break;
			case 'partie':
			default:
				await window.electron.dialog.savePartieConfig(code);
				break;
		}
	};

	changeType = async (e: React.ChangeEvent<HTMLSelectElement>) => {
		switch (e.target.value) {
			case 'board':
				this.setState({ type: 'board', code: '{}' }, async () => {
					const { code } = this.state;
					await this.onChange(code);
				});
				break;
			case 'partie':
			default:
				this.setState({ type: 'partie', code: '{}' }, async () => {
					const { code } = this.state;
					await this.onChange(code);
				});
		}
	};

	render() {
		let popupLeaveR = null;
		const { popupLeave, type } = this.state;
		if (popupLeave) {
			popupLeaveR = (
				<ConfirmPopup
					label="Validator wirklich verlassen?"
					onConfirm={this.backToHomeScreen}
					onAbort={this.abortBackToHomeScreen}
				/>
			);
		}
		const { code, codeError } = this.state;
		const errorMsg: ReactElement[] = [];
		if (codeError === '') {
			errorMsg[0] = (
				<div className="flex fex-cols gap-2 pt-2">
					VALID JSON Format
				</div>
			);
		} else {
			try {
				let i = 0;
				JSON.parse(codeError).forEach((e: DefinedError) => {
					if (e.instancePath !== '') {
						errorMsg[i] = (
							<div className="flex fex-cols" key={i}>
								<p className="mr-2 pr-4 border-r pt-2">
									{i + 1 < 10 ? `0${i + 1}` : i + 1}
								</p>
								<p className="font-black pt-2">
									{`${e.keyword.toUpperCase()}:`}&nbsp;
								</p>
								<p className="font-black text-red-500 pt-2">
									{`${e.instancePath}`}&nbsp;
								</p>
								<p className="pt-2">{e.message}</p>
							</div>
						);
					} else {
						errorMsg[i] = (
							<div className="flex fex-cols" key={i}>
								<p className="mr-2 pr-4 border-r pt-2">
									{i + 1 < 10 ? `0${i + 1}` : i + 1}
								</p>
								<p className="font-black pt-2">
									{`${e.keyword.toUpperCase()}:`}&nbsp;
								</p>
								<p className="pt-2">{e.message}</p>
							</div>
						);
					}
					i += 1;
				});
				// eslint-disable-next-line no-empty
			} catch (e) {}
		}

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
					<div className="flex text-white bg-background-900 border-b font-lato">
						<button
							type="button"
							className="bg-accent-500/25 hover:bg-accent-500 text-lg p-2 flex flex-row justify-center items-center gap-2 border-r"
							onClick={this.openFile}
						>
							<AiFillFolderOpen /> Öffnen
						</button>
						<button
							type="button"
							className="bg-accent-500/25 hover:bg-accent-500 text-lg p-2 flex flex-row justify-center items-center gap-2 border-r"
							onClick={this.saveFile}
						>
							<HiSaveAs /> Speichern
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
						<div className="bg-[#30344F] h-[75%]">
							<MonacoEditor
								language="json"
								height="100%"
								width="100%"
								theme="vs-dark"
								value={code}
								onChange={this.onChange}
							/>
						</div>
						<div className="h-[5%] text-white flex flex-col justify-center border-b">
							<div className="text-xl pl-4">Errors</div>
						</div>
						<div className="w-full bg-[#30344F] h-[20%] text-white">
							<div className="h-full max-h-full font-mono overflow-auto pl-8">
								{errorMsg}
							</div>
						</div>
					</div>
				</div>
				{popupLeaveR}
			</div>
		);
	}
}

export default JSONValidierer;
