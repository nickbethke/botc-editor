import { RiverPreset, RiverPresetWithFile } from '../../../main/helper/PresetsLoader';

type EditorCacheStorageItem = { edited: boolean; preset: RiverPresetWithFile };
type EditorCacheStorage = Map<string, EditorCacheStorageItem>;

class EditorCache {
	private readonly cache: EditorCacheStorage;

	constructor() {
		this.cache = new Map();
	}

	public fileExists(fileName: string): boolean {
		return this.cache.has(fileName);
	}

	public addFile(preset: RiverPresetWithFile) {
		this.cache.set(preset.file.base, {
			edited: false,
			preset: structuredClone(preset),
		});
	}

	public updateFile(fileName: string, preset: RiverPresetWithFile, edited = true) {
		if (this.fileExists(fileName)) {
			this.cache.set(fileName, {
				edited,
				preset: structuredClone(preset),
			});
		}
	}

	public updatePreset(fileName: string, preset: RiverPreset, edited = true) {
		if (this.fileExists(fileName)) {
			const currentState = this.getFile(fileName);
			if (currentState) {
				this.cache.set(fileName, {
					edited,
					preset: { ...preset, file: currentState.preset.file },
				});
			}
		}
	}

	public getFile(fileName: string): EditorCacheStorageItem | null {
		if (this.fileExists(fileName)) {
			return this.cache.get(fileName) ?? null;
		}
		return null;
	}

	public getPreset(fileName: string): RiverPreset | null {
		if (this.fileExists(fileName)) {
			const preset = this.cache.get(fileName);
			return preset
				? {
						width: preset.preset.width,
						height: preset.preset.height,
						data: preset.preset.data,
						name: preset.preset.name,
				  }
				: null;
		}
		return null;
	}

	public deleteFile(fileName: string) {
		if (this.fileExists(fileName)) {
			this.cache.delete(fileName);
		}
	}

	public size() {
		return this.cache.size;
	}

	public hasUnsavedFiles(): boolean {
		let has = false;
		this.cache.forEach((value) => {
			if (value.edited) has = true;
		});
		return has;
	}

	getUnsavedFiles(): EditorCacheStorageItem[] {
		const unsaved: EditorCacheStorageItem[] = [];
		this.cache.forEach((value) => {
			if (value.edited) unsaved.push(value);
		});
		return unsaved;
	}
}

export default EditorCache;
