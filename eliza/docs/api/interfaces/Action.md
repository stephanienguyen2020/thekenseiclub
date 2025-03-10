[@elizaos/core v0.25.7](../index.md) / Action

# Interface: Action

Represents an action the agent can perform

## Properties

### similes

> **similes**: `string`[]

Similar action descriptions

#### Defined in

[packages/core/src/types.ts:440](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L440)

***

### description

> **description**: `string`

Detailed description

#### Defined in

[packages/core/src/types.ts:443](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L443)

***

### examples

> **examples**: [`ActionExample`](ActionExample.md)[][]

Example usages

#### Defined in

[packages/core/src/types.ts:446](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L446)

***

### handler

> **handler**: [`Handler`](../type-aliases/Handler.md)

Handler function

#### Defined in

[packages/core/src/types.ts:449](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L449)

***

### name

> **name**: `string`

Action name

#### Defined in

[packages/core/src/types.ts:452](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L452)

***

### validate

> **validate**: [`Validator`](../type-aliases/Validator.md)

Validation function

#### Defined in

[packages/core/src/types.ts:455](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L455)

***

### suppressInitialMessage?

> `optional` **suppressInitialMessage**: `boolean`

Whether to suppress the initial message when this action is used

#### Defined in

[packages/core/src/types.ts:458](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L458)
