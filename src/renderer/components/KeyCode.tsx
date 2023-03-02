import React from 'react';
import _uniqueId from 'lodash/uniqueId';

type KeyCodeProps = {
	text: string;
	keyCodes: string[];
	delimiter?: string;
};

function KeyCode(props: KeyCodeProps) {
	const { text, keyCodes, delimiter } = props;
	const codes = keyCodes.map((code, index, array) =>
		index < array.length - 1 ? (
			<>
				<kbd className="border py-1 px-2 bg-[#29282d] shadow-[4px_4px_0_2px_rgb(0,0,0)]">
					{code}
				</kbd>
				<pre className="border border-transparent py-1 px-2">
					{delimiter}
				</pre>
			</>
		) : (
			<>
				<kbd className="border py-1 px-2 bg-[#29282d] shadow-[4px_4px_0_2px_rgb(0,0,0)]">
					{code}
				</kbd>
			</>
		)
	);
	const key = _uniqueId('key-code-');
	return (
		<div key={key} className="flex gap-4 items-center p-2">
			<div className="flex flex-row text-sm">{codes}</div>
			<div className="font-mono">{text}</div>
		</div>
	);
}

KeyCode.defaultProps = {
	delimiter: '+',
};

export default KeyCode;
