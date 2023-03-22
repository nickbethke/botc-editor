import React, { MouseEventHandler } from 'react';
import destinyMountainImage from '../../../../assets/textures/schicksalsberg.png';
import { SettingsInterface } from '../../../interfaces/SettingsInterface';

export type PopupV2Props = {
	title: string;
	closeButtonText: string;
	onClose: () => void;
	children: string | JSX.Element | JSX.Element[];
	position: { x: number; y: number };
	onPositionChange: (position: { x: number; y: number }, callback: () => void) => void;
	onDimensionChange: (dimension: { width: number; height: number }) => void;
	os: NodeJS.Platform;
	topOffset?: boolean;
	settings: SettingsInterface;
};
type PopupV2State = {
	isDragged: boolean;
	rel: { x: number; y: number };
	visible: boolean;
};

class PopupV2 extends React.Component<PopupV2Props, PopupV2State> {
	constructor(props: PopupV2Props) {
		super(props);
		this.state = {
			isDragged: false,
			rel: { x: 0, y: 0 },
			visible: false,
		};
		this.handleOffClick = this.handleOffClick.bind(this);
	}

	static get defaultProps() {
		return {
			topOffset: false,
		};
	}

	componentDidMount() {
		const popup = document.getElementById('popupV2Popup');
		const { onPositionChange, position, onDimensionChange } = this.props;
		if (popup) {
			onPositionChange(
				{
					x: position.x - popup.clientWidth / 2,
					y: position.y - popup.clientHeight / 2,
				},
				() => {
					setTimeout(() => {
						this.setState({ visible: true });
					}, 200);
				}
			);
			onDimensionChange({
				width: popup.clientWidth + 2,
				height: popup.clientHeight + 2,
			});
		}
	}

	handleOffClick: MouseEventHandler<HTMLDivElement> = () => {
		const { onClose } = this.props;
		onClose();
	};

	render() {
		const { closeButtonText, onClose, children, title, position, onPositionChange, os, topOffset } = this.props;
		const { visible } = this.state;
		return (
			<div
				role="presentation"
				id="popupV2Popup-container"
				className="w-[100vw] absolute left-0 bg-black/25"
				style={{
					top: os === 'win32' && topOffset ? 32 : 0,
					height: window.innerHeight - (os === 'win32' && topOffset ? 32 : 0),
				}}
				onClick={this.handleOffClick}
			>
				<div
					role="presentation"
					id="popupV2Popup"
					className={`fixed origin-top-left z-50 max-w-[50vw] transition transition-opacity ${
						visible ? 'opacity-1' : 'opacity-0'
					}`}
					style={{
						top: position.y,
						left: position.x,
					}}
				>
					<div className="dark:bg-muted-800 bg-muted-600 rounded shadow-xl box-shadow-xl border dark:border-muted-700 border-muted-400 max-h-[600px]">
						<div
							role="presentation"
							className="p-2 flex justify-start gap-4 items-center text-lg border-b dark:border-muted-700 border-muted-400"
							draggable
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
								onPositionChange(
									{
										x: event.pageX - rel.x,
										y: event.pageY - rel.y,
									},
									() => {}
								);
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
							<img className="h-6" src={destinyMountainImage} alt={window.languageHelper.translate('Logo')} />
							<span>{title}</span>
						</div>
						<div className="py-2 px-4 overflow-y-auto max-h-[508px]">{children}</div>
						<div className="py-2 px-4 flex justify-end gap-4 items-center text-sm border-t dark:border-muted-700 border-muted-400">
							<button
								className="py-1 px-2 border dark:border-muted-700 border-muted-400 rounded hover:bg-white/25"
								type="button"
								onClick={onClose}
							>
								{closeButtonText}
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default PopupV2;
