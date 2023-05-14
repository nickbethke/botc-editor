import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { ParsedPath } from 'path';
import BoardConfigInterface from '../interfaces/BoardConfigInterface';
import GameConfigInterface from '../interfaces/GameConfigInterface';
import { RiverPresetWithFile } from './helper/PresetsLoader';
import { SettingsInterface } from '../interfaces/SettingsInterface';
import { ConfigType } from '../interfaces/Types';

export type Channels = 'enter-full-screen' | 'leave-full-screen';

const electronHandler = {
	ipcRenderer: {
		on(channel: Channels, func: (...args: unknown[]) => void) {
			const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => func(...args);
			ipcRenderer.on(channel, subscription);

			return () => {
				ipcRenderer.removeListener(channel, subscription);
			};
		},
		once(channel: Channels, func: (...args: unknown[]) => void) {
			ipcRenderer.once(channel, (_event, ...args) => func(...args));
		},
	},
	validate: (json: object, type: ConfigType): Promise<boolean | string> => {
		return ipcRenderer.invoke('validate:json', json, type);
	},
	schemas: {
		game: () => {
			return ipcRenderer.invoke('schemas:game');
		},
		board: () => {
			return ipcRenderer.invoke('schemas:board');
		},
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
		openGameConfiguration: (): Promise<
			| {
			parsedPath: ParsedPath;
			path: string;
			config: GameConfigInterface;
		}
			| false
		> => {
			return ipcRenderer.invoke('dialog:openGameConfig');
		},
		saveGameConfiguration: (
			json: string,
		): Promise<
			| {
			parsedPath: ParsedPath;
			path: string;
		}
			| false | 'canceled'
		> => {
			return ipcRenderer.invoke('dialog:saveGameConfig', json);
		},
		saveBoardConfig: (
			json: string,
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
		getVersion() {
			return ipcRenderer.invoke('get:version');
		},
		prefetch(): Promise<{
			os: NodeJS.Platform;
			settings: SettingsInterface;
		}> {
			return ipcRenderer.invoke('get:prefetch');
		},
		updateSettings(settings: SettingsInterface): Promise<SettingsInterface> {
			return ipcRenderer.invoke('update:settings', settings);
		},
		beep(): Promise<void> {
			return ipcRenderer.invoke('beep');
		},
	},
	load: {
		riverPresets(): Promise<Array<RiverPresetWithFile>> {
			return ipcRenderer.invoke('load:riverPresets');
		},
		boardPresets(): Promise<Array<RiverPresetWithFile>> {
			return ipcRenderer.invoke('load:boardPresets');
		},
	},
	file: {
		openPresetDir() {
			return ipcRenderer.invoke('file:openPresetDir');
		},
		openExternal(file: string) {
			return ipcRenderer.invoke('file:openExternal', file);
		},
		save(file: string, content: string): Promise<true | string> {
			return ipcRenderer.invoke('file:save', file, content);
		},
		savePreset(file: string, content: string): Promise<boolean> {
			return ipcRenderer.invoke('file:savePreset', file, content);
		},
		remove(file: string): Promise<true | string> {
			return ipcRenderer.invoke('file:remove', file);
		},
		getTranslation(lang: string): Promise<string> {
			return ipcRenderer.invoke('file:getTranslation', lang);
		},
		renamePreset(from: string, to: string): Promise<ParsedPath> {
			return ipcRenderer.invoke('file:renamePreset', from, to);
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
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
