---
title: renderer/helper/BoardConfigValidator.ts
nav_order: 23
parent: Modules
---

## BoardConfigValidator overview

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [BoardConfigValidator (class)](#boardconfigvalidator-class)
    - [getMaxDimension (static method)](#getmaxdimension-static-method)
    - [wallDoubleOccupancy (method)](#walldoubleoccupancy-method)
    - [checkDoubleOccupancy (method)](#checkdoubleoccupancy-method)
    - [checkDimensions (method)](#checkdimensions-method)
    - [errors (property)](#errors-property)

---

# utils

## BoardConfigValidator (class)

**Signature**

```ts
export declare class BoardConfigValidator {
  constructor(boardConfig: BoardConfigInterface)
}
```

### getMaxDimension (static method)

Calculate the max dimensions of the board and the given position

**Signature**

```ts
private static getMaxDimension(
		maxDimensions: { x: number; y: number },
		position: Position,
	): { x: number; y: number }
```

### wallDoubleOccupancy (method)

Check if a wall is double occupied

**Signature**

```ts
private wallDoubleOccupancy(): false | [Position, Position]
```

### checkDoubleOccupancy (method)

Check if a field is double occupied

**Signature**

```ts
private checkDoubleOccupancy(): false | Position
```

### checkDimensions (method)

Check if the board dimensions are big enough

**Signature**

```ts
private checkDimensions(): false | Position
```

### errors (property)

**Signature**

```ts
readonly errors: string[]
```
