import React, { MouseEventHandler } from 'react';
import destinyMountainImage from '../../../../assets/textures/schicksalsberg.png';
import { SettingsInterface } from '../../../interfaces/SettingsInterface';
import Button from '../Button';

/**
 * THe popup component properties
 */
export type PopupV2Props = {
	title: string;
	closeButtonText: string;
	onClose: () => void;
	children: string | React.JSX.Element | React.JSX.Element[];
	windowDimensions: { width: number; height: number };
	os: NodeJS.Platform;
	topOffset?: boolean;
	settings: SettingsInterface;
};
/**
 * The popup component state properties
 */
type PopupV2State = {
	isDragged: boolean;
	rel: { x: number; y: number };
	visible: boolean;
	position: { x: number; y: number };
	dimension: { width: number; height: number };
};

/**
 * The popup component
 */
class PopupV2 extends React.Component<PopupV2Props, PopupV2State> {
	constructor(props: PopupV2Props) {
		super(props);
		this.state = {
			isDragged: false,
			rel: { x: 0, y: 0 },
			visible: false,
			position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
			dimension: { width: 0, height: 0 },
		};
		this.handleOffClick = this.handleOffClick.bind(this);
	}

	/**
	 * The popup component default properties
	 */
	static get defaultProps() {
		return {
			topOffset: false,
		};
	}

	/**
	 * Fires when the component did mount
	 */
	componentDidMount() {
		setTimeout(() => {
			const popup = document.getElementById('popupV2Popup');
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
					},
				);
			}
		}, 200);
	}

	/**
	 * Fires when the component has been updated
	 */
	componentDidUpdate() {
		const { position, dimension } = this.state;
		const { windowDimensions, os } = this.props;
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
	 */
	handleOffClick: MouseEventHandler<HTMLDivElement> = (event) => {
		// @ts-ignore
		if (event.target instanceof HTMLElement) {
			if (!document.getElementById('popupV2Popup-container')?.contains(event.target)) {
				const { onClose } = this.props;
				onClose();
			}
		}
	};

	/**
	 * Renders the popup component
	 */
	render() {
		const { closeButtonText, onClose, children, title, os, topOffset } = this.props;
		const { visible, position } = this.state;
		return (
			<div
				role='presentation'
				id='popupV2Popup-container'
				className='w-[100vw] absolute left-0 bg-black/25'
				style={{
					top: os === 'win32' && topOffset ? 32 : 0,
					height: window.innerHeight - (os === 'win32' && topOffset ? 32 : 0),
				}}
				onClick={this.handleOffClick}
			>
				<div
					role='presentation'
					id='popupV2Popup'
					className={`fixed origin-top-left z-50 max-w-[50vw] transition-opacity ${
						visible ? 'opacity-1' : 'opacity-0'
					}`}
					style={{
						top: position.y,
						left: position.x,
					}}
				>
					<div
						className='dark:bg-muted-800 bg-muted-600 rounded shadow-xl box-shadow-xl border dark:border-muted-700 border-muted-400 max-h-[600px]'>
						<div
							role='presentation'
							className='p-2 flex justify-start gap-4 items-center text-lg border-b dark:border-muted-700 border-muted-400'
							draggable='true'
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
							<img className='h-6' src={destinyMountainImage} alt={window.t.translate('Logo')} />
							<span>{title}</span>
						</div>
						<div className='py-2 px-4 overflow-y-auto max-h-[508px]'>{children}</div>
						<div
							className='py-2 px-4 flex justify-end gap-4 items-center text-sm border-t dark:border-muted-700 border-muted-400'>
							<Button
								buttonType='primary'
								className='py-1 px-2 border dark:border-muted-700 border-muted-400 rounded hover:bg-white/25'
								size='sm'
								onClick={onClose}>
								{closeButtonText}
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default PopupV2;
