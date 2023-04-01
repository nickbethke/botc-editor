import React from 'react';
import { VscChromeClose } from 'react-icons/vsc';
import Notification from './Notification';

class Error extends Notification {
	render() {
		const { visible } = this.state;
		const { label } = this.props;
		return (
			<div
				className={`bg-muted-100/25 border border-red-400 px-4 py-2 rounded flex items-center relative${
					!visible ? ' hidden' : ''
				}`}
				role="alert"
			>
				<span className="block sm:inline">{label}</span>
				<button
					type="button"
					className="ml-auto"
					onClick={() => {
						this.setState({ visible: false });
					}}
				>
					<VscChromeClose onClick={this.close} />
				</button>
			</div>
		);
	}
}

export default Error;
