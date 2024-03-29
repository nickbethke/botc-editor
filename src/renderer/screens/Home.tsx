import React, { Component } from 'react';
import Mousetrap from 'mousetrap';
import { JsonViewer } from '@textea/json-viewer';
import { HomeMenuSeparator, HomeScreenButton } from '../components/HomeScreenButton';
import bgImage from '../../../assets/images/bg-color-2x-no-bg.png';
import sunImage from '../../../assets/images/sun.gif';
import { SettingsInterface } from '../../interfaces/SettingsInterface';
import BoardEditorChoice from '../components/popups/BoardEditorChoice';
import RandomBoardStartValuesDialogV2 from '../components/popups/RandomBoardStartValuesDialogV2';
import GameConfiguratorChoice from '../components/popups/GameConfiguratorChoice';
import SettingsPopup from '../components/popups/SettingsPopup';
import PopupV2 from '../components/popups/PopupV2';
import BoardGenerator from '../components/generator/BoardGenerator';
import { AppScreens } from '../App';
import AboutPopup from '../components/popups/AboutPopup';
import Dragger from '../components/Dragger';
import { isBoardConfiguration } from '../components/boardConfigurator/HelperFunctions';

type HomePopups =
	| 'boardEditorChoiceV2'
	| 'gameEditorChoice'
	| 'randomBoardV2StartValues'
	| 'settings'
	| 'about'
	| 'error'
	| null;

type HomeProps = {
	os: NodeJS.Platform;
	settings: SettingsInterface;
	onOpenScreen: (screen: AppScreens, toLoad?: object) => void;
	onSettingsUpdate: (settings: SettingsInterface) => void;
};

type HomeState = {
	openPopup: HomePopups;
	version: string;
	surprise: boolean;
	errorMessage: { title: string; error: string; text: string } | null;
	windowDimensions: {
		width: number;
		height: number;
	};
};

export default class Home extends Component<HomeProps, HomeState> {
	constructor(props: HomeProps) {
		super(props);
		this.state = {
			openPopup: null,
			version: '',
			surprise: false,
			errorMessage: null,
			windowDimensions: {
				width: window.innerWidth,
				height: window.innerHeight,
			},
		};
	}

