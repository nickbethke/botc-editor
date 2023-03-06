import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import TranslationHelper, {
	AvailableLanguages,
} from './helper/TranslationHelper';

window.languageHelper = new TranslationHelper(AvailableLanguages.de);

const container = document.getElementById('root');
if (container) {
	const root = createRoot(container);
	root.render(
		<React.StrictMode>
			<App />
		</React.StrictMode>
	);
}
