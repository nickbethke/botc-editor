import { Channels } from 'main/preload';
import { ParsedPath } from 'path';
import { BoardPreset, RiverPreset } from '../main/helper/PresetsLoader';
import PartieConfigInterface from './components/interfaces/PartieConfigInterface';
import BoardConfigInterface from './components/interfaces/BoardConfigInterface';
import TranslationHelper from './helper/TranslationHelper';

declare global {
	interface Window {
		languageHelper: TranslationHelper;
		electron: {
			dialog: {
				openConfig(): Promise<
					| {
							parsedPath: ParsedPath;
							path: string;
							config: BoardConfigInterface;
					  }
					| false
				>;
				openBoardConfig(): Promise<
					| {
							parsedPath: ParsedPath;
							path: string;
							config: BoardConfigInterface;
					  }
					| false
				>;
				openPartieConfig(): Promise<
					| {
							parsedPath: ParsedPath;
							path: string;
							config: PartieConfigInterface;
					  }
					| false
				>;
				savePartieConfig(json: string): Promise<
					| {
							parsedPath: ParsedPath;
							path: string;
					  }
					| false
				>;
				saveBoardConfig(json: string): Promise<
					| {
							parsedPath: ParsedPath;
							path: string;
					  }
					| false
				>;
			};
			load: {
				presets(): Promise<{
					rivers: Array<RiverPreset>;
					boards: Array<BoardPreset>;
				}>;
			};
			file: {
				openExternal(file: string): void;
				openDir(file: string): void;
				save(file: string, content: string): Promise<true | string>;
				remove(file: string): Promise<true | string>;
				getTranslation(lang: string): Promise<string>;
			};
			validate(
				json: object,
				type: 'partie' | 'board'
			): Promise<boolean | string>;
			app: {
				close(): void;
				isWin(): Promise<boolean>;
				isLinux(): Promise<boolean>;
				isMac(): Promise<boolean>;
				getOS(): Promise<NodeJS.Platform>;
				getVersion(): Promise<string>;
			};
			open: {
				homepage(): void;
			};
			ipcRenderer: {
				on(
					channel: Channels,
					func: (...args: unknown[]) => void
				): (() => void) | undefined;
				once(
					channel: Channels,
					func: (...args: unknown[]) => void
				): void;
			};
		};
	}
}

export {};
