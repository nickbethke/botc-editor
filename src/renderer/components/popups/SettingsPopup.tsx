import React from 'react';
import { SettingsInterface } from '../../../interfaces/SettingsInterface';
import ConfirmPopupV2 from '../boardConfigurator/ConfirmPopupV2';
import InputLabel from '../InputLabel';
import TranslationHelper, { AvailableLanguages } from '../../helper/TranslationHelper';

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
}

class SettingsPopup extends React.Component<SettingsPopupProps, SettingsPopupStat> {
	constructor(props: SettingsPopupProps) {
		super(props);
		this.state = { settings: props.settings };
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
				<div className="flex flex-col gap-4 p-4">
					<div className="grid grid-cols-2 items-center gap-8">
						<p>{window.t.translate('Language')}</p>
						<select
							className="bg-transparent border-b-2 text-sm px-2 py-1 w-full"
							value={TranslationHelper.stringToEnum(settings.language)}
							onChange={(event) => {
								this.setState({
									settings: {
										...settings,
										language: AvailableLanguages[Number.parseInt(event.target.value, 10)] as 'de' | 'en',
									},
								});
							}}
						>
							<option value={AvailableLanguages.de}>{window.t.translate('German')}</option>
							<option value={AvailableLanguages.en}>{window.t.translate('English')}</option>
						</select>
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
			</ConfirmPopupV2>
		);
	}
}

export default SettingsPopup;
