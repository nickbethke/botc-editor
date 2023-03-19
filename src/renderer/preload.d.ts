import { Channels } from 'main/preload';
import { ParsedPath } from 'path';
import { BoardPreset, RiverPreset } from '../main/helper/PresetsLoader';
import PartieConfigInterface from './components/interfaces/PartieConfigInterface';
import BoardConfigInterface from './components/interfaces/BoardConfigInterface';
import TranslationHelper from './helper/TranslationHelper';
import { SettingsInterface } from '../interfaces/SettingsInterface';

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
				saveScreenShot(file: string, content: string): Promise<boolean>;
			};
			load: {
				presets(): Promise<{
					rivers: Array<RiverPreset>;
					boards: Array<BoardPreset>;
				}>;
			};
			file: {
				openPresetDir(): void;
				openExternal(file: string): void;
				openDir(file: string): void;
				save(file: string, content: string): Promise<true | string>;
				remove(file: string): Promise<true | string>;
				getTranslation(lang: string): Promise<string>;
			};
			validate(
				json: BoardConfigInterface | PartieConfigInterface,
				type: 'partie' | 'board'
			): Promise<true | string>;
			app: {
				close(): void;
				isWin(): Promise<boolean>;
				isLinux(): Promise<boolean>;
				isMac(): Promise<boolean>;
				getOS(): Promise<NodeJS.Platform>;
				getVersion(): Promise<string>;
				prefetch(): Promise<{
					os: NodeJS.Platform;
					settings: SettingsInterface;
				}>;
				updateSettings(settings: SettingsInterface): SettingsInterface;
				beep(): void;
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
			clipboard: {
				write(text: string): void;
			};
		};
	}
}

export {};
