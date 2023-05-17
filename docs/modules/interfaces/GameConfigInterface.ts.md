---
title: interfaces/GameConfigInterface.ts
nav_order: 2
parent: Modules
---

## GameConfigInterface overview

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [GameConfigInterface (interface)](#gameconfiginterface-interface)
  - [GameConfigWithPath (type alias)](#gameconfigwithpath-type-alias)
  - [PathInterface (type alias)](#pathinterface-type-alias)

---

# utils

## GameConfigInterface (interface)

The party configuration type

**Signature**

```ts
interface GameConfigInterface {
  startLembas: number
  shotLembas: number
  cardSelectionTimeout: number
  characterChoiceTimeout: number
  riverMoveCount: number
  serverIngameDelay: number
  reviveRounds: number
  maxRounds: number

  [k: string]: unknown
}
```

## GameConfigWithPath (type alias)

**Signature**

```ts
export type GameConfigWithPath = PathInterface & {
  config: GameConfigInterface
}
```

## PathInterface (type alias)

**Signature**

```ts
export type PathInterface = {
  parsedPath: ParsedPath
  path: string
}
```
