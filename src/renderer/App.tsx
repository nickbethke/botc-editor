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

type AppStates = {
	openScreen: string;
	openPopup:
		| 'boardEditorChoice'
		| 'partieEditorChoice'
		| 'randomBoardStartValues'
		| false;
	toLoad: object | null;
	generator: BoardGenerator | null;
};

class App extends React.Component<unknown, AppStates> {
	constructor(props: unknown) {
		super(props);
		this.state = {
			openScreen: 'home',
			openPopup: false,
			toLoad: null,
			generator: null,
		};
		this.handleOpenBoardEditorChoice =
			this.handleOpenBoardEditorChoice.bind(this);
		this.handleOpenPartieEditorChoice =
			this.handleOpenPartieEditorChoice.bind(this);
		this.handleCloseApp = this.handleCloseApp.bind(this);
		this.handleOpenValidator = this.handleOpenValidator.bind(this);

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

	render = () => {
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
			return <PartieKonfigurator App={this} loadedValues={null} />;
		}
		if (openScreen === 'partieConfigLoadScreen') {
			const { toLoad } = this.state;
			this.setState({ toLoad: null });
			return (
				<PartieKonfigurator
					App={this}
					loadedValues={toLoad as PartieConfigInterface}
				/>
			);
		}
		return null;
	};

	boardConfigScreen = (generator: BoardGenerator | null = null) => {
		const { openScreen, toLoad } = this.state;
		if (openScreen === 'boardConfigNewScreen') {
			return (
				<BoardKonfigurator
					onClose={() => {
						this.setState({ openScreen: 'home', openPopup: false });
					}}
				/>
			);
		}
		if (openScreen === 'boardConfigLoadScreen') {
			return (
				<BoardKonfigurator
					onClose={() => {
						this.setState({ openScreen: 'home', openPopup: false });
					}}
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
					onClose={() => {
						this.setState({ openScreen: 'home', openPopup: false });
					}}
					generator={generator}
				/>
			);
		}
		return null;
	};

	validatorScreen = () => {
		const { openScreen } = this.state;
		if (openScreen === 'validator') {
			return (
				<JSONValidierer
					onClose={() => {
						this.setState({ openScreen: 'home', openPopup: false });
					}}
				/>
			);
		}
		return null;
	};

	homeScreen() {
		const { openPopup } = this.state;
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
								toLoad: boardJSON,
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
								toLoad: partieJSON,
							});
						}
					}}
				/>
			);
		}
		const tabIndex = openPopup !== false ? -1 : 0;
		return (
			<div className="text-white">
				<div id="home" className={popup ? 'blur' : ''}>
					<div id="homeScreenBG" />
					<div className="dragger absolute top-0 left-0 w-[100vw] h-8" />
					<div className="flex flex-col py-8 px-12 justify-between h-[100vh] w-[50vw]">
						<div>
							<div className="text-4xl 2xl:text-6xl">
								Battle of the Centerländ
							</div>
							<div className="text-2xl 2xl:text-4xl">Editor</div>
						</div>
						<div className="flex flex-col gap-4">
							<button
								tabIndex={tabIndex}
								type="button"
								className="text-2xl clickable"
								onClick={this.handleOpenBoardEditorChoice}
							>
								Board-Konfigurator
							</button>
							<button
								tabIndex={tabIndex}
								type="button"
								className="text-2xl clickable"
								onClick={this.handleOpenPartieEditorChoice}
							>
								Partie-Konfigurator
							</button>
							<button
								tabIndex={tabIndex}
								type="button"
								className="text-2xl clickable"
								onClick={this.handleOpenValidator}
							>
								Validierer
							</button>
							<button
								tabIndex={tabIndex}
								type="button"
								className="text-2xl clickable mt-8 flex gap-4"
								onClick={this.handleCloseApp}
							>
								Beenden
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
