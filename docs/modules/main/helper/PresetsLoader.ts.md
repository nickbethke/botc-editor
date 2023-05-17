---
title: main/helper/PresetsLoader.ts
nav_order: 7
parent: Modules
---

## PresetsLoader overview

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [BoardPreset (type alias)](#boardpreset-type-alias)
  - [BoardPresetWithFile (type alias)](#boardpresetwithfile-type-alias)
  - [PresetsLoader (class)](#presetsloader-class)
    - [generateFolders (static method)](#generatefolders-static-method)
    - [getRiverPresets (static method)](#getriverpresets-static-method)
    - [getBoardPresets (static method)](#getboardpresets-static-method)
    - [validateFile (static method)](#validatefile-static-method)
    - [saveRiverPreset (static method)](#saveriverpreset-static-method)
    - [renameRiverPreset (static method)](#renameriverpreset-static-method)
  - [RiverPreset (type alias)](#riverpreset-type-alias)
  - [RiverPresetWithFile (type alias)](#riverpresetwithfile-type-alias)

---

# utils

## BoardPreset (type alias)

The board preset schema

**Signature**

```ts
export type BoardPreset = {
  name: string
  width: number
  height: number
  data: object
}
```

## BoardPresetWithFile (type alias)

The board preset schema with file property

**Signature**

```ts
export type BoardPresetWithFile = BoardPreset & {
  file: ParsedPath
}
```

## PresetsLoader (class)

The preset loader class

**Signature**

```ts
export declare class PresetsLoader
```

### generateFolders (static method)

Generates the required folder structure

**Signature**

```ts
private static generateFolders()
```

### getRiverPresets (static method)

Loads the river presets

**Signature**

```ts
public static getRiverPresets()
```

### getBoardPresets (static method)

Loads the board presets

**Signature**

```ts
public static getBoardPresets()
```

### validateFile (static method)

Validates the file content

**Signature**

```ts
static validateFile(type: 'river' | 'board', content: string)
```

### saveRiverPreset (static method)

Saves a river preset to file

**Signature**

```ts
static saveRiverPreset(file: string, content: string)
```

### renameRiverPreset (static method)

Renames a river preset

**Signature**

```ts
static async renameRiverPreset(from: string, to: string): Promise<ParsedPath>
```

## RiverPreset (type alias)

The river preset scheme

**Signature**

```ts
export type RiverPreset = {
  name: string
  width: number
  height: number
  data: {
    position: Position
    direction: Direction
  }[]
}
```

## RiverPresetWithFile (type alias)

The river preset schema with file property

**Signature**

```ts
export type RiverPresetWithFile = RiverPreset & {
  file: ParsedPath
}
```
