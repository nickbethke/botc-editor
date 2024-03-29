import PopupV2 from './PopupV2';
import { SettingsInterface } from '../../../interfaces/SettingsInterface';
import logo from '../../../../assets/icons/192x192.png';

type Props = {
	onClose: () => void;
	windowDimensions: { width: number; height: number };
	os: NodeJS.Platform;
	settings: SettingsInterface;
	topOffset?: boolean;
	version: string;
};

export default function AboutPopup(props: Props) {
	const { windowDimensions, os, settings, onClose, topOffset, version } = props;
	return (
		<PopupV2
			title={window.t.translate('About')}
			windowDimensions={windowDimensions}
			os={os}
			settings={settings}
			onClose={onClose}
			closeButtonText={window.t.translate('Close')}
			topOffset={topOffset}
		>
			<div className="grid grid-cols-3 gap-4 m-4">
				<div className="flex justify-start">
					<img src={logo} alt="logo" className="w-24 h-24 mx-auto drop-shadow-lg" />
				</div>
				<div className="col-span-2">
					<p className="text-xl">
						<b>Editor - BotC</b> <span className="text-sm">v{version}</span>
					</p>
					<p className="mb-4">{window.t.translate('Editor for the game Battle of the Centerländ')}</p>
					<p>
						<b>{window.t.translate('OS')}:</b> {os}
					</p>
					<div className="mb-4">
						<b>{window.t.translate('Author')}:</b>
						<p>Team 11 - Sopra 2022/23</p>
						<p>{window.t.translate('University Ulm')}</p>
					</div>
					<p>
						<b>Copyright:</b> &copy; 2022-2023
					</p>
				</div>
			</div>
		</PopupV2>
	);
}

AboutPopup.defaultProps = {
	topOffset: false,
};
