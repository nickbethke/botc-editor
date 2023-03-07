import React from 'react';
import BoardConfigInterface from '../interfaces/BoardConfigInterface';
import InputLabel from '../InputLabel';

type BoardSettingsPopupProps = {
	config: BoardConfigInterface;
	onConfirm: (values: BoardSettingsPopupConfig) => void;
	onAbort: () => void;
};
type BoardSettingsPopupConfig = {
	name: string;
	width: number;
	height: number;
};
type BoardSettingsPopupState = {
	config: BoardSettingsPopupConfig;
};

class BoardSettingsPopup extends React.Component<
	BoardSettingsPopupProps,
	BoardSettingsPopupState
> {
	constructor(props: BoardSettingsPopupProps) {
		super(props);
		this.state = {
			config: {
				name: props.config.name,
				width: props.config.width,
				height: props.config.height,
			},
		};
	}

	render() {
		const { onAbort, onConfirm } = this.props;
		const { config } = this.state;
		return (
			<div className="absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] dark:bg-muted-800 bg-muted-500 text-white rounded border dark:border-muted-600 border-muted-500">
				<div className="w-full text-center p-2 dark:bg-muted-700 bg-muted-600">
					<div>
						{window.languageHelper.translate('Board Settings')}
					</div>
				</div>
				<div className="p-4">
					<InputLabel
						label={window.languageHelper.translate('Board Name')}
						type="text"
						value={config.name}
						onChange={(value) => {
							this.setState({
								config: {
									...config,
									name: value.toString(),
								},
							});
						}}
					/>
				</div>
				<div className="p-4 grid grid-cols-2 gap-4">
					<InputLabel
						label={window.languageHelper.translate('Board Width')}
						type="range"
						min={2}
						max={20}
						value={config.width}
						onChange={(value) => {
							this.setState({
								config: {
									...config,
									width: Number.parseInt(
										value.toString(),
										10
									),
								},
							});
						}}
					/>
					<InputLabel
						label={window.languageHelper.translate('Board Height')}
						type="range"
						min={2}
						max={20}
						value={config.height}
						onChange={(value) => {
							this.setState({
								config: {
									...config,
									height: Number.parseInt(
										value.toString(),
										10
									),
								},
							});
						}}
					/>
				</div>
				<div className="p-2 flex justify-center gap-4">
					<button
						className="px-2 py-1 dark:bg-muted-700 bg-muted-600 border dark:border-muted-600 border-muted-400 rounded dark:hover:bg-muted-600 hover:bg-muted-400"
						type="button"
						onClick={onAbort}
					>
						{window.languageHelper.translate('Cancel')}
					</button>
					<button
						className="px-2 py-1 dark:bg-muted-700 bg-muted-600 border dark:border-muted-600 border-muted-400 rounded dark:hover:bg-muted-600 hover:bg-muted-400"
						type="button"
						onClick={() => {
							onConfirm(config);
						}}
					>
						{window.languageHelper.translate('Save')}
					</button>
				</div>
			</div>
		);
	}
}

export default BoardSettingsPopup;
