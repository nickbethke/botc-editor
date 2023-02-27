import React from 'react';
import { BiChevronLeft } from 'react-icons/bi';
import backgroundImage from '../../../assets/images/bg-color-III.jpg';
import App from '../App';
import InputLabel from '../components/InputLabel';
import Notification from '../components/Notification';
import Error from '../components/Error';
import InputValidator from '../helper/InputValidator';

import ConfirmPopup from '../components/popups/ConfirmPopup';
import PartieConfigInterface from '../components/interfaces/PartieConfigInterface';

type PartieKonfiguratorProps = {
	App: App;
	loadedValues: PartieConfigInterface | null;
};
type PartieKonfiguratorState = {
	values: PartieConfigInterface;
	popupLeave: boolean;
};

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
		};
	}

	handleBackButton = () => {
		this.setState({ popupLeave: true });
	};

	backToHomeScreen = () => {
		// eslint-disable-next-line @typescript-eslint/no-shadow
		const { App } = this.props;
		App.setState({ openScreen: 'home', openPopup: false });
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
			this.setState({ values: partieJSON });
			this.notification = <Notification label="Erfolgreich geladen" />;
		} else {
			this.notification = (
				<Error label="Laden der Datei fehlgeschlagen!" />
			);
		}
	};

	render = () => {
		let { values } = this.state;
		const { popupLeave } = this.state;
		const { loadedValues } = this.props;

		if (loadedValues) {
			values = loadedValues;
			this.setState({ values });
			this.notification = <Notification label="Erfolgreich geladen" />;
		}
		let popupLeaveR = null;
		if (popupLeave) {
			popupLeaveR = (
				<ConfirmPopup
					label="Partie-Konfigurator wirklich verlassen?"
					onConfirm={this.backToHomeScreen}
					onAbort={this.abortBackToHomeScreen}
				/>
			);
		}
		return (
			<div>
				<div className="dragger absolute top-0 left-0 w-[100vw] h-8" />
				{popupLeaveR}
				<div className="text-white grid grid-cols-3 2xl:grid-cols-2 gap-0 h-[100vh] w-[100vw]">
					<div
						style={{
							backgroundImage: `url(${backgroundImage})`,
							backgroundSize: 'cover',
						}}
					/>
					<div className="col-span-2 2xl:col-span-1 m-8 flex flex-col gap-8">
						<div className="flex flex-row justify-start gap-8">
							<button
								type="button"
								className="border border-white cursor-pointer hover:bg-accent-500"
								onClick={this.handleBackButton}
							>
								<BiChevronLeft className="text-4xl" />
							</button>
							<div className="text-4xl">Partie Konfigurator</div>
						</div>
						<div>{this.notification}</div>
						<div className="grid grid-cols-2 gap-8">
							<div>
								<InputLabel
									label="Maximale Rundenanzahl"
									type="number"
									min={-1}
									value={values.maxRounds}
									validator={
										new InputValidator(
											InputValidator.TYPE_NUMBER,
											{
												number: {
													ifSmallerThen: {
														number: 3,
														error: 'Unpassende Rundenanzahl. Das Spiel wäre sehr schnell vorbei!',
													},
													ifBiggerThen: {
														number: 1000,
														error: 'Unpassende Rundenanzahl. Das Spiel würde sehr lange dauern!',
													},
												},
											}
										)
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
									label="Start LembasField"
									type="number"
									value={values.startLembas}
									validator={
										new InputValidator(
											InputValidator.TYPE_NUMBER,
											{
												number: {
													ifSmallerThen: {
														number: 5,
														error: 'Unpassende Start LembasField-Anzahl!',
													},
												},
											}
										)
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
									label="Schuss LembasField"
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
						<div className="grid grid-cols-2 gap-8">
							<div>
								<button
									type="button"
									className="w-full border border-white p-4 hover:bg-accent-500 text-lg bg-white/25"
									onClick={this.handleSaveClick}
								>
									Speichern
								</button>
							</div>
							<div>
								<button
									type="button"
									className="w-full border border-white p-4 hover:bg-accent-500 text-lg bg-white/25"
									onClick={this.openLoadPartieConfig}
								>
									Laden
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};
}

export default PartieKonfigurator;
