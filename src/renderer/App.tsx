import React from 'react';
import './App.scss';
import Mousetrap from 'mousetrap';
import { isBoolean, isEqual } from 'lodash';
import { ParsedPath } from 'path';
import BoardEditorChoice from './components/popups/BoardEditorChoice';
import PartieEditorChoice from './components/popups/PartieEditorChoice';
import PartieKonfigurator from './screens/PartieKonfigurator';
import JSONValidierer from './screens/JSONValidierer';
import BoardGenerator from './components/generator/BoardGenerator';
import PartieConfigInterface from './components/interfaces/PartieConfigInterface';
import BoardConfigInterface from './components/interfaces/BoardConfigInterface';
import sunImage from '../../assets/images/sun.gif';
import bgImage from '../../assets/images/bg-color-2x-no-bg.png';
import TranslationHelper, { AvailableLanguages } from './helper/TranslationHelper';
import BoardConfiguratorV2 from './screens/BoardConfiguratorV2';
import { TopMenuSeparator } from './components/boardConfigurator/TopMenuItem';
import { SettingsInterface } from '../interfaces/SettingsInterface';
import SettingsPopup from './components/popups/SettingsPopup';
import RandomBoardStartValuesDialogV2 from './components/popups/RandomBoardStartValuesDialogV2';
import PopupV2 from './components/boardConfigurator/PopupV2';
import RiverPresetEditor from './screens/RiverPresetEditor';

type AppPopups =
	| 'boardEditorChoiceV2'
	| 'partieEditorChoice'
	| 'randomBoardV2StartValues'
	| 'settings'
	| 'error'
	| null;

type AppScreens =
	| 'home'
	| 'validator'
	| 'boardConfigV2FromRandomScreen'
	| 'partieConfigNewScreen'
	| 'partieConfigLoadScreen'
	| 'boardConfigV2LoadScreen'
	| 'boardConfigV2NewScreen'
	| 'riverPresetEditor';

type AppProps = {
	os: NodeJS.Platform;
	settings: SettingsInterface;
};
type AppStates = {
	openScreen: AppScreens;
	openPopup: AppPopups;
	toLoad: object | null;
	generator: BoardGenerator | null;
	version: string;
	surprise: boolean;
	settings: SettingsInterface;
	popupPosition: { x: number; y: number };
	popupDimension: { width: number; height: number };
	errorMessage: { title: string; error: string } | null;
	fullScreen: boolean;
};

class App extends React.Component<AppProps, AppStates> {
	constructor(props: AppProps) {
		super(props);
		this.state = {
			openScreen: 'home',
			openPopup: null,
			toLoad: null,
			generator: null,
			version: '',
			surprise: false,
			settings: props.settings,
			popupPosition: {
				x: window.innerWidth / 2,
				y: window.innerHeight / 2,
			},
			popupDimension: {
				width: 0,
				height: 0,
			},
			errorMessage: null,
			fullScreen: false,
		};
		this.handleOpenPartieEditorChoice = this.handleOpenPartieEditorChoice.bind(this);
		this.handleCloseApp = this.handleCloseApp.bind(this);
		this.handleOpenValidator = this.handleOpenValidator.bind(this);
		this.handleCloseChildScreen = this.handleCloseChildScreen.bind(this);
	}

	componentDidMount() {
		const { settings } = this.props;
		Mousetrap.bind(['command+b', 'ctrl+b'], () => {
			this.setState({ openPopup: 'boardEditorChoiceV2' });
		});
		Mousetrap.bind(['command+p', 'ctrl+p'], () => {
			this.setState({ openPopup: 'partieEditorChoice' });
		});
		Mousetrap.bind(['command+p', 'ctrl+p'], () => {
			this.setState({ openPopup: 'partieEditorChoice' });
		});
		Mousetrap.bind(['esc'], () => {
			const { openPopup } = this.state;
			if (openPopup === 'randomBoardV2StartValues') {
				this.setState({ openPopup: 'boardEditorChoiceV2' });
			} else {
				this.setState({ openPopup: null });
			}
		});

		Mousetrap.bind('up up down down left right left right b a enter', () => {
			const { surprise } = this.state;
			this.setState({ surprise: !surprise });
		});
		if (settings.darkMode) {
			document.documentElement.classList.add('dark');
		}
		document.documentElement.setAttribute('lang', settings.language);
		window.addEventListener('resize', () => {
			this.setState({
				popupPosition: {
					x: window.innerWidth / 2,
					y: window.innerHeight / 2,
				},
				fullScreen: !window.screenTop && !window.screenY,
			});
		});
	}

