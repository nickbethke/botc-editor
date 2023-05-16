import React from 'react';

export function HomeScreenButton(props: { text: string; onClick: () => void; tabIndex: number; last?: boolean }) {
	const {onClick, tabIndex, text, last} = props;
	return (
		<span
			role="presentation"
			tabIndex={tabIndex}
			className={`text-lg xl:text-xl 2xl:text-2xl cursor-pointer hover font-flicker tracking-widest ${last ? 'last' : ''}`}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
					onClick();
				}

			}}>
			{text}
		</span>
	);
}

HomeScreenButton.defaultProps = {last: false};

export function HomeMenuSeparator() {
	return <hr className="dark:border-muted-600 border-white my-1"/>;
}
