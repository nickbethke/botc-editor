import React from 'react';
import './App.scss';
import Mousetrap from 'mousetrap';
import BoardEditorChoice from './components/popups/BoardEditorChoice';
import PartieEditorChoice from './components/popups/PartieEditorChoice';
import PartieKonfigurator from './screens/PartieKonfigurator';

import BoardKonfigurator from './screens/BoardKonfigurator';
import JSONValidierer from './screens/JSONValidierer';
import RandomBoardStartValuesDialog from './components/popups/RandomBoardStartValuesDialog';
import BoardGenerator from './components/generator/BoardGenerator';
import PartieConfigInterface from './components/interfaces/PartieConfigInterface';
import BoardConfigInterface from './components/interfaces/BoardConfigInterface';
import sunImage from '../../assets/images/sun.gif';
import deFlag from '../../assets/images/de.png';
import gbFlag from '../../assets/images/gb.png';
import TranslationHelper, {
	AvailableLanguages,
} from './helper/TranslationHelper';

type AppStates = {
	openScreen: string;
	openPopup:
		| 'boardEditorChoice'
		| 'partieEditorChoice'
		| 'randomBoardStartValues'
		| false;
	toLoad: object | null;
	generator: BoardGenerator | null;
	version: string;
	surprise: boolean;
	lang: AvailableLanguages;
};

class App extends React.Component<unknown, AppStates> {
	constructor(props: unknown) {
		super(props);
		this.state = {
			openScreen: 'home',
			openPopup: false,
			toLoad: null,
			generator: null,
			version: '',
			surprise: false,
			lang: AvailableLanguages.de,
		};
		this.handleOpenBoardEditorChoice =
			this.handleOpenBoardEditorChoice.bind(this);
		this.handleOpenPartieEditorChoice =
			this.handleOpenPartieEditorChoice.bind(this);
		this.handleCloseApp = this.handleCloseApp.bind(this);
		this.handleOpenValidator = this.handleOpenValidator.bind(this);
		this.handleCloseChildScreen = this.handleCloseChildScreen.bind(this);

		Mousetrap.bind(['command+b', 'ctrl+b'], () => {
			this.setState({ openPopup: 'boardEditorChoice' });
		});
		Mousetrap.bind(['command+p', 'ctrl+p'], () => {
			this.setState({ openPopup: 'partieEditorChoice' });
		});
		Mousetrap.bind(['esc'], () => {
			const { openPopup } = this.state;
			if (openPopup === 'randomBoardStartValues') {
				this.setState({ openPopup: 'boardEditorChoice' });
			} else {
				this.setState({ openPopup: false });
			}
		});

		Mousetrap.bind(
			'up up down down left right left right b a enter',
			() => {
				const { surprise } = this.state;
				this.setState({ surprise: !surprise });
			}
		);
	}

	handleOpenBoardEditorChoice = () => {
		this.setState({ openPopup: 'boardEditorChoice' });
	};

	handleOpenPartieEditorChoice = () => {
		this.setState({ openPopup: 'partieEditorChoice' });
	};

	handleCloseApp = () => {
		window.electron.app.close();
	};

	handleOpenValidator = () => {
		this.setState({ openScreen: 'validator' });
	};

