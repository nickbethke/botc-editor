import React from 'react';
import {BiChevronLeft} from 'react-icons/bi';
import {VscAdd, VscColorMode, VscFile, VscSave} from 'react-icons/vsc';
import {isBoolean} from 'lodash';
import Mousetrap from 'mousetrap';
import backgroundImage from '../../../assets/images/damn_nice_background_color.png';
import backgroundImageDark from '../../../assets/images/damn_nice_background.png';
import InputLabel from '../components/InputLabel';
import Notification from '../components/Notification';
import Error from '../components/Error';
import InputValidator, {InputValidatorType} from '../helper/InputValidator';

import PartieConfigInterface, {
	PartieConfigWithPath,
	PathInterface,
} from '../components/interfaces/PartieConfigInterface';
import ConfirmPopupV2 from '../components/boardConfigurator/ConfirmPopupV2';
import {SettingsInterface} from '../../interfaces/SettingsInterface';
import FilePathComponent from '../components/FilePathComponent';

type PartieKonfiguratorProps = {
	onClose: () => void;
	loadedValues: PartieConfigWithPath | null;
	os: NodeJS.Platform;
	settings: SettingsInterface;
	onSettingsUpdate: (settings: SettingsInterface) => void;
	fullScreen: boolean;
};
type PartieKonfiguratorState = {
	configuration: PartieConfigInterface;
	popupLeave: boolean;
	popupNew: boolean;
	windowDimensions: {
		width: number;
		height: number;
	};
	notification: JSX.Element | null;
	file: PathInterface | null;
	edited: boolean;
};

// TODO: Translations
class PartyConfigurator extends React.Component<PartieKonfiguratorProps, PartieKonfiguratorState> {
	private default: PartieConfigInterface = {
		maxRounds: 0,
		reviveRounds: 0,
		serverIngameDelay: 0,
		riverMoveCount: 0,
		cardSelectionTimeout: 0,
		characterChoiceTimeout: 0,
		shotLembas: 0,
		startLembas: 0,
	};

	constructor(props: PartieKonfiguratorProps) {
		super(props);
		this.handleBackButton = this.handleBackButton.bind(this);
		this.handleSaveClick = this.handleSaveClick.bind(this);
		this.openLoadPartieConfig = this.openLoadPartieConfig.bind(this);
		this.abortBackToHomeScreen = this.abortBackToHomeScreen.bind(this);
		this.state = {
			configuration: this.default,
			popupLeave: false,
			windowDimensions: {
				width: window.innerWidth,
				height: window.innerHeight,
			},
			notification: null,
			file: null,
			edited: false,
			popupNew: false,
		};
	}

	componentDidMount() {
		Mousetrap.bind('ctrl+s', () => {
			this.handleSaveClick().catch(() => {
			});
		});
		Mousetrap.bind('ctrl+n', () => {
			this.handleNewConfigClick();
		});
		window.addEventListener('resize', this.handleResize);

		const {loadedValues} = this.props;
		const {file} = this.state;
		if (loadedValues && file == null && this.predictIfConfigurationIsPartyConfiguration(loadedValues.config)) {
			const configuration: PartieConfigInterface = {...this.default, ...loadedValues.config};
			window.electron
				.validate(loadedValues.config, 'partie')
				.then((valid) => {
					if (isBoolean(valid) && valid) {
						this.setState({
							configuration,
							notification: <Notification label={window.t.translate('Loaded successfully')}/>,
							file: loadedValues as PathInterface,
						});

						return null;
					}
					this.setState({
						file: null,
						notification: <Error label={window.t.translate('Failed to load file!')}/>,
					});
					return null;
				})
				.catch(() => {
				});
		}
	}

	componentWillUnmount() {
		Mousetrap.unbind('ctrl+s');
		Mousetrap.unbind('ctrl+n');
		window.removeEventListener('resize', this.handleResize);
	}

	handleResize = () => {
		this.setState({
			windowDimensions: {
				width: window.innerWidth,
				height: window.innerHeight,
			},
		});
	}

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

	handleBackButton = () => {
		const {edited} = this.state;
		if (edited) {
			this.setState({popupLeave: true});
		} else {
			const {onClose} = this.props;
			onClose();
		}
	};

	backToHomeScreen = () => {
		const {onClose} = this.props;
		onClose();
	};

	abortBackToHomeScreen = () => {
		this.setState({popupLeave: false});
	};

	handleSaveClick = async () => {
		const {configuration, file} = this.state;
		const json = JSON.stringify({...this.default, ...configuration}, null, 4);

		if (file) {
			const answer = await window.electron.file.save(file.path, json);
			if (answer)
				this.setState({
					edited: false,
					notification: <Notification label="Erfolgreich gespeichert"/>,
				});
			else
				this.setState({
					notification: <Error label="Speichern fehlgeschlagen!"/>,
				});
		} else {
			const answer = await window.electron.dialog.savePartieConfig(json);
			if (answer)
				this.setState({
					file: answer as PathInterface,
					edited: false,
					notification: <Notification label="Erfolgreich gespeichert"/>,
				});
			else
				this.setState({
					notification: <Error label="Speichern fehlgeschlagen!"/>,
				});
		}
	};

