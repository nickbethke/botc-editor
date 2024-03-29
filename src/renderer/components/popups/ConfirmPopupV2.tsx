import React, { MouseEventHandler } from 'react';
import destinyMountainImage from '../../../../assets/textures/schicksalsberg.png';
import { SettingsInterface } from '../../../interfaces/SettingsInterface';
import Button from '../Button';

/**
 * The properties of the confirmation popup.
 */
export type ConfirmPopupV2Props = {
	title: string;
	abortButtonText: string;
	onAbort: () => void;
	confirmButtonText: string | React.JSX.Element;
	onConfirm: () => void;
	children: string | React.JSX.Element | React.JSX.Element[];
	os: NodeJS.Platform;
	topOffset?: boolean;
	settings: SettingsInterface;
	windowDimensions: { width: number; height: number };
	maxWidth?: number | null;
	big?: boolean;
};
/**
 * The state properties of the confirmation popup.
 */
type ConfirmPopupV2State = {
	isDragged: boolean;
	rel: { x: number; y: number };
	visible: boolean;
	offClick: boolean;
	position: { x: number; y: number };
	dimension: { width: number; height: number };
};

/**
 * The confirmation popup component.
 */
class ConfirmPopupV2 extends React.Component<ConfirmPopupV2Props, ConfirmPopupV2State> {
	constructor(props: ConfirmPopupV2Props) {
		super(props);
		this.state = {
			isDragged: false,
			rel: { x: 0, y: 0 },
			visible: false,
			offClick: false,
			position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
			dimension: { width: 0, height: 0 },
		};
		this.handleOffClick = this.handleOffClick.bind(this);
	}

	/**
	 * Confirmation popup default properties.
	 */
	static get defaultProps() {
		return {
			topOffset: false,
			maxWidth: null,
			big: false,
		};
	}

	/**
	 * Function called when the component did mount.
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
		const { visible } = this.state;
		if (visible) {
			const popup = document.getElementById('popupV2');
			if (popup) {
				popup.addEventListener('resize', () => {
					const { dimension } = this.state;
					if (dimension.width !== popup.clientWidth + 4 || dimension.height !== popup.clientHeight + 4) {
						this.setState({
							dimension: {
								width: popup.clientWidth + 4,
								height: popup.clientHeight + 4,
							},
						});
					}
				});
			}
		}
	}

	/**
	 * Function called when the component was updated.
	 * @param prevProps
	 * @param prevState
	 */
	componentDidUpdate(prevProps: Readonly<ConfirmPopupV2Props>, prevState: Readonly<ConfirmPopupV2State>) {
		const { offClick: preOffClick, dimension: preDimension } = prevState;
		const { visible } = this.state;
		const popup = document.getElementById('popupV2');
		if (visible) {
			if (popup) {
				const dimension = {
					width: popup.clientWidth + 4,
					height: popup.clientHeight + 4,
				};
				if (dimension.width !== preDimension.width || dimension.height !== preDimension.height) {
					this.setState({ dimension });
				}
			}

			const { offClick, position, dimension } = this.state;
			const { windowDimensions, os } = this.props;
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
	}

	/**
	 * Handles off-clicks of the popup.
	 * @param e
	 */
	handleOffClick: MouseEventHandler<HTMLDivElement> = (e) => {
		const trigger = document.querySelector('#popupV2-container');
		if (trigger && trigger === e.target) this.setState({ offClick: true });
	};

	/**
	 * Renders the component.
	 */
	render() {
		const { confirmButtonText, abortButtonText, onConfirm, onAbort, children, title, os, topOffset, maxWidth, big } =
			this.props;
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
					className={`fixed origin-top-left z-50 transition-opacity ${visible ? 'opacity-1' : 'opacity-0'} ${
						offClick && 'popup-warn'
					} ${big ? 'w-[50vw]' : ''}`}
					style={{
						top: position.y,
						left: position.x,
						maxWidth: `${maxWidth}px` || (big ? '50vw' : '33.333vw'),
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
							<span className="font-flicker tracking-widest">{title}</span>
						</div>
						<div className="py-2 px-4 mb-2">
							{children instanceof Array ? children.map((child) => child) : children}
						</div>
						<div className="py-2 px-4 flex justify-end gap-4 items-center text-sm border-t dark:border-muted-700 border-muted-400">
							<Button onClick={onConfirm} buttonType="primary" size="sm">
								{confirmButtonText}
							</Button>
							<Button onClick={onAbort} size="sm">
								{abortButtonText}
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default ConfirmPopupV2;
