---
title: renderer/helper/InputValidator.ts
nav_order: 25
parent: Modules
---

## InputValidator overview

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [InputValidator (class)](#inputvalidator-class)
    - [validate (method)](#validate-method)
    - [args (property)](#args-property)

---

# utils

## InputValidator (class)

InputValidator class

**Signature**

```ts
export declare class InputValidator {
  constructor(args: InputValidatorArgs)
}
```

**Example**

```ts
const inputValidator = new InputValidator({
  type: InputValidatorType.TYPE_STRING,
  options: {
    longerThan: {
      number: 3,
      error: 'The value must be longer than 3 characters',
    },
    regex: {
      expression: /^[a-z]+$/,
      error: 'The value must only contain lowercase letters',
    },
    notEmpty: {
      error: 'The value must not be empty',
    },
  },
})
const answer = inputValidator.validate('abc')
console.log(answer)
```

### validate (method)

validates the given value by the given rules

**Signature**

```ts
validate(value: string): InputValidatorValidateAnswer
```

### args (property)

**Signature**

```ts
readonly args: InputValidatorArgs
```
