import { Channels } from 'main/preload';
import PartieConfigInterface from '../schema/interfaces/partieConfigInterface';
import BoardConfigInterface from '../schema/interfaces/boardConfigInterface';
import { RiverPreset } from '../main/helper/PresetsLoader';
import { RandomBoardStartValues } from './components/RandomBoardStartValuesDialog';

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
			generateRandomBoard(
				startValues: RandomBoardStartValues
			): Promise<{ board: BoardConfigInterface; preview: string }>;
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
