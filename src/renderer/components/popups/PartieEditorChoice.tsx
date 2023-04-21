import React from 'react';
import newBGImage from '../../../../assets/images/new-color.jpg';
import loadingBGImage from '../../../../assets/images/bg-color-II.jpg';
import PartieEditorChoiceCard from './components/PartieEditorChoiceCard';

type PartieEditorChoiceProps = {
	onClose: () => void;
	onNewConfig: () => void;
	onLoadConfig: () => void;
};

class PartieEditorChoice extends React.Component<PartieEditorChoiceProps, unknown> {
	constructor(props: PartieEditorChoiceProps) {
		super(props);
		this.handlePopupClose = this.handlePopupClose.bind(this);
		this.openLoadPartieConfig = this.openLoadPartieConfig.bind(this);
	}

	handlePopupClose = () => {
		const { onClose } = this.props;
		onClose();
	};

	openNewConfigScreen = () => {
		const { onNewConfig } = this.props;
		onNewConfig();
	};

	openLoadPartieConfig = async () => {
		const { onLoadConfig } = this.props;
		onLoadConfig();
	};

	render() {
		return (
			<div className="absolute w-[100vw] h-[100vh] top-0 left-0">
				<div role="presentation" className="w-[100vw] h-[100vh] bg-background-800/50" onClick={this.handlePopupClose} />
				<div>
					<div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
						<div className="text-center text-3xl mb-8 font-flicker tracking-widest">
							{window.translationHelper.translate('Game-Configuration')}
						</div>
						<div className="relative flex gap-8 w-[80vw] xl:w-[70vw] 2xl:w-[60vw]  mx-auto">
							<PartieEditorChoiceCard
								text={window.translationHelper.translate('New Game Configuration')}
								bgImage={newBGImage}
								onClickAction={this.openNewConfigScreen}
							/>
							<PartieEditorChoiceCard
								text={window.translationHelper.translate('Load')}
								bgImage={loadingBGImage}
								onClickAction={this.openLoadPartieConfig}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default PartieEditorChoice;
