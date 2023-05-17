---
title: interfaces/BoardConfigInterface.ts
nav_order: 1
parent: Modules
---

## BoardConfigInterface overview

The board configuration type interface

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [BoardConfigInterface (interface)](#boardconfiginterface-interface)
  - [Direction (type alias)](#direction-type-alias)
  - [LembasField (interface)](#lembasfield-interface)
  - [Position (type alias)](#position-type-alias)
  - [PositionDirection (interface)](#positiondirection-interface)

---

# utils

## BoardConfigInterface (interface)

The board configuration type interface

**Signature**

```ts
interface BoardConfigInterface {
  checkPoints: Array<Position>
  eye: PositionDirection
  height: number
  holes: Array<Position>
  lembasFields: LembasField[]
  name: string
  riverFields: PositionDirection[]
  startFields: PositionDirection[]
  walls: Array<Array<Position>>
  width: number
}
```

## Direction (type alias)

The direction type

**Signature**

```ts
export type Direction = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST'
```

## LembasField (interface)

The lembas field type

**Signature**

```ts
export interface LembasField {
  amount: number
  position: Position
}
```

## Position (type alias)

The position type

**Signature**

```ts
export type Position = [number, number]
```

## PositionDirection (interface)

The position with direction interface

**Signature**

```ts
export interface PositionDirection {
  direction: Direction
  position: Position
}
```
