import React from 'react';
import { BsFillCursorFill, BsFillTrashFill } from 'react-icons/bs';
import _uniqueId from 'lodash/uniqueId';
import App from '../App';
import BoardConfigInterface, {
	Direction,
} from '../../schema/interfaces/boardConfigInterface';
import InputLabel from './InputLabel';
import InputValidator from '../helper/InputValidator';
import { RiverPreset } from '../../main/helper/PresetsLoader';

type BoardKonfiguratorProps = {
	// eslint-disable-next-line react/no-unused-prop-types
	App: App;
};
type BoardKonfiguratorState = {
	config: BoardConfigInterface;
	openTab: 'fields' | 'presets' | 'global';
	currentTool: 'select' | 'delete';
	presets: Array<RiverPreset>;
};

// TODO: Speichern Dialog: Als Preset oder als Board
class BoardKonfigurator extends React.Component<
	BoardKonfiguratorProps,
	BoardKonfiguratorState
> {
	static default: BoardConfigInterface = {
		eye: { direction: Direction.NORTH, position: [0, 0] },
		height: 2,
		width: 2,
		checkPoints: [[1, 0]],
		name: 'Default Board',
		startFields: [{ direction: Direction.NORTH, position: [0, 0] }],
	};

	private draggableItemClass: string =
		'p-4 bg-white/10 flex text-center justify-center items-center cursor-grab border-2 border-transparent border-dashed hover:border-white';

	private tabOpenClass =
		'p-4 bg-white/25 text-center hover:bg-white/50 transition-colors transition';

	private tabClosedClass =
		'p-4 text-center hover:bg-white/50 transition-colors transition';

	constructor(props: BoardKonfiguratorProps) {
		super(props);
		this.state = {
			config: BoardKonfigurator.default,
			currentTool: 'select',
			openTab: 'global',
			presets: [],
		};
		this.changeToPresets = this.changeToPresets.bind(this);
	}

	changeToPresets = async () => {
		this.setState({
			openTab: 'presets',
		});
		window.electron.load
			.presets()
			.then((presets) => {
				this.setState({ presets });
				return true;
			})
			.catch((e) => {
				if (!e) {
					throw Error();
				}
			});
	};

	render = () => {
		const { openTab } = this.state;

		return (
			<div>
				<div className="dragger absolute top-0 left-0 w-[100vw] h-8" />
				<div className="grid grid-cols-4 xl:grid-cols-6 h-[100vh] bg-background">
					<div
						id="board-configurator-sidebar-left"
						className="w-full h-full bg-background-700 text-white flex flex-col"
					>
						<div className="p-4 text-2xl text-center">
							Board-Konfigurator
						</div>
						<div className="flex-grow border-t flex flex-col">
							<div className="flex flex-col">
								<div className="grid grid-cols-3 border-b">
									<button
										className={
											openTab === 'global'
												? this.tabOpenClass
												: this.tabClosedClass
										}
										onClick={() => {
											this.setState({
												openTab: 'global',
											});
										}}
										type="button"
									>
										Global
									</button>
									<button
										className={
											openTab === 'fields'
												? this.tabOpenClass
												: this.tabClosedClass
										}
										onClick={() => {
											this.setState({
												openTab: 'fields',
											});
										}}
										type="button"
									>
										Felder
									</button>
									<button
										className={
											openTab === 'presets'
												? this.tabOpenClass
												: this.tabClosedClass
										}
										onClick={this.changeToPresets}
										type="button"
									>
										Presets
									</button>
								</div>
							</div>
							{this.tools()}
						</div>
						<div className="grid grid-cols-3 border-t border-b">
							<button
								type="button"
								className="p-4 hover:bg-white/50 transition-colors transition"
							>
								Laden
							</button>
							<button
								type="button"
								className="p-4 hover:bg-white/50 transition-colors transition"
							>
								Speichern
							</button>
							<button
								type="button"
								className="p-4 hover:bg-white/50 transition-colors transition"
							>
								Beenden
							</button>
						</div>
					</div>
					<div className="col-span-2 xl:col-span-4" />
					<div
						id="board-configurator-sidebar-right"
						className="w-full h-full bg-background-700"
					/>
				</div>
			</div>
		);
	};

	tools = () => {
		let currentTab;
		const { openTab, currentTool } = this.state;

		switch (openTab) {
			case 'fields':
				currentTab = this.fields();
				break;
			case 'presets':
				currentTab = this.presets();
				break;
			case 'global':
			default:
				currentTab = this.globals();
				break;
		}
		if (openTab === 'global')
			return (
				<div className="flex flex-col flex-grow">
					<div className="bg-white/10 flex flex-grow">
						{currentTab}
					</div>
				</div>
			);
		return (
			<div className="flex flex-col flex-grow">
				<div className="border-b">
					<div className="grid grid-cols-2">
						<button
							className={
								currentTool === 'select'
									? this.tabOpenClass
									: this.tabClosedClass
							}
							onClick={() => {
								this.setState({
									currentTool: 'select',
								});
							}}
							type="button"
						>
							<BsFillCursorFill className="text-2xl mx-auto" />
						</button>
						<button
							className={
								currentTool === 'delete'
									? this.tabOpenClass
									: this.tabClosedClass
							}
							onClick={() => {
								this.setState({
									currentTool: 'delete',
								});
							}}
							type="button"
						>
							<BsFillTrashFill className="text-2xl mx-auto" />
						</button>
					</div>
				</div>
				<div className="bg-white/10 flex flex-col flex-grow">
					{currentTab}
				</div>
			</div>
		);
	};

	fields = () => {
		return (
			<div className="grid grid-cols-2 m-4 gap-4">
				<div className={this.draggableItemClass}>Start</div>
				<div className={this.draggableItemClass}>Checkpoint</div>
				<div className={this.draggableItemClass}>Saurons Auge</div>
				<div className={this.draggableItemClass}>Fluss</div>
				<div className={this.draggableItemClass}>Lembas</div>
				<div className={this.draggableItemClass}>Loch</div>
				<div className={`${this.draggableItemClass} col-span-2`}>
					Wand
				</div>
			</div>
		);
	};

	presets = () => {
		const presetsElements: Array<JSX.Element> = [];
		const { presets } = this.state;
		presets.forEach((preset) => {
			const id = _uniqueId('preset-element-');
			presetsElements.push(
				<div key={id} className="p-2 bg-white/25 text-center">
					{preset.name}
				</div>
			);
		});
		return (
			<div className="grid grid-cols-2 m-4 gap-4">
				{presetsElements.map((presetsElement) => presetsElement)}
			</div>
		);
	};

	globals = () => {
		const { config } = this.state;
		return (
			<div className="flex flex-col flex-grow">
				<div className="flex-shrink">
					<div className="p-4">
						<InputLabel
							label="Board-Name"
							type="text"
							labelClass="text-xl"
							placeholder="Board-Name"
							value={config.name}
							onChange={(boardName) => {
								this.setState({
									config: {
										...config,
										name: boardName.toString(),
									},
								});
							}}
							validator={
								new InputValidator(InputValidator.TYPE_STRING, {
									text: {
										notEmpty: {
											error: 'Board-Name darf nicht leer sein!',
										},
									},
								})
							}
						/>
					</div>
					<div className="p-4">
						<InputLabel
							label="Breite"
							type="range"
							labelClass="text-xl"
							value={config.width}
							min={config.height === 1 ? 2 : 1}
							onChange={(width) => {
								this.setState({
									config: {
										...config,
										width: Number.parseInt(
											width.toString(),
											10
										),
									},
								});
							}}
						/>
					</div>
					<div className="p-4">
						<InputLabel
							label="Höhe"
							type="range"
							labelClass="text-xl"
							value={config.height}
							min={config.width === 1 ? 2 : 1}
							onChange={(height) => {
								this.setState({
									config: {
										...config,
										height: Number.parseInt(
											height.toString(),
											10
										),
									},
								});
							}}
						/>
					</div>
				</div>
				<div className="flex-grow p-4 border-t">
					<div className="text-xl">Checkpoint Reihenfolge</div>
				</div>
			</div>
		);
	};
}

export default BoardKonfigurator;
