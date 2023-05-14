import React from 'react';
import newBGImage from '../../../../assets/images/new-color.jpg';
import loadingBGImage from '../../../../assets/images/bg-color-II.jpg';
import GameConfiguratorChoiceCard from './components/GameConfiguratorChoiceCard';

type GameConfiguratorChoiceProps = {
	onClose: () => void;
	onNewConfig: () => void;
	onLoadConfig: () => void;
};

class GameConfiguratorChoice extends React.Component<GameConfiguratorChoiceProps, unknown> {
	constructor(props: GameConfiguratorChoiceProps) {
		super(props);
		this.handlePopupClose = this.handlePopupClose.bind(this);
		this.openLoadGameConfig = this.openLoadGameConfig.bind(this);
	}

	handlePopupClose = () => {
		const { onClose } = this.props;
		onClose();
	};

	openNewConfigScreen = () => {
		const { onNewConfig } = this.props;
		onNewConfig();
	};

	openLoadGameConfig = async () => {
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
							{window.t.translate('Game-Configurator')}
						</div>
						<div className="relative flex gap-8 w-[80vw] xl:w-[70vw] 2xl:w-[60vw]  mx-auto">
							<GameConfiguratorChoiceCard
								text={window.t.translate('New Game Configuration')}
								bgImage={newBGImage}
								onClickAction={this.openNewConfigScreen}
							/>
							<GameConfiguratorChoiceCard
								text={window.t.translate('Load')}
								bgImage={loadingBGImage}
								onClickAction={this.openLoadGameConfig}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default GameConfiguratorChoice;
