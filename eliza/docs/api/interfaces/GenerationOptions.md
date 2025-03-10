[@elizaos/core v0.25.7](../index.md) / GenerationOptions

# Interface: GenerationOptions

Configuration options for generating objects with a model.

## Properties

### runtime

> **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

#### Defined in

[packages/core/src/generation.ts:2063](https://github.com/elizaOS/eliza/blob/main/packages/core/src/generation.ts#L2063)

***

### context

> **context**: `string`

#### Defined in

[packages/core/src/generation.ts:2064](https://github.com/elizaOS/eliza/blob/main/packages/core/src/generation.ts#L2064)

***

### modelClass

> **modelClass**: [`ModelClass`](../enumerations/ModelClass.md)

#### Defined in

[packages/core/src/generation.ts:2065](https://github.com/elizaOS/eliza/blob/main/packages/core/src/generation.ts#L2065)

***

### schema?

> `optional` **schema**: `ZodType`\<`any`, `ZodTypeDef`, `any`\>

#### Defined in

[packages/core/src/generation.ts:2066](https://github.com/elizaOS/eliza/blob/main/packages/core/src/generation.ts#L2066)

***

### schemaName?

> `optional` **schemaName**: `string`

#### Defined in

[packages/core/src/generation.ts:2067](https://github.com/elizaOS/eliza/blob/main/packages/core/src/generation.ts#L2067)

***

### schemaDescription?

> `optional` **schemaDescription**: `string`

#### Defined in

[packages/core/src/generation.ts:2068](https://github.com/elizaOS/eliza/blob/main/packages/core/src/generation.ts#L2068)

***

### stop?

> `optional` **stop**: `string`[]

#### Defined in

[packages/core/src/generation.ts:2069](https://github.com/elizaOS/eliza/blob/main/packages/core/src/generation.ts#L2069)

***

### mode?

> `optional` **mode**: `"auto"` \| `"json"` \| `"tool"`

#### Defined in

[packages/core/src/generation.ts:2070](https://github.com/elizaOS/eliza/blob/main/packages/core/src/generation.ts#L2070)

***

### experimental\_providerMetadata?

> `optional` **experimental\_providerMetadata**: `Record`\<`string`, `unknown`\>

#### Defined in

[packages/core/src/generation.ts:2071](https://github.com/elizaOS/eliza/blob/main/packages/core/src/generation.ts#L2071)