	componentDidUpdate(prevProps: Readonly<AppProps>, prevState: Readonly<AppStates>) {
		const { openPopup: prePopup, settings: preSettings } = prevState;
		const { openPopup: popup, popupPosition, popupDimension, settings } = this.state;

		if (!isEqual(preSettings, settings)) {
			if (settings.darkMode) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
			document.documentElement.setAttribute('lang', settings.language);
		}
		if (popup === null && prePopup !== popup) {
			this.setState({
				popupPosition: {
					x: window.innerWidth / 2,
					y: window.innerHeight / 2,
				},
			});
		}
		if (popupPosition.x < 0) {
			this.setState({ popupPosition: { x: 0, y: popupPosition.y } });
		}
		if (popupPosition.y < 0) {
			this.setState({
				popupPosition: {
					x: popupPosition.x,
					y: 0,
				},
			});
		}
		if (popupPosition.x + popupDimension.width > window.innerWidth) {
			this.setState({
				popupPosition: {
					x: window.innerWidth - popupDimension.width,
					y: popupPosition.y,
				},
			});
		}
		if (popupPosition.y + popupDimension.height > window.innerHeight) {
			this.setState({
				popupPosition: {
					x: popupPosition.x,
					y: window.innerHeight - popupDimension.height,
				},
			});
		}
	}

	handleOpenBoardEditorChoiceV2 = () => {
		this.setState({ openPopup: 'boardEditorChoiceV2' });
	};

	handleOpenPartieEditorChoice = () => {
		this.setState({ openPopup: 'partieEditorChoice' });
	};

	handleOpenSettings = () => {
		this.setState({ openPopup: 'settings' });
	};

	handleCloseApp = () => {
		window.electron.app.close().catch(() => {});
	};

	handleOpenValidator = () => {
		this.setState({ openScreen: 'validator' });
	};

	handleCloseChildScreen = () => {
		this.setState({ openScreen: 'home', openPopup: null });
	};

	handleSettingsChange = async (settings: SettingsInterface) => {
		const newSettings = await window.electron.app.updateSettings(settings);
		const lang = TranslationHelper.stringToEnum(newSettings.language);
		await this.handleLanguageChange(lang);
		if (settings.darkMode) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
		this.setState({ settings: newSettings });
	};

	handleLanguageChange = async (lang: AvailableLanguages) => {
		await window.languageHelper.switchLanguage(lang);
	};

	render = () => {
		const { version } = this.state;
		if (version === '') {
			window.electron.app
				.getVersion()
				.then((v) => {
					this.setState({ version: v });
					return null;
				})
				.catch(() => {
					this.setState({ version: '0.0.1' });
				});
		}

		const { openScreen, generator } = this.state;
		switch (openScreen) {
			case 'home':
				return this.homeScreen();
			case 'partieConfigNewScreen':
			case 'partieConfigLoadScreen':
				return this.partieConfigScreen();
			case 'boardConfigV2NewScreen':
			case 'boardConfigV2LoadScreen':
				return this.boardConfigV2Screen();
			case 'riverPresetEditor':
				return this.riverPresetEditor();
			case 'boardConfigV2FromRandomScreen':
				return this.boardConfigV2Screen(generator);
			case 'validator':
				return this.validatorScreen();
			default:
				return this.homeScreen();
		}
	};

	partieConfigScreen = () => {
		const { openScreen, settings, fullScreen } = this.state;
		const { os } = this.props;
		if (openScreen === 'partieConfigNewScreen') {
			return (
				<PartieKonfigurator
					onClose={this.handleCloseChildScreen}
					loadedValues={null}
					settings={settings}
					os={os}
					onSettingsUpdate={this.handleSettingsChange}
					fullScreen={fullScreen}
				/>
			);
		}
		if (openScreen === 'partieConfigLoadScreen') {
			const { toLoad } = this.state;
			this.setState({ toLoad: null });
			return (
				<PartieKonfigurator
					settings={settings}
					os={os}
					onClose={this.handleCloseChildScreen}
					loadedValues={toLoad as PartieConfigInterface}
					onSettingsUpdate={this.handleSettingsChange}
					fullScreen={fullScreen}
				/>
			);
		}
		return null;
	};

	riverPresetEditor = () => {
		const { settings } = this.state;
		const { os } = this.props;
		return (
			<RiverPresetEditor
				os={os}
				onClose={this.handleCloseChildScreen}
				settings={settings}
				onSettingsUpdate={this.handleSettingsChange}
			/>
		);
	};

