[@elizaos/core v0.25.7](../index.md) / IDatabaseAdapter

# Interface: IDatabaseAdapter

Interface for database operations

## Properties

### db

> **db**: `any`

Database instance

#### Defined in

[packages/core/src/types.ts:972](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L972)

## Methods

### init()

> **init**(): `Promise`\<`void`\>

Optional initialization

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:975](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L975)

***

### close()

> **close**(): `Promise`\<`void`\>

Close database connection

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:978](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L978)

***

### getAccountById()

> **getAccountById**(`userId`): `Promise`\<[`Account`](Account.md)\>

Get account by ID

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Account`](Account.md)\>

#### Defined in

[packages/core/src/types.ts:981](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L981)

***

### createAccount()

> **createAccount**(`account`): `Promise`\<`boolean`\>

Create new account

#### Parameters

• **account**: [`Account`](Account.md)

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[packages/core/src/types.ts:984](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L984)

***

### getMemories()

> **getMemories**(`params`): `Promise`\<[`Memory`](Memory.md)[]\>

Get memories matching criteria

#### Parameters

• **params**

• **params.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.count?**: `number`

• **params.unique?**: `boolean`

• **params.tableName**: `string`

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.start?**: `number`

• **params.end?**: `number`

#### Returns

`Promise`\<[`Memory`](Memory.md)[]\>

#### Defined in

[packages/core/src/types.ts:987](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L987)

***

### getMemoryById()

> **getMemoryById**(`id`): `Promise`\<[`Memory`](Memory.md)\>

#### Parameters

• **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Memory`](Memory.md)\>

#### Defined in

[packages/core/src/types.ts:997](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L997)

***

### getMemoriesByIds()

> **getMemoriesByIds**(`ids`, `tableName`?): `Promise`\<[`Memory`](Memory.md)[]\>

#### Parameters

• **ids**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]

• **tableName?**: `string`

#### Returns

`Promise`\<[`Memory`](Memory.md)[]\>

#### Defined in

[packages/core/src/types.ts:999](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L999)

***

### getMemoriesByRoomIds()

> **getMemoriesByRoomIds**(`params`): `Promise`\<[`Memory`](Memory.md)[]\>

#### Parameters

• **params**

• **params.tableName**: `string`

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.roomIds**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]

• **params.limit?**: `number`

#### Returns

`Promise`\<[`Memory`](Memory.md)[]\>

#### Defined in

[packages/core/src/types.ts:1001](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1001)

***

### getCachedEmbeddings()

> **getCachedEmbeddings**(`params`): `Promise`\<`object`[]\>

#### Parameters

• **params**

• **params.query\_table\_name**: `string`

• **params.query\_threshold**: `number`

• **params.query\_input**: `string`

• **params.query\_field\_name**: `string`

• **params.query\_field\_sub\_name**: `string`

• **params.query\_match\_count**: `number`

#### Returns

`Promise`\<`object`[]\>

#### Defined in

[packages/core/src/types.ts:1008](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1008)

***

### log()

> **log**(`params`): `Promise`\<`void`\>

#### Parameters

• **params**

• **params.body**

• **params.userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.type**: `string`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1017](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1017)

***

### getActorDetails()

> **getActorDetails**(`params`): `Promise`\<[`Actor`](Actor.md)[]\>

#### Parameters

• **params**

• **params.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Actor`](Actor.md)[]\>

#### Defined in

[packages/core/src/types.ts:1024](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1024)

***

### searchMemories()

> **searchMemories**(`params`): `Promise`\<[`Memory`](Memory.md)[]\>

#### Parameters

• **params**

• **params.tableName**: `string`

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.embedding**: `number`[]

• **params.match\_threshold**: `number`

• **params.match\_count**: `number`

• **params.unique**: `boolean`

#### Returns

`Promise`\<[`Memory`](Memory.md)[]\>

#### Defined in

[packages/core/src/types.ts:1026](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1026)

***

### updateGoalStatus()

> **updateGoalStatus**(`params`): `Promise`\<`void`\>

#### Parameters

• **params**

• **params.goalId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.status**: [`GoalStatus`](../enumerations/GoalStatus.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1036](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1036)

***

### searchMemoriesByEmbedding()

> **searchMemoriesByEmbedding**(`embedding`, `params`): `Promise`\<[`Memory`](Memory.md)[]\>

#### Parameters

• **embedding**: `number`[]

• **params**

• **params.match\_threshold?**: `number`

• **params.count?**: `number`

• **params.roomId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.agentId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.unique?**: `boolean`

• **params.tableName**: `string`

#### Returns

`Promise`\<[`Memory`](Memory.md)[]\>

#### Defined in

[packages/core/src/types.ts:1041](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1041)

***

### createMemory()

> **createMemory**(`memory`, `tableName`, `unique`?): `Promise`\<`void`\>

#### Parameters

• **memory**: [`Memory`](Memory.md)

• **tableName**: `string`

• **unique?**: `boolean`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1053](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1053)

***

### removeMemory()

> **removeMemory**(`memoryId`, `tableName`): `Promise`\<`void`\>

#### Parameters

• **memoryId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **tableName**: `string`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1059](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1059)

***

### removeAllMemories()

> **removeAllMemories**(`roomId`, `tableName`): `Promise`\<`void`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **tableName**: `string`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1061](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1061)

***

### countMemories()

> **countMemories**(`roomId`, `unique`?, `tableName`?): `Promise`\<`number`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **unique?**: `boolean`

• **tableName?**: `string`

#### Returns

`Promise`\<`number`\>

#### Defined in

[packages/core/src/types.ts:1063](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1063)

***

### getGoals()

> **getGoals**(`params`): `Promise`\<[`Goal`](Goal.md)[]\>

#### Parameters

• **params**

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.userId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.onlyInProgress?**: `boolean`

• **params.count?**: `number`

#### Returns

`Promise`\<[`Goal`](Goal.md)[]\>

#### Defined in

[packages/core/src/types.ts:1069](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1069)

***

### updateGoal()

> **updateGoal**(`goal`): `Promise`\<`void`\>

#### Parameters

• **goal**: [`Goal`](Goal.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1077](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1077)

***

### createGoal()

> **createGoal**(`goal`): `Promise`\<`void`\>

#### Parameters

• **goal**: [`Goal`](Goal.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1079](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1079)

***

### removeGoal()

> **removeGoal**(`goalId`): `Promise`\<`void`\>

#### Parameters

• **goalId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1081](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1081)

***

### removeAllGoals()

> **removeAllGoals**(`roomId`): `Promise`\<`void`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1083](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1083)

***

### getRoom()

> **getRoom**(`roomId`): `Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`\>

#### Defined in

[packages/core/src/types.ts:1085](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1085)

***

### createRoom()

> **createRoom**(`roomId`?): `Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`\>

#### Parameters

• **roomId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`\>

