import React, { MouseEventHandler } from 'react';

type BoardEditorChoiceCardProps = {
	text: string;
	bgImage: string;
	onClickAction: MouseEventHandler<HTMLButtonElement>;
	single?: boolean;
};

type BoardEditorChoiceCardState = {
	hover: boolean;
};

class BoardEditorChoiceCard extends React.Component<BoardEditorChoiceCardProps, BoardEditorChoiceCardState> {
	constructor(props: BoardEditorChoiceCardProps) {
		super(props);
		this.state = { hover: false };
		this.handleHover = this.handleHover.bind(this);
	}

	static get defaultProps() {
		return { single: false };
	}

	handleHover = () => {
		const { hover } = this.state;
		this.setState({ hover: !hover });
	};

	render() {
		const { text, bgImage, single } = this.props;
		const { hover } = this.state || { hover: false };
		const { onClickAction } = this.props;
		const onclick = onClickAction.bind(this);
		return (
			<button
				type="button"
				className={`relative ${
					single ? 'w-1/2' : 'w-1/3'
				} h-[400px] xl:h-[500px] 2xl:h-[600px] shadow-2xl hover:cursor-pointer`}
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
						className={`transition-all absolute bottom-0 text-center w-full text-xl${
							hover ? ' bg-accent-500 p-8' : ' bg-background-800/50 p-4'
						}`}
					>
						{text}
					</div>
				</div>
			</button>
		);
	}
}

export default BoardEditorChoiceCard;