	openLoadPartieConfig = async () => {
		this.setState({
			notification: null,
		});
		const partieJSON = await window.electron.dialog.openPartieConfig();
		if (partieJSON) {
			if (this.predictIfConfigurationIsPartyConfiguration(partieJSON.config)) {
				this.setState({
					configuration: {...partieJSON.config},
					file: partieJSON as PathInterface,
					notification: <Notification label="Erfolgreich geladen"/>,
					edited: false,
				});
				return;
			}
			this.setState({
				notification: (
					<Error label={window.t.translate('The loaded file is not a party configuration.')}/>
				),
			});
			return;
		}
		this.setState({
			notification: (
				<Error label={window.t.translate('The loaded file is not a party configuration.')}/>
			),
		});
	};

	handleNewConfigClick = () => {
		const {edited} = this.state;
		if (edited) {
			this.setState({popupNew: true});
		} else {
			this.setState({edited: false, file: null, configuration: this.default});
		}
	};

	render = () => {
		const {configuration, notification, popupLeave, windowDimensions, file, edited, popupNew} = this.state;
		const {os, settings, onSettingsUpdate, fullScreen} = this.props;
		const notWinDragger = !fullScreen ? <div className="dragger w-[100vw] h-8 absolute top-0 left-0"/> : null;
		return (
			<div className="dark:bg-muted-800 bg-muted-600 flex flex-col duration-500">
				{os === 'win32' ? <div className="dragger w-[100vw] h-8 bg-muted"/> : notWinDragger}
				{popupLeave ? (
					<ConfirmPopupV2
						title={window.t.translate('Close Game Configurator')}
						onConfirm={this.backToHomeScreen}
						onAbort={this.abortBackToHomeScreen}
						settings={settings}
						windowDimensions={windowDimensions}
						confirmButtonText={window.t.translate('Discard')}
						os={os}
						abortButtonText={window.t.translate('Cancel')}
					>
						{window.t.translate(
							'The current file has not yet been saved. Do you want to discard the current changes?'
						)}
					</ConfirmPopupV2>
				) : null}
				{popupNew ? (
					<ConfirmPopupV2
						title={window.t.translate('New Game Configuration')}
						onConfirm={() => {
							this.setState({edited: false, popupNew: false, configuration: this.default, file: null});
						}}
						onAbort={() => {
							this.setState({popupNew: false});
						}}
						settings={settings}
						windowDimensions={windowDimensions}
						confirmButtonText={window.t.translate('Discard')}
						os={os}
						abortButtonText={window.t.translate('Cancel')}
					>
						{window.t.translate(
							'The current changes had not yet been saved. Do you want to discard the current changes?'
						)}
					</ConfirmPopupV2>
				) : null}
				<div
					className="text-white grid grid-cols-3 2xl:grid-cols-2 gap-0 grow w-[100vw]"
					style={{
						minHeight: fullScreen && os !== 'win32' ? '100vh' : 'calc(100vh - 32px)',
					}}
				>
					<div
						className="transition-all duration-500"
						style={{
							backgroundImage: `url(${settings.darkMode ? backgroundImageDark : backgroundImage})`,
							backgroundSize: 'cover',
						}}
					/>
					<div className="col-span-2 2xl:col-span-1 m-8 flex flex-col gap-4 transition">
						<div className="flex flex-row justify-start gap-8">
							<button
								type="button"
								className="rounded border dark:border-muted-700 border-muted-400 hover:bg-accent-500 transition"
								onClick={this.handleBackButton}
							>
								<BiChevronLeft className="text-4xl"/>
							</button>
							<div className="text-4xl">{window.t.translate('Game-Configurator')}</div>
							<button
								type="button"
								className="p-1 dark:bg-muted-800 bg-muted-600 dark:hover:bg-muted-700 hover:bg-muted-500 transition flex items-center ml-auto"
								onClick={() => {
									onSettingsUpdate({
										...settings,
										darkMode: !settings.darkMode,
									});
								}}
							>
								<VscColorMode
									title={window.t.translate('Dark Mode')}
									className={`${settings.darkMode ? '' : 'rotate-180'} transition transform-gpu text-lg`}
								/>
							</button>
						</div>
						<div className="flex gap-4 items-center">
							<div>
								<button
									type="button"
									className="flex gap-2 items-center rounded border dark:border-muted-700 border-muted-400 dark:bg-muted-800 bg-muted-500 dark:hover:bg-accent-500 hover:bg-accent-500 transition px-4 py-2"
									onClick={this.handleNewConfigClick}
								>
									<VscAdd/> {window.t.translate('New')}
								</button>
							</div>
							<div>
								<button
									type="button"
									className="flex gap-2 items-center rounded border dark:border-muted-700 border-muted-400 dark:bg-muted-800 bg-muted-500 dark:hover:bg-accent-500 hover:bg-accent-500 transition px-4 py-2"
									onClick={this.handleSaveClick}
								>
									<VscSave/> {window.t.translate('Save')}
								</button>
							</div>
							<div>
								<button
									type="button"
									className="flex gap-2 items-center rounded border dark:border-muted-700 border-muted-400 dark:bg-muted-800 bg-muted-500 dark:hover:bg-accent-500 hover:bg-accent-500 transition px-4 py-2"
									onClick={this.openLoadPartieConfig}
								>
									<VscFile/>
									{window.t.translate('Load')}
								</button>
							</div>
							<div>
								{file ? (
									<div
										className="rounded border dark:border-muted-700 border-muted-400 dark:bg-muted-800 bg-muted-500 px-4 py-2">
										<FilePathComponent file={file.parsedPath} os={os} edited={edited}/>
									</div>
								) : (
									<div
										className="rounded border dark:border-muted-700 border-muted-400 dark:bg-muted-800 bg-muted-500 px-4 py-2">
										<div className="flex items-center gap-0 h-full">
											{window.t.translate('Unsaved File')}
											{!edited ? '' : ` *`}
										</div>
									</div>
								)}
							</div>
						</div>
						{notification ? <div>{notification}</div> : null}
						<div className="grid grid-cols-2 gap-8">
							<div>
								<InputLabel
									label="Maximale Rundenanzahl"
									type="number"
									min={-1}
									max={200}
									value={configuration.maxRounds}
									validator={
										new InputValidator({
											type: InputValidatorType.TYPE_NUMBER,
											options: {
												ifSmallerThen: {
													number: 3,
													error: 'Ungünstige Rundenanzahl. Das Spiel wäre sehr schnell vorbei!',
													except: -1,
												},
												ifBiggerThen: {
													number: 50,
													error: 'Ungünstige Rundenanzahl. Das Spiel würde sehr lange dauern!',
												},
											},
										})
									}
									onChange={(value) => {
										this.setState({
											edited: true,
											configuration: {
												...configuration,
												maxRounds: value,
											},
										});
									}}
								/>
							</div>
							<div>
								<InputLabel
									label="Start Lembas"
									type="number"
									value={configuration.startLembas}
									validator={
										new InputValidator({
											type: InputValidatorType.TYPE_NUMBER,
											options: {
												ifSmallerThen: {
													number: 5,
													error: 'Ungünstige Start LembasField-Anzahl!',
													except: -1,
												},
											},
										})
									}
									onChange={(value) => {
										this.setState({
											edited: true,
											configuration: {
												...configuration,
												startLembas: value,
											},
										});
									}}
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-8">
							<div>
								<InputLabel
									label="Schuss Lembas"
									type="number"
									onChange={(value) => {
										this.setState({
											edited: true,
											configuration: {
												...configuration,
												shotLembas: value,
											},
										});
									}}
									value={configuration.shotLembas}
								/>
							</div>
							<div>
								<InputLabel
									label="Flussbewegungsschritte"
									type="number"
									onChange={(value) => {
										this.setState({
											edited: true,
											configuration: {
												...configuration,
												riverMoveCount: value,
											},
										});
									}}
									value={configuration.riverMoveCount}
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-8">
							<div>
								<InputLabel
									label="Runden bis zur Wiederbelebung"
									type="number"
									helperText="-1 für dauerhaften Tod"
									onChange={(value) => {
										this.setState({
											edited: true,
											configuration: {
												...configuration,
												reviveRounds: value,
											},
										});
									}}
									value={configuration.reviveRounds}
								/>
							</div>
							<div>
								<InputLabel
									label="TimeOut für Charakterauswahl"
									type="number"
									helperText="in ms"
									min={0}
									max={10 ** 6}
									onChange={(value) => {
										this.setState({
											edited: true,
											configuration: {
												...configuration,
												characterChoiceTimeout: value,
											},
										});
									}}
									value={configuration.characterChoiceTimeout}
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-8">
							<div>
								<InputLabel
									label="TimeOut für Kartenauswahl"
									type="number"
									helperText="in ms"
									min={0}
									max={10 ** 6}
									onChange={(value) => {
										this.setState({
											edited: true,
											configuration: {
												...configuration,
												cardSelectionTimeout: value,
											},
										});
									}}
									value={configuration.cardSelectionTimeout}
								/>
							</div>
							<div>
								<InputLabel
									label="Server-Ingame-Delay"
									type="number"
									helperText="in ms"
									min={0}
									max={10 ** 6}
									onChange={(value) => {
										this.setState({
											edited: true,
											configuration: {
												...configuration,
												serverIngameDelay: value,
											},
										});
									}}
									value={configuration.serverIngameDelay}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};
}

export default PartyConfigurator;
