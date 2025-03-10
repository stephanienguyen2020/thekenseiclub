[@elizaos/core v0.25.7](../index.md) / Memory

# Interface: Memory

Represents a stored memory/message

## Properties

### id?

> `optional` **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Optional unique identifier

#### Defined in

[packages/core/src/types.ts:369](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L369)

***

### userId

> **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Associated user ID

#### Defined in

[packages/core/src/types.ts:372](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L372)

***

### agentId

> **agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Associated agent ID

#### Defined in

[packages/core/src/types.ts:375](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L375)

***

### createdAt?

> `optional` **createdAt**: `number`

Optional creation timestamp

#### Defined in

[packages/core/src/types.ts:378](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L378)

***

### content

> **content**: [`Content`](Content.md)

Memory content

#### Defined in

[packages/core/src/types.ts:381](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L381)

***

### embedding?

> `optional` **embedding**: `number`[]

Optional embedding vector

#### Defined in

[packages/core/src/types.ts:384](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L384)

***

### roomId

> **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Associated room ID

#### Defined in

[packages/core/src/types.ts:387](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L387)

***

### unique?

> `optional` **unique**: `boolean`

Whether memory is unique

#### Defined in

[packages/core/src/types.ts:390](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L390)

***

### similarity?

> `optional` **similarity**: `number`

Embedding similarity score

#### Defined in

[packages/core/src/types.ts:393](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L393)
