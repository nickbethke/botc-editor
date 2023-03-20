import { ElectronHandler } from 'main/preload';
import TranslationHelper from './helper/TranslationHelper';

declare global {
	interface Window {
		languageHelper: TranslationHelper;
		electron: ElectronHandler;
	}
}

export {};
