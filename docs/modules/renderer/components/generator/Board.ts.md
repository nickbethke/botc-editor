---
title: renderer/components/generator/Board.ts
nav_order: 12
parent: Modules
---

## Board overview

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Board (class)](#board-class)
    - [generateRandom (static method)](#generaterandom-static-method)
    - [addCheckPoint (method)](#addcheckpoint-method)
    - [addStartField (method)](#addstartfield-method)
    - [setEye (method)](#seteye-method)
    - [addHole (method)](#addhole-method)
    - [addLembasField (method)](#addlembasfield-method)
    - [addRiverField (method)](#addriverfield-method)
    - [addWall (method)](#addwall-method)
    - [removeWall (method)](#removewall-method)
    - [checkPoints (property)](#checkpoints-property)
    - [eye (property)](#eye-property)
    - [height (property)](#height-property)
    - [holes (property)](#holes-property)
    - [lembasFields (property)](#lembasfields-property)
    - [name (property)](#name-property)
    - [riverFields (property)](#riverfields-property)
    - [startFields (property)](#startfields-property)
    - [walls (property)](#walls-property)
    - [width (property)](#width-property)

---

# utils

## Board (class)

The board class with the properties of a board configuration and helper functions.

**Signature**

```ts
export declare class Board {
  constructor(name: string, width: number, height: number)
}
```

### generateRandom (static method)

generate a random valid boardConfigurator via the BoardGeneration class

**Signature**

```ts
static generateRandom(startValues?: RandomBoardStartValues): BoardGenerator
```

### addCheckPoint (method)

Add a position to the checkPoints array

**Signature**

```ts
public addCheckPoint(position: BoardPosition)
```

### addStartField (method)

Add a position and direction to the startFields array

**Signature**

```ts
public addStartField(position: BoardPosition, direction: DirectionEnum)
```

### setEye (method)

Set the position and direction of saurons eye in the eye attribute

**Signature**

```ts
public setEye(position: BoardPosition, direction: DirectionEnum)
```

### addHole (method)

Add a position to the holes array

**Signature**

```ts
public addHole(position: BoardPosition)
```

### addLembasField (method)

Add a position and amount to the lembasFields array

**Signature**

```ts
public addLembasField(position: BoardPosition, amount: number)
```

### addRiverField (method)

Add a position and direction to the riverFields array

**Signature**

```ts
public addRiverField(position: BoardPosition, direction: DirectionEnum)
```

### addWall (method)

Add a wall position to the walls array

**Signature**

```ts
public addWall(position: [[number, number], [number, number]])
```

### removeWall (method)

Remove a wall from the configuration

**Signature**

```ts
public removeWall(position: Position[])
```

### checkPoints (property)

**Signature**

```ts
checkPoints: Position[]
```

### eye (property)

**Signature**

```ts
eye: PositionDirection
```

### height (property)

**Signature**

```ts
height: number
```

### holes (property)

**Signature**

```ts
holes: Position[]
```

### lembasFields (property)

**Signature**

```ts
lembasFields: LembasField[]
```

### name (property)

**Signature**

```ts
name: string
```

### riverFields (property)

**Signature**

```ts
riverFields: PositionDirection[]
```

### startFields (property)

**Signature**

```ts
startFields: PositionDirection[]
```

### walls (property)

**Signature**

```ts
walls: Position[][]
```

### width (property)

**Signature**

```ts
width: number
```
