---
title: main/helper/IPCHelper.ts
nav_order: 6
parent: Modules
---

## IPCHelper overview

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [IPCHelper (class)](#ipchelper-class)
    - [openFile (static method)](#openfile-static-method)
    - [openDirectory (static method)](#opendirectory-static-method)
    - [openDirectoryDirectly (static method)](#opendirectorydirectly-static-method)
    - [saveFile (static method)](#savefile-static-method)
    - [saveScreenShotDialog (static method)](#savescreenshotdialog-static-method)
    - [removeFile (static method)](#removefile-static-method)
    - [loadLanguageFile (static method)](#loadlanguagefile-static-method)
    - [getAssetPath (static method)](#getassetpath-static-method)
    - [clipBoardWrite (static method)](#clipboardwrite-static-method)
    - [prefetch (static method)](#prefetch-static-method)
    - [updateSettings (static method)](#updatesettings-static-method)
    - [savePreset (static method)](#savepreset-static-method)
    - [renamePreset (static method)](#renamepreset-static-method)
    - [getSchemaGame (static method)](#getschemagame-static-method)
    - [getSchemaBoard (static method)](#getschemaboard-static-method)
    - [openPresetDir (static method)](#openpresetdir-static-method)

---

# utils

## IPCHelper (class)

The ipc helper class.

**Signature**

```ts
export declare class IPCHelper
```

### openFile (static method)

**Signature**

```ts
static openFile(file: string): void
```

### openDirectory (static method)

**Signature**

```ts
static openDirectory(file: string): void
```

### openDirectoryDirectly (static method)

**Signature**

```ts
static openDirectoryDirectly(dir: string): void
```

### saveFile (static method)

**Signature**

```ts
static saveFile(file: string, content: string): boolean | string
```

### saveScreenShotDialog (static method)

**Signature**

```ts
static async saveScreenShotDialog(file: string, content: string, window: BrowserWindow | null): Promise<boolean>
```

### removeFile (static method)

**Signature**

```ts
static removeFile(file: string): boolean | string
```

### loadLanguageFile (static method)

**Signature**

```ts
static loadLanguageFile(lang: string): string
```

### getAssetPath (static method)

**Signature**

```ts
static getAssetPath(...paths: string[]): string
```

### clipBoardWrite (static method)

**Signature**

```ts
static clipBoardWrite(text: string): void
```

### prefetch (static method)

Prefetches the needed resources for the current platform and the settings

**Signature**

```ts
static prefetch(): {
		os: NodeJS.Platform;
		settings: SettingsInterface;
	}
```

### updateSettings (static method)

**Signature**

```ts
static updateSettings(settings: SettingsInterface): SettingsInterface
```

### savePreset (static method)

**Signature**

```ts
static savePreset(file: string, content: string): void
```

### renamePreset (static method)

**Signature**

```ts
static renamePreset(from: string, to: string): Promise<path.ParsedPath>
```

### getSchemaGame (static method)

**Signature**

```ts
static getSchemaGame(): object
```

### getSchemaBoard (static method)

**Signature**

```ts
static getSchemaBoard(): object
```

### openPresetDir (static method)

**Signature**

```ts
static openPresetDir(): void
```
