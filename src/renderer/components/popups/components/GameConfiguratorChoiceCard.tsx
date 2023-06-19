/* eslint-disable jsx-a11y/no-autofocus */
import React, { MouseEventHandler } from 'react';

type GameConfiguratorChoiceCardProps = {
	text: string;
	bgImage: string;
	onClickAction: MouseEventHandler<HTMLButtonElement>;
};

type GameConfiguratorChoiceCardState = {
	hover: boolean;
};

class GameConfiguratorChoiceCard extends React.Component<
	GameConfiguratorChoiceCardProps,
	GameConfiguratorChoiceCardState
> {
	constructor(props: GameConfiguratorChoiceCardProps) {
		super(props);
		this.state = { hover: false };
		this.handleHover = this.handleHover.bind(this);
	}

	handleHover = () => {
		const { hover } = this.state;
		this.setState({ hover: !hover });
	};

	render() {
		const { text, bgImage } = this.props;
		const { hover } = this.state || { hover: false };
		const { onClickAction } = this.props;
		const onclick = onClickAction?.bind(this);
		return (
			<button
				type="button"
				className="relative w-[50%] h-[400px] xl:h-[500px] 2xl:h-[600px] shadow-2xl hover:cursor-pointer"
				onMouseEnter={this.handleHover}
				onMouseLeave={this.handleHover}
				onClick={onclick}
			>
				<div className="absolute top-0 left-0 h-full w-full z-0">
					<div
						style={{
							backgroundImage: `url("${bgImage}")`,
							backgroundPosition: 'center',
							backgroundSize: 'cover',
						}}
						className="absolute top-0 left-0 w-full h-full"
					/>
					<div
						className={`transition-all absolute top-0 left-0 w-full h-full${
							hover ? ' bg-background-800/0' : ' bg-background-800/50'
						}`}
					/>
				</div>
				<div className="z-20 absolute top-0 left-0 h-full w-full">
					<div
						className={`transition-all absolute bottom-0 text-center w-full font-flicker tracking-widest ${
							hover ? 'bg-accent-500 p-6 text-2xl' : 'bg-background-800/50 p-4 text-xl'
						}`}
					>
						{text}
					</div>
				</div>
			</button>
		);
	}
}

export default GameConfiguratorChoiceCard;
