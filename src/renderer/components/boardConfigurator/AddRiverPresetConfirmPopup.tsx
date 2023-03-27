import { RiverPresetWithFile } from 'main/helper/PresetsLoader';
import React, { Component } from 'react';
import { VscAdd } from 'react-icons/vsc';
import { SettingsInterface } from '../../../interfaces/SettingsInterface';
import { BoardPosition } from '../generator/interfaces/boardPosition';
import ConfirmPopupV2 from './ConfirmPopupV2';
import BoardConfigInterface from '../interfaces/BoardConfigInterface';
import InputLabel from '../InputLabel';
import { getDirectionArrow } from '../presetEditor/RiverFieldPreset';

/**
 * The properties for the river preset component.
 */
type AddRiverPresetConfirmPopupProps = {
	onCancel: () => void;
	onConfirm: (position: BoardPosition, adjustBoardSize: boolean) => void;
	preset: RiverPresetWithFile;
	os: NodeJS.Platform;
	settings: SettingsInterface;
	windowDimensions: { width: number; height: number };
	configuration: BoardConfigInterface;
};
/**
 * The state types for the river preset component.
 */
type AddRiverPresetConfirmPopupState = {
	position: BoardPosition;
	adjustBoardSize: boolean;
};
/**
 * The river preset component.
 */
export default class AddRiverPresetConfirmPopup extends Component<
	AddRiverPresetConfirmPopupProps,
	AddRiverPresetConfirmPopupState
> {
	constructor(props: AddRiverPresetConfirmPopupProps) {
		super(props);
		this.state = {
			position:
				props.configuration.eye.position[0] === 0 && props.configuration.eye.position[1] === 0
					? {
							x: 1,
							y: 1,
					  }
					: { x: 0, y: 0 },
			adjustBoardSize: false,
		};
	}

	/**
	 * Builds the board for the preset preview.
	 */
	buildBoard = () => {
		const { configuration, preset } = this.props;
		const { position, adjustBoardSize } = this.state;
		const h = adjustBoardSize ? 20 : configuration.height;
		const w = adjustBoardSize ? 20 : configuration.width;
		const board: JSX.Element[][] = [];
		for (let x = 0; x < w; x += 1) {
			const row: JSX.Element[] = [];
			for (let y = 0; y < h; y += 1) {
				const possibleRiver = preset.data.filter((river) => {
					return river.position[0] + position.x === x && river.position[1] + position.y === y;
				});
				const isEye = configuration.eye.position[0] === x && configuration.eye.position[1] === y;
				const isRiver = !isEye && possibleRiver.length > 0;
				const riverClass = isRiver ? 'isRiver' : '';
				const className = isEye ? 'isEye' : riverClass;
				row.push(
					<div className={`w-8 h-8 relative border dark:border-muted-700 border-muted-400 ${className}`}>
						<div
							className={`w-full h-full hover:opacity-100 opacity-0 flex items-center justify-center ${
								isEye ? 'hover:cursor-not-allowed' : 'hover:cursor-pointer'
							}`}
						>
							{!isEye ? (
								<VscAdd
									onClick={() => {
										if (!isEye) {
											this.setState({
												position: { x, y },
											});
										}
									}}
								/>
							) : null}
						</div>
						{isRiver ? (
							<div
								role="presentation"
								className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hover:cursor-pointer"
								onClick={() => {
									if (!isEye) {
										this.setState({
											position: { x, y },
										});
									}
								}}
							>
								{getDirectionArrow(possibleRiver[0].direction)}
							</div>
						) : null}
					</div>
				);
			}
			board.push(row);
		}
		return board;
	};

	render() {
		const { onCancel, onConfirm, preset, os, settings, windowDimensions } = this.props;
		const { position, adjustBoardSize } = this.state;
		const board = this.buildBoard();
		return (
			<ConfirmPopupV2
				title={window.languageHelper.translate('Add River Preset')}
				abortButtonText={window.languageHelper.translate('Cancel')}
				onAbort={onCancel}
				confirmButtonText={window.languageHelper.translate('Add')}
				onConfirm={() => {
					onConfirm(position, adjustBoardSize);
				}}
				os={os}
				settings={settings}
				windowDimensions={windowDimensions}
			>
				<div className="flex flex-col gap-4">
					<p>{window.languageHelper.translateVars('Add {0} river preset.', [`"${preset.name}"`])}</p>
					<div className="flex gap-2 justify-center items-center">
						<InputLabel
							type="switch"
							label={window.languageHelper.translate('Adjust board size')}
							value={adjustBoardSize}
							onChange={() => {
								this.setState({ adjustBoardSize: !adjustBoardSize });
							}}
						/>
					</div>
					<div className="flex items-center justify-center">
						<div className="flex">
							{board.map((row) => (
								<div className="flex flex-col">{row.map((cell) => cell)}</div>
							))}
						</div>
					</div>
				</div>
			</ConfirmPopupV2>
		);
	}
}
