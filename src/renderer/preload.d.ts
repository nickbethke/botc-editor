import { Channels } from 'main/preload';
import { PartieConfigSchema } from './components/PartieKonfigurator';
import { BoardConfigSchema } from './components/BoardKonfigurator';

declare global {
  interface Window {
    electron: {
      dialog: {
        openConfig(): PartieConfigSchema | BoardConfigSchema,
        openBoardConfig(): BoardConfigSchema,
        openPartieConfig(): PartieConfigSchema,
        savePartieConfig(json: string): Promise<boolean>
      };
      validate(json: object): boolean | string;
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
