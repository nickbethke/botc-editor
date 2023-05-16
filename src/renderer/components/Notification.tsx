import React from 'react';
import { VscChromeClose } from 'react-icons/vsc';

type NotificationProps = {
	label: string;
};
type NotificationState = {
	visible: boolean;
};

class Notification extends React.Component<NotificationProps, NotificationState> {
	constructor(props: NotificationProps) {
		super(props);
		this.state = {visible: true};
	}

	close = () => {
		this.setState({visible: false});
	};

	render() {
		const {visible} = this.state;
		const {label} = this.props;
		return (
			<div
				className={`dark:bg-muted-100/25 bg-muted-100/10 border border-green-400 px-4 py-2 rounded flex items-center relative${
					!visible ? ' hidden' : ''
				}`}
				role="alert"
			>
				<span className="block sm:inline">{label}</span>
				<button
					type="button"
					className="ml-auto"
					onClick={() => {
						this.setState({visible: false});
					}}
				>
					<VscChromeClose onClick={this.close}/>
				</button>
			</div>
		);
	}
}

export default Notification;
