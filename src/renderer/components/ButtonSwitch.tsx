import { Component } from 'react';
import Button from './Button';

class ButtonSwitchLabel {
	title: string;
	value: string;

	constructor(title: string, value: string) {
		this.title = title;
		this.value = value;
	}
}

type ButtonSwitchProps = {
	value: string;
	onChange: (checked: ButtonSwitchLabel) => void;
	labels: [ButtonSwitchLabel, ButtonSwitchLabel];
}

type ButtonSwitchState = {
	checked: boolean;
}

export default class ButtonSwitch extends Component<ButtonSwitchProps, ButtonSwitchState> {
	static Label: typeof ButtonSwitchLabel = ButtonSwitchLabel;


	render() {
		return (
			<div className="flex items-center justify-center">
				<Button onClick={
					() => {
						this.props.onChange(this.props.labels[0]);
					}
				}
						border="l"
						buttonType={this.props.value === this.props.labels[0].value ? 'primary' : undefined}
				>
					{this.props.labels[0].title}
				</Button>
				<Button onClick={
					() => {
						this.props.onChange(this.props.labels[1]);
					}
				}
						border="r"
						buttonType={this.props.value === this.props.labels[1].value ? 'primary' : undefined}
				>
					{this.props.labels[1].title}
				</Button>
			</div>
		)
	}
}

ButtonSwitch.Label = ButtonSwitchLabel;
