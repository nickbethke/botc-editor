import React from 'react';
import { pluginSymbol } from 'mini-css-extract-plugin';

type KeyCodeProps = {
	text: string;
	keyCodes: string[];
};

function KeyCode(props: KeyCodeProps) {
	const { text, keyCodes } = props;
	const codes = keyCodes.map((code, index, array) =>
		index < array.length - 1 ? (
			<>
				<kbd className="border py-1 px-2 shadow-[4px_4px_0_2px_rgb(0,0,0)]">
					{code}
				</kbd>
				<pre className="border border-transparent py-1 px-2">+</pre>
			</>
		) : (
			<kbd className="border py-1 px-2 shadow-[4px_4px_0_2px_rgb(0,0,0)]">
				{code}
			</kbd>
		)
	);
	return (
		<div className="flex gap-4 items-center ml-4">
			<div className="flex flex-row text-sm">{codes}</div>
			<div>{text}</div>
		</div>
	);
}

export default KeyCode;
