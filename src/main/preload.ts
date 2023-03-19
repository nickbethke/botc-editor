import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { ParsedPath } from 'path';
import BoardConfigInterface from '../renderer/components/interfaces/BoardConfigInterface';
import PartieConfigInterface from '../renderer/components/interfaces/PartieConfigInterface';
import { BoardPreset, RiverPreset } from './helper/PresetsLoader';
import { SettingsInterface } from '../interfaces/SettingsInterface';

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
		openConfig: (): Promise<
			| {
					parsedPath: ParsedPath;
					path: string;
					config: BoardConfigInterface;
			  }
			| false
		> => {
			return ipcRenderer.invoke('dialog:openConfig');
		},
		openBoardConfig: (): Promise<
			| {
					parsedPath: ParsedPath;
					path: string;
					config: BoardConfigInterface;
			  }
			| false
		> => {
			return ipcRenderer.invoke('dialog:openBoardConfig');
		},
		openPartieConfig: (): Promise<
			| {
					parsedPath: ParsedPath;
					path: string;
					config: PartieConfigInterface;
			  }
			| false
		> => {
			return ipcRenderer.invoke('dialog:openPartieConfig');
		},
		savePartieConfig: (
			json: string
		): Promise<
			| {
					parsedPath: ParsedPath;
					path: string;
			  }
			| false
		> => {
			return ipcRenderer.invoke('dialog:savePartieConfig', json);
		},
		saveBoardConfig: (
			json: string
		): Promise<
			| {
					parsedPath: ParsedPath;
					path: string;
			  }
			| false
		> => {
			return ipcRenderer.invoke('dialog:saveBoardConfig', json);
		},
		saveScreenShot(file: string, content: string): Promise<boolean> {
			return ipcRenderer.invoke('dialog:saveScreenshot', file, content);
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
		prefetch(): Promise<{
			os: NodeJS.Platform;
			settings: SettingsInterface;
		}> {
			return ipcRenderer.invoke('get:prefetch');
		},
		updateSettings(
			settings: SettingsInterface
		): Promise<SettingsInterface> {
			return ipcRenderer.invoke('update:settings', settings);
		},
		beep(): Promise<void> {
			return ipcRenderer.invoke('beep');
		},
	},
	load: {
		presets(): Promise<{
			rivers: Array<RiverPreset>;
			boards: Array<BoardPreset>;
		}> {
			return ipcRenderer.invoke('load:presets');
		},
	},
	file: {
		openPresetDir() {
			return ipcRenderer.invoke('file:openPresetDir');
		},
		openExternal(file: string) {
			return ipcRenderer.invoke('file:openExternal', file);
		},
		openDir(file: string) {
			return ipcRenderer.invoke('file:openDir', file);
		},
		save(file: string, content: string): Promise<true | string> {
			return ipcRenderer.invoke('file:save', file, content);
		},
		remove(file: string): Promise<true | string> {
			return ipcRenderer.invoke('file:remove', file);
		},
		getTranslation(lang: string): Promise<Array<[string, string]> | []> {
			return ipcRenderer.invoke('file:getTranslation', lang);
		},
	},
	open: {
		homepage() {
			return ipcRenderer.invoke('open:homepage');
		},
	},
	clipboard: {
		write(text: string): Promise<void> {
			return ipcRenderer.invoke('clipboard:write', text);
		},
	},
});