	boardConfigV2Screen = (generator: BoardGenerator | null = null) => {
		const { openScreen, toLoad, settings } = this.state;
		const { os } = this.props;
		switch (openScreen) {
			case 'boardConfigV2NewScreen':
				return (
					<BoardConfiguratorV2
						os={os}
						onClose={this.handleCloseChildScreen}
						settings={settings}
						onSettingsUpdate={this.handleSettingsChange}
					/>
				);
			case 'boardConfigV2LoadScreen':
				return (
					<BoardConfiguratorV2
						os={os}
						onClose={this.handleCloseChildScreen}
						config={
							(
								toLoad as {
									parsedPath: ParsedPath;
									path: string;
									config: BoardConfigInterface;
								}
							).config
						}
						settings={settings}
						onSettingsUpdate={this.handleSettingsChange}
						file={
							toLoad as {
								parsedPath: ParsedPath;
								path: string;
							}
						}
					/>
				);
			case 'boardConfigV2FromRandomScreen':
				if (generator) {
					return (
						<BoardConfiguratorV2
							os={os}
							onClose={this.handleCloseChildScreen}
							config={generator.boardJSON}
							settings={settings}
							onSettingsUpdate={this.handleSettingsChange}
						/>
					);
				}
				return null;
			default:
				return null;
		}
	};

	validatorScreen = () => {
		const { openScreen } = this.state;
		if (openScreen === 'validator') {
			return <JSONValidierer onClose={this.handleCloseChildScreen} />;
		}
		return null;
	};

	errorPopup = () => {
		const { popupPosition, settings, errorMessage } = this.state;
		const { os } = this.props;
		return (
			<PopupV2
				title={errorMessage ? errorMessage.title : window.languageHelper.translate('Error')}
				closeButtonText={window.languageHelper.translate('Close')}
				onClose={() => {
					this.setState({ openPopup: null });
				}}
				position={popupPosition}
				onPositionChange={(position, callback) => {
					this.setState({ popupPosition: position }, callback);
				}}
				onDimensionChange={(dimension) => {
					this.setState({ popupDimension: dimension });
				}}
				os={os}
				settings={settings}
			>
				<pre>{errorMessage?.error}</pre>
			</PopupV2>
		);
	};

	onLoadRiverPreset = () => {};

	onBoardLoadConfig = async () => {
		const boardJSON = await window.electron.dialog.openBoardConfig();
		if (boardJSON) {
			const validation = await window.electron.validate(boardJSON.config, 'board');
			if (isBoolean(validation) && validation) {
				this.setState({
					openScreen: 'boardConfigV2LoadScreen',
					toLoad: boardJSON,
					generator: null,
				});
			} else {
				this.setState({
					errorMessage: {
						title: window.languageHelper.translate('Board Configuration Validation Error'),
						error: validation,
					},
					openPopup: 'error',
				});
			}
		}
	};

