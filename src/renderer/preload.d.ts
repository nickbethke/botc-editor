import { Channels } from 'main/preload';
import { PartieConfigSchema } from './components/PartieKonfigurator';

declare global {
  interface Window {
    electron: {
      dialog: {
        openBoardConfig(): object,
        openPartieConfig(): PartieConfigSchema,
        savePartieConfig(json: string): Promise<boolean>
      };
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
