import { Channels } from 'main/preload';
import PartieConfigInterface from '../schema/interfaces/partieConfigInterface';
import BoardConfigInterface from '../schema/interfaces/boardConfigInterface';

declare global {
  interface Window {
    electron: {
      dialog: {
        openConfig(): Promise<PartieConfigInterface | BoardConfigInterface>;
        openBoardConfig(): Promise<BoardConfigInterface>;
        openPartieConfig(): Promise<PartieConfigInterface>;
        savePartieConfig(json: string): Promise<boolean>;
        saveBoardConfig(json: string): Promise<boolean>;
      };
      validate(
        json: object,
        type: 'partie' | 'board'
      ): Promise<boolean | string>;
      app: { close(): void };
      ipcRenderer: {
        sendMessage(channel: Channels, args: unknown[]): void;
        on(
          channel: Channels,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: Channels, func: (...args: unknown[]) => void): void;
      };
    };
  }
}

export {};
