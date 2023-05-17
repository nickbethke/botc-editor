---
title: interfaces/SettingsInterface.ts
nav_order: 3
parent: Modules
---

## SettingsInterface overview

The settings interface

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [SettingsInterface (interface)](#settingsinterface-interface)

---

# utils

## SettingsInterface (interface)

The settings interface

**Signature**

```ts
export interface SettingsInterface {
  darkMode: boolean
  language: string
  popupsDraggable: boolean
  defaultValues: {
    defaultBoardName: string
    maxBoardSize: number
    maxCheckpoints: number
    maxLembasFields: number
    maxLembasCount: number
    maxHoles: number
  }
}
```
