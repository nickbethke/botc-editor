import { ElectronHandler } from 'main/preload';
import TranslationHelper from './helper/TranslationHelper';

declare global {
	interface Window {
		translationHelper: TranslationHelper;
		electron: ElectronHandler;
	}
}

export {};
