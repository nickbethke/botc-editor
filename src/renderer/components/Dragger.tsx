import React from 'react';

type DraggerProps = {
	os: NodeJS.Platform;
	children?: React.ReactNode;
};

const Dragger = (props: DraggerProps) => {
	const { os, children } = props;
	if (os === 'win32') {
		return <div className='dragger w-[100vw] h-8 bg-muted flex items-center px-2 text-sm'>{children}</div>;
	} else if (os === 'darwin') {
		return <div className='fixed top-0 right-0 dragger h-8 w-[100vw]' />;
	}
	return null;
};

export default Dragger;
