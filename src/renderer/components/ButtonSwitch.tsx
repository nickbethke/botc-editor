import { Component } from 'react';
import Button from './Button';
import { ButtonSwitchLabel } from './ButtonSwitchLabel';

type ButtonSwitchProps = {
	value: string;
	onChange: (checked: ButtonSwitchLabel) => void;
	labels: [ButtonSwitchLabel, ButtonSwitchLabel];
};

type ButtonSwitchState = {
	checked: boolean;
};

export default class ButtonSwitch extends Component<ButtonSwitchProps, ButtonSwitchState> {
	static Label: typeof ButtonSwitchLabel = ButtonSwitchLabel;

	render() {
		const { value, onChange, labels } = this.props;
		return (
			<div className="flex items-center justify-center">
				<Button
					onClick={() => {
						onChange(labels[0]);
					}}
					border="l"
					buttonType={value === labels[0].value ? 'primary' : undefined}
				>
					{labels[0].title}
				</Button>
				<Button
					onClick={() => {
						onChange(labels[1]);
					}}
					border="r"
					buttonType={value === labels[1].value ? 'primary' : undefined}
				>
					{labels[1].title}
				</Button>
			</div>
		);
	}
}

ButtonSwitch.Label = ButtonSwitchLabel;