#### Defined in

[packages/core/src/types.ts:1087](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1087)

***

### removeRoom()

> **removeRoom**(`roomId`): `Promise`\<`void`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1089](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1089)

***

### getRoomsForParticipant()

> **getRoomsForParticipant**(`userId`): `Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

#### Defined in

[packages/core/src/types.ts:1091](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1091)

***

### getRoomsForParticipants()

> **getRoomsForParticipants**(`userIds`): `Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

#### Parameters

• **userIds**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]

#### Returns

`Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

#### Defined in

[packages/core/src/types.ts:1093](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1093)

***

### addParticipant()

> **addParticipant**(`userId`, `roomId`): `Promise`\<`boolean`\>

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[packages/core/src/types.ts:1095](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1095)

***

### removeParticipant()

> **removeParticipant**(`userId`, `roomId`): `Promise`\<`boolean`\>

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[packages/core/src/types.ts:1097](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1097)

***

### getParticipantsForAccount()

> **getParticipantsForAccount**(`userId`): `Promise`\<[`Participant`](Participant.md)[]\>

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Participant`](Participant.md)[]\>

#### Defined in

[packages/core/src/types.ts:1099](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1099)

***

### getParticipantsForRoom()

> **getParticipantsForRoom**(`roomId`): `Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

#### Defined in

[packages/core/src/types.ts:1101](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1101)

***

### getParticipantUserState()

> **getParticipantUserState**(`roomId`, `userId`): `Promise`\<`"FOLLOWED"` \| `"MUTED"`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`"FOLLOWED"` \| `"MUTED"`\>

#### Defined in

[packages/core/src/types.ts:1103](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1103)

***

### setParticipantUserState()

> **setParticipantUserState**(`roomId`, `userId`, `state`): `Promise`\<`void`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **state**: `"FOLLOWED"` \| `"MUTED"`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1108](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1108)

***

### createRelationship()

> **createRelationship**(`params`): `Promise`\<`boolean`\>

#### Parameters

• **params**

• **params.userA**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.userB**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[packages/core/src/types.ts:1114](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1114)

***

### getRelationship()

> **getRelationship**(`params`): `Promise`\<[`Relationship`](Relationship.md)\>

#### Parameters

• **params**

• **params.userA**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.userB**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Relationship`](Relationship.md)\>

#### Defined in

[packages/core/src/types.ts:1116](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1116)

***

### getRelationships()

> **getRelationships**(`params`): `Promise`\<[`Relationship`](Relationship.md)[]\>

#### Parameters

• **params**

• **params.userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Relationship`](Relationship.md)[]\>

#### Defined in

[packages/core/src/types.ts:1121](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1121)

***

### getKnowledge()

> **getKnowledge**(`params`): `Promise`\<[`RAGKnowledgeItem`](RAGKnowledgeItem.md)[]\>

#### Parameters

• **params**

• **params.id?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.limit?**: `number`

• **params.query?**: `string`

• **params.conversationContext?**: `string`

#### Returns

`Promise`\<[`RAGKnowledgeItem`](RAGKnowledgeItem.md)[]\>

#### Defined in

[packages/core/src/types.ts:1123](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1123)

***

### searchKnowledge()

> **searchKnowledge**(`params`): `Promise`\<[`RAGKnowledgeItem`](RAGKnowledgeItem.md)[]\>

#### Parameters

• **params**

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.embedding**: `Float32Array`

• **params.match\_threshold**: `number`

• **params.match\_count**: `number`

• **params.searchText?**: `string`

#### Returns

`Promise`\<[`RAGKnowledgeItem`](RAGKnowledgeItem.md)[]\>

#### Defined in

[packages/core/src/types.ts:1131](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1131)

***

### createKnowledge()

> **createKnowledge**(`knowledge`): `Promise`\<`void`\>

#### Parameters

• **knowledge**: [`RAGKnowledgeItem`](RAGKnowledgeItem.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1139](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1139)

***

### removeKnowledge()

> **removeKnowledge**(`id`): `Promise`\<`void`\>

#### Parameters

• **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1140](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1140)

***

### clearKnowledge()

> **clearKnowledge**(`agentId`, `shared`?): `Promise`\<`void`\>

#### Parameters

• **agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **shared?**: `boolean`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1141](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1141)
