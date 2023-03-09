import React from 'react';
import destinyMountainImage from '../../../../assets/texturepacks/default/schicksalsberg.png';

type ConfirmPopupV2Props = {
	title: string;
	abortButtonText: string;
	onAbort: () => void;
	confirmButtonText: string;
	onConfirm: () => void;
	children: string | JSX.Element | JSX.Element[];
	position: { x: number; y: number };
	onPositionChange: (
		position: { x: number; y: number },
		callback: () => void
	) => void;
	onDimensionChange: (dimension: { width: number; height: number }) => void;
	os: NodeJS.Platform;
};
type ConfirmPopupV2State = {
	isDragged: boolean;
	rel: { x: number; y: number };
	visible: boolean;
};

class ConfirmPopupV2 extends React.Component<
	ConfirmPopupV2Props,
	ConfirmPopupV2State
> {
	constructor(props: ConfirmPopupV2Props) {
		super(props);
		this.state = {
			isDragged: false,
			rel: { x: 0, y: 0 },
			visible: false,
		};
	}

	componentDidMount() {
		const popup = document.getElementById('popupV2');
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

	render() {
		const {
			confirmButtonText,
			abortButtonText,
			onConfirm,
			onAbort,
			children,
			title,
			position,
			onPositionChange,
			os,
		} = this.props;
		const { visible } = this.state;
		return (
			<div
				className="w-[100vw] absolute left-0 bg-black/50"
				style={{
					top: os === 'win32' ? 32 : 0,
					height: window.innerHeight - (os === 'win32' ? 32 : 0),
				}}
			>
				<div
					id="popupV2"
					className={`fixed origin-top-left z-50 max-w-[33.333vw] transition transition-opacity ${
						visible ? 'opacity-1' : 'opacity-0'
					}`}
					style={{
						top: position.y,
						left: position.x,
					}}
				>
					<div className="dark:bg-muted-800 rounded shadow-xl box-shadow-xl border dark:border-muted-700 border-muted-400">
						<div
							role="presentation"
							className="p-2 flex justify-start gap-4 items-center text-lg border-b dark:border-muted-700 border-muted-400"
							draggable
							onMouseDown={(e) => {
								const { isDragged } = this.state;
								if (!isDragged) {
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
								if (!isDragged) return;
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
								this.setState({ isDragged: false });
								e.stopPropagation();
								e.preventDefault();
							}}
							onMouseLeave={() => {
								this.setState({ isDragged: false });
							}}
						>
							<img
								className="h-6"
								src={destinyMountainImage}
								alt={window.languageHelper.translate('Logo')}
							/>
							<span>{title}</span>
						</div>
						<div className="py-2 px-4">{children}</div>
						<div className="py-2 px-4 flex justify-end gap-4 items-center text-sm">
							<button
								className="py-1 px-2 bg-accent-600 rounded"
								type="button"
								onClick={onConfirm}
							>
								{confirmButtonText}
							</button>
							<button
								className="py-1 px-2 border dark:border-muted-700 border-muted-400 rounded"
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

export default ConfirmPopupV2;
