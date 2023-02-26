import React, { MouseEventHandler } from 'react';
import InputLabel from './InputLabel';
import BoardGenerator from './generator/BoardGenerator';

export type RandomBoardStartValuesDialogStats = {
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
};

export type RandomBoardStartValues = {
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
};

type RandomBoardStartValuesDialogProps = {
	onClose: () => void;
	onGenerated: (generator: BoardGenerator) => void;
};

/**
 * river algorithm type
 */
export type RiverAlgorithm = 'default' | 'complex';

/**
 * river algorithm type
 */
export type WallAlgorithm = 'iterative' | 'random';

class RandomBoardStartValuesDialog extends React.Component<
	RandomBoardStartValuesDialogProps,
	RandomBoardStartValuesDialogStats
> {
	private dimensionMax: number = 20;

	constructor(props: RandomBoardStartValuesDialogProps) {
		super(props);
		this.state = {
			name: 'THE CENTERLÄND',
			width: 2,
			height: 2,
			startFields: 2,
			checkpoints: 1,
			lembasFields: 0,
			lembasAmountExactMaximum: true,
			maxLembasAmountOnField: 3,
			rivers: false,
			holes: 0,
			walls: false,
			riverAlgorithm: 'default',
			wallsAlgorithm: 'iterative',
		};
		this.generate = this.generate.bind(this);
		this.close = this.close.bind(this);
	}

	componentDidUpdate(
		prevProps: Readonly<unknown>,
		prevState: Readonly<RandomBoardStartValuesDialogStats>
	) {
		const { width, height } = this.state;
		const fieldCountNeeded = this.getNeededFieldCount();
		if (width > this.dimensionMax) {
			const neededDimension = Math.ceil(
				fieldCountNeeded / this.dimensionMax
			);
			this.setState({
				height: neededDimension,
				width: this.dimensionMax,
			});
			return;
		}
		if (height > this.dimensionMax) {
			const neededDimension = Math.ceil(
				fieldCountNeeded / this.dimensionMax
			);
			this.setState({
				width: neededDimension,
				height: this.dimensionMax,
			});
			return;
		}
		if (fieldCountNeeded > width * height) {
			const { height: prevHeight, width: prevWidth } = prevState;
			if (
				prevHeight !== height ||
				(prevWidth === width && height > width)
			) {
				const neededDimension = Math.ceil(fieldCountNeeded / height);
				this.setState({
					width: neededDimension,
				});
				return;
			}
			if (
				prevWidth !== width ||
				(prevHeight === height && width > height)
			) {
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
		const { startFields, checkpoints, lembasFields, holes } = this.state;
		return startFields + checkpoints + lembasFields + holes + 1;
	};

	generate: MouseEventHandler<HTMLButtonElement> = async () => {
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
		} = this.state;
		const generationValues: RandomBoardStartValues = {
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
		};
		const { onGenerated } = this.props;
		const generator = new BoardGenerator(generationValues);
		onGenerated(generator);
	};

	close: MouseEventHandler<HTMLButtonElement> = () => {
		const { onClose } = this.props;
		onClose();
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
		} = this.state;
		return (
			<div className="absolute w-[100vw] h-[100vh] top-0 left-0">
				<div
					role="presentation"
					className="w-[100vw] h-[100vh] bg-background-800/50"
				/>
				<div>
					<div className="absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] bg-background-700 p-8">
						<div className="text-center text-3xl mb-4">
							Zufälliges Board - Startwerte
						</div>
						<div className="2xl:w-[50vw] w-[75vw]">
							<div className="h-fit">
								<div className="relative grid grid-cols-2 gap-8">
									<div className="col-span-2">
										<InputLabel
											label="Board Name"
											value={name}
											onChange={(value) => {
												this.setState({
													name: value.toString(),
												});
											}}
											type="text"
											placeholder="Board Name"
										/>
									</div>
									<div className="flex flex-col gap-8">
										<InputLabel
											label="Breite"
											value={width}
											onChange={(value) => {
												this.setState({
													width: Number.parseInt(
														value.toString(),
														10
													),
												});
											}}
											type="range"
											min={2}
											max={this.dimensionMax}
										/>
										<InputLabel
											label="Startfelder"
											value={startFields}
											onChange={(value) => {
												this.setState({
													startFields:
														Number.parseInt(
															value.toString(),
															10
														),
												});
											}}
											type="range"
											min={2}
											max={6}
										/>
									</div>
									<div className="flex flex-col gap-8">
										<InputLabel
											label="Höhe"
											value={height}
											onChange={(value) => {
												this.setState({
													height: Number.parseInt(
														value.toString(),
														10
													),
												});
											}}
											type="range"
											min={2}
										/>
										<InputLabel
											label="Checkpoints"
											value={checkpoints}
											onChange={(value) => {
												this.setState({
													checkpoints:
														Number.parseInt(
															value.toString(),
															10
														),
												});
											}}
											type="range"
											min={1}
											max={32}
										/>
									</div>
								</div>
								<hr className="my-4" />
								<div className="relative grid grid-cols-2 gap-8 h-fit">
									<InputLabel
										label="LembasField-Felder"
										value={lembasFields}
										onChange={(value) => {
											this.setState({
												lembasFields: Number.parseInt(
													value.toString(),
													10
												),
											});
										}}
										type="range"
										min={0}
										max={32}
									/>
									<InputLabel
										label="LembasField-Anzahl"
										value={maxLembasAmountOnField}
										onChange={(value) => {
											this.setState({
												maxLembasAmountOnField:
													Number.parseInt(
														value.toString(),
														10
													),
											});
										}}
										type="range"
										min={0}
										max={32}
									/>
									<div className="col-span-2">
										<InputLabel
											label="Exakte LembasField Anzahl"
											value={lembasAmountExactMaximum}
											onChange={(value) => {
												this.setState({
													lembasAmountExactMaximum:
														!!value,
												});
											}}
											type="switch"
										/>
									</div>
								</div>
								<hr className="my-4" />
								<div className="relative grid gap-8 h-fit">
									<InputLabel
										label="Löcher"
										type="range"
										value={holes}
										onChange={(value) => {
											this.setState({
												holes: Number.parseInt(
													value.toString(),
													10
												),
											});
										}}
										min={0}
										max={32}
									/>
								</div>
								<hr className="my-4" />
								<div className="text-center font-lato flex flex-col">
									<span>Freie Felder/Felder insgesamt</span>
									<span className="text-2xl">
										{width * height -
											this.getNeededFieldCount()}
										/{width * height}
									</span>
								</div>
								<hr className="my-4" />
								<div className="relative grid grid-cols-2 gap-8 h-fit">
									<InputLabel
										label="Flüsse"
										type="switch"
										value={rivers ? 1 : 0}
										onChange={(value) => {
											this.setState({
												rivers: !!value,
											});
										}}
									/>
									{rivers ? (
										<div className="flex flex-row font-lato items-center gap-2">
											<span>Default</span>
											<InputLabel
												type="switch"
												bothSides
												value={
													riverAlgorithm === 'complex'
														? 1
														: 0
												}
												onChange={(value) => {
													this.setState({
														riverAlgorithm: value
															? 'complex'
															: 'default',
													});
												}}
											/>
											<span>Complex</span>
										</div>
									) : null}
								</div>
								<hr className="my-4" />
								<div className="relative grid grid-cols-2 gap-8 h-fit">
									<InputLabel
										label="Wände"
										type="switch"
										value={walls ? 1 : 0}
										onChange={(value) => {
											this.setState({
												walls: !!value,
											});
										}}
									/>
									{walls ? (
										<div className="flex flex-row font-lato items-center gap-2">
											<span>Iterativ</span>
											<InputLabel
												type="switch"
												bothSides
												value={
													wallsAlgorithm === 'random'
														? 1
														: 0
												}
												onChange={(value) => {
													this.setState({
														wallsAlgorithm: value
															? 'random'
															: 'iterative',
													});
												}}
											/>
											<span>Zufällig</span>
										</div>
									) : null}
								</div>
								<div className="relative flex gap-8 h-fit mt-4 justify-around">
									<button
										type="button"
										className="w-full border border-white p-2 bg-white/25 hover:bg-accent-500 text-lg"
										onClick={this.generate}
									>
										Generieren
									</button>
									<button
										type="button"
										className="w-full border border-white p-2 bg-white/25 hover:bg-accent-500 text-lg"
										onClick={this.close}
									>
										Abbrechen
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default RandomBoardStartValuesDialog;
