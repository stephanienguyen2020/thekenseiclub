[@elizaos/core v0.25.7](../index.md) / IMemoryManager

# Interface: IMemoryManager

## Properties

### runtime

> **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

#### Defined in

[packages/core/src/types.ts:1160](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1160)

***

### tableName

> **tableName**: `string`

#### Defined in

[packages/core/src/types.ts:1161](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1161)

***

### constructor

> **constructor**: `Function`

#### Defined in

[packages/core/src/types.ts:1162](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1162)

## Methods

### addEmbeddingToMemory()

> **addEmbeddingToMemory**(`memory`): `Promise`\<[`Memory`](Memory.md)\>

#### Parameters

• **memory**: [`Memory`](Memory.md)

#### Returns

`Promise`\<[`Memory`](Memory.md)\>

#### Defined in

[packages/core/src/types.ts:1164](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1164)

***

### getMemories()

> **getMemories**(`opts`): `Promise`\<[`Memory`](Memory.md)[]\>

#### Parameters

• **opts**

• **opts.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **opts.count?**: `number`

• **opts.unique?**: `boolean`

• **opts.start?**: `number`

• **opts.end?**: `number`

#### Returns

`Promise`\<[`Memory`](Memory.md)[]\>

#### Defined in

[packages/core/src/types.ts:1166](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1166)

***

### getCachedEmbeddings()

> **getCachedEmbeddings**(`content`): `Promise`\<`object`[]\>

#### Parameters

• **content**: `string`

#### Returns

`Promise`\<`object`[]\>

#### Defined in

[packages/core/src/types.ts:1174](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1174)

***

### getMemoryById()

> **getMemoryById**(`id`): `Promise`\<[`Memory`](Memory.md)\>

#### Parameters

• **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Memory`](Memory.md)\>

#### Defined in

[packages/core/src/types.ts:1178](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1178)

***

### getMemoriesByRoomIds()

> **getMemoriesByRoomIds**(`params`): `Promise`\<[`Memory`](Memory.md)[]\>

#### Parameters

• **params**

• **params.roomIds**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]

• **params.limit?**: `number`

#### Returns

`Promise`\<[`Memory`](Memory.md)[]\>

#### Defined in

[packages/core/src/types.ts:1179](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1179)

***

### searchMemoriesByEmbedding()

> **searchMemoriesByEmbedding**(`embedding`, `opts`): `Promise`\<[`Memory`](Memory.md)[]\>

#### Parameters

• **embedding**: `number`[]

• **opts**

• **opts.match\_threshold?**: `number`

• **opts.count?**: `number`

• **opts.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **opts.unique?**: `boolean`

#### Returns

`Promise`\<[`Memory`](Memory.md)[]\>

#### Defined in

[packages/core/src/types.ts:1183](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1183)

***

### createMemory()

> **createMemory**(`memory`, `unique`?): `Promise`\<`void`\>

#### Parameters

• **memory**: [`Memory`](Memory.md)

• **unique?**: `boolean`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1193](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1193)

***

### removeMemory()

> **removeMemory**(`memoryId`): `Promise`\<`void`\>

#### Parameters

• **memoryId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1195](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1195)

***

### removeAllMemories()

> **removeAllMemories**(`roomId`): `Promise`\<`void`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1197](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1197)

***

### countMemories()

> **countMemories**(`roomId`, `unique`?): `Promise`\<`number`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **unique?**: `boolean`

#### Returns

`Promise`\<`number`\>

#### Defined in

[packages/core/src/types.ts:1199](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1199)
