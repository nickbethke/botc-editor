---
title: renderer/helper/TranslationHelper.ts
nav_order: 26
parent: Modules
---

## TranslationHelper overview

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [LanguageSchema (interface)](#languageschema-interface)
  - [TranslationHelper (class)](#translationhelper-class)
    - [stringToEnum (static method)](#stringtoenum-static-method)
    - [enumToString (static method)](#enumtostring-static-method)
    - [translate (method)](#translate-method)
    - [translateVars (method)](#translatevars-method)
    - [setLanguageJSON (method)](#setlanguagejson-method)
    - [switchLanguage (method)](#switchlanguage-method)
    - [missingTranslations (property)](#missingtranslations-property)

---

# utils

## LanguageSchema (interface)

**Signature**

```ts
export interface LanguageSchema {
  lang?: string
  data?: [string, string][]
}
```

## TranslationHelper (class)

**Signature**

```ts
export declare class TranslationHelper {
  constructor(lang: AvailableLanguages)
}
```

### stringToEnum (static method)

**Signature**

```ts
static stringToEnum(language: string): AvailableLanguages
```

### enumToString (static method)

**Signature**

```ts
static enumToString(value: AvailableLanguages)
```

### translate (method)

**Signature**

```ts
public translate(str: string): string
```

### translateVars (method)

**Signature**

```ts
public translateVars(str: string, p: string[]): string
```

### setLanguageJSON (method)

**Signature**

```ts
private setLanguageJSON()
```

### switchLanguage (method)

**Signature**

```ts
public switchLanguage(lang: AvailableLanguages)
```

### missingTranslations (property)

**Signature**

```ts
missingTranslations: Map<string, boolean>
```
