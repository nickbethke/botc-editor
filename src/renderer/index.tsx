import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import TranslationHelper from './helper/TranslationHelper';
import InitialLoader from './components/InitialLoader';

const container = document.getElementById('root');
const root = createRoot(container ? container : document.createElement('div'));

const run = async () => {
	const prefetch = await window.electron.app.prefetch();
	window.t = new TranslationHelper(TranslationHelper.stringToEnum(prefetch.settings.language));
	root.render(<App os={prefetch.os} settings={prefetch.settings} />);
	return Promise.resolve();
};
root.render(<InitialLoader />);
setTimeout(() => {
	run().catch(console.error);
}, 1000);

