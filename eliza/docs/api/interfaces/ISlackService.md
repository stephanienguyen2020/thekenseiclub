[@elizaos/core v0.25.7](../index.md) / ISlackService

# Interface: ISlackService

## Extends

- [`Service`](../classes/Service.md)

## Properties

### client

> **client**: `any`

#### Defined in

[packages/core/src/types.ts:1569](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1569)

## Accessors

### serviceType

#### Get Signature

> **get** **serviceType**(): [`ServiceType`](../enumerations/ServiceType.md)

##### Returns

[`ServiceType`](../enumerations/ServiceType.md)

#### Inherited from

[`Service`](../classes/Service.md).[`serviceType`](../classes/Service.md#serviceType-1)

#### Defined in

[packages/core/src/types.ts:1263](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1263)

## Methods

### initialize()

> `abstract` **initialize**(`runtime`): `Promise`\<`void`\>

Add abstract initialize method that must be implemented by derived classes

#### Parameters

• **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Service`](../classes/Service.md).[`initialize`](../classes/Service.md#initialize)

#### Defined in

[packages/core/src/types.ts:1268](https://github.com/elizaOS/eliza/blob/main/packages/core/src/types.ts#L1268)
