import React, { MouseEventHandler } from 'react';
import destinyMountainImage from '../../../../assets/textures/schicksalsberg.png';
import { SettingsInterface } from '../../../interfaces/SettingsInterface';
import InputLabel from '../InputLabel';

/**
 * The prompt popup component properties
 */
export type PromptPopupV2Props = {
	title: string;
	abortButtonText: string;
	onAbort: () => void;
	confirmButtonText: string;
	onConfirm: (value: string) => void;
	input: { type: 'text'; startValue: string };
	windowDimensions: { width: number; height: number };
	os: NodeJS.Platform;
	topOffset?: boolean;
	settings: SettingsInterface;
};
/**
 * The prompt popup component state properties
 */
type PromptPopupV2State = {
	isDragged: boolean;
	rel: { x: number; y: number };
	visible: boolean;
	offClick: boolean;
	value: string;
	position: { x: number; y: number };
	dimension: { width: number; height: number };
};

/**
 * The prompt popup component
 */
class PromptPopupV2 extends React.Component<PromptPopupV2Props, PromptPopupV2State> {
	constructor(props: PromptPopupV2Props) {
		super(props);
		this.state = {
			isDragged: false,
			rel: { x: 0, y: 0 },
			visible: false,
			offClick: false,
			value: props.input.startValue,
			position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
			dimension: { width: 0, height: 0 },
		};
		this.handleOffClick = this.handleOffClick.bind(this);
	}

	/**
	 * The prompt popup component default properties
	 */
	static get defaultProps() {
		return {
			topOffset: false,
		};
	}

	/**
	 * Fires when the component is mounted
	 */
	componentDidMount() {
		setTimeout(() => {
			const popup = document.getElementById('popupV2');
			const { position } = this.state;
			if (popup) {
				this.setState(
					{
						position: {
							x: position.x - popup.clientWidth / 2,
							y: position.y - popup.clientHeight / 2,
						},
						dimension: {
							width: popup.clientWidth + 4,
							height: popup.clientHeight + 4,
						},
					},
					() => {
						setTimeout(() => {
							this.setState({ visible: true });
						}, 200);
					}
				);
			}
		}, 200);
	}

	/**
	 * Fires when the component is updated
	 * @param prevProps
	 * @param prevState
	 */
	componentDidUpdate(prevProps: Readonly<PromptPopupV2Props>, prevState: Readonly<PromptPopupV2State>) {
		const { offClick: preOffClick } = prevState;
		const { offClick, position, dimension } = this.state;
		const { os, windowDimensions } = this.props;
		if (offClick !== preOffClick && !preOffClick) {
			window.electron.app.beep().catch(() => {});
			setTimeout(() => {
				this.setState({ offClick: false });
			}, 500);
		}
		if (position.x < 0) {
			this.setState({ position: { x: 0, y: position.y } });
		}
		if (position.y < (os === 'win32' ? 32 : 0)) {
			this.setState({
				position: {
					x: position.x,
					y: os === 'win32' ? 32 : 0,
				},
			});
		}
		if (position.x + dimension.width > windowDimensions.width) {
			this.setState({
				position: {
					x: windowDimensions.width - dimension.width,
					y: position.y,
				},
			});
		}
		if (position.y + dimension.height > windowDimensions.height) {
			this.setState({
				position: {
					x: position.x,
					y: windowDimensions.height - dimension.height,
				},
			});
		}
	}

	/**
	 * Handles offClick events
	 * @param e
	 */
	handleOffClick: MouseEventHandler<HTMLDivElement> = (e) => {
		const trigger = document.querySelector('#popupV2-container');
		if (trigger && trigger === e.target) this.setState({ offClick: true });
	};

	/**
	 * Renders the text input
	 */
	textInput = () => {
		const { value } = this.state;
		const { onConfirm } = this.props;
		return (
			<InputLabel
				label={false}
				type="text"
				value={value}
				onChange={(v) => {
					this.setState({ value: v.replace(/[/\\:*?"<>]/g, '') });
				}}
				onEnter={() => {
					onConfirm(value);
				}}
			/>
		);
	};

	/**
	 * Renders the prompt popup component
	 */
	render() {
		const { confirmButtonText, abortButtonText, onConfirm, onAbort, input, title, os, topOffset } = this.props;
		const { visible, offClick, position } = this.state;
		return (
			<div
				role="presentation"
				id="popupV2-container"
				className="w-[100vw] absolute left-0 bg-black/25 text-white"
				style={{
					top: os === 'win32' && topOffset ? 32 : 0,
					height: window.innerHeight - (os === 'win32' && topOffset ? 32 : 0),
				}}
				onClick={this.handleOffClick}
			>
				<div
					role="presentation"
					id="popupV2"
					className={`fixed origin-top-left z-50 max-w-[33.333vw] transition-opacity ${
						visible ? 'opacity-1' : 'opacity-0'
					} ${offClick && 'popup-warn'}`}
					style={{
						top: position.y,
						left: position.x,
					}}
				>
					<div className="dark:bg-muted-800 bg-muted-600 rounded shadow-xl box-shadow-xl border dark:border-muted-700 border-muted-400">
						<div
							role="presentation"
							className="p-2 flex justify-start gap-4 items-center text-lg border-b dark:border-muted-700 border-muted-400"
							draggable="true"
							onMouseDown={(e) => {
								const { isDragged } = this.state;
								const { settings } = this.props;
								if (!isDragged && settings.popupsDraggable) {
									this.setState({
										isDragged: true,
										rel: {
											x: e.pageX - position.x,
											y: e.pageY - position.y,
										},
									});
								}
								e.stopPropagation();
								e.preventDefault();
							}}
							onMouseMove={(event) => {
								const { isDragged, rel } = this.state;
								const { settings } = this.props;
								if (!isDragged || !settings.popupsDraggable) return;
								this.setState({
									position: {
										x: event.pageX - rel.x,
										y: event.pageY - rel.y,
									},
								});
								event.stopPropagation();
								event.preventDefault();
							}}
							onMouseUp={(e) => {
								const { settings } = this.props;
								if (settings.popupsDraggable) {
									this.setState({ isDragged: false });
								}
								e.stopPropagation();
								e.preventDefault();
							}}
							onMouseLeave={(e) => {
								const { settings } = this.props;
								if (settings.popupsDraggable) {
									this.setState({ isDragged: false });
								}
								e.stopPropagation();
								e.preventDefault();
							}}
						>
							<img className="h-6" src={destinyMountainImage} alt={window.t.translate('Logo')} />
							<span>{title}</span>
						</div>
						<div className="py-2 px-4 mb-2">{input.type === 'text' ? this.textInput() : null}</div>
						<div className="py-2 px-4 flex justify-end gap-4 items-center text-sm border-t dark:border-muted-700 border-muted-400">
							<button
								className="py-1 px-2 bg-accent-600 rounded hover:bg-accent-500"
								type="button"
								onClick={() => {
									const { value } = this.state;
									onConfirm(value);
								}}
							>
								{confirmButtonText}
							</button>
							<button
								className="py-1 px-2 border dark:border-muted-700 border-muted-400 rounded hover:bg-white/25"
								type="button"
								onClick={onAbort}
							>
								{abortButtonText}
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default PromptPopupV2;
