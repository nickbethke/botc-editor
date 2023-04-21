import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import TranslationHelper, { AvailableLanguages } from './helper/TranslationHelper';

window.translationHelper = new TranslationHelper(AvailableLanguages.de);
window.electron.app
	.prefetch()
	.then((prefetch) => {
		const container = document.getElementById('root');
		if (container) {
			const root = createRoot(container);
			root.render(<App os={prefetch.os} settings={prefetch.settings} />);
		}
		return null;
	})
	.catch(() => {});
