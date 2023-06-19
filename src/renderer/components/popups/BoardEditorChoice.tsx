import React from 'react';
import newBGImage from '../../../../assets/images/new-color.jpg';
import randomBGImage from '../../../../assets/images/random-color.jpg';
import loadingBGImage from '../../../../assets/images/bg-color-II.jpg';
import BoardEditorChoiceCard from './components/BoardEditorChoiceCard';
import ButtonSwitch from '../ButtonSwitch';

type BoardEditorChoiceProps = {
	onClose: () => void;
	onLoadConfig: () => void;
	onNewConfig: () => void;
	onRandomConfig: () => void;
	onOpenRiverPresetEditor: () => void;
};
type BoardEditorChoiceState = {
	view: 'default' | 'riverPreset';
};

class BoardEditorChoice extends React.Component<BoardEditorChoiceProps, BoardEditorChoiceState> {
	constructor(props: BoardEditorChoiceProps) {
		super(props);

		this.state = {
			view: 'default',
		};

		this.handlePopupClose = this.handlePopupClose.bind(this);
		this.openNewBoardConfig = this.openNewBoardConfig.bind(this);
		this.openRandomBoardConfig = this.openRandomBoardConfig.bind(this);
		this.openLoadBoardConfig = this.openLoadBoardConfig.bind(this);
	}

	handlePopupClose = () => {
		const { onClose } = this.props;
		onClose();
	};

	openLoadBoardConfig = async () => {
		const { onLoadConfig } = this.props;
		onLoadConfig();
	};

	openNewBoardConfig = () => {
		const { onNewConfig } = this.props;
		onNewConfig();
	};

	openRandomBoardConfig = () => {
		const { onRandomConfig } = this.props;
		onRandomConfig();
	};

	openRiverPresetEditor = () => {
		const { onOpenRiverPresetEditor } = this.props;
		onOpenRiverPresetEditor();
	};

	renderPreset = () => {
		return (
			<div className="relative flex gap-8 w-[90vw] xl:w-[80vw] 2xl:w-[60vw] mx-auto items-center justify-center">
				<BoardEditorChoiceCard
					text={window.t.translate('Open River-Preset Editor')}
					bgImage={newBGImage}
					onClickAction={this.openRiverPresetEditor}
					single
				/>
			</div>
		);
	};

	renderDefault() {
		return (
			<div className="relative flex gap-8 w-[80vw] xl:w-[70vw] 2xl:w-[60vw]  mx-auto">
				<BoardEditorChoiceCard
					text={window.t.translate('Empty Board')}
					bgImage={newBGImage}
					onClickAction={this.openNewBoardConfig}
				/>
				<BoardEditorChoiceCard
					text={window.t.translate('Random')}
					bgImage={randomBGImage}
					onClickAction={this.openRandomBoardConfig}
				/>
				<BoardEditorChoiceCard
					text={window.t.translate('Load')}
					bgImage={loadingBGImage}
					onClickAction={this.openLoadBoardConfig}
				/>
			</div>
		);
	}

	render() {
		const { view } = this.state;
		return (
			<div className="absolute w-[100vw] h-[100vh] top-0 left-0">
				<div role="presentation" className="w-[100vw] h-[100vh] bg-background-800/50" onClick={this.handlePopupClose} />
				<div>
					<div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
						<div className="flex flex-col gap-8">
							<div className="flex gap-4 items-center justify-center">
								<div className="text-center text-3xl font-flicker tracking-widest">
									{view === 'default'
										? window.t.translate('Board-Configurator')
										: window.t.translate('River-Preset Editor')}
								</div>
							</div>
							<div className="flex justify-center">
								<div className="flex gap-4 items-center justify-center">
									<ButtonSwitch
										value={view}
										onChange={(label) => {
											this.setState({ view: label.value as 'default' | 'riverPreset' });
										}}
										labels={[
											new ButtonSwitch.Label(window.t.translate('Configuration'), 'default'),
											new ButtonSwitch.Label(window.t.translate('River Preset'), 'riverPreset'),
										]}
									/>
								</div>
							</div>
							{/* CSS Carousel with animation between the two elements */}
							<div className="flex overflow-x-hidden max-w-[100vw]">
								<div
									className={`snap-start shrink-0 w-full transition-all ${
										view === 'default' ? 'opacity-1 translate-x-0' : 'opacity-0 translate-x-full'
									}`}
								>
									{this.renderDefault()}
								</div>
								<div
									className={`snap-start shrink-0 w-full transition-all ${
										view === 'riverPreset' ? 'opacity-1 -translate-x-full' : 'opacity-0 translate-x-0'
									}`}
								>
									{this.renderPreset()}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default BoardEditorChoice;