	homeScreen() {
		const { openPopup, version, surprise } = this.state;
		const { os } = this.props;
		const popup = this.popup(openPopup);
		const tabIndex = openPopup !== null ? -1 : 0;
		return (
			<div className="text-white bg-gradient-to-br dark:from-slate-900 dark:to-muted-800 from-slate-400 to-muted-500">
				<div id="home" className={`${popup ? 'blur' : ''} flex flex-col`}>
					{os === 'win32' ? (
						<div className="dragger w-[100vw] h-8 bg-muted flex items-center px-2 text-sm">
							{window.languageHelper.translate('Battle of the Centerländ - Editor')}
						</div>
					) : (
						<div className="fixed top-0 left-0 dragger w-[100vw] h-8" />
					)}
					<div className="grid grid-cols-2 grow">
						<div className="flex flex-col pb-8" style={{ height: window.innerHeight - (os === 'win32' ? 32 : 0) }}>
							<div className="flex flex-col py-8 px-12 justify-between grow">
								<div>
									<div className="text-4xl 2xl:text-6xl">Battle of the Centerländ</div>
									<div className="text-2xl 2xl:text-4xl tracking-widest">
										{window.languageHelper.translate('Editor')}
									</div>
								</div>
								<div className="flex flex-col gap-4 w-fit">
									<button
										tabIndex={tabIndex}
										type="button"
										className="text-2xl clickable"
										onClick={this.handleOpenBoardEditorChoiceV2}
									>
										{window.languageHelper.translate('Board-Configurator')}
									</button>
									<button
										tabIndex={tabIndex}
										type="button"
										className="text-2xl clickable"
										onClick={this.handleOpenPartieEditorChoice}
									>
										{window.languageHelper.translate('Party-Configurator')}
									</button>
									<button
										tabIndex={tabIndex}
										type="button"
										className="text-2xl clickable"
										onClick={this.handleOpenValidator}
									>
										{window.languageHelper.translate('Validator')}
									</button>
									<TopMenuSeparator />
									<button
										tabIndex={tabIndex}
										type="button"
										className="text-2xl clickable"
										onClick={this.handleOpenSettings}
									>
										{window.languageHelper.translate('Settings')}
									</button>
									<TopMenuSeparator />
									<button
										tabIndex={tabIndex}
										type="button"
										className="text-2xl clickable"
										onClick={this.handleCloseApp}
									>
										{window.languageHelper.translate('Exit')}
									</button>
								</div>
							</div>
						</div>
						<div className="relative">
							<img
								className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full"
								src={bgImage}
								alt={window.languageHelper.translate('Background image')}
							/>
							<img
								alt="surprise sun"
								src={sunImage}
								className={`${
									surprise ? 'opacity-1 top-1/4' : 'opacity-0 top-1/3'
								} absolute left-1/2 transition transition-all duration-1000 w-16 2xl:w-32`}
							/>
						</div>
					</div>
					<div className="absolute bottom-0 left-0 z-10 bg-muted p-2 w-[100vw] font-jetbrains flex flex-row items-center justify-end gap-2 text-[10px]">
						<button
							type="button"
							onClick={async () => {
								await window.electron.open.homepage();
							}}
						>
							{window.languageHelper.translate('Website')}
						</button>
						|
						<span>
							{window.languageHelper.translate('Editor Version')}: {version}
						</span>
					</div>
				</div>
				<div role="dialog" id="popup">
					{popup}
				</div>
			</div>
		);
	}

	private popup(openPopup: AppPopups) {
		const { popupPosition, settings } = this.state;
		const { os } = this.props;
		let popup: JSX.Element | null;
		switch (openPopup) {
			case 'error':
				popup = this.errorPopup();
				break;
			case 'boardEditorChoiceV2':
				popup = (
					<BoardEditorChoice
						onClose={() => {
							this.setState({ openPopup: null });
						}}
						onLoadConfig={this.onBoardLoadConfig}
						onNewConfig={() => {
							this.setState({
								openScreen: 'boardConfigV2NewScreen',
								generator: null,
							});
						}}
						onRandomConfig={() => {
							this.setState({
								openPopup: 'randomBoardV2StartValues',
								generator: null,
							});
						}}
						onOpenRiverPresetEditor={() => {
							this.setState({
								openScreen: 'riverPresetEditor',
								generator: null,
							});
						}}
					/>
				);
				break;
			case 'randomBoardV2StartValues':
				popup = (
					<RandomBoardStartValuesDialogV2
						onAbort={() => {
							this.setState({ openPopup: 'boardEditorChoiceV2' });
						}}
						onConfirm={(generator) => {
							this.setState({
								generator,
								openScreen: 'boardConfigV2FromRandomScreen',
								openPopup: null,
							});
						}}
						settings={settings}
						position={popupPosition}
						onPositionChange={(position, callback) => {
							this.setState({ popupPosition: position }, callback);
						}}
						onDimensionChange={(dimension) => {
							this.setState({ popupDimension: dimension });
						}}
						os={os}
					/>
				);
				break;
			case 'partieEditorChoice':
				popup = (
					<PartieEditorChoice
						onClose={() => {
							this.setState({ openPopup: null });
						}}
						onNewConfig={() => {
							this.setState({
								openScreen: 'partieConfigNewScreen',
							});
						}}
						onLoadConfig={async () => {
							const partieJSON = await window.electron.dialog.openPartieConfig();
							if (partieJSON) {
								this.setState({
									openScreen: 'partieConfigLoadScreen',
									toLoad: partieJSON.config,
								});
							}
						}}
					/>
				);
				break;
			case 'settings':
				popup = (
					<SettingsPopup
						settings={settings}
						position={popupPosition}
						onPositionChange={(position, callback) => {
							this.setState({ popupPosition: position }, callback);
						}}
						onDimensionChange={(dimension) => {
							this.setState({ popupDimension: dimension });
						}}
						os={os}
						onAbort={() => {
							this.setState({ openPopup: null });
						}}
						onConfirm={async (s) => {
							await this.handleSettingsChange(s);
							this.setState({ openPopup: null });
						}}
					/>
				);
				break;
			default:
				popup = null;
				break;
		}
		return popup;
	}
}

export default App;
