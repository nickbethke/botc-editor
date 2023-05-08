import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import TranslationHelper, {AvailableLanguages} from './helper/TranslationHelper';
import InitialLoader from "./components/InitialLoader";


const run = async () => {
	window.t = new TranslationHelper(AvailableLanguages.de);
	const prefetch = await window.electron.app.prefetch()
	const container = document.getElementById('root');
	if (container) {
		const root = createRoot(container);
		root.render(<App os={prefetch.os} settings={prefetch.settings}/>);
		return Promise.resolve();
	} else {
		return Promise.reject('No root element found');
	}
}
const container = document.getElementById('root');
if (container) {
	const root = createRoot(container);
	root.render(<InitialLoader/>);
} else {
	console.error('No root element found');
}
setTimeout(() => {
	run().catch(console.error);
}, 1000);

