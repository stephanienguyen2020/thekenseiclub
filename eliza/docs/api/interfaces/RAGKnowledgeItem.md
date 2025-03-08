[@elizaos/core v0.25.7](../index.md) / RAGKnowledgeItem

# Interface: RAGKnowledgeItem

## Properties

### id

> **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Defined in

[packages/core/src/types.ts:1540](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1540)

***

### agentId

> **agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Defined in

[packages/core/src/types.ts:1541](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1541)

***

### content

> **content**: `object`

#### text

> **text**: `string`

#### metadata?

> `optional` **metadata**: `object`

##### Index Signature

 \[`key`: `string`\]: `unknown`

#### metadata.isMain?

> `optional` **isMain**: `boolean`

#### metadata.isChunk?

> `optional` **isChunk**: `boolean`

#### metadata.originalId?

> `optional` **originalId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### metadata.chunkIndex?

> `optional` **chunkIndex**: `number`

#### metadata.source?

> `optional` **source**: `string`

#### metadata.type?

> `optional` **type**: `string`

#### metadata.isShared?

> `optional` **isShared**: `boolean`

#### Defined in

[packages/core/src/types.ts:1542](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1542)

***

### embedding?

> `optional` **embedding**: `Float32Array`

#### Defined in

[packages/core/src/types.ts:1555](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1555)

***

### createdAt?

> `optional` **createdAt**: `number`

#### Defined in

[packages/core/src/types.ts:1556](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1556)

***

### similarity?

> `optional` **similarity**: `number`

#### Defined in

[packages/core/src/types.ts:1557](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1557)

***

### score?

> `optional` **score**: `number`

#### Defined in

[packages/core/src/types.ts:1558](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1558)
