import React from 'react';
import newBGImage from '../../../assets/images/new-color.jpg';
import randomBGImage from '../../../assets/images/random-color.jpg';
import loadingBGImage from '../../../assets/images/bg-color-II.jpg';
import App from '../App';
import BoardEditorChoiceCard from './BoardEditorChoiceCard';

type BoardEditorChoiceProps = {
	parentApp: App;
};

class BoardEditorChoice extends React.Component<
	BoardEditorChoiceProps,
	unknown
> {
	constructor(props: BoardEditorChoiceProps) {
		super(props);
		this.handlePopupClose = this.handlePopupClose.bind(this);
		this.openNewBoardConfig = this.openNewBoardConfig.bind(this);
		this.openRandomBoardConfig = this.openRandomBoardConfig.bind(this);
		this.openLoadBoardConfig = this.openLoadBoardConfig.bind(this);
	}

	handlePopupClose = () => {
		const { parentApp } = this.props;
		parentApp.setState({ openPopup: false });
	};

	openLoadBoardConfig = async () => {
		const boarsJSON = await window.electron.dialog.openBoardConfig();
		if (boarsJSON) {
			const { parentApp } = this.props;
			parentApp.setState({
				openScreen: 'boardConfigLoadScreen',
				toLoad: boarsJSON,
			});
		}
	};

	openNewBoardConfig = () => {
		const { parentApp } = this.props;
		parentApp.setState({ openScreen: 'boardConfigNewScreen' });
	};

	openRandomBoardConfig = () => {};

	render() {
		return (
			<div className="absolute w-[100vw] h-[100vh] top-0 left-0">
				<div
					role="presentation"
					className="w-[100vw] h-[100vh] bg-background-800/50"
					onClick={this.handlePopupClose}
				/>
				<div>
					<div className="absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%]">
						<div className="text-center text-3xl mb-8">
							Board Konfiguration
						</div>
						<div className="relative flex gap-8 w-[80vw] xl:w-[70vw] 2xl:w-[60vw]  mx-auto">
							<BoardEditorChoiceCard
								text="Leeres Board"
								bgImage={newBGImage}
								onClickAction={this.openNewBoardConfig}
							/>
							<BoardEditorChoiceCard
								text="Zufällig"
								bgImage={randomBGImage}
								onClickAction={this.openRandomBoardConfig}
							/>
							<BoardEditorChoiceCard
								text="Laden"
								bgImage={loadingBGImage}
								onClickAction={this.openLoadBoardConfig}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default BoardEditorChoice;
