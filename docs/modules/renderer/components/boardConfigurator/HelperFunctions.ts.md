---
title: renderer/components/boardConfigurator/HelperFunctions.ts
nav_order: 11
parent: Modules
---

## HelperFunctions overview

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [GetFieldTypeReturnValues (type alias)](#getfieldtypereturnvalues-type-alias)
  - [addCheckpoint](#addcheckpoint)
  - [addHole](#addhole)
  - [addLembasField](#addlembasfield)
  - [addRiver](#addriver)
  - [addStartField](#addstartfield)
  - [calculateRiverPresetFieldPositionWithRotation](#calculateriverpresetfieldpositionwithrotation)
  - [getCheckpointIndexConfig](#getcheckpointindexconfig)
  - [getDirectionFieldConfig](#getdirectionfieldconfig)
  - [getFieldType](#getfieldtype)
  - [getLembasFieldConfig](#getlembasfieldconfig)
  - [getNextDirection](#getnextdirection)
  - [getNextRotation](#getnextrotation)
  - [getPreviousRotation](#getpreviousrotation)
  - [isBoardConfiguration](#isboardconfiguration)
  - [isDestinyMountain](#isdestinymountain)
  - [moveSauronsEye](#movesauronseye)
  - [predictIfConfigurationIsBoardConfiguration](#predictifconfigurationisboardconfiguration)
  - [removeCheckpoint](#removecheckpoint)
  - [removeHole](#removehole)
  - [removeLembasField](#removelembasfield)
  - [removeRiver](#removeriver)
  - [removeStartField](#removestartfield)
  - [removeWall](#removewall)
  - [rotateDirection](#rotatedirection)
  - [updateLembasFieldAmount](#updatelembasfieldamount)
  - [updateRiverFieldDirection](#updateriverfielddirection)
  - [updateStartFieldDirection](#updatestartfielddirection)

---

# utils

## GetFieldTypeReturnValues (type alias)

The getFieldType return value type

**Signature**

```ts
export type GetFieldTypeReturnValues =
  | FieldsEnum.START
  | FieldsEnum.CHECKPOINT
  | FieldsEnum.EYE
  | FieldsEnum.HOLE
  | FieldsEnum.LEMBAS
  | FieldsEnum.RIVER
  | null
```

## addCheckpoint

adds a checkpoint to the board config

**Signature**

```ts
export declare function addCheckpoint(position: BoardPosition, config: BoardConfigInterface): BoardConfigInterface
```

## addHole

adds a hole field to the board config

**Signature**

```ts
export declare function addHole(position: BoardPosition, config: BoardConfigInterface): BoardConfigInterface
```

## addLembasField

adds a lembas field to the board config

**Signature**

```ts
export declare function addLembasField(position: BoardPosition, config: BoardConfigInterface): BoardConfigInterface
```

## addRiver

adds a river field to the board config

**Signature**

```ts
export declare function addRiver(
  position: BoardPosition,
  config: BoardConfigInterface,
  direction: Direction
): BoardConfigInterface
```

## addStartField

adds a start field to the board config

**Signature**

```ts
export declare function addStartField(
  position: BoardPosition,
  config: BoardConfigInterface,
  direction: Direction
): BoardConfigInterface
```

## calculateRiverPresetFieldPositionWithRotation

**Signature**

```ts
export declare function calculateRiverPresetFieldPositionWithRotation(
  position: [number, number],
  rotation: '0' | '90' | '180' | '270'
): BoardPosition
```

## getCheckpointIndexConfig

gets a checkpoint field index by its position from the board config

**Signature**

```ts
export declare function getCheckpointIndexConfig(position: BoardPosition, config: BoardConfigInterface): number | null
```

## getDirectionFieldConfig

gets the direction of a field in the board if it has a direction

**Signature**

```ts
export declare function getDirectionFieldConfig(
  position: BoardPosition,
  config: BoardConfigInterface
): PositionDirection | null
```

## getFieldType

get the field type of the position

**Signature**

```ts
export declare function getFieldType(position: BoardPosition, config: BoardConfigInterface): GetFieldTypeReturnValues
```

## getLembasFieldConfig

gets a lembas field by its position from the board config

**Signature**

```ts
export declare function getLembasFieldConfig(position: BoardPosition, config: BoardConfigInterface): LembasField | null
```

## getNextDirection

calculates the next direction value

**Signature**

```ts
export declare function getNextDirection(direction: Direction): Direction
```

## getNextRotation

calculates the next rotation value

**Signature**

```ts
export declare function getNextRotation(rotation: Rotation): Rotation
```

## getPreviousRotation

calculates the previous rotation value

**Signature**

```ts
export declare function getPreviousRotation(rotation: Rotation): Rotation
```

## isBoardConfiguration

determines if a configuration is a board configuration

**Signature**

```ts
export declare function isBoardConfiguration(config: any): config is BoardConfigInterface
```

Added in v0.9.85

## isDestinyMountain

determine if the position is the destiny mountain

**Signature**

```ts
export declare function isDestinyMountain(position: BoardPosition, config: BoardConfigInterface): boolean
```

## moveSauronsEye

moves saurons eyes to a new position

**Signature**

```ts
export declare function moveSauronsEye(position: BoardPosition, config: BoardConfigInterface): BoardConfigInterface
```

## predictIfConfigurationIsBoardConfiguration

predicts if a configuration is a board configuration

**Signature**

```ts
export declare function predictIfConfigurationIsBoardConfiguration(config: any): config is BoardConfigInterface
```

## removeCheckpoint

remove a checkpoint with the position from the board config

**Signature**

```ts
export declare function removeCheckpoint(position: BoardPosition, config: BoardConfigInterface): BoardConfigInterface
```

## removeHole

remove a hole field with the position from the board config

**Signature**

```ts
export declare function removeHole(position: BoardPosition, config: BoardConfigInterface): BoardConfigInterface
```

## removeLembasField

remove a lembas field with the position from the board config

**Signature**

```ts
export declare function removeLembasField(position: BoardPosition, config: BoardConfigInterface): BoardConfigInterface
```

## removeRiver

remove a river field with the position from the board config

**Signature**

```ts
export declare function removeRiver(position: BoardPosition, config: BoardConfigInterface): BoardConfigInterface
```

## removeStartField

remove a start field with the position from the board config

**Signature**

```ts
export declare function removeStartField(position: BoardPosition, config: BoardConfigInterface): BoardConfigInterface
```

## removeWall

remove a wall with the position from the board config

**Signature**

```ts
export declare function removeWall(
  position: [BoardPosition, BoardPosition],
  config: BoardConfigInterface
): BoardConfigInterface
```

## rotateDirection

**Signature**

```ts
export declare function rotateDirection(direction: Direction, rotation: Rotation): Direction
```

## updateLembasFieldAmount

updates the amount of a lembas field in the board config

**Signature**

```ts
export declare function updateLembasFieldAmount(
  config: BoardConfigInterface,
  position: BoardPosition,
  amount: number
): BoardConfigInterface
```

## updateRiverFieldDirection

updates the direction of a river field in the board config

**Signature**

```ts
export declare function updateRiverFieldDirection(
  config: BoardConfigInterface,
  position: BoardPosition,
  direction: DirectionEnum
): BoardConfigInterface
```

## updateStartFieldDirection

updates the direction of a start field in the board config

**Signature**

```ts
export declare function updateStartFieldDirection(
  config: BoardConfigInterface,
  position: BoardPosition,
  direction: DirectionEnum
): BoardConfigInterface
```
