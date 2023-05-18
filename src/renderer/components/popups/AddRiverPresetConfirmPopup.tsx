import { RiverPresetWithFile } from 'main/helper/PresetsLoader';
import React, { Component } from 'react';
import { VscAdd } from 'react-icons/vsc';
import { SettingsInterface } from '../../../interfaces/SettingsInterface';
import { BoardPosition } from '../generator/interfaces/BoardPosition';
import ConfirmPopupV2 from './ConfirmPopupV2';
import BoardConfigInterface from '../../../interfaces/BoardConfigInterface';
import InputLabel from '../InputLabel';
import { getDirectionArrow } from '../presetEditor/RiverFieldPreset';
import { HomeMenuSeparator } from '../HomeScreenButton';
import Button from '../Button';
import { GrRotateLeft, GrRotateRight } from 'react-icons/gr';
import { Rotation } from '../../../interfaces/Types';
import {
	calculateRiverPresetFieldPositionWithRotation,
	getNextRotation,
	getPreviousRotation,
	rotateDirection,
} from '../boardConfigurator/HelperFunctions';
import _uniqueId from 'lodash/uniqueId';

/**
 * The properties for the river preset component.
 */
type AddRiverPresetConfirmPopupProps = {
	onCancel: () => void;
	onConfirm: (position: BoardPosition, adjustBoardSize: boolean, rotation: Rotation) => void;
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
	rotation: Rotation;
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
			rotation: '0',
		};
	}

	/**
	 * Builds the board for the preset preview.
	 */
	buildBoard = () => {
		const { configuration, preset, settings } = this.props;
		const { position, adjustBoardSize, rotation } = this.state;
		const h = adjustBoardSize ? settings.defaultValues.maxBoardSize : configuration.height;
		const w = adjustBoardSize ? settings.defaultValues.maxBoardSize : configuration.width;
		const board: React.JSX.Element[][] = [];
		for (let x = 0; x < w; x += 1) {
			const row: React.JSX.Element[] = [];
			for (let y = 0; y < h; y += 1) {
				const possibleRiver = preset.data.filter((river) => {
					const riverPosition = calculateRiverPresetFieldPositionWithRotation(river.position, rotation);
					return riverPosition.x + position.x === x && riverPosition.y + position.y === y;
				});

				const isStart = configuration.startFields.some((start) => start.position[0] === x && start.position[1] === y);
				const isCheckpoint = configuration.checkPoints.some((value) => value[0] === x && value[1] === y);
				const isLembas = configuration.lembasFields.some((value) => value.position[0] === x && value.position[1] === y);
				const isHole = configuration.holes.some((value) => value[0] === x && value[1] === y);
				const isRiver = configuration.riverFields.some((value) => value.position[0] === x && value.position[1] === y);

				const isEye = configuration.eye.position[0] === x && configuration.eye.position[1] === y;
				const isNewRiver = !isEye && possibleRiver.length > 0;
				const newRiverClass = isNewRiver ? 'isRiver' : '';
				const isStartClass = isStart ? 'isStartField' : '';
				const isCheckpointClass = isCheckpoint ? 'isCheckpoint' : '';
				const isLembasClass = isLembas ? 'isLembasField' : '';
				const isHoleClass = isHole ? 'isHole' : '';
				const isEyeClass = isEye ? 'isEye' : '';
				const isRiverClass = isRiver ? 'isRiverMuted' : '';
				const className = isEyeClass || newRiverClass || isRiverClass || isCheckpointClass || isStartClass || isLembasClass || isHoleClass;

				row.push(
					<div className={`w-8 h-8 relative border dark:border-muted-700 border-muted-400 ${className}`}>
						<div
							className={`w-full h-full hover:opacity-100 opacity-0 flex items-center justify-center ${
								isEye ? 'hover:cursor-not-allowed' : 'hover:cursor-pointer'
							}`}
							onClick={() => {
								if (!isEye) {
									this.setState({
										position: { x, y },
									});
								}
							}}
						>
							{!isEye ? (
								<VscAdd />
							) : null}
						</div>
						{isNewRiver ? (
							<div
								role='presentation'
								className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hover:cursor-pointer'
								onClick={() => {
									if (!isEye) {
										this.setState({
											position: { x, y },
										});
									}
								}}
							>
								{getDirectionArrow(rotateDirection(possibleRiver[0].direction, rotation))}
							</div>
						) : null}
						{isRiver ? (
							<div
								role='presentation'
								className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hover:cursor-pointer'
							>
								{getDirectionArrow(configuration.riverFields.find((value) => value.position[0] === x && value.position[1] === y)!.direction)}
							</div>
						) : null}
					</div>,
				);
			}
			board.push(row);
		}
		return board;
	};

	render() {
		const { onCancel, onConfirm, preset, os, settings, windowDimensions } = this.props;
		const { position, adjustBoardSize, rotation } = this.state;
		const board = this.buildBoard();
		return (
			<ConfirmPopupV2
				title={window.t.translate('Add River Preset')}
				abortButtonText={window.t.translate('Cancel')}
				onAbort={onCancel}
				confirmButtonText={window.t.translate('Add')}
				onConfirm={() => {
					onConfirm(position, adjustBoardSize, rotation);
				}}
				os={os}
				settings={settings}
				windowDimensions={windowDimensions}
			>
				<div className='flex flex-col gap-4'>
					<div className='flex justify-center flex-col gap-2 items-center'>
						<p>{window.t.translateVars('Add {0} river preset.', [`"${preset.name}"`])}</p>
						<small>{window.t.translate('Click on the board to place the river.')}</small>
						<small>{window.t.translate('Already occupied fields will be overridden, except for the eye.')}</small>
					</div>
					<HomeMenuSeparator />
					<div className='flex justify-center items-center gap-2'>
						<Button
							onClick={() => {
								this.setState({
									rotation: getNextRotation(rotation),
								});
							}}
						>
							<GrRotateRight />

						</Button>
						<Button
							onClick={() => {
								this.setState({
									rotation: getPreviousRotation(rotation),
								});
							}}
						>
							<GrRotateLeft />
						</Button>
						<span>{window.t.translate('Rotation')}: {this.state.rotation}°</span>
					</div>
					<div className='flex gap-2 justify-center items-center'>
						<InputLabel
							type='switch'
							label={window.t.translate('Adjust board size')}
							value={adjustBoardSize}
							onChange={() => {
								this.setState({ adjustBoardSize: !adjustBoardSize });
							}}
						/>
					</div>
					<div className='flex items-center justify-center'>
						<div className='flex'>
							{board.map((row) => (
								<div key={_uniqueId()} className='flex flex-col'>{row.map((cell) => cell)}</div>
							))}
						</div>
					</div>
				</div>
			</ConfirmPopupV2>
		);
	}


}
