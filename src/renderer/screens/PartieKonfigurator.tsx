import React from 'react';
import { BiChevronLeft } from 'react-icons/bi';
import { VscColorMode } from 'react-icons/vsc';
import backgroundImage from '../../../assets/images/bg-color-III.jpg';
import backgroundImageDark from '../../../assets/images/bg-color-II.jpg';
import InputLabel from '../components/InputLabel';
import Notification from '../components/Notification';
import Error from '../components/Error';
import InputValidator, { InputValidatorType } from '../helper/InputValidator';

import PartieConfigInterface from '../components/interfaces/PartieConfigInterface';
import ConfirmPopupV2 from '../components/boardConfigurator/ConfirmPopupV2';
import { SettingsInterface } from '../../interfaces/SettingsInterface';

type PartieKonfiguratorProps = {
	onClose: () => void;
	loadedValues: PartieConfigInterface | null;
	os: NodeJS.Platform;
	settings: SettingsInterface;
	onSettingsUpdate: (settings: SettingsInterface) => void;
	fullScreen: boolean;
};
type PartieKonfiguratorState = {
	values: PartieConfigInterface;
	popupLeave: boolean;

	windowDimensions: {
		width: number;
		height: number;
	};

	popupPosition: { x: number; y: number };
	popupDimension: { width: number; height: number };
};

// TODO: Translations
class PartieKonfigurator extends React.Component<
	PartieKonfiguratorProps,
	PartieKonfiguratorState
