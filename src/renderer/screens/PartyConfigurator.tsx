import React from 'react';
import { VscAdd, VscColorMode, VscFile, VscNewFile, VscSave } from 'react-icons/vsc';
import { isBoolean } from 'lodash';
import Mousetrap from 'mousetrap';
import backgroundImage from '../../../assets/images/damn_nice_background_color.png';
import backgroundImageDark from '../../../assets/images/damn_nice_background.png';
import InputLabel from '../components/InputLabel';
import Notification from '../components/Notification';
import Error from '../components/Error';
import InputValidator, { InputValidatorType } from '../helper/InputValidator';

import PartieConfigInterface, {
	PartieConfigWithPath,
	PathInterface,
} from '../components/interfaces/PartieConfigInterface';
import ConfirmPopupV2 from '../components/popups/ConfirmPopupV2';
import { SettingsInterface } from '../../interfaces/SettingsInterface';
import FilePathComponent from '../components/FilePathComponent';
import Button from '../components/Button';
import { FaChevronLeft, FaMoon, FaPlus, FaSave, FaSun } from 'react-icons/fa';
import Dragger from '../components/Dragger';

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
			this.handleSaveClick().catch(() => {});
		});
		Mousetrap.bind('ctrl+n', () => {
			this.handleNewConfigClick();
		});
		window.addEventListener('resize', this.handleResize);

		const { loadedValues } = this.props;
		const { file } = this.state;
		if (loadedValues && file == null && this.predictIfConfigurationIsPartyConfiguration(loadedValues.config)) {
			const configuration: PartieConfigInterface = { ...this.default, ...loadedValues.config };
			window.electron
				.validate(loadedValues.config, 'partie')
				.then((valid) => {
					if (isBoolean(valid) && valid) {
						this.setState({
							configuration,
							notification: <Notification label={window.t.translate('Loaded successfully')} />,
							file: loadedValues as PathInterface,
						});

						return null;
					}
					this.setState({
						file: null,
						notification: <Error label={window.t.translate('Failed to load file!')} />,
					});
					return null;
				})
				.catch(() => {});
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

	handleBackButton = () => {
		const { edited } = this.state;
		if (edited) {
			this.setState({ popupLeave: true });
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
		this.setState({ popupLeave: false });
	};

	handleSaveClick = async () => {
		const { configuration, file } = this.state;
		const json = JSON.stringify({ ...this.default, ...configuration }, null, 4);

		if (file) {
			const answer = await window.electron.file.save(file.path, json);
			if (answer)
				this.setState({
					edited: false,
					notification: <Notification label="Erfolgreich gespeichert" />,
				});
			else
				this.setState({
					notification: <Error label="Speichern fehlgeschlagen!" />,
				});
		} else {
			const answer = await window.electron.dialog.savePartieConfig(json);
			if (answer)
				this.setState({
					file: answer as PathInterface,
					edited: false,
					notification: <Notification label="Erfolgreich gespeichert" />,
				});
			else
				this.setState({
					notification: <Error label="Speichern fehlgeschlagen!" />,
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
					configuration: { ...partieJSON.config },
					file: partieJSON as PathInterface,
					notification: <Notification label="Erfolgreich geladen" />,
					edited: false,
				});
				return;
			}
			this.setState({
				notification: <Error label={window.t.translate('The loaded file is not a party configuration.')} />,
			});
			return;
		}
		this.setState({
			notification: <Error label={window.t.translate('The loaded file is not a party configuration.')} />,
		});
	};

	handleNewConfigClick = () => {
		const { edited } = this.state;
		if (edited) {
			this.setState({ popupNew: true });
		} else {
			this.setState({ edited: false, file: null, configuration: this.default });
		}
	};

	render = () => {
		const { configuration, notification, popupLeave, windowDimensions, file, edited, popupNew } = this.state;
		const { os, settings, onSettingsUpdate } = this.props;
		return (
			<div
				className="flex flex-col duration-500 w-full h-full overflow-hidden bg-cover bg-no-repeat bg-center"
				style={{
					backgroundImage: `url(${settings.darkMode ? backgroundImageDark : backgroundImage})`,
				}}
			>
				<Dragger os={os} />
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
						{window.t.translate('The current file has not yet been saved. Do you want to discard the current changes?')}
					</ConfirmPopupV2>
				) : null}
				{popupNew ? (
					<ConfirmPopupV2
						title={window.t.translate('New Game Configuration')}
						onConfirm={() => {
							this.setState({ edited: false, popupNew: false, configuration: this.default, file: null });
						}}
						onAbort={() => {
							this.setState({ popupNew: false });
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
					className="text-white grid grid-cols-3 2xl:grid-cols-2 gap-0 grow w-[100vw] relative"
					style={{
						minHeight: os !== 'win32' ? '100vh' : 'calc(100vh - 32px)',
					}}
				>
					<div />
					<div className="dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 bg-gradient-to-br from-muted-700/95 to-muted-500/95 col-span-2 2xl:col-span-1 flex flex-col gap-4 transition p-8">
						<div className="flex flex-row justify-start gap-8">
							<Button onClick={this.handleBackButton} icon={<FaChevronLeft className="text-lg" />} size="sm" />

							<div className="text-4xl">{window.t.translate('Game-Configurator')}</div>
							<Button
								className="ml-auto"
								onClick={() => {
									onSettingsUpdate({
										...settings,
										darkMode: !settings.darkMode,
									});
								}}
								icon={settings.darkMode ? <FaSun /> : <FaMoon />}
							/>
						</div>
						<div className="flex gap-4 items-center">
							<div>
								<Button onClick={this.handleNewConfigClick} icon={<VscNewFile />}>
									{window.t.translate('New')}
								</Button>
							</div>
							<div>
								<Button icon={<VscSave />} onClick={this.handleSaveClick}>
									{window.t.translate('Save')}
								</Button>
							</div>
							<div>
								<Button icon={<VscFile />} onClick={this.openLoadPartieConfig}>
									{window.t.translate('Load')}
								</Button>
							</div>
							<div>
								{file ? (
									<Button>
										<FilePathComponent file={file.parsedPath} os={os} edited={edited} />
									</Button>
								) : (
									<Button>
										<div className="flex items-center gap-0 h-full">
											{window.t.translate('Unsaved File')}
											{!edited ? '' : ` *`}
										</div>
									</Button>
								)}
							</div>
						</div>
						{notification ? <div>{notification}</div> : null}
						<div className="grid grid-cols-2 gap-8">
							<div>
								<InputLabel
									label="Maximale Rundenanzahl"
									type="number"
									min={0}
									max={200}
									value={configuration.maxRounds}
									validator={
										new InputValidator({
											type: InputValidatorType.TYPE_NUMBER,
											options: {
												ifSmallerThen: {
													number: 3,
													error: window.t.translate('Unfavorable number of laps. The game would be over very quickly!'),
													isError: true,
												},
												ifBiggerThen: {
													number: 50,
													error: window.t.translate('Unfavorable number of laps. The game would take a long time!'),
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
													error: window.t.translate('Unfavorable start lembas number.'),
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
									validator={
										new InputValidator({
											type: InputValidatorType.TYPE_NUMBER,
											options: {
												ifSmallerThen: {
													number: 0,
													error: window.t.translate(
														'Unfavorable shot lembas number. Negative numbers are not allowed!'
													),
												},
												ifBiggerThen: {
													number: 5,
													error: window.t.translate(
														'Unfavorable shot lembas number. It would be nearly impossible to shoot!'
													),
												},
											},
										})
									}
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
									validator={
										new InputValidator({
											type: InputValidatorType.TYPE_NUMBER,
											options: {
												ifSmallerThen: {
													number: 0,
													error: window.t.translate('Unfavorable river move count. Negative numbers are not allowed!'),
												},
												ifBiggerThen: {
													number: 5,
													error: window.t.translate(
														'Unfavorable river move count. The river moves would be very unpredictable!'
													),
												},
												exact: {
													number: 0,
													error: window.t.translate(
														'Unfavorable river move count. The river would not move the characters!'
													),
												},
											},
										})
									}
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-8">
							<div>
								<InputLabel
									label="Runden bis zur Wiederbelebung"
									type="number"
									helperText={window.t.translate('-1 = no revive')}
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
									validator={
										new InputValidator({
											type: InputValidatorType.TYPE_NUMBER,
											options: {
												ifBiggerThen: {
													number: 5,
													error: window.t.translate(
														'Unfavorable revive rounds. The player would have to wait too long to play again!'
													),
												},
											},
										})
									}
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
									validator={
										new InputValidator({
											type: InputValidatorType.TYPE_NUMBER,
											options: {
												ifBiggerThen: {
													number: 30000,
													error: window.t.translate(
														'Unfavorable character choice timeout. It would be too long to wait for the player to choose a character!'
													),
												},
												ifSmallerThen: {
													number: 10000,
													error: window.t.translate(
														'Unfavorable character choice timeout. It would be too short to wait for the player to choose a character!'
													),
													isError: true,
												},
											},
										})
									}
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
									validator={
										new InputValidator({
											type: InputValidatorType.TYPE_NUMBER,
											options: {
												ifBiggerThen: {
													number: 30000,
													error: window.t.translate(
														'Unfavorable card choice timeout. It would be too long to wait for the player to choose a card!'
													),
												},
												ifSmallerThen: {
													number: 10000,
													error: window.t.translate(
														'Unfavorable card choice timeout. It would be too short to wait for the player to choose a card!'
													),
													isError: true,
												},
											},
										})
									}
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
									validator={
										new InputValidator({
											type: InputValidatorType.TYPE_NUMBER,
											options: {
												ifBiggerThen: {
													number: 5000,
													error: window.t.translate(
														'Unfavorable server ingame delay. It would be too long to wait for the server to process the game!'
													),
												},
												ifSmallerThen: {
													number: 500,
													error: window.t.translate(
														'Unfavorable server ingame delay. It would be too short to wait for the clients to animate the game!'
													),
													isError: true,
												},
											},
										})
									}
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
