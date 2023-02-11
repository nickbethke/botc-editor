import React from 'react';
import './App.scss';
import BoardEditorChoice from './components/BoardEditorChoice';
import PartieEditorChoice from './components/PartieEditorChoice';
import PartieKonfigurator from './components/PartieKonfigurator';
import PartieConfigInterface from '../schema/interfaces/partieConfigInterface';
import BoardKonfigurator from './components/BoardKonfigurator';
import JSONValidierer from './components/JSONValidierer';

type AppStates = {
	openScreen: string;
	openPopup: string | false;
	toLoad: object | null;
};

class App extends React.Component<unknown, AppStates> {
	constructor(props: unknown) {
		super(props);
		this.state = { openScreen: 'home', openPopup: false, toLoad: null };
		this.handleOpenBoardEditorChoice =
			this.handleOpenBoardEditorChoice.bind(this);
		this.handleOpenPartieEditorChoice =
			this.handleOpenPartieEditorChoice.bind(this);
		this.handleCloseApp = this.handleCloseApp.bind(this);
		this.handleOpenValidator = this.handleOpenValidator.bind(this);
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
		const { openScreen } = this.state;
		switch (openScreen) {
			case 'home':
				return this.homeScreen();
			case 'partieConfigNewScreen':
			case 'partieConfigLoadScreen':
				return this.partieConfigScreen();
			case 'boardConfigNewScreen':
			case 'boardConfigLoadScreen':
				return this.boardConfigScreen();
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

	boardConfigScreen = () => {
		const { openScreen } = this.state;
		if (openScreen === 'boardConfigNewScreen') {
			return <BoardKonfigurator App={this} />;
		}
		if (openScreen === 'boardConfigLoadScreen') {
			return <BoardKonfigurator App={this} />;
		}
		return null;
	};

	validatorScreen = () => {
		const { openScreen } = this.state;
		if (openScreen === 'validator') {
			return <JSONValidierer parentApp={this} />;
		}
		return null;
	};

	homeScreen() {
		const { openPopup } = this.state;
		let popup: JSX.Element | string = '';
		if (openPopup === 'boardEditorChoice') {
			popup = <BoardEditorChoice parentApp={this} />;
		}
		if (openPopup === 'partieEditorChoice') {
			popup = <PartieEditorChoice parentApp={this} />;
		}
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
								type="button"
								className="text-2xl clickable"
								onClick={this.handleOpenBoardEditorChoice}
							>
								Board-Konfigurator
							</button>
							<button
								type="button"
								className="text-2xl clickable"
								onClick={this.handleOpenPartieEditorChoice}
							>
								Partie-Konfigurator
							</button>
							<button
								type="button"
								className="text-2xl clickable"
								onClick={this.handleOpenValidator}
							>
								Validierer
							</button>
							<button
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
