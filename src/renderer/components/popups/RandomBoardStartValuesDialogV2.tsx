import React from 'react';
import { TailSpin } from 'react-loader-spinner';
import InputLabel from '../InputLabel';
import BoardGenerator, { RiverAlgorithm, WallAlgorithm } from '../generator/BoardGenerator';
import { SettingsInterface } from '../../../interfaces/SettingsInterface';
import ConfirmPopupV2 from './ConfirmPopupV2';
import eagleField from '../generator/fields/EagleField';

export type RandomBoardStartValuesDialogV2Stats = {
	checkpoints: number;
	generating: boolean;
	height: number;
	holes: number;
	lembasAmountExactMaximum: boolean;
	lembasFields: number;
	maxLembasAmountOnField: number;
	name: string;
	riverAlgorithm: RiverAlgorithm;
	rivers: boolean;
	startFields: number;
	walls: boolean;
	wallsAlgorithm: WallAlgorithm;
	width: number;
	eagleFields: number;
};

export type RandomBoardStartValuesV2 = {
	name: string;
	width: number;
	height: number;
	startFields: number;
	checkpoints: number;
	lembasFields: number;
	maxLembasAmountOnField: number;
	lembasAmountExactMaximum: boolean;
	rivers: boolean;
	holes: number;
	walls: boolean;
	riverAlgorithm: RiverAlgorithm;
	wallsAlgorithm: WallAlgorithm;
	eagleFields: number;
};

type RandomBoardStartValuesDialogV2Props = {
	onAbort: () => void;
	onConfirm: (generator: BoardGenerator) => void;
	windowDimensions: { width: number; height: number };
	os: NodeJS.Platform;
	topOffset?: boolean;
	settings: SettingsInterface;
};

class RandomBoardStartValuesDialogV2 extends React.Component<
	RandomBoardStartValuesDialogV2Props,
	RandomBoardStartValuesDialogV2Stats
