import React from 'react';
import { SettingsInterface } from '../../../interfaces/SettingsInterface';
import ConfirmPopupV2 from '../boardConfiguratorV2/ConfirmPopupV2';
import InputLabel from '../InputLabel';
import TranslationHelper, {
	AvailableLanguages,
} from '../../helper/TranslationHelper';

interface SettingsPopupProps {
	settings: SettingsInterface;
	onAbort: () => void;
	onConfirm: (settings: SettingsInterface) => void;
	position: { x: number; y: number };
	onPositionChange: (
		position: { x: number; y: number },
		callback: () => void
	) => void;
	onDimensionChange: (dimension: { width: number; height: number }) => void;
	os: NodeJS.Platform;
	topOffset?: boolean;
}

interface SettingsPopupStat {
	settings: SettingsInterface;
}

class SettingsPopup extends React.Component<
	SettingsPopupProps,
	SettingsPopupStat
> {
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
		const {
			os,
			position,
			onPositionChange,
			onDimensionChange,
			onAbort,
			onConfirm,
			topOffset,
		} = this.props;
		const { settings } = this.state;
		return (
			<ConfirmPopupV2
				title={window.languageHelper.translate('Settings')}
				abortButtonText={window.languageHelper.translate('Cancel')}
				onAbort={onAbort}
				confirmButtonText={window.languageHelper.translate('Save')}
				onConfirm={() => {
					onConfirm(settings);
				}}
				position={position}
				onPositionChange={onPositionChange}
				onDimensionChange={onDimensionChange}
				os={os}
				topOffset={topOffset}
				settings={settings}
			>
				<div className="flex flex-col gap-4">
					<div className="grid grid-cols-2 items-center gap-8">
						<p>{window.languageHelper.translate('Language')}</p>
						<select
							className="bg-transparent border-b-2 text-sm px-2 py-1 w-full"
							value={TranslationHelper.stringToEnum(
								settings.language
							)}
							onChange={(event) => {
								this.setState({
									settings: {
										...settings,
										language: AvailableLanguages[
											Number.parseInt(
												event.target.value,
												10
											)
										] as 'de' | 'en',
									},
								});
							}}
						>
							<option value={AvailableLanguages.de}>
								{window.languageHelper.translate('German')}
							</option>
							<option value={AvailableLanguages.en}>
								{window.languageHelper.translate('English')}
							</option>
						</select>
					</div>
					<div className="grid grid-cols-2 items-center gap-8">
						<p>{window.languageHelper.translate('Dark Mode')}</p>
						<InputLabel
							type="switch"
							value={settings.darkMode}
							onChange={(value) => {
								this.setState({
									settings: {
										...settings,
										darkMode: !!value,
									},
								});
							}}
						/>
					</div>
					<div className="grid grid-cols-2 items-center gap-8">
						<p>
							{window.languageHelper.translate('Popups movable')}
						</p>
						<InputLabel
							type="switch"
							value={settings.popupsDraggable}
							onChange={(value) => {
								this.setState({
									settings: {
										...settings,
										popupsDraggable: !!value,
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
