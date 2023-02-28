import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

contextBridge.exposeInMainWorld('electron', {
	ipcRenderer: {
		on(channel: Channels, func: (...args: unknown[]) => void) {
			const subscription = (
				_event: IpcRendererEvent,
				...args: unknown[]
			) => func(...args);
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
		return ipcRenderer.invoke('validate:json', json, type);
	},
	dialog: {
		openConfig: () => {
			return ipcRenderer.invoke('dialog:openConfig');
		},
		openBoardConfig: () => {
			return ipcRenderer.invoke('dialog:openBoardConfig');
		},
		openPartieConfig: () => {
			return ipcRenderer.invoke('dialog:openPartieConfig');
		},
		savePartieConfig: (json: string) => {
			return ipcRenderer.invoke('dialog:savePartieConfig', json);
		},
		saveBoardConfig: (json: string) => {
			return ipcRenderer.invoke('dialog:saveBoardConfig', json);
		},
	},
	app: {
		close() {
			return ipcRenderer.invoke('app-close');
		},
		isWin() {
			return ipcRenderer.invoke('get:isWin');
		},
		isMac() {
			return ipcRenderer.invoke('get:isMac');
		},
		isLinux() {
			return ipcRenderer.invoke('get:isLinux');
		},
		getOS() {
			return ipcRenderer.invoke('get:os');
		},
		getVersion() {
			return ipcRenderer.invoke('get:version');
		},
	},
	load: {
		presets() {
			return ipcRenderer.invoke('load:presets');
		},
	},
	file: {
		open(file: string) {
			return ipcRenderer.invoke('file:open', file);
		},
		openDir(file: string) {
			return ipcRenderer.invoke('file:openDir', file);
		},
	},
});
