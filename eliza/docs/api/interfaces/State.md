[@elizaos/core v0.25.7](../index.md) / State

# Interface: State

Represents the current state/context of a conversation

## Indexable

 \[`key`: `string`\]: `unknown`

## Properties

### userId?

> `optional` **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

ID of user who sent current message

#### Defined in

[packages/core/src/types.ts:282](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L282)

***

### agentId?

> `optional` **agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

ID of agent in conversation

#### Defined in

[packages/core/src/types.ts:285](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L285)

***

### bio

> **bio**: `string`

Agent's biography

#### Defined in

[packages/core/src/types.ts:288](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L288)

***

### lore

> **lore**: `string`

Agent's background lore

#### Defined in

[packages/core/src/types.ts:291](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L291)

***

### messageDirections

> **messageDirections**: `string`

Message handling directions

#### Defined in

[packages/core/src/types.ts:294](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L294)

***

### postDirections

> **postDirections**: `string`

Post handling directions

#### Defined in

[packages/core/src/types.ts:297](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L297)

***

### roomId

> **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Current room/conversation ID

#### Defined in

[packages/core/src/types.ts:300](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L300)

***

### agentName?

> `optional` **agentName**: `string`

Optional agent name

#### Defined in

[packages/core/src/types.ts:303](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L303)

***

### senderName?

> `optional` **senderName**: `string`

Optional message sender name

#### Defined in

[packages/core/src/types.ts:306](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L306)

***

### actors

> **actors**: `string`

String representation of conversation actors

#### Defined in

[packages/core/src/types.ts:309](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L309)

***

### actorsData?

> `optional` **actorsData**: [`Actor`](Actor.md)[]

Optional array of actor objects

#### Defined in

[packages/core/src/types.ts:312](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L312)

***

### goals?

> `optional` **goals**: `string`

Optional string representation of goals

#### Defined in

[packages/core/src/types.ts:315](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L315)

***

### goalsData?

> `optional` **goalsData**: [`Goal`](Goal.md)[]

Optional array of goal objects

#### Defined in

[packages/core/src/types.ts:318](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L318)

***

### recentMessages

> **recentMessages**: `string`

Recent message history as string

#### Defined in

[packages/core/src/types.ts:321](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L321)

***

### recentMessagesData

> **recentMessagesData**: [`Memory`](Memory.md)[]

Recent message objects

#### Defined in

[packages/core/src/types.ts:324](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L324)

***

### actionNames?

> `optional` **actionNames**: `string`

Optional valid action names

#### Defined in

[packages/core/src/types.ts:327](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L327)

***

### actions?

> `optional` **actions**: `string`

Optional action descriptions

#### Defined in

[packages/core/src/types.ts:330](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L330)

***

### actionsData?

> `optional` **actionsData**: [`Action`](Action.md)[]

Optional action objects

#### Defined in

[packages/core/src/types.ts:333](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L333)

***

### actionExamples?

> `optional` **actionExamples**: `string`

Optional action examples

#### Defined in

[packages/core/src/types.ts:336](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L336)

***

### providers?

> `optional` **providers**: `string`

Optional provider descriptions

#### Defined in

[packages/core/src/types.ts:339](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L339)

***

### responseData?

> `optional` **responseData**: [`Content`](Content.md)

Optional response content

#### Defined in

[packages/core/src/types.ts:342](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L342)

***

### recentInteractionsData?

> `optional` **recentInteractionsData**: [`Memory`](Memory.md)[]

Optional recent interaction objects

#### Defined in

[packages/core/src/types.ts:345](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L345)

***

### recentInteractions?

> `optional` **recentInteractions**: `string`

Optional recent interactions string

#### Defined in

[packages/core/src/types.ts:348](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L348)

***

### formattedConversation?

> `optional` **formattedConversation**: `string`

Optional formatted conversation

#### Defined in

[packages/core/src/types.ts:351](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L351)

***

### knowledge?

> `optional` **knowledge**: `string`

Optional formatted knowledge

#### Defined in

[packages/core/src/types.ts:354](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L354)

***

### knowledgeData?

> `optional` **knowledgeData**: [`KnowledgeItem`](../type-aliases/KnowledgeItem.md)[]

Optional knowledge data

#### Defined in

[packages/core/src/types.ts:356](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L356)

***

### ragKnowledgeData?

> `optional` **ragKnowledgeData**: [`RAGKnowledgeItem`](RAGKnowledgeItem.md)[]

Optional knowledge data

#### Defined in

[packages/core/src/types.ts:358](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L358)