	componentDidMount() {
		window.addEventListener('resize', this.handleResize);

		Mousetrap.bind(['command+b', 'ctrl+b'], () => {
			this.setState({ openPopup: 'boardEditorChoiceV2' });
		});
		Mousetrap.bind(['command+p', 'ctrl+p'], () => {
			this.setState({ openPopup: 'gameEditorChoice' });
		});
		Mousetrap.bind(['command+p', 'ctrl+p'], () => {
			this.setState({ openPopup: 'gameEditorChoice' });
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
	}

	componentWillUnmount() {
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

	handleOpenBoardEditorChoiceV2 = () => {
		this.setState({ openPopup: 'boardEditorChoiceV2' });
	};

	handleOpenGameEditorChoice = () => {
		this.setState({ openPopup: 'gameEditorChoice' });
	};

	handleOpenSettings = () => {
		this.setState({ openPopup: 'settings' });
	};

	errorPopup = () => {
		const { os, settings } = this.props;
		const { errorMessage, windowDimensions } = this.state;
		return (
			<PopupV2
				title={errorMessage ? errorMessage.title : window.t.translate('Error')}
				closeButtonText={window.t.translate('Close')}
				onClose={() => {
					this.setState({ openPopup: null });
				}}
				windowDimensions={windowDimensions}
				os={os}
				settings={settings}
			>
				<div className="flex flex-col gap-4">
					{errorMessage && errorMessage.text ? <p>{errorMessage.text}</p> : ''}
					{errorMessage && errorMessage.error ? (
						<JsonViewer value={JSON.parse(errorMessage.error)} theme={settings.darkMode ? 'dark' : 'light'} />
					) : (
						''
					)}
				</div>
			</PopupV2>
		);
	};

	onBoardLoadConfig = async () => {
		const boardJSON = await window.electron.dialog.openBoardConfig();
		const { onOpenScreen } = this.props;
		if (boardJSON) {
			const { valid, missing } = isBoardConfiguration(boardJSON.config);
			if (valid) {
				onOpenScreen('boardConfigV2LoadScreen', boardJSON);
			} else {
				this.setState({
					errorMessage: {
						title: window.t.translate('Board Configuration Validation Error'),
						error: JSON.stringify({ missing, valid }),
						text: window.t.translate(
							'The board configuration you are trying to load is not valid. Please check the error message below and try again.'
						),
					},
					openPopup: 'error',
				});
			}
		}
	};

	popup = (openPopup: HomePopups) => {
		const { windowDimensions, version } = this.state;
		const { os, settings, onOpenScreen, onSettingsUpdate } = this.props;
		let popup: React.JSX.Element | null;
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
							onOpenScreen('boardConfigV2NewScreen');
						}}
						onRandomConfig={() => {
							this.setState({
								openPopup: 'randomBoardV2StartValues',
							});
						}}
						onOpenRiverPresetEditor={() => {
							this.setState({});
							onOpenScreen('riverPresetEditor');
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
							onOpenScreen('boardConfigV2FromRandomScreen', generator.boardJSON);
						}}
						settings={settings}
						windowDimensions={windowDimensions}
						os={os}
					/>
				);
				break;
			case 'gameEditorChoice':
				popup = (
					<GameConfiguratorChoice
						onClose={() => {
							this.setState({ openPopup: null });
						}}
						onNewConfig={() => {
							onOpenScreen('gameConfigNewScreen');
						}}
						onLoadConfig={async () => {
							const gameJSON = await window.electron.dialog.openGameConfiguration();
							if (gameJSON) {
								onOpenScreen('gameConfigLoadScreen', gameJSON);
							}
						}}
					/>
				);
				break;
			case 'settings':
				popup = (
					<SettingsPopup
						settings={settings}
						os={os}
						onAbort={() => {
							this.setState({ openPopup: null });
						}}
						onConfirm={(s) => {
							onSettingsUpdate(s);
							this.setState({ openPopup: null });
						}}
						windowDimensions={windowDimensions}
					/>
				);
				break;
			case 'about':
				popup = (
					<AboutPopup
						onClose={() => {
							this.setState({ openPopup: null });
						}}
						windowDimensions={windowDimensions}
						os={os}
						settings={settings}
						version={version}
					/>
				);
				break;
			default:
				popup = null;
				break;
		}
		return popup;
	};

	handleOpenValidator = () => {
		const { onOpenScreen } = this.props;
		onOpenScreen('validator');
	};

	render() {
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
		const { openPopup, surprise } = this.state;
		const { os } = this.props;
		const popup = this.popup(openPopup);
		const tabIndex = openPopup !== null ? -1 : 0;
		return (
			<div className="text-white transition duration-500 dark:bg-gradient-to-br dark:from-slate-900 dark:to-muted-800 bg-with-gradient overflow-hidden relative">
				<div id="home" className={`${popup ? 'blur' : ''} flex flex-col`}>
					<Dragger os={os}>{window.t.translate('Battle of the Centerländ - Editor')}</Dragger>
					<div className="grid grid-cols-2 grow">
						<div className="flex flex-col pb-8" style={{ height: window.innerHeight - (os === 'win32' ? 32 : 0) }}>
							<div className="flex flex-col pt-8 justify-between grow">
								<div className="flex xl:flex-col items-center xl:items-start gap-4 xl:gap-0 w-full px-12">
									<div className="flex gap-4 items-center text-4xl xl:text-6xl 2xl:text-8xl dark:font-with-gradient pt-4 font-flicker">
										Battle of the Centerländ
									</div>
									<div className="text-2xl xl:text-4xl 2xl:text-6xl tracking-widest dark:font-with-gradient pt-4 xl:pt-0 font-flicker">
										{window.t.translate('Editor')}
									</div>
								</div>
								<div className="flex flex-col gap-4 w-fit text-left tracking-widest px-12 py-6">
									<div className="flex flex-col justify-start gap-4 bg-slate-600/25 p-6 rounded">
										<HomeScreenButton
											text={window.t.translate('Board-Configurator')}
											onClick={this.handleOpenBoardEditorChoiceV2}
											tabIndex={tabIndex}
										/>
										<HomeScreenButton
											text={window.t.translate('Game-Configurator')}
											onClick={this.handleOpenGameEditorChoice}
											tabIndex={tabIndex}
										/>
										<HomeMenuSeparator />
										<HomeScreenButton
											text={window.t.translate('Validator')}
											onClick={this.handleOpenValidator}
											tabIndex={tabIndex}
										/>
										<HomeMenuSeparator />
										<HomeScreenButton
											text={window.t.translate('Settings')}
											onClick={this.handleOpenSettings}
											tabIndex={tabIndex}
										/>
										<HomeMenuSeparator />
										<HomeScreenButton
											text={window.t.translate('Exit')}
											onClick={() => {
												window.electron.app.close().catch(() => {});
											}}
											tabIndex={tabIndex}
											last
										/>
									</div>
								</div>
							</div>
						</div>
						<div className="relative">
							<div className="w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
								<img className="w-full home-bg" src={bgImage} alt={window.t.translate('Background image')} />
								<img
									alt="surprise sun"
									src={sunImage}
									className={`${
										surprise ? 'opacity-1 top-1/4' : 'opacity-0 top-1/3'
									} absolute left-1/2 transition-all duration-1000 w-16 2xl:w-32`}
								/>
							</div>
						</div>
					</div>
					<div className="absolute bottom-0 left-0 z-10 bg-white/50 dark:bg-white/10 p-2 w-[100vw] flex flex-row items-center justify-end gap-2 text-xs dark:text-white text-slate-900">
						<button
							type="button"
							className="cursor-pointer hover:underline"
							onClick={() => {
								this.setState({ openPopup: 'about' });
							}}
						>
							{window.t.translate('About')}
						</button>
						<span>
							{window.t.translate('Editor Version')}: {version}
						</span>
					</div>
				</div>
				<div role="dialog" id="popup">
					{popup}
				</div>
			</div>
		);
	}
}
