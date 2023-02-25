import { Channels } from 'main/preload';
import { RiverPreset } from '../main/helper/PresetsLoader';
import PartieConfigInterface from './components/interfaces/PartieConfigInterface';
import BoardConfigInterface from './components/interfaces/BoardConfigInterface';

declare global {
	interface Window {
		electron: {
			dialog: {
				openConfig(): Promise<
					PartieConfigInterface | BoardConfigInterface
				>;
				openBoardConfig(): Promise<BoardConfigInterface>;
				openPartieConfig(): Promise<PartieConfigInterface>;
				savePartieConfig(json: string): Promise<boolean>;
				saveBoardConfig(json: string): Promise<boolean>;
			};
			load: {
				presets(): Promise<Array<RiverPreset>>;
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
