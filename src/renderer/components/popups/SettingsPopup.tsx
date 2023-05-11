import React from 'react';
import { SettingsInterface } from '../../../interfaces/SettingsInterface';
import ConfirmPopupV2 from '../boardConfigurator/ConfirmPopupV2';
import InputLabel from '../InputLabel';
import TranslationHelper from '../../helper/TranslationHelper';
import { HomeMenuSeparator } from '../HomeScreenButton';
import Button from '../Button';
import ButtonSwitch from '../ButtonSwitch';
import SelectComponent from '../Select';

interface SettingsPopupProps {
	settings: SettingsInterface;
	onAbort: () => void;
	onConfirm: (settings: SettingsInterface) => void;
	windowDimensions: { width: number; height: number };
	os: NodeJS.Platform;
	topOffset?: boolean;
}

interface SettingsPopupStat {
	settings: SettingsInterface;
	openView: 'settings' | 'defaultValues';
}

class SettingsPopup extends React.Component<SettingsPopupProps, SettingsPopupStat> {
	static get defaultSettings(): SettingsInterface {
		return {
			language: 'en',
			popupsDraggable: true,
			darkMode: false,
			defaultValues: {
				defaultBoardName: 'New Board',
				maxBoardSize: 20,
				maxCheckpoints: 10,
				maxHoles: 10,
				maxLembasCount: 10,
				maxLembasFields: 10,
			},
		};
	}

	constructor(props: SettingsPopupProps) {
		super(props);
		this.state = {
			settings: props.settings,
			openView: 'settings',
		};
	}

	static get defaultProps() {
		return {
			topOffset: false,
		};
	}

	render() {
		const { os, windowDimensions, onAbort, onConfirm, topOffset } = this.props;
		const { settings } = this.state;
		return (
			<ConfirmPopupV2
				title={window.t.translate('Settings')}
				abortButtonText={window.t.translate('Cancel')}
				onAbort={onAbort}
				confirmButtonText={window.t.translate('Save')}
				onConfirm={() => {
					onConfirm(settings);
				}}
				windowDimensions={windowDimensions}
				os={os}
				topOffset={topOffset}
				settings={settings}
			>
				<div className="w-[500px]">
					<div className="w-full">
						<div className="flex flex-row justify-between items-center p-4 w-full">
							<div className="flex flex-row items-center w-full justify-center">
								<ButtonSwitch
									value={this.state.openView}
									onChange={(checkedLabel) => {
										this.setState({
											openView: checkedLabel.value === 'settings' ? 'settings' : 'defaultValues',
										});
									}}
									labels={[
										new ButtonSwitch.Label(window.t.translate('Settings'), 'settings'),
										new ButtonSwitch.Label(window.t.translate('Default values'), 'defaultValues'),
									]}
								/>
							</div>
						</div>
					</div>
					{this.state.openView === 'settings' ? (
						<div className="flex flex-col gap-4 p-4">
							<div className="grid grid-cols-2 items-center gap-8">
								<p>{window.t.translate('Language')}</p>
								<SelectComponent
									value={settings.language}
									onChange={(language) => {
										this.setState({
											settings: {
												...settings,
												language: language,
											},
										});
									}}
									options={[
										{ value: 'de', text: window.t.translate('German') },
										{ value: 'en', text: window.t.translate('English') },
										{ value: 'fr', text: window.t.translate('French') },
									]}
									containerClassName={'border-b border-gray-300'}
								/>
							</div>
							<div className="grid grid-cols-2 items-center gap-8">
								<p>{window.t.translate('Dark Mode')}</p>
								<InputLabel
									type="switch"
									value={settings.darkMode}
									onChange={(darkMode) => {
										this.setState({
											settings: {
												...settings,
												darkMode,
											},
										});
									}}
								/>
							</div>
							<div className="grid grid-cols-2 items-center gap-8">
								<p>{window.t.translate('Popups movable')}</p>
								<InputLabel
									type="switch"
									value={settings.popupsDraggable}
									onChange={(popupsDraggable) => {
										this.setState({
											settings: {
												...settings,
												popupsDraggable,
											},
										});
									}}
								/>
							</div>
						</div>
					) : (
						<div className="flex flex-col gap-4 p-4">
							<div className="grid grid-cols-2 items-center gap-8">
								<p>{window.t.translate('Default Board Name')}</p>
								<InputLabel
									type="text"
									value={settings.defaultValues.defaultBoardName}
									onChange={(defaultBoardName) => {
										this.setState({
											settings: {
												...settings,
												defaultValues: {
													...settings.defaultValues,
													defaultBoardName,
												},
											},
										});
									}}
								/>
							</div>
							<div className="grid grid-cols-2 items-center gap-8">
								<p>{window.t.translate('Maximum Board Dimension')}</p>
								<InputLabel
									type="number"
									value={settings.defaultValues.maxBoardSize}
									onChange={(maxBoardWidth) => {
										this.setState({
											settings: {
												...settings,
												defaultValues: {
													...settings.defaultValues,
													maxBoardSize: maxBoardWidth,
												},
											},
										});
									}}
									max={64}
									min={1}
								/>
							</div>
							<div className="grid grid-cols-2 items-center gap-8">
								<p>{window.t.translate('Maximum Checkpoints')}</p>
								<InputLabel
									type="number"
									value={settings.defaultValues.maxCheckpoints}
									onChange={(maxCheckpoints) => {
										this.setState({
											settings: {
												...settings,
												defaultValues: {
													...settings.defaultValues,
													maxCheckpoints,
												},
											},
										});
									}}
									max={64}
									min={1}
								/>
							</div>
							<div className="grid grid-cols-2 items-center gap-8">
								<p>{window.t.translate('Maximum Lembas Fields')}</p>
								<InputLabel
									type="number"
									value={settings.defaultValues.maxLembasFields}
									onChange={(maxLembasFields) => {
										this.setState({
											settings: {
												...settings,
												defaultValues: {
													...settings.defaultValues,
													maxLembasFields,
												},
											},
										});
									}}
									max={64}
									min={1}
								/>
							</div>
							<div className="grid grid-cols-2 items-center gap-8">
								<p>{window.t.translate('Maximum Lembas Count')}</p>
								<InputLabel
									type="number"
									value={settings.defaultValues.maxLembasCount}
									onChange={(maxLembasCount) => {
										this.setState({
											settings: {
												...settings,
												defaultValues: {
													...settings.defaultValues,
													maxLembasCount,
												},
											},
										});
									}}
									max={64}
									min={1}
								/>
							</div>
							<div className="grid grid-cols-2 items-center gap-8">
								<p>{window.t.translate('Maximum Holes')}</p>
								<InputLabel
									type="number"
									value={settings.defaultValues.maxHoles}
									onChange={(maxHoles) => {
										this.setState({
											settings: {
												...settings,
												defaultValues: {
													...settings.defaultValues,
													maxHoles,
												},
											},
										});
									}}
									max={64}
									min={1}
								/>
							</div>
							<HomeMenuSeparator />
							<div className="grid grid-cols-2 items-center gap-8">
								<p>{window.t.translate('Reset Default Values')}</p>
								<Button
									onClick={() => {
										this.setState({
											settings: {
												...settings,
												defaultValues: {
													...SettingsPopup.defaultSettings.defaultValues,
												},
											},
										});
									}}
								>
									{window.t.translate('Reset')}
								</Button>
							</div>
						</div>
					)}
				</div>
			</ConfirmPopupV2>
		);
	}
}

export default SettingsPopup;