> {
	private readonly dimensionMax: number = 20;

	constructor(props: RandomBoardStartValuesDialogV2Props) {
		super(props);
		this.state = {
			name: props.settings.defaultValues.defaultBoardName,
			width: 3,
			height: 2,
			startFields: 2,
			checkpoints: 2,
			lembasFields: 0,
			lembasAmountExactMaximum: true,
			maxLembasAmountOnField: 3,
			rivers: false,
			holes: 0,
			walls: false,
			riverAlgorithm: 'default',
			wallsAlgorithm: 'iterative',
			generating: false,
			eagleFields: 0,
		};

		this.dimensionMax = props.settings.defaultValues.maxBoardSize;
	}

	static get defaultProps() {
		return {
			topOffset: false,
		};
	}

	componentDidUpdate(
		prevProps: Readonly<RandomBoardStartValuesDialogV2Props>,
		prevState: Readonly<RandomBoardStartValuesDialogV2Stats>
	) {
		const { width, height } = this.state;
		const fieldCountNeeded = this.getNeededFieldCount();
		if (width > this.dimensionMax) {
			const neededDimension = Math.ceil(fieldCountNeeded / this.dimensionMax);
			this.setState({
				height: neededDimension,
				width: this.dimensionMax,
			});
			return;
		}
		if (height > this.dimensionMax) {
			const neededDimension = Math.ceil(fieldCountNeeded / this.dimensionMax);
			this.setState({
				width: neededDimension,
				height: this.dimensionMax,
			});
			return;
		}
		if (fieldCountNeeded > width * height) {
			const { height: prevHeight, width: prevWidth } = prevState;
			if (prevHeight !== height || (prevWidth === width && height > width)) {
				const neededDimension = Math.ceil(fieldCountNeeded / height);
				this.setState({
					width: neededDimension,
				});
				return;
			}
			if (prevWidth !== width || (prevHeight === height && width > height)) {
				const neededDimension = Math.ceil(fieldCountNeeded / width);
				this.setState({
					height: neededDimension,
				});
				return;
			}
			const neededDimension = Math.ceil(Math.sqrt(fieldCountNeeded));
			this.setState({
				height: neededDimension,
				width: neededDimension,
			});
		}
	}

	getNeededFieldCount = () => {
		const { startFields, checkpoints, lembasFields, holes, eagleFields } = this.state;
		return startFields + checkpoints + lembasFields + holes + 1 + eagleFields;
	};

	generate = () => {
		this.setState({ generating: true }, () => {
			setTimeout(() => {
				const {
					height,
					startFields,
					lembasFields,
					maxLembasAmountOnField,
					lembasAmountExactMaximum,
					riverAlgorithm,
					rivers,
					wallsAlgorithm,
					walls,
					holes,
					checkpoints,
					name,
					width,
					eagleFields,
				} = this.state;
				const { onConfirm } = this.props;
				const generationValues: RandomBoardStartValuesV2 = {
					height,
					startFields,
					lembasFields,
					maxLembasAmountOnField,
					lembasAmountExactMaximum,
					riverAlgorithm,
					rivers,
					wallsAlgorithm,
					walls,
					holes,
					checkpoints,
					name,
					width,
					eagleFields,
				};
				const generator = new BoardGenerator(generationValues);
				this.setState({ generating: false });
				onConfirm(generator);
			}, 1000);
		});
	};

	render() {
		const {
			name,
			width,
			height,
			startFields,
			checkpoints,
			lembasFields,
			maxLembasAmountOnField,
			lembasAmountExactMaximum,
			riverAlgorithm,
			rivers,
			wallsAlgorithm,
			walls,
			holes,
			generating,
			eagleFields,
		} = this.state;
		const { windowDimensions, os, topOffset, onAbort, settings } = this.props;
		return (
			<ConfirmPopupV2
				title={window.t.translate('Random Board - Start Values')}
				abortButtonText={window.t.translate('Cancel')}
				onAbort={onAbort}
				confirmButtonText={
					generating ? <TailSpin height={16} width={16} color="#ffffff" /> : window.t.translate('Generate')
				}
				onConfirm={this.generate}
				windowDimensions={windowDimensions}
				os={os}
				topOffset={topOffset}
				settings={settings}
				maxWidth={1000}
				big
			>
				<div className="px-16">
					<div className="grid grid-cols-2 gap-8">
						<div className="col-span-2">
							<InputLabel
								label={window.t.translate('Board Name')}
								value={name}
								onChange={(value) => {
									this.setState({
										name: value.toString(),
									});
								}}
								type="text"
							/>
						</div>
						<div className="flex flex-col gap-8">
							<InputLabel
								label={window.t.translate('Board Width')}
								value={width}
								onChange={(value) => {
									this.setState({
										width: Number.parseInt(value.toString(), 10),
									});
								}}
								type="range"
								min={2}
								max={this.dimensionMax}
							/>
							<InputLabel
								label={window.t.translate('Start Fields')}
								value={startFields}
								onChange={(value) => {
									this.setState({
										startFields: Number.parseInt(value.toString(), 10),
									});
								}}
								type="range"
								min={2}
								max={6}
							/>
						</div>
						<div className="flex flex-col gap-8">
							<InputLabel
								label={window.t.translate('Board Height')}
								value={height}
								onChange={(value) => {
									this.setState({
										height: Number.parseInt(value.toString(), 10),
									});
								}}
								type="range"
								min={2}
								max={this.dimensionMax}
							/>
							<InputLabel
								label={window.t.translate('Checkpoints')}
								value={checkpoints}
								onChange={(value) => {
									this.setState({
										checkpoints: Number.parseInt(value.toString(), 10),
									});
								}}
								type="range"
								min={2}
								max={settings.defaultValues.maxCheckpoints}
							/>
						</div>
					</div>
					<hr className="my-4" />
					<div className="relative grid grid-cols-2 gap-8 h-fit">
						<InputLabel
							label={window.t.translate('Lembas Fields')}
							value={lembasFields}
							onChange={(value) => {
								this.setState({
									lembasFields: Number.parseInt(value.toString(), 10),
								});
							}}
							type="range"
							min={0}
							max={settings.defaultValues.maxLembasFields}
						/>
						<InputLabel
							label={window.t.translate('Lembas Count')}
							value={maxLembasAmountOnField}
							onChange={(value) => {
								this.setState({
									maxLembasAmountOnField: Number.parseInt(value.toString(), 10),
								});
							}}
							type="range"
							min={0}
							max={settings.defaultValues.maxLembasCount}
						/>
						<div className="col-span-2">
							<InputLabel
								label={window.t.translate('Random Lembas Count between 0 and Lembas Count')}
								value={!lembasAmountExactMaximum}
								onChange={(value) => {
									this.setState({
										lembasAmountExactMaximum: !value,
									});
								}}
								type="switch"
							/>
							<p className="text-sm text-gray-300 dark:text-gray-500 text-center">
								{' '}
								{window.t.translate('If not checked, the lembas count will be exact the value from above')}
							</p>
						</div>
					</div>
					<hr className="my-4" />
					<div className="flex gap-8 w-full">
						<div className="w-full">
							<InputLabel
								label={window.t.translate('Holes')}
								type="range"
								value={holes}
								onChange={(value) => {
									this.setState({
										holes: Number.parseInt(value.toString(), 10),
									});
								}}
								min={0}
								max={settings.defaultValues.maxHoles}
							/>
						</div>
						<div className="w-full">
							<InputLabel
								label={window.t.translate('Eagle Fields')}
								type="range"
								value={eagleFields}
								onChange={(value) => {
									this.setState({
										eagleFields: Number.parseInt(value.toString(), 10),
									});
								}}
								min={0}
								max={settings.defaultValues.maxEagleFields}
							/>
						</div>
					</div>
					<hr className="my-4" />
					<div className="text-center font-lato flex flex-col">
						<span>{window.t.translate('possible empty fields / total number of fields')}</span>
						<span className="text-2xl">
							{width * height - this.getNeededFieldCount()}/{width * height}
						</span>
					</div>
					<hr className="my-4" />
					<div className="relative grid grid-cols-2 gap-8 h-fit">
						<InputLabel
							type="switch"
							label={window.t.translate('Rivers')}
							value={rivers}
							onChange={(value) => {
								this.setState({
									rivers: !!value,
								});
							}}
						/>
						{rivers ? (
							<div className="flex flex-row font-lato items-center gap-2">
								<span>{window.t.translate('Default')}</span>
								<InputLabel
									type="switch"
									bothSides
									value={riverAlgorithm === 'complex'}
									onChange={(value) => {
										this.setState({
											riverAlgorithm: value ? 'complex' : 'default',
										});
									}}
								/>
								<span>{window.t.translate('Complex')}</span>
							</div>
						) : null}
					</div>
					<hr className="my-4" />
					<div className="relative grid grid-cols-2 gap-8 h-fit">
						<InputLabel
							label={window.t.translate('Walls')}
							type="switch"
							value={walls}
							onChange={(value) => {
								this.setState({
									walls: !!value,
								});
							}}
						/>
						{walls ? (
							<div className="flex flex-row font-lato items-center gap-2">
								<span>{window.t.translate('Iterative')}</span>
								<InputLabel
									type="switch"
									bothSides
									value={wallsAlgorithm === 'random'}
									onChange={(value) => {
										this.setState({
											wallsAlgorithm: value ? 'random' : 'iterative',
										});
									}}
								/>
								<span>{window.t.translate('Random')}</span>
							</div>
						) : null}
					</div>
				</div>
			</ConfirmPopupV2>
		);
	}
}

export default RandomBoardStartValuesDialogV2;
