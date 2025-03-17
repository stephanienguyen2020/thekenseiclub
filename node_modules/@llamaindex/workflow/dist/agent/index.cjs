Object.defineProperty(exports, '__esModule', { value: true });

var memory = require('@llamaindex/core/memory');
var prompts = require('@llamaindex/core/prompts');
var tools = require('@llamaindex/core/tools');
var utils = require('@llamaindex/core/utils');
var zod = require('zod');
var env = require('@llamaindex/env');
var global = require('@llamaindex/core/global');

class WorkflowEvent {
    constructor(data){
        this.data = data;
        this.displayName = this.constructor.name;
    }
    toString() {
        return this.displayName;
    }
    static or(AEvent, BEvent) {
        function OrEvent() {
            throw new Error("Cannot instantiate OrEvent");
        }
        OrEvent.prototype = Object.create(AEvent.prototype);
        Object.getOwnPropertyNames(BEvent.prototype).forEach((property)=>{
            if (!(property in OrEvent.prototype)) {
                Object.defineProperty(OrEvent.prototype, property, Object.getOwnPropertyDescriptor(BEvent.prototype, property));
            }
        });
        OrEvent.prototype.constructor = OrEvent;
        Object.defineProperty(OrEvent, Symbol.hasInstance, {
            value: function(instance) {
                return instance instanceof AEvent || instance instanceof BEvent;
            }
        });
        return OrEvent;
    }
}
// These are special events that are used to control the workflow
class StartEvent extends WorkflowEvent {
    constructor(data){
        super(data);
    }
}
class StopEvent extends WorkflowEvent {
    constructor(data){
        super(data);
    }
}