	handleCloseChildScreen = () => {
		this.setState({ openScreen: 'home', openPopup: false });
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
			case 'boardConfigNewScreen':
			case 'boardConfigLoadScreen':
				return this.boardConfigScreen();
			case 'boardConfigFromRandomScreen':
				return this.boardConfigScreen(generator);
			case 'validator':
				return this.validatorScreen();
			default:
				return this.homeScreen();
		}
	};

	partieConfigScreen = () => {
		const { openScreen } = this.state;
		if (openScreen === 'partieConfigNewScreen') {
			return (
				<PartieKonfigurator
					onClose={this.handleCloseChildScreen}
					loadedValues={null}
				/>
			);
		}
		if (openScreen === 'partieConfigLoadScreen') {
			const { toLoad } = this.state;
			this.setState({ toLoad: null });
			return (
				<PartieKonfigurator
					onClose={this.handleCloseChildScreen}
					loadedValues={toLoad as PartieConfigInterface}
				/>
			);
		}
		return null;
	};

	boardConfigScreen = (generator: BoardGenerator | null = null) => {
		const { openScreen, toLoad } = this.state;
		if (openScreen === 'boardConfigNewScreen') {
			return <BoardKonfigurator onClose={this.handleCloseChildScreen} />;
		}
		if (openScreen === 'boardConfigLoadScreen') {
			return (
				<BoardKonfigurator
					onClose={this.handleCloseChildScreen}
					json={toLoad as BoardConfigInterface}
				/>
			);
		}
		if (
			openScreen === 'boardConfigFromRandomScreen' &&
			generator instanceof BoardGenerator
		) {
			return (
				<BoardKonfigurator
					onClose={this.handleCloseChildScreen}
					generator={generator}
				/>
			);
		}
		return null;
	};

	validatorScreen = () => {
		const { openScreen } = this.state;
		if (openScreen === 'validator') {
			return <JSONValidierer onClose={this.handleCloseChildScreen} />;
		}
		return null;
	};

	homeScreen() {
		const { openPopup, version, surprise } = this.state;
		let popup: JSX.Element | string = '';
		if (openPopup === 'boardEditorChoice') {
			popup = (
				<BoardEditorChoice
					onClose={() => {
						this.setState({ openPopup: false });
					}}
					onLoadConfig={async () => {
						const boardJSON =
							await window.electron.dialog.openBoardConfig();
						if (boardJSON) {
							this.setState({
								openScreen: 'boardConfigLoadScreen',
								toLoad: boardJSON.config,
							});
						}
					}}
					onNewConfig={() => {
						this.setState({ openScreen: 'boardConfigNewScreen' });
					}}
					onRandomConfig={() => {
						this.setState({ openPopup: 'randomBoardStartValues' });
					}}
				/>
			);
		}
		if (openPopup === 'randomBoardStartValues') {
			popup = (
				<RandomBoardStartValuesDialog
					onClose={() => {
						this.setState({ openPopup: 'boardEditorChoice' });
					}}
					onGenerated={(generator) => {
						this.setState({
							generator,
							openScreen: 'boardConfigFromRandomScreen',
							openPopup: false,
						});
					}}
				/>
			);
		}
		if (openPopup === 'partieEditorChoice') {
			popup = (
				<PartieEditorChoice
					onClose={() => {
						this.setState({ openPopup: false });
					}}
					onNewConfig={() => {
						this.setState({ openScreen: 'partieConfigNewScreen' });
					}}
					onLoadConfig={async () => {
						const partieJSON =
							await window.electron.dialog.openPartieConfig();
						if (partieJSON) {
							this.setState({
								openScreen: 'partieConfigLoadScreen',
								toLoad: partieJSON.config,
							});
						}
					}}
				/>
			);
		}
		const tabIndex = openPopup !== false ? -1 : 0;
		const { lang } = this.state;
		return (
			<div className="text-white">
				<div id="home" className={popup ? 'blur' : ''}>
					<div id="homeScreenBG" className="relative">
						<img
							alt="surprise sun"
							src={sunImage}
							className={`${
								surprise
									? 'opacity-1 top-1/4'
									: 'opacity-0 top-1/3'
							} absolute left-1/2 transition transition-all duration-1000 w-16 2xl:w-32`}
						/>
					</div>
					<div className="dragger absolute top-0 left-0 w-[100vw] h-8" />
					<div className="h-[100vh] w-[50vw] flex flex-col">
						<div className="flex flex-col py-8 px-12 justify-between grow">
							<div>
								<div className="text-4xl 2xl:text-6xl">
									Battle of the Centerländ
								</div>
								<div className="text-2xl 2xl:text-4xl">
									{window.languageHelper.translate('Editor')}
								</div>
							</div>
							<div className="flex flex-col gap-4">
								<button
									tabIndex={tabIndex}
									type="button"
									className="text-2xl clickable"
									onClick={this.handleOpenBoardEditorChoice}
								>
									{window.languageHelper.translate(
										'Board-Configurator'
									)}
								</button>
								<button
									tabIndex={tabIndex}
									type="button"
									className="text-2xl clickable"
									onClick={this.handleOpenPartieEditorChoice}
								>
									{window.languageHelper.translate(
										'Party-Configurator'
									)}
								</button>
								<button
									tabIndex={tabIndex}
									type="button"
									className="text-2xl clickable"
									onClick={this.handleOpenValidator}
								>
									{window.languageHelper.translate(
										'Validator'
									)}
								</button>
								<button
									tabIndex={tabIndex}
									type="button"
									className="text-2xl clickable mt-8 flex gap-4"
									onClick={this.handleCloseApp}
								>
									{window.languageHelper.translate('Exit')}
								</button>
							</div>
						</div>
						<div className="bg-white/10 p-2 w-full font-jetbrains flex flex-row justify-end gap-4">
							<button
								type="button"
								className="text-[10px]"
								onClick={() => {
									window.electron.open.homepage();
								}}
							>
								{window.languageHelper.translate('Website')}
							</button>
							<span className="text-[10px]">
								{window.languageHelper.translate(
									'Editor Version'
								)}
								: {version}
							</span>
							<button
								type="button"
								className="text-[10px]"
								onClick={() => {
									if (lang === AvailableLanguages.en) {
										window.languageHelper
											.switchLanguage(
												AvailableLanguages.de
											)
											.then(() => {
												this.setState({
													lang: AvailableLanguages.de,
												});
												return null;
											})
											.catch(console.log);
									} else {
										window.languageHelper
											.switchLanguage(
												AvailableLanguages.en
											)
											.then(() => {
												this.setState({
													lang: AvailableLanguages.en,
												});
												return null;
											})
											.catch(console.log);
									}
								}}
							>
								<img
									src={
										lang === AvailableLanguages.en
											? deFlag
											: gbFlag
									}
									alt={
										lang === AvailableLanguages.en
											? 'DE'
											: 'GB'
									}
									className="h-3"
								/>
							</button>
						</div>
					</div>
				</div>
				<div role="dialog" id="popup">
					{popup}
				</div>
			</div>
		);
	}
}

export default App;
