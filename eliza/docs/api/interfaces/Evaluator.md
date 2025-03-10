[@elizaos/core v0.25.7](../index.md) / Evaluator

# Interface: Evaluator

Evaluator for assessing agent responses

## Properties

### alwaysRun?

> `optional` **alwaysRun**: `boolean`

Whether to always run

#### Defined in

[packages/core/src/types.ts:480](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L480)

***

### description

> **description**: `string`

Detailed description

#### Defined in

[packages/core/src/types.ts:483](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L483)

***

### similes

> **similes**: `string`[]

Similar evaluator descriptions

#### Defined in

[packages/core/src/types.ts:486](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L486)

***

### examples

> **examples**: [`EvaluationExample`](EvaluationExample.md)[]

Example evaluations

#### Defined in

[packages/core/src/types.ts:489](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L489)

***

### handler

> **handler**: [`Handler`](../type-aliases/Handler.md)

Handler function

#### Defined in

[packages/core/src/types.ts:492](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L492)

***

### name

> **name**: `string`

Evaluator name

#### Defined in

[packages/core/src/types.ts:495](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L495)

***

### validate

> **validate**: [`Validator`](../type-aliases/Validator.md)

Validation function

#### Defined in

[packages/core/src/types.ts:498](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L498)