var _computedKey, _computedKey1;
function flattenEvents(acceptEventTypes, inputEvents) {
    const eventMap = new Map();
    for (const event of inputEvents){
        for (const acceptType of acceptEventTypes){
            if (event instanceof acceptType && !eventMap.has(acceptType)) {
                eventMap.set(acceptType, event);
                break; // Once matched, no need to check other accept types
            }
        }
    }
    return Array.from(eventMap.values());
}
_computedKey = Symbol.asyncIterator, _computedKey1 = Symbol.toStringTag;
class WorkflowContext {
    #steps;
    #startEvent;
    #queue;
    #queueEventTarget;
    #wait;
    #timeout;
    #verbose;
    #data;
    #stepCache;
    #getStepFunction(event) {
        if (this.#stepCache.has(event)) {
            return this.#stepCache.get(event);
        }
        const set = new Set();
        const stepInputs = new WeakMap();
        const stepOutputs = new WeakMap();
        const res = [
            set,
            stepInputs,
            stepOutputs
        ];
        this.#stepCache.set(event, res);
        for (const [step, { inputs, outputs }] of this.#steps){
            if (inputs.some((input)=>event instanceof input)) {
                set.add(step);
                stepInputs.set(step, inputs);
                stepOutputs.set(step, outputs);
            }
        }
        return res;
    }
    constructor(params){
        this.#queue = [];
        this.#queueEventTarget = new EventTarget();
        this.#timeout = null;
        this.#verbose = false;
        this.#stepCache = new Map();
        // make sure it will only be called once
        this.#iterator = null;
        this.#signal = null;
        this.#sendEvent = (event)=>{
            this.#queue.push({
                type: "event",
                event
            });
        };
        this.#requireEvent = async (event)=>{
            const requestId = env.randomUUID();
            this.#queue.push({
                type: "requestEvent",
                id: requestId,
                requestEvent: event
            });
            return new Promise((resolve)=>{
                const handler = (event)=>{
                    if (event instanceof env.CustomEvent) {
                        const { id } = event.detail;
                        if (requestId === id) {
                            this.#queueEventTarget.removeEventListener("update", handler);
                            resolve(event.detail.event);
                        }
                    }
                };
                this.#queueEventTarget.addEventListener("update", handler);
            });
        };
        this.#pendingInputQueue = [];
        // if strict mode is enabled, it will throw an error if there's input or output events are not expected
        this.#strict = false;
        // PromiseLike implementation, this is following the Promise/A+ spec
        // It will consume the iterator and resolve the promise once it reaches the StopEvent
        // If you want to customize the behavior, you can use the async iterator directly
        this.#resolved = null;
        this.#rejected = null;
        this[_computedKey1] = "Context";
        this.#steps = params.steps;
        this.#startEvent = params.startEvent;
        if (typeof params.timeout === "number") {
            this.#timeout = params.timeout;
        }
        this.#data = params.contextData;
        this.#verbose = params.verbose ?? false;
        this.#wait = params.wait;
        // push start event to the queue
        const [step] = this.#getStepFunction(this.#startEvent);
        if (step.size === 0) {
            throw new TypeError("No step found for start event");
        }
        // restore from snapshot
        if (params.queue) {
            params.queue.forEach((protocol)=>{
                this.#queue.push(protocol);
            });
        } else {
            this.#sendEvent(this.#startEvent);
        }
        if (params.pendingInputQueue) {
            this.#pendingInputQueue = params.pendingInputQueue;
        }
        if (params.resolved) {
            this.#resolved = params.resolved;
        }
        if (params.rejected) {
            this.#rejected = params.rejected;
        }
    }
    #iterator;
    #signal;
    get #iteratorSingleton() {
        if (this.#iterator === null) {
            this.#iterator = this.#createStreamEvents();
        }
        return this.#iterator;
    }
    [_computedKey]() {
        return this.#iteratorSingleton;
    }
    #sendEvent;
    #requireEvent;
    #pendingInputQueue;
    #strict;
    strict() {
        this.#strict = true;
        return this;
    }
    get data() {
        return this.#data;
    }
    /**
   * Stream events from the start event
   *
   * Note that this function will stop once there's no more future events,
   *  if you want stop immediately once reach a StopEvent, you should handle it in the other side.
   * @private
   */ #createStreamEvents() {
        const isPendingEvents = new WeakSet();
        const pendingTasks = new Set();
        const enqueuedEvents = new Set();
        const stream = new ReadableStream({
            start: async (controller)=>{
                while(true){
                    const eventProtocol = this.#queue.shift();
                    if (eventProtocol) {
                        switch(eventProtocol.type){
                            case "requestEvent":
                                {
                                    const { id, requestEvent } = eventProtocol;
                                    const acceptableInput = this.#pendingInputQueue.find((event)=>event instanceof requestEvent);
                                    if (acceptableInput) {
                                        // remove the event from the queue, in case of infinite loop
                                        const protocolIdx = this.#queue.findIndex((protocol)=>protocol.type === "event" && protocol.event === acceptableInput);
                                        if (protocolIdx !== -1) {
                                            this.#queue.splice(protocolIdx, 1);
                                        }
                                        this.#pendingInputQueue.splice(this.#pendingInputQueue.indexOf(acceptableInput), 1);
                                        this.#queueEventTarget.dispatchEvent(new env.CustomEvent("update", {
                                            detail: {
                                                id,
                                                event: acceptableInput
                                            }
                                        }));
                                    } else {
                                        // push back to the queue as there are not enough events
                                        this.#queue.push(eventProtocol);
                                    }
                                    break;
                                }
                            case "event":
                                {
                                    const { event } = eventProtocol;
                                    if (isPendingEvents.has(event)) {
                                        // this event is still processing
                                        this.#sendEvent(event);
                                    } else {
                                        if (!enqueuedEvents.has(event)) {
                                            controller.enqueue(event);
                                            enqueuedEvents.add(event);
                                        }
                                        const [steps, inputsMap, outputsMap] = this.#getStepFunction(event);
                                        const nextEventPromises = [
                                            ...steps
                                        ].map((step)=>{
                                            const inputs = [
                                                ...inputsMap.get(step) ?? []
                                            ];
                                            const acceptableInputs = this.#pendingInputQueue.filter((event)=>inputs.some((input)=>event instanceof input));
                                            const events = flattenEvents(inputs, [
                                                event,
                                                ...acceptableInputs
                                            ]);
                                            // remove the event from the queue, in case of infinite loop
                                            events.forEach((event)=>{
                                                const protocolIdx = this.#queue.findIndex((protocol)=>protocol.type === "event" && protocol.event === event);
                                                if (protocolIdx !== -1) {
                                                    this.#queue.splice(protocolIdx, 1);
                                                }
                                            });
                                            if (events.length !== inputs.length) {
                                                if (this.#verbose) {
                                                    console.log(`Not enough inputs for step ${step.name}, waiting for more events`);
                                                }
                                                // not enough to run the step, push back to the queue
                                                this.#sendEvent(event);
                                                isPendingEvents.add(event);
                                                return null;
                                            }
                                            if (isPendingEvents.has(event)) {
                                                isPendingEvents.delete(event);
                                            }
                                            if (this.#verbose) {
                                                console.log(`Running step ${step.name} with inputs ${events}`);
                                            }
                                            const data = this.data;
                                            return step.call(null, {
                                                get data () {
                                                    return data;
                                                },
                                                sendEvent: this.#sendEvent,
                                                requireEvent: this.#requireEvent
                                            }, // @ts-expect-error IDK why
                                            ...events.sort((a, b)=>{
                                                const aIndex = inputs.indexOf(a.constructor);
                                                const bIndex = inputs.indexOf(b.constructor);
                                                return aIndex - bIndex;
                                            })).then((nextEvent)=>{
                                                if (nextEvent === undefined) {
                                                    return;
                                                }
                                                if (this.#verbose) {
                                                    console.log(`Step ${step.name} completed, next event is ${nextEvent}`);
                                                }
                                                const outputs = outputsMap.get(step) ?? [];
                                                if (!outputs.some((output)=>nextEvent.constructor === output)) {
                                                    if (this.#strict) {
                                                        const error = Error(`Step ${step.name} returned an unexpected output event ${nextEvent}`);
                                                        controller.error(error);
                                                    } else {
                                                        console.warn(`Step ${step.name} returned an unexpected output event ${nextEvent}`);
                                                    }
                                                }
                                                if (!(nextEvent instanceof StopEvent)) {
                                                    this.#pendingInputQueue.unshift(nextEvent);
                                                    this.#sendEvent(nextEvent);
                                                }
                                                return nextEvent;
                                            });
                                        }).filter((promise)=>promise !== null);
                                        nextEventPromises.forEach((promise)=>{
                                            pendingTasks.add(promise);
                                            promise.catch((err)=>{
                                                console.error("Error in step", err);
                                            }).finally(()=>{
                                                pendingTasks.delete(promise);
                                            });
                                        });
                                        Promise.race(nextEventPromises).then((fastestNextEvent)=>{
                                            if (fastestNextEvent === undefined) {
                                                return;
                                            }
                                            if (!enqueuedEvents.has(fastestNextEvent)) {
                                                controller.enqueue(fastestNextEvent);
                                                enqueuedEvents.add(fastestNextEvent);
                                            }
                                            return fastestNextEvent;
                                        }).then(async (fastestNextEvent)=>Promise.all(nextEventPromises).then((nextEvents)=>{
                                                const events = nextEvents.filter((event)=>event !== undefined);
                                                for (const nextEvent of events){
                                                    // do not enqueue the same event twice
                                                    if (fastestNextEvent !== nextEvent) {
                                                        if (!enqueuedEvents.has(nextEvent)) {
                                                            controller.enqueue(nextEvent);
                                                            enqueuedEvents.add(nextEvent);
                                                        }
                                                    }
                                                }
                                            })).catch((err)=>{
                                            // when the step raise an error, should go back to the previous step
                                            this.#sendEvent(event);
                                            isPendingEvents.add(event);
                                            controller.error(err);
                                        });
                                    }
                                    break;
                                }
                        }
                    }
                    if (this.#queue.length === 0 && pendingTasks.size === 0) {
                        if (this.#verbose) {
                            console.log("No more events in the queue");
                        }
                        break;
                    }
                    await this.#wait();
                }
                controller.close();
            }
        });
        return stream[Symbol.asyncIterator]();
    }
    with(data) {
        return new WorkflowContext({
            startEvent: this.#startEvent,
            wait: this.#wait,
            contextData: data,
            steps: this.#steps,
            timeout: this.#timeout,
            verbose: this.#verbose,
            queue: this.#queue,
            pendingInputQueue: this.#pendingInputQueue,
            resolved: this.#resolved,
            rejected: this.#rejected
        });
    }
    #resolved;
    #rejected;
    async then(onfulfilled, onrejected) {
        onfulfilled ??= (value)=>value;
        onrejected ??= (reason)=>{
            throw reason;
        };
        if (this.#resolved !== null) {
            return Promise.resolve(this.#resolved).then(onfulfilled, onrejected);
        } else if (this.#rejected !== null) {
            return Promise.reject(this.#rejected).then(onfulfilled, onrejected);
        }
        if (this.#timeout !== null) {
            const timeout = this.#timeout;
            this.#signal = AbortSignal.timeout(timeout * 1000);
        }
        this.#signal?.addEventListener("abort", ()=>{
            this.#rejected = new Error(`Operation timed out after ${this.#timeout} seconds`);
            onrejected?.(this.#rejected);
        });
        try {
            for await (const event of this.#iteratorSingleton){
                if (this.#rejected !== null) {
                    return onrejected?.(this.#rejected);
                }
                if (event instanceof StartEvent) {
                    if (this.#verbose) {
                        console.log(`Starting workflow with event ${event}`);
                    }
                }
                if (event instanceof StopEvent) {
                    if (this.#verbose && this.#pendingInputQueue.length > 0) {
                    // fixme: #pendingInputQueue might should be cleanup correctly?
                    }
                    this.#resolved = event;
                    return onfulfilled?.(event);
                }
            }
        } catch (err) {
            if (err instanceof Error) {
                this.#rejected = err;
            }
            return onrejected?.(err);
        }
        const nextValue = await this.#iteratorSingleton.next();
        if (nextValue.done === false) {
            this.#rejected = new Error("Workflow did not complete");
            return onrejected?.(this.#rejected);
        }
        return onrejected?.(new Error("UNREACHABLE"));
    }
    catch(onrejected) {
        return this.then((v)=>v, onrejected);
    }
    finally(onfinally) {
        return this.then(()=>{
            onfinally?.();
        }, ()=>{
            onfinally?.();
        });
    }
    // for worker thread
    snapshot() {
        const state = {
            startEvent: this.#startEvent,
            queue: this.#queue,
            pendingInputQueue: this.#pendingInputQueue,
            data: this.#data,
            timeout: this.#timeout,
            verbose: this.#verbose,
            resolved: this.#resolved,
            rejected: this.#rejected
        };
        const jsonString = JSON.stringify(state, (_, value)=>{
            // If value is an instance of a class, serialize only its properties
            if (value instanceof WorkflowEvent) {
                return {
                    data: value.data,
                    constructor: value.constructor.name
                };
            }
            // value is Subtype of WorkflowEvent
            if (typeof value === "object" && value !== null && value?.prototype instanceof WorkflowEvent) {
                return {
                    constructor: value.prototype.constructor.name
                };
            }
            return value;
        });
        return new TextEncoder().encode(jsonString).buffer;
    }
}

class Workflow {
    #steps;
    #verbose;
    #timeout;
    // fixme: allow microtask
    #nextTick;
    constructor(params = {}){
        this.#steps = new Map();
        this.#verbose = false;
        this.#timeout = null;
        this.#nextTick = ()=>new Promise((resolve)=>setTimeout(resolve, 0));
        if (params.verbose) {
            this.#verbose = params.verbose;
        }
        if (params.timeout) {
            this.#timeout = params.timeout;
        }
        if (params.wait) {
            this.#nextTick = params.wait;
        }
    }
    addStep(parameters, stepFn) {
        const { inputs, outputs } = parameters;
        this.#steps.set(stepFn, {
            inputs,
            outputs
        });
        return this;
    }
    hasStep(stepFn) {
        return this.#steps.has(stepFn);
    }
    removeStep(stepFn) {
        this.#steps.delete(stepFn);
        return this;
    }
    run(event, data) {
        const startEvent = event instanceof StartEvent ? event : new StartEvent(event);
        return new WorkflowContext({
            startEvent,
            wait: this.#nextTick,
            contextData: data,
            steps: new Map(this.#steps),
            timeout: this.#timeout,
            verbose: this.#verbose,
            queue: undefined,
            pendingInputQueue: undefined,
            resolved: null,
            rejected: null
        });
    }
    recover(data) {
        const jsonString = new TextDecoder().decode(data);
        const state = JSON.parse(jsonString);
        const reconstructedStartEvent = new StartEvent(state.startEvent);
        const AllEvents = [
            ...this.#steps
        ].map(([, { inputs, outputs }])=>[
                ...inputs,
                ...outputs ?? []
            ]).flat();
        const reconstructedQueue = state.queue.map((protocol)=>{
            switch(protocol.type){
                case "requestEvent":
                    {
                        const { requestEvent, id } = protocol;
                        const EventType = AllEvents.find((type)=>type.prototype.constructor.name === requestEvent.constructor);
                        if (!EventType) {
                            throw new TypeError(`Event type not found: ${requestEvent.constructor}`);
                        }
                        return {
                            type: "requestEvent",
                            id,
                            requestEvent: EventType
                        };
                    }
                case "event":
                    {
                        const { event } = protocol;
                        const EventType = AllEvents.find((type)=>type.prototype.constructor.name === event.constructor);
                        if (!EventType) {
                            throw new TypeError(`Event type not found: ${event.constructor}`);
                        }
                        return {
                            type: "event",
                            event: new EventType(event.data)
                        };
                    }
            }
        });
        const reconstructedPendingInputQueue = state.pendingInputQueue.map((event)=>{
            const EventType = AllEvents.find((type)=>type.prototype.constructor.name === event.constructor);
            if (!EventType) {
                throw new TypeError(`Event type not found: ${event.constructor}`);
            }
            return new EventType(event.data);
        });
        return new WorkflowContext({
            startEvent: reconstructedStartEvent,
            contextData: state.data,
            wait: this.#nextTick,
            steps: this.#steps,
            timeout: state.timeout,
            verbose: state.verbose,
            queue: reconstructedQueue,
            pendingInputQueue: reconstructedPendingInputQueue,
            resolved: state.resolved ? new StopEvent(state.resolved) : null,
            rejected: state.rejected ? new Error(state.rejected) : null
        });
    }
}

class AgentToolCall extends WorkflowEvent {
}
// TODO: Check for if we need a raw tool output
class AgentToolCallResult extends WorkflowEvent {
}
class AgentInput extends WorkflowEvent {
}
class AgentSetup extends WorkflowEvent {
}
class AgentStream extends WorkflowEvent {
}
class AgentOutput extends WorkflowEvent {
}

const DEFAULT_SYSTEM_PROMPT = "You are a helpful assistant. Use the provided tools to answer questions.";
class FunctionAgent {
    constructor({ name, llm, description, tools, canHandoffTo, systemPrompt }){
        this.name = name ?? "Agent";
        this.llm = llm ?? global.Settings.llm;
        if (!this.llm.supportToolCall) {
            throw new Error("FunctionAgent requires an LLM that supports tool calls");
        }
        this.description = description ?? "A single agent that uses the provided tools or functions.";
        this.tools = tools;
        if (tools.length === 0) {
            throw new Error("FunctionAgent must have at least one tool");
        }
        // Process canHandoffTo to extract agent names
        this.canHandoffTo = [];
        if (canHandoffTo) {
            if (Array.isArray(canHandoffTo)) {
                if (canHandoffTo.length > 0) {
                    if (typeof canHandoffTo[0] === "string") {
                        // string[] case
                        this.canHandoffTo = canHandoffTo;
                    } else if (canHandoffTo[0] instanceof AgentWorkflow) {
                        // AgentWorkflow[] case
                        const workflows = canHandoffTo;
                        workflows.forEach((workflow)=>{
                            const agentNames = workflow.getAgents().map((agent)=>agent.name);
                            this.canHandoffTo.push(...agentNames);
                        });
                    } else {
                        // BaseWorkflowAgent[] case
                        const agents = canHandoffTo;
                        this.canHandoffTo = agents.map((agent)=>agent.name);
                    }
                }
            }
        }
        const uniqueHandoffAgents = new Set(this.canHandoffTo);
        if (uniqueHandoffAgents.size !== this.canHandoffTo.length) {
            throw new Error("Duplicate handoff agents");
        }
        this.systemPrompt = systemPrompt ?? DEFAULT_SYSTEM_PROMPT;
    }
    async takeStep(ctx, llmInput, tools) {
        // Get scratchpad from context or initialize if not present
        const scratchpad = ctx.data.scratchpad;
        const currentLLMInput = [
            ...llmInput,
            ...scratchpad
        ];
        const responseStream = await this.llm.chat({
            messages: currentLLMInput,
            tools,
            stream: true
        });
        let response = "";
        let lastChunk;
        const toolCalls = new Map();
        for await (const chunk of responseStream){
            response += chunk.delta;
            ctx.sendEvent(new AgentStream({
                delta: chunk.delta,
                response: response,
                currentAgentName: this.name,
                raw: chunk.raw
            }));
            const toolCallsInChunk = this.getToolCallFromResponseChunk(chunk);
            if (toolCallsInChunk.length > 0) {
                // Just upsert the tool calls with the latest one if they exist
                toolCallsInChunk.forEach((toolCall)=>{
                    toolCalls.set(toolCall.data.toolId, toolCall);
                });
            }
        }
        const message = {
            role: "assistant",
            content: response
        };
        if (toolCalls.size > 0) {
            message.options = {
                toolCall: Array.from(toolCalls.values()).map((toolCall)=>({
                        name: toolCall.data.toolName,
                        input: toolCall.data.toolKwargs,
                        id: toolCall.data.toolId
                    }))
            };
        }
        scratchpad.push(message);
        ctx.data.scratchpad = scratchpad;
        return new AgentOutput({
            response: message,
            toolCalls: Array.from(toolCalls.values()),
            raw: lastChunk?.raw,
            currentAgentName: this.name
        });
    }
    async handleToolCallResults(ctx, results) {
        const scratchpad = ctx.data.scratchpad;
        for (const result of results){
            const content = result.data.toolOutput.result;
            const rawToolMessage = {
                role: "user",
                content,
                options: {
                    toolResult: {
                        id: result.data.toolId,
                        result: content,
                        isError: result.data.toolOutput.isError
                    }
                }
            };
            ctx.data.scratchpad.push(rawToolMessage);
        }
        ctx.data.scratchpad = scratchpad;
    }
    async finalize(ctx, output, memory) {
        // Get scratchpad messages
        const scratchpad = ctx.data.scratchpad;
        for (const msg of scratchpad){
            memory.put(msg);
        }
        // Clear scratchpad after finalization
        ctx.data.scratchpad = [];
        return output;
    }
    getToolCallFromResponseChunk(responseChunk) {
        const toolCalls = [];
        const options = responseChunk.options ?? {};
        if (options && "toolCall" in options && Array.isArray(options.toolCall)) {
            toolCalls.push(...options.toolCall.map((call)=>{
                // Convert input to arguments format
                let toolKwargs;
                if (typeof call.input === "string") {
                    try {
                        toolKwargs = JSON.parse(call.input);
                    } catch (e) {
                        toolKwargs = {
                            rawInput: call.input
                        };
                    }
                } else {
                    toolKwargs = call.input;
                }
                return new AgentToolCall({
                    agentName: this.name,
                    toolName: call.name,
                    toolKwargs: toolKwargs,
                    toolId: call.id
                });
            }));
        }
        const invalidToolCalls = toolCalls.filter((call)=>!this.tools.some((tool)=>tool.metadata.name === call.data.toolName));
        if (invalidToolCalls.length > 0) {
            const invalidToolNames = invalidToolCalls.map((call)=>call.data.toolName).join(", ");
            throw new Error(`Tools not found: ${invalidToolNames}`);
        }
        return toolCalls;
    }
}

const DEFAULT_HANDOFF_PROMPT = new prompts.PromptTemplate({
    template: `Useful for handing off to another agent.
If you are currently not equipped to handle the user's request, or another agent is better suited to handle the request, please hand off to the appropriate agent.

Currently available agents: 
{agent_info}
`
});
const DEFAULT_HANDOFF_OUTPUT_PROMPT = new prompts.PromptTemplate({
    template: `Agent {to_agent} is now handling the request due to the following reason: {reason}.\nPlease continue with the current request.`
});
// Wrapper events for multiple tool calls and results
class ToolCallsEvent extends WorkflowEvent {
}
class ToolResultsEvent extends WorkflowEvent {
}
class AgentStepEvent extends WorkflowEvent {
}
/**
 * Create a multi-agent workflow
 * @param params - Parameters for the AgentWorkflow
 * @returns A new AgentWorkflow instance
 */ const multiAgent = (params)=>{
    return new AgentWorkflow(params);
};
/**
 * Create a simple workflow with a single agent and specified tools
 * @param params - Parameters for the single agent workflow
 * @returns A new AgentWorkflow instance
 */ const agent = (params)=>{
    return AgentWorkflow.fromTools(params);
};
/**
 * AgentWorkflow - An event-driven workflow for executing agents with tools
 *
 * This class provides a simple interface for creating and running agent workflows
 * based on the LlamaIndexTS workflow system. It supports single agent workflows
 * with multiple tools.
 */ class AgentWorkflow {
    constructor({ agents, rootAgent, verbose, timeout }){
        this.agents = new Map();
        this.handleInputStep = async (ctx, event)=>{
            const { userInput, chatHistory } = event.data;
            const memory = ctx.data.memory;
            if (chatHistory) {
                chatHistory.forEach((message)=>{
                    memory.put(message);
                });
            }
            if (userInput) {
                const userMessage = {
                    role: "user",
                    content: userInput
                };
                memory.put(userMessage);
            } else if (chatHistory) {
                // If no user message, use the last message from chat history as user_msg_str
                const lastMessage = chatHistory[chatHistory.length - 1];
                if (lastMessage?.role !== "user") {
                    throw new Error("Either provide a user message or a chat history with a user message as the last message");
                }
                ctx.data.userInput = lastMessage.content;
            } else {
                throw new Error("No user message or chat history provided");
            }
            return new AgentInput({
                input: await memory.getMessages(),
                currentAgentName: this.rootAgentName
            });
        };
        this.setupAgent = async (ctx, event)=>{
            const currentAgentName = event.data.currentAgentName;
            const agent = this.agents.get(currentAgentName);
            if (!agent) {
                throw new Error(`Agent ${currentAgentName} not found`);
            }
            const llmInput = event.data.input;
            if (agent.systemPrompt) {
                llmInput.unshift({
                    role: "system",
                    content: agent.systemPrompt
                });
            }
            return new AgentSetup({
                input: llmInput,
                currentAgentName: currentAgentName
            });
        };
        this.runAgentStep = async (ctx, event)=>{
            const agent = this.agents.get(event.data.currentAgentName);
            if (!agent) {
                throw new Error("No valid agent found");
            }
            if (this.verbose) {
                console.log(`[Agent ${agent.name}]: Running for input: ${event.data.input[event.data.input.length - 1]?.content}`);
            }
            const output = await agent.takeStep(ctx, event.data.input, agent.tools);
            ctx.sendEvent(output);
            return new AgentStepEvent({
                agentName: agent.name,
                response: output.data.response,
                toolCalls: output.data.toolCalls
            });
        };
        this.parseAgentOutput = async (ctx, event)=>{
            const { agentName, response, toolCalls } = event.data;
            // If no tool calls, return final response
            if (!toolCalls || toolCalls.length === 0) {
                if (this.verbose) {
                    console.log(`[Agent ${agentName}]: No tool calls to process, returning final response`);
                }
                const agentOutput = new AgentOutput({
                    response,
                    toolCalls: [],
                    raw: response,
                    currentAgentName: agentName
                });
                const content = await this.agents.get(agentName)?.finalize(ctx, agentOutput, ctx.data.memory);
                return new StopEvent({
                    result: content?.data.response.content
                });
            }
            return new ToolCallsEvent({
                agentName,
                toolCalls
            });
        };
        this.executeToolCalls = async (ctx, event)=>{
            const { agentName, toolCalls } = event.data;
            const agent = this.agents.get(agentName);
            if (!agent) {
                throw new Error(`Agent ${agentName} not found`);
            }
            const results = [];
            // Execute each tool call
            for (const toolCall of toolCalls){
                // Send single tool call event, useful for UI
                ctx.sendEvent(toolCall);
                const toolResult = new AgentToolCallResult({
                    toolName: toolCall.data.toolName,
                    toolKwargs: toolCall.data.toolKwargs,
                    toolId: toolCall.data.toolId,
                    toolOutput: {
                        id: toolCall.data.toolId,
                        result: "",
                        isError: false
                    },
                    returnDirect: false
                });
                try {
                    const output = await this.callTool(toolCall, ctx);
                    toolResult.data.toolOutput.result = utils.stringifyJSONToMessageContent(output);
                    toolResult.data.returnDirect = toolCall.data.toolName === "handOff";
                } catch (error) {
                    toolResult.data.toolOutput.isError = true;
                    toolResult.data.toolOutput.result = `Error: ${error}`;
                }
                results.push(toolResult);
                // Send single tool result event, useful for UI
                ctx.sendEvent(toolResult);
            }
            return new ToolResultsEvent({
                agentName,
                results
            });
        };
        this.processToolResults = async (ctx, event)=>{
            const { agentName, results } = event.data;
            // Get agent
            const agent = this.agents.get(agentName);
            if (!agent) {
                throw new Error(`Agent ${agentName} not found`);
            }
            await agent.handleToolCallResults(ctx, results);
            const directResult = results.find((r)=>r.data.returnDirect);
            if (directResult) {
                const isHandoff = directResult.data.toolName === "handOff";
                const output = typeof directResult.data.toolOutput.result === "string" ? directResult.data.toolOutput.result : JSON.stringify(directResult.data.toolOutput.result);
                const agentOutput = new AgentOutput({
                    response: {
                        role: "assistant",
                        content: output
                    },
                    toolCalls: [],
                    raw: output,
                    currentAgentName: agent.name
                });
                await agent.finalize(ctx, agentOutput, ctx.data.memory);
                if (isHandoff) {
                    const nextAgentName = ctx.data.nextAgentName;
                    console.log(`[Agent ${agentName}]: Handoff to ${nextAgentName}: ${directResult.data.toolOutput.result}`);
                    if (nextAgentName) {
                        ctx.data.currentAgentName = nextAgentName;
                        ctx.data.nextAgentName = null;
                        const messages = await ctx.data.memory.getMessages();
                        return new AgentInput({
                            input: messages,
                            currentAgentName: nextAgentName
                        });
                    }
                }
                return new StopEvent({
                    result: output
                });
            }
            // Continue with another agent step
            const messages = await ctx.data.memory.getMessages();
            return new AgentInput({
                input: messages,
                currentAgentName: agent.name
            });
        };
        this.workflow = new Workflow({
            verbose: verbose ?? false,
            timeout: timeout ?? 60
        });
        this.verbose = verbose ?? false;
        // Handle AgentWorkflow cases for agents
        const processedAgents = [];
        if (agents.length > 0) {
            if (agents[0] instanceof AgentWorkflow) {
                // If agents is AgentWorkflow[], extract the BaseWorkflowAgent from each workflow
                const agentWorkflows = agents;
                agentWorkflows.forEach((workflow)=>{
                    const workflowAgents = workflow.getAgents();
                    processedAgents.push(...workflowAgents);
                });
            } else {
                // Otherwise, agents is already BaseWorkflowAgent[]
                processedAgents.push(...agents);
            }
        }
        // Handle AgentWorkflow case for rootAgent and set rootAgentName
        if (rootAgent instanceof AgentWorkflow) {
            // If rootAgent is an AgentWorkflow, check if it has exactly one agent
            const rootAgents = rootAgent.getAgents();
            if (rootAgents.length !== 1) {
                throw new Error(`Root agent must be a single agent, but it is a workflow with ${rootAgents.length} agents`);
            }
            // We know rootAgents[0] exists because we checked length === 1 above
            this.rootAgentName = rootAgents[0].name;
        } else {
            // Otherwise, rootAgent is already a BaseWorkflowAgent
            this.rootAgentName = rootAgent.name;
        }
        // Validate root agent
        if (!processedAgents.some((a)=>a.name === this.rootAgentName)) {
            throw new Error(`Root agent ${this.rootAgentName} not found in agents`);
        }
        this.addAgents(processedAgents);
    }
    validateAgent(agent) {
        // Validate that all canHandoffTo agents exist
        const invalidAgents = agent.canHandoffTo.filter((name)=>!this.agents.has(name));
        if (invalidAgents.length > 0) {
            throw new Error(`Agent "${agent.name}" references non-existent agents in canHandoffTo: ${invalidAgents.join(", ")}`);
        }
    }
    addHandoffTool(agent) {
        const handoffTool = createHandoffTool(this.agents);
        if (agent.canHandoffTo.length > 0 && !agent.tools.some((t)=>t.metadata.name === handoffTool.metadata.name)) {
            agent.tools.push(handoffTool);
        }
    }
    addAgents(agents) {
        const agentNames = new Set(agents.map((a)=>a.name));
        if (agentNames.size !== agents.length) {
            throw new Error("The agent names must be unique!");
        }
        // First pass: add all agents to the map
        agents.forEach((agent)=>{
            this.agents.set(agent.name, agent);
        });
        // Second pass: validate and setup handoff tools
        agents.forEach((agent)=>{
            this.validateAgent(agent);
            this.addHandoffTool(agent);
        });
    }
    /**
   * Adds a new agent to the workflow
   */ addAgent(agent) {
        this.agents.set(agent.name, agent);
        this.validateAgent(agent);
        this.addHandoffTool(agent);
        return this;
    }
    /**
   * Gets all agents in this workflow
   * @returns Array of agents in this workflow
   */ getAgents() {
        return Array.from(this.agents.values());
    }
    /**
   * Create a simple workflow with a single agent and specified tools
   * @param params - Parameters for the single agent workflow
   * @returns A new AgentWorkflow instance
   */ static fromTools(params) {
        const agent = new FunctionAgent({
            name: params.name,
            description: params.description,
            tools: params.tools,
            llm: params.llm,
            systemPrompt: params.systemPrompt
        });
        const workflow = new AgentWorkflow({
            agents: [
                agent
            ],
            rootAgent: agent,
            verbose: params.verbose ?? false,
            timeout: params.timeout ?? 60
        });
        return workflow;
    }
    setupWorkflowSteps() {
        this.workflow.addStep({
            inputs: [
                StartEvent
            ],
            outputs: [
                AgentInput
            ]
        }, this.handleInputStep);
        this.workflow.addStep({
            inputs: [
                AgentInput
            ],
            outputs: [
                AgentSetup
            ]
        }, this.setupAgent);
        this.workflow.addStep({
            inputs: [
                AgentSetup
            ],
            outputs: [
                AgentStepEvent
            ]
        }, this.runAgentStep);
        this.workflow.addStep({
            inputs: [
                AgentStepEvent
            ],
            outputs: [
                ToolCallsEvent,
                StopEvent
            ]
        }, this.parseAgentOutput);
        this.workflow.addStep({
            inputs: [
                ToolCallsEvent
            ],
            outputs: [
                ToolResultsEvent,
                StopEvent
            ]
        }, this.executeToolCalls);
        this.workflow.addStep({
            inputs: [
                ToolResultsEvent
            ],
            outputs: [
                AgentInput,
                StopEvent
            ]
        }, this.processToolResults);
        return this;
    }
    callTool(toolCall, ctx) {
        const tool = this.agents.get(toolCall.data.agentName)?.tools.find((t)=>t.metadata.name === toolCall.data.toolName);
        if (!tool) {
            throw new Error(`Tool ${toolCall.data.toolName} not found`);
        }
        if (tool.metadata.requireContext) {
            const input = {
                context: ctx.data,
                ...toolCall.data.toolKwargs
            };
            return tool.call(input);
        } else {
            return tool.call(toolCall.data.toolKwargs);
        }
    }
    run(userInput, params) {
        if (this.agents.size === 0) {
            throw new Error("No agents added to workflow");
        }
        this.setupWorkflowSteps();
        const contextData = params?.context ?? {
            userInput: userInput,
            memory: new memory.ChatMemoryBuffer(),
            scratchpad: [],
            currentAgentName: this.rootAgentName,
            agents: Array.from(this.agents.keys()),
            nextAgentName: null
        };
        const result = this.workflow.run({
            userInput: userInput,
            chatHistory: params?.chatHistory
        }, contextData);
        return result;
    }
}
const createHandoffTool = (agents)=>{
    const agentInfo = Array.from(agents.values()).reduce((acc, a)=>{
        acc[a.name] = a.description;
        return acc;
    }, {});
    return tools.FunctionTool.from(({ context, toAgent, reason })=>{
        if (!context) {
            throw new Error("Context is required for handoff");
        }
        const agents = context.agents;
        if (!agents.includes(toAgent)) {
            return `Agent ${toAgent} not found. Select a valid agent to hand off to. Valid agents: ${agents.join(", ")}`;
        }
        context.nextAgentName = toAgent;
        return DEFAULT_HANDOFF_OUTPUT_PROMPT.format({
            to_agent: toAgent,
            reason: reason
        });
    }, {
        name: "handOff",
        description: DEFAULT_HANDOFF_PROMPT.format({
            agent_info: JSON.stringify(agentInfo)
        }),
        parameters: zod.z.object({
            toAgent: zod.z.string({
                description: "The name of the agent to hand off to"
            }),
            reason: zod.z.string({
                description: "The reason for handing off to the agent"
            })
        }),
        requireContext: true
    });
};

exports.AgentInput = AgentInput;
exports.AgentOutput = AgentOutput;
exports.AgentSetup = AgentSetup;
exports.AgentStepEvent = AgentStepEvent;
exports.AgentStream = AgentStream;
exports.AgentToolCall = AgentToolCall;
exports.AgentToolCallResult = AgentToolCallResult;
exports.AgentWorkflow = AgentWorkflow;
exports.FunctionAgent = FunctionAgent;
exports.ToolCallsEvent = ToolCallsEvent;
exports.ToolResultsEvent = ToolResultsEvent;
exports.agent = agent;
exports.multiAgent = multiAgent;
