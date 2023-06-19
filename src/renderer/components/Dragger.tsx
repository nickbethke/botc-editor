import React from 'react';

type DraggerProps = {
	os: NodeJS.Platform;
	children?: React.ReactNode;
	classNameMac?: string;
	classNameWin?: string;
};

function Dragger(props: DraggerProps) {
	const { os, children, classNameMac, classNameWin } = props;
	if (os === 'win32') {
		return (
			<div className={`dragger w-[100vw] h-8 bg-muted flex items-center px-2 text-sm ${classNameWin}`}>{children}</div>
		);
	}
	if (os === 'darwin') {
		// return <div className={`fixed top-0 right-0 dragger h-8 w-[100vw] z-50 ${classNameMac}`} />;
	}
	return null;
}

Dragger.defaultProps = {
	children: null,
	classNameMac: '',
	classNameWin: '',
};

export default Dragger;
