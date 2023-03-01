import { Channels } from 'main/preload';
import { ParsedPath } from 'path';
import { RiverPreset } from '../main/helper/PresetsLoader';
import PartieConfigInterface from './components/interfaces/PartieConfigInterface';
import BoardConfigInterface from './components/interfaces/BoardConfigInterface';

declare global {
	interface Window {
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
				openBoardConfig(): Promise<BoardConfigInterface>;
				openPartieConfig(): Promise<PartieConfigInterface>;
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
				presets(): Promise<Array<RiverPreset>>;
			};
			file: {
				openExternal(file: string): void;
				openDir(file: string): void;
				save(file: string, content: string): Promise<true | string>;
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
