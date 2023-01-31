import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  validate: (json: object, type: 'partie' | 'board') => {
    console.log('INVOKE: validate:json');
    return ipcRenderer.invoke('validate:json', json, type);
  },
  dialog: {
    openConfig: () => {
      console.log('INVOKE: dialog:openConfig');
      return ipcRenderer.invoke('dialog:openConfig');
    },
    openBoardConfig: () => {
      console.log('INVOKE: dialog:openBoardConfig');
      return ipcRenderer.invoke('dialog:openBoardConfig');
    },
    openPartieConfig: () => {
      console.log('INVOKE: dialog:openPartieConfig');
      return ipcRenderer.invoke('dialog:openPartieConfig');
    },
    savePartieConfig: (json: string) => {
      console.log('INVOKE: dialog:savePartieConfig');
      return ipcRenderer.invoke('dialog:savePartieConfig', json);
    },
    saveBoardConfig: (json: string) => {
      console.log('INVOKE: dialog:saveBoardConfig');
      return ipcRenderer.invoke('dialog:saveBoardConfig', json);
    },
  },
  app: {
    close() {
      console.log('INVOKE: CLOSING');
      ipcRenderer.invoke('app-close');
    },
  },
});
