---
title: renderer/components/generator/helper/DirectionHelper.ts
nav_order: 20
parent: Modules
---

## DirectionHelper overview

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [DirectionHelper (class)](#directionhelper-class)
    - [dirEnumToString (static method)](#direnumtostring-static-method)
    - [~~directionToDirEnum~~ (static method)](#directiontodirenum-static-method)
    - [string2DirEnum (static method)](#string2direnum-static-method)
    - [getNextDirection (static method)](#getnextdirection-static-method)
    - [getPreviousDirection (static method)](#getpreviousdirection-static-method)

---

# utils

## DirectionHelper (class)

The direction helper class.

**Signature**

```ts
export declare class DirectionHelper
```

### dirEnumToString (static method)

Converting a direction enum value to its correlating string

**Signature**

```ts
static dirEnumToString(direction: DirectionEnum): Direction
```

### ~~directionToDirEnum~~ (static method)

Converting a direction to its correlating enum value

**Signature**

```ts
static directionToDirEnum(directionString: Direction): DirectionEnum
```

### string2DirEnum (static method)

Converting a direction string to its correlating enum value

**Signature**

```ts
static string2DirEnum(directionString: string): DirectionEnum
```

### getNextDirection (static method)

**Signature**

```ts
static getNextDirection(direction: Direction): Direction
```

### getPreviousDirection (static method)

**Signature**

```ts
static getPreviousDirection(direction: Direction): Direction
```
