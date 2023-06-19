import React from 'react';
import './App.scss';
import { isEqual } from 'lodash';
import { ParsedPath } from 'path';
import GameConfigurator from './screens/GameConfigurator';
import JsonValidator from './screens/JsonValidator';
import { GameConfigWithPath } from '../interfaces/GameConfigInterface';
import BoardConfigInterface from '../interfaces/BoardConfigInterface';
import TranslationHelper from './helper/TranslationHelper';
import BoardConfiguratorV2 from './screens/BoardConfiguratorV2';
import { SettingsInterface } from '../interfaces/SettingsInterface';
import RiverPresetEditor from './screens/RiverPresetEditor';
import Home from './screens/Home';

export type AppScreens =
	| 'home'
	| 'validator'
	| 'boardConfigV2FromRandomScreen'
	| 'gameConfigNewScreen'
	| 'gameConfigLoadScreen'
	| 'boardConfigV2LoadScreen'
	| 'boardConfigV2NewScreen'
	| 'riverPresetEditor';

type AppProps = {
	os: NodeJS.Platform;
	settings: SettingsInterface;
};
type AppStates = {
	openScreen: AppScreens;
	toLoad: object | null;
	settings: SettingsInterface;
};

/**
 * App component
 */
class App extends React.Component<AppProps, AppStates> {
	constructor(props: AppProps) {
		super(props);
		this.state = {
			openScreen: 'home',
			toLoad: null,
			settings: props.settings,
		};
	}

	componentDidMount() {
		const { settings } = this.state;
		if (settings.darkMode) {
			document.documentElement.classList.add('dark');
		}
		document.documentElement.setAttribute('lang', settings.language);
	}

	componentDidUpdate(prevProps: Readonly<AppProps>, prevState: Readonly<AppStates>) {
		const { settings: preSettings } = prevState;
		const { settings } = this.state;

		if (!isEqual(preSettings, settings)) {
			if (settings.darkMode) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
			document.documentElement.setAttribute('lang', settings.language);
		}
	}

	handleCloseChildScreen = () => {
		this.setState({ openScreen: 'home' });
	};

	handleSettingsChange = (settings: SettingsInterface) => {
		(async () => {
			const newSettings = await window.electron.app.updateSettings(settings);
			const lang = TranslationHelper.stringToEnum(newSettings.language);
			await window.t.switchLanguage(lang);
			if (settings.darkMode) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
			this.setState({ settings: newSettings });
		})().catch(() => {});
	};

	gameConfigScreen = () => {
		const { openScreen, settings } = this.state;
		const { os } = this.props;
		if (openScreen === 'gameConfigNewScreen') {
			return (
				<GameConfigurator
					onClose={this.handleCloseChildScreen}
					loadedValues={null}
					settings={settings}
					os={os}
					onSettingsUpdate={this.handleSettingsChange}
				/>
			);
		}
		if (openScreen === 'gameConfigLoadScreen') {
			const { toLoad } = this.state;
			if (toLoad) this.setState({ toLoad: null });
			return (
				<GameConfigurator
					settings={settings}
					os={os}
					onClose={this.handleCloseChildScreen}
					loadedValues={toLoad as GameConfigWithPath}
					onSettingsUpdate={this.handleSettingsChange}
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

	boardConfigV2Screen = () => {
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
				if (toLoad) {
					return (
						<BoardConfiguratorV2
							os={os}
							onClose={this.handleCloseChildScreen}
							config={toLoad as BoardConfigInterface}
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
		const { openScreen, settings } = this.state;
		const { os } = this.props;
		if (openScreen === 'validator') {
			return (
				<JsonValidator
					onClose={this.handleCloseChildScreen}
					settings={settings}
					os={os}
					onSettingsUpdated={this.handleSettingsChange}
				/>
			);
		}
		return null;
	};

	handleOpenScreen = (screen: AppScreens, toLoad: any) => {
		this.setState({ openScreen: screen, toLoad });
	};

	homeScreen() {
		const { os } = this.props;
		const { settings } = this.state;
		return (
			<Home
				os={os}
				settings={settings}
				onSettingsUpdate={this.handleSettingsChange}
				onOpenScreen={this.handleOpenScreen}
			/>
		);
	}

	render() {
		const { openScreen } = this.state;
		switch (openScreen) {
			case 'home':
				return this.homeScreen();
			case 'gameConfigNewScreen':
			case 'gameConfigLoadScreen':
				return this.gameConfigScreen();
			case 'boardConfigV2NewScreen':
			case 'boardConfigV2LoadScreen':
				return this.boardConfigV2Screen();
			case 'riverPresetEditor':
				return this.riverPresetEditor();
			case 'boardConfigV2FromRandomScreen':
				return this.boardConfigV2Screen();
			case 'validator':
				return this.validatorScreen();
			default:
				return this.homeScreen();
		}
	}
}

export default App;
