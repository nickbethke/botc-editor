import React from 'react';

export type PopupProps = {
	label: string;
	content: JSX.Element | string;
	closeText?: string;
	onClose?: () => void;
	closeButton?: boolean;
};
type PopupStats = {
	visible: boolean;
};

class Popup extends React.Component<PopupProps, PopupStats> {
	static get defaultProps() {
		return {
			closeText: 'Schließen',
			onClose: null,
			closeButton: true,
		};
	}

	constructor(props: PopupProps) {
		super(props);
		this.handleClose = this.handleClose.bind(this);
		this.state = { visible: true };
	}

	handleClose = () => {
		this.setState({ visible: false });
		const { onClose } = this.props;
		if (onClose) onClose();
	};

	render() {
		const { visible } = this.state;
		const { content, closeText, label, closeButton } = this.props;
		if (!visible) {
			return null;
		}
		return (
			<div role="dialog" className="absolute w-[100vw] h-[100vh] top-0 left-0 bg-background-800/75">
				<div>
					<div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
						<div className="p-8 bg-accent-700 text-white">
							<div className="text-center text-3xl mb-8 font-flicker tracking-widest">{label}</div>
							<div className="mb-8">{content}</div>
							{closeButton ? (
								<div className="flex flex-row gap-8">
									<button
										type="button"
										className="w-full border border-white p-4 hover:bg-accent-500 text-lg"
										onClick={this.handleClose}
									>
										{closeText}
									</button>
								</div>
							) : null}
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Popup;
