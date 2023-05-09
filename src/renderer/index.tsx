import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import TranslationHelper, {AvailableLanguages} from './helper/TranslationHelper';
import InitialLoader from "./components/InitialLoader";

const container = document.getElementById('root');
const root = createRoot(container ? container : document.createElement('div'));

const run = async () => {
	window.t = new TranslationHelper(AvailableLanguages.de);
	const prefetch = await window.electron.app.prefetch()
	root.render(<App os={prefetch.os} settings={prefetch.settings}/>);
	return Promise.resolve();
}
root.render(<InitialLoader/>);
setTimeout(() => {
	run().catch(console.error);
}, 1000);