> {
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

	private notification: JSX.Element | undefined;

	constructor(props: PartieKonfiguratorProps) {
		super(props);
		this.handleBackButton = this.handleBackButton.bind(this);
		this.handleSaveClick = this.handleSaveClick.bind(this);
		this.openLoadPartieConfig = this.openLoadPartieConfig.bind(this);
		this.abortBackToHomeScreen = this.abortBackToHomeScreen.bind(this);
		this.state = {
			values: this.default,
			popupLeave: false,
			windowDimensions: {
				width: window.innerWidth,
				height: window.innerHeight,
			},
			popupPosition: {
				x: window.innerWidth / 2,
				y: window.innerHeight / 2,
			},
			popupDimension: {
				width: 0,
				height: 0,
			},
		};
	}

	componentDidUpdate(
		prevProps: Readonly<PartieKonfiguratorProps>,
		prevState: Readonly<PartieKonfiguratorState>
	) {
		const { popupLeave: prePopupLeave } = prevState;
		const { popupPosition, popupDimension, windowDimensions, popupLeave } =
			this.state;
		const { os } = this.props;
		if (popupPosition.x < 0) {
			this.setState({ popupPosition: { x: 0, y: popupPosition.y } });
		}
		if (popupPosition.y < (os === 'win32' ? 32 : 0)) {
			this.setState({
				popupPosition: {
					x: popupPosition.x,
					y: os === 'win32' ? 32 : 0,
				},
			});
		}
		if (popupPosition.x + popupDimension.width > windowDimensions.width) {
			this.setState({
				popupPosition: {
					x: windowDimensions.width - popupDimension.width,
					y: popupPosition.y,
				},
			});
		}
		if (popupPosition.y + popupDimension.height > windowDimensions.height) {
			this.setState({
				popupPosition: {
					x: popupPosition.x,
					y: windowDimensions.height - popupDimension.height,
				},
			});
		}
		if (prePopupLeave !== popupLeave) {
			this.setState({
				popupPosition: {
					x: window.innerWidth / 2,
					y: window.innerHeight / 2,
				},
			});
		}
	}

	handleBackButton = () => {
		this.setState({ popupLeave: true });
	};

	backToHomeScreen = () => {
		const { onClose } = this.props;
		onClose();
	};

	abortBackToHomeScreen = () => {
		this.setState({ popupLeave: false });
	};

	handleSaveClick = async () => {
		const { values } = this.state;
		const json = JSON.stringify({ ...this.default, ...values }, null, 4);
		const answer = await window.electron.dialog.savePartieConfig(json);
		if (answer)
			this.notification = (
				<Notification label="Erfolgreich gespeichert" />
			);
		this.setState({ values: { ...this.default, ...values } });
	};

	openLoadPartieConfig = async () => {
		const partieJSON = await window.electron.dialog.openPartieConfig();
		if (partieJSON) {
			this.setState({
				values: { ...partieJSON.config },
			});
			this.notification = <Notification label="Erfolgreich geladen" />;
		} else {
			this.notification = (
				<Error label="Laden der Datei fehlgeschlagen!" />
			);
		}
	};

	render = () => {
		let { values } = this.state;
		const { popupLeave, popupPosition } = this.state;
		const { loadedValues, os, settings, onSettingsUpdate, fullScreen } =
			this.props;

		if (loadedValues) {
			values = { ...this.default, ...loadedValues };
			this.setState({ values });
			this.notification = <Notification label="Erfolgreich geladen" />;
		}
		let popupLeaveR = null;
		if (popupLeave) {
			popupLeaveR = (
				<ConfirmPopupV2
					title={window.languageHelper.translate(
						'Close Party Configurator'
					)}
					onConfirm={this.backToHomeScreen}
					onAbort={this.abortBackToHomeScreen}
					settings={settings}
					onPositionChange={(position, callback) => {
						this.setState({ popupPosition: position }, callback);
					}}
					onDimensionChange={(dimension) => {
						this.setState({ popupDimension: dimension });
					}}
					position={popupPosition}
					confirmButtonText={window.languageHelper.translate(
						'Discard'
					)}
					os={os}
					abortButtonText={window.languageHelper.translate('Cancel')}
				>
					{window.languageHelper.translate(
						'The current file has not yet been saved. Do you want to discard the current changes?'
					)}
				</ConfirmPopupV2>
			);
		}
		const notWinDragger = !fullScreen ? (
			<div className="dragger w-[100vw] h-8 absolute top-0 left-0" />
		) : null;
		return (
			<div className="dark:bg-muted-800 bg-muted-600 flex flex-col">
				{os === 'win32' ? (
					<div className="dragger w-[100vw] h-8 bg-muted" />
				) : (
					notWinDragger
				)}
				{popupLeaveR}
				<div
					className="text-white grid grid-cols-3 2xl:grid-cols-2 gap-0 grow w-[100vw]"
					style={{
						minHeight:
							fullScreen && os !== 'win32'
								? '100vh'
								: 'calc(100vh - 32px)',
					}}
				>
					<div
						className="transition transition-all"
						style={{
							backgroundImage: `url(${
								settings.darkMode
									? backgroundImageDark
									: backgroundImage
							})`,
							backgroundSize: 'cover',
						}}
					/>
					<div className="col-span-2 2xl:col-span-1 m-8 flex flex-col gap-4 transition transition-all">
						<div className="flex flex-row justify-start gap-8">
							<button
								type="button"
								className="rounded border dark:border-muted-700 border-muted-400 hover:bg-accent-500 transition transition-colors"
								onClick={this.handleBackButton}
							>
								<BiChevronLeft className="text-4xl" />
							</button>
							<div className="text-4xl">Partie Konfigurator</div>
							<button
								type="button"
								className="p-1 dark:bg-muted-800 bg-muted-600 dark:hover:bg-muted-700 hover:bg-muted-500 transition transition-colors flex items-center ml-auto"
								onClick={() => {
									onSettingsUpdate({
										...settings,
										darkMode: !settings.darkMode,
									});
								}}
							>
								<VscColorMode
									title={window.languageHelper.translate(
										'Dark Mode'
									)}
									className={`${
										settings.darkMode ? '' : 'rotate-180'
									} transition transition-all transform-gpu text-lg`}
								/>
							</button>
						</div>
						<div className="flex gap-4">
							<div>
								<button
									type="button"
									className="rounded border dark:border-muted-700 border-muted-400 dark:bg-muted-800 bg-muted-500 dark:hover:bg-accent-500 hover:bg-accent-500 transition transition-colors px-4 py-2"
									onClick={this.handleSaveClick}
								>
									Speichern
								</button>
							</div>
							<div>
								<button
									type="button"
									className="rounded border dark:border-muted-700 border-muted-400 dark:bg-muted-800 bg-muted-500 dark:hover:bg-accent-500  hover:bg-accent-500 transition transition-colors px-4 py-2"
									onClick={this.openLoadPartieConfig}
								>
									Laden
								</button>
							</div>
						</div>
						{this.notification ? (
							<div>{this.notification}</div>
						) : null}
						<div className="grid grid-cols-2 gap-8">
							<div>
								<InputLabel
									label="Maximale Rundenanzahl"
									type="number"
									min={-1}
									max={200}
									value={values.maxRounds}
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
											popupLeave: false,
											values: {
												...values,
												maxRounds: Number.parseFloat(
													value.toString()
												),
											},
										});
									}}
								/>
							</div>
							<div>
								<InputLabel
									label="Start Lembas"
									type="number"
									value={values.startLembas}
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
											values: {
												...values,
												startLembas: Number.parseFloat(
													value.toString()
												),
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
											values: {
												...values,
												shotLembas: Number.parseFloat(
													value.toString()
												),
											},
										});
									}}
									value={values.shotLembas}
								/>
							</div>
							<div>
								<InputLabel
									label="Flussbewegungsschritte"
									type="number"
									onChange={(value) => {
										this.setState({
											values: {
												...values,
												riverMoveCount:
													Number.parseFloat(
														value.toString()
													),
											},
										});
									}}
									value={values.riverMoveCount}
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
											values: {
												...values,
												reviveRounds: Number.parseFloat(
													value.toString()
												),
											},
										});
									}}
									value={values.reviveRounds}
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
											values: {
												...values,
												characterChoiceTimeout:
													Number.parseFloat(
														value.toString()
													),
											},
										});
									}}
									value={values.characterChoiceTimeout}
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
											values: {
												...values,
												cardSelectionTimeout:
													Number.parseFloat(
														value.toString()
													),
											},
										});
									}}
									value={values.cardSelectionTimeout}
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
											values: {
												...values,
												serverIngameDelay:
													Number.parseFloat(
														value.toString()
													),
											},
										});
									}}
									value={values.serverIngameDelay}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};
}

export default PartieKonfigurator;
