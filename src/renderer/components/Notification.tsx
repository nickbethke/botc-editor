import React from 'react';

type NotificationProps = {
	label: string;
};
type NotificationState = {
	visible: boolean;
};

class Notification extends React.Component<
	NotificationProps,
	NotificationState
> {
	constructor(props: NotificationProps) {
		super(props);
		this.state = { visible: true };
	}

	close = () => {
		this.setState({ visible: false });
	};

	render() {
		const { visible } = this.state;
		const { label } = this.props;
		return (
			<div
				className={`bg-green-100/50 border border-green-400 px-4 py-3 rounded relative${
					!visible ? ' hidden' : ''
				}`}
				role="alert"
			>
				<span className="block sm:inline">{label}</span>
				<button
					type="button"
					className="absolute top-0 bottom-0 right-0 px-4 py-3"
					onClick={() => {
						this.setState({ visible: false });
					}}
				>
					<svg
						className="fill-white h-6 w-6"
						role="button"
						xmlns="http://www.w3.org/2000/svg"
						onClick={this.close}
						viewBox="0 0 20 20"
					>
						<title>Close</title>
						<path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
					</svg>
				</button>
			</div>
		);
	}
}

export default Notification;
