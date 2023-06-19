import React, { Component } from 'react';
import _uniqueId from 'lodash/uniqueId';

type ButtonProps = {
	type?: Readonly<'button' | 'submit' | 'reset' | undefined>;
	onClick?: () => void;
	className?: string;
	disabled?: boolean;
	buttonType?: 'primary' | 'secondary' | 'default';
	border?: 'l' | 'r' | 't' | 'b' | 'x' | 'y' | 'tr' | 'tl' | 'br' | 'bl' | 'none' | 'default';
	size?: 'sm' | 'md' | 'lg';
	icon?: React.JSX.Element;
	children?: React.JSX.Element | string | React.JSX.Element[] | string[];
};

export default class Button extends Component<ButtonProps> {
	static get defaultProps() {
		return {
			buttonType: 'default',
			disabled: false,
			border: 'default',
			size: 'md',
			icon: null,
			children: null,
			className: '',
			onClick: () => {},
			type: 'button',
		};
	}

	getSizeClass = () => {
		const { size } = this.props;
		switch (size) {
			case 'sm':
				return 'px-2 py-1 text-sm';
			case 'lg':
				return 'px-4 py-2 text-lg';
			case 'md':
			default:
				return 'px-3 py-2 text-base';
		}
	};

	getBorderClass = () => {
		const { border } = this.props;
		switch (border) {
			case 'l':
				return 'rounded-l';
			case 'r':
				return 'rounded-r';
			case 't':
				return 'rounded-t';
			case 'b':
				return 'rounded-b';
			case 'x':
				return 'rounded-l rounded-r';
			case 'y':
				return 'rounded-t rounded-b';
			case 'tr':
				return 'rounded-tr';
			case 'tl':
				return 'rounded-tl';
			case 'br':
				return 'rounded-br';
			case 'bl':
				return 'rounded-bl';
			case 'none':
				return '';
			case 'default':
			default:
				return 'rounded';
		}
	};

	getButtonTypeClass = () => {
		const { buttonType } = this.props;
		switch (buttonType) {
			case 'primary':
				return 'bg-accent-600 hover:bg-accent-500';
			case 'secondary':
				return 'bg-muted-400 hover:bg-muted-300 dark:bg-muted-700 dark:hover:bg-muted-600';
			default:
				return 'dark:border-muted-700 border border-muted-600 bg-muted-400 hover:bg-muted-300 dark:bg-muted-700 dark:hover:bg-muted-600';
		}
	};

	render() {
		const { type, onClick, className, disabled, icon, children } = this.props;
		return (
			<button
				type={type}
				disabled={disabled}
				className={`${this.getSizeClass()} ${this.getBorderClass()} inline-flex items-center gap-2 font-bold transition-all ${className} ${this.getButtonTypeClass()}`}
				onClick={onClick}
			>
				{icon}
				{children instanceof Array
					? children.map((child, index) => {
							return <div key={_uniqueId()}>{child}</div>;
					  })
					: children}
			</button>
		);
	}
}
