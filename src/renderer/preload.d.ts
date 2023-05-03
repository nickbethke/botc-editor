import { ElectronHandler } from 'main/preload';
import TranslationHelper from './helper/TranslationHelper';

declare global {
	interface Window {
		t: TranslationHelper;
		electron: ElectronHandler;
	}
}

export {};
