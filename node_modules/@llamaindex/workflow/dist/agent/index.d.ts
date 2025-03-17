import { ToolResult, ChatMessage, BaseToolWithCall, LLM, ToolCallLLM } from '@llamaindex/core/llms';
import { BaseMemory } from '@llamaindex/core/memory';
import { JSONValue } from '@llamaindex/core/global';

declare class WorkflowEvent<Data> {
    displayName: string;
    data: Data;
    constructor(data: Data);
    toString(): string;
    static or<A extends AnyWorkflowEventConstructor, B extends AnyWorkflowEventConstructor>(AEvent: A, BEvent: B): A | B;
}
type AnyWorkflowEventConstructor = new (data: any) => WorkflowEvent<any>;
type StartEventConstructor<T = string> = new (data: T) => StartEvent<T>;
type StopEventConstructor<T = string> = new (data: T) => StopEvent<T>;
declare class StartEvent<T = string> extends WorkflowEvent<T> {
    constructor(data: T);
}
declare class StopEvent<T = string> extends WorkflowEvent<T> {
    constructor(data: T);
}

type StepHandler<Data = unknown, Inputs extends [
    AnyWorkflowEventConstructor | StartEventConstructor,
    ...(AnyWorkflowEventConstructor | StopEventConstructor)[]
] = [AnyWorkflowEventConstructor | StartEventConstructor], Out extends (AnyWorkflowEventConstructor | StopEventConstructor)[] = []> = (context: HandlerContext<Data>, ...events: {
    [K in keyof Inputs]: InstanceType<Inputs[K]>;
}) => Promise<Out extends [] ? void : {
    [K in keyof Out]: InstanceType<Out[K]>;
}[number]>;
type ReadonlyStepMap<Data> = ReadonlyMap<StepHandler<Data, never, never>, {
    inputs: AnyWorkflowEventConstructor[];
    outputs: AnyWorkflowEventConstructor[];
}>;
type Wait = () => Promise<void>;
type ContextParams<Start, Stop, Data> = {
    startEvent: StartEvent<Start>;
    contextData: Data;
    steps: ReadonlyStepMap<Data>;
    timeout: number | null;
    verbose: boolean;
    wait: Wait;
    queue: QueueProtocol[] | undefined;
    pendingInputQueue: WorkflowEvent<unknown>[] | undefined;
    resolved: StopEvent<Stop> | null | undefined;
    rejected: Error | null | undefined;
};
type HandlerContext<Data = unknown> = {
    get data(): Data;
    sendEvent(event: WorkflowEvent<unknown>): void;
    requireEvent<T extends AnyWorkflowEventConstructor>(event: T): Promise<InstanceType<T>>;
};
type QueueProtocol = {
    type: "event";
    event: WorkflowEvent<unknown>;
} | {
    type: "requestEvent";
    id: string;
    requestEvent: AnyWorkflowEventConstructor;
};
declare class WorkflowContext<Start = string, Stop = string, Data = unknown> implements AsyncIterable<WorkflowEvent<unknown>, unknown, void>, Promise<StopEvent<Stop>> {
    #private;
    constructor(params: ContextParams<Start, Stop, Data>);
    [Symbol.asyncIterator](): AsyncIterableIterator<WorkflowEvent<unknown>>;
    strict(): this;
    get data(): Data;
    with<Initial extends Data>(data: Initial): WorkflowContext<Start, Stop, Initial>;
    then<TResult1, TResult2 = never>(onfulfilled?: ((value: StopEvent<Stop>) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null | undefined): Promise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null | undefined): Promise<StopEvent<Stop> | TResult>;
    finally(onfinally?: (() => void) | undefined | null): Promise<never>;
    [Symbol.toStringTag]: string;
    snapshot(): ArrayBuffer;
}

declare class AgentToolCall extends WorkflowEvent<{
    agentName: string;
    toolName: string;
    toolKwargs: Record<string, JSONValue>;
    toolId: string;
}> {
}
declare class AgentToolCallResult extends WorkflowEvent<{
    toolName: string;
    toolKwargs: Record<string, JSONValue>;
    toolId: string;
    toolOutput: ToolResult;
    returnDirect: boolean;
}> {
}
declare class AgentInput extends WorkflowEvent<{
    input: ChatMessage[];
    currentAgentName: string;
}> {
}
declare class AgentSetup extends WorkflowEvent<{
    input: ChatMessage[];
    currentAgentName: string;
}> {
}
declare class AgentStream extends WorkflowEvent<{
    delta: string;
    response: string;
    currentAgentName: string;
    raw: unknown;
}> {
}
declare class AgentOutput extends WorkflowEvent<{
    response: ChatMessage;
    toolCalls: AgentToolCall[];
    raw: unknown;
    currentAgentName: string;
}> {
}

type AgentWorkflowContext = {
    userInput: string;
    memory: BaseMemory;
    scratchpad: ChatMessage[];
    agents: string[];
    currentAgentName: string;
    nextAgentName?: string | null;
};
/**
 * Base interface for workflow agents
 */
interface BaseWorkflowAgent {
    readonly name: string;
    readonly systemPrompt: string;
    readonly description: string;
    readonly tools: BaseToolWithCall[];
    readonly llm: LLM;
    readonly canHandoffTo: string[];
    /**
     * Take a single step with the agent
     * Using memory directly to get messages instead of requiring them to be passed in
     */
    takeStep(ctx: HandlerContext<AgentWorkflowContext>, llmInput: ChatMessage[], tools: BaseToolWithCall[]): Promise<AgentOutput>;
    /**
     * Handle results from tool calls
     */
    handleToolCallResults(ctx: HandlerContext<AgentWorkflowContext>, results: AgentToolCallResult[]): Promise<void>;
    /**
     * Finalize the agent's output
     */
    finalize(ctx: HandlerContext<AgentWorkflowContext>, output: AgentOutput, memory: BaseMemory): Promise<AgentOutput>;
}

type FunctionAgentParams = {
    /**
     * Agent name
     */
    name?: string | undefined;
    /**
     * LLM to use for the agent, required.
     */
    llm?: ToolCallLLM | undefined;
    /**
     * Description of the agent, useful for task assignment.
     * Should provide the capabilities or responsibilities of the agent.
     */
    description?: string | undefined;
    /**
     * List of tools that the agent can use, requires at least one tool.
     */
    tools: BaseToolWithCall[];
    /**
     * List of agents that this agent can delegate tasks to
     * Can be a list of agent names as strings, BaseWorkflowAgent instances, or AgentWorkflow instances
     */
    canHandoffTo?: string[] | BaseWorkflowAgent[] | AgentWorkflow[] | undefined;
    /**
     * Custom system prompt for the agent
     */
    systemPrompt?: string | undefined;
};
declare class FunctionAgent implements BaseWorkflowAgent {
    readonly name: string;
    readonly systemPrompt: string;
    readonly description: string;
    readonly llm: ToolCallLLM;
    readonly tools: BaseToolWithCall[];
    readonly canHandoffTo: string[];
    constructor({ name, llm, description, tools, canHandoffTo, systemPrompt, }: FunctionAgentParams);
    takeStep(ctx: HandlerContext<AgentWorkflowContext>, llmInput: ChatMessage[], tools: BaseToolWithCall[]): Promise<AgentOutput>;
    handleToolCallResults(ctx: HandlerContext<AgentWorkflowContext>, results: AgentToolCallResult[]): Promise<void>;
    finalize(ctx: HandlerContext<AgentWorkflowContext>, output: AgentOutput, memory: BaseMemory): Promise<AgentOutput>;
    private getToolCallFromResponseChunk;
}

type AgentInputData = {
    userInput?: string | undefined;
    chatHistory?: ChatMessage[] | undefined;
};
declare class ToolCallsEvent extends WorkflowEvent<{
    agentName: string;
    toolCalls: AgentToolCall[];
}> {
}
declare class ToolResultsEvent extends WorkflowEvent<{
    agentName: string;
    results: AgentToolCallResult[];
}> {
}
declare class AgentStepEvent extends WorkflowEvent<{
    agentName: string;
    response: ChatMessage;
    toolCalls: AgentToolCall[];
}> {
}
type SingleAgentParams = FunctionAgentParams & {
    /**
     * Whether to log verbose output
     */
    verbose?: boolean;
    /**
     * Timeout for the workflow in seconds
     */
    timeout?: number;
};
type AgentWorkflowParams = {
    /**
     * List of agents to include in the workflow.
     * Need at least one agent.
     * Can also be an array of AgentWorkflow objects, in which case the agents from each workflow will be extracted.
     */
    agents: BaseWorkflowAgent[] | AgentWorkflow[];
    /**
     * The agent to start the workflow with.
     * Must be an agent in the `agents` list.
     * Can also be an AgentWorkflow object, in which case the workflow must have exactly one agent.
     */
    rootAgent: BaseWorkflowAgent | AgentWorkflow;
    verbose?: boolean;
    /**
     * Timeout for the workflow in seconds.
     */
    timeout?: number;
};
/**
 * Create a multi-agent workflow
 * @param params - Parameters for the AgentWorkflow
 * @returns A new AgentWorkflow instance
 */
declare const multiAgent: (params: AgentWorkflowParams) => AgentWorkflow;
/**
 * Create a simple workflow with a single agent and specified tools
 * @param params - Parameters for the single agent workflow
 * @returns A new AgentWorkflow instance
 */
declare const agent: (params: SingleAgentParams) => AgentWorkflow;
/**
 * AgentWorkflow - An event-driven workflow for executing agents with tools
 *
 * This class provides a simple interface for creating and running agent workflows
 * based on the LlamaIndexTS workflow system. It supports single agent workflows
 * with multiple tools.
 */
declare class AgentWorkflow {
    private workflow;
    private agents;
    private verbose;
    private rootAgentName;
    constructor({ agents, rootAgent, verbose, timeout }: AgentWorkflowParams);
    private validateAgent;
    private addHandoffTool;
    private addAgents;
    /**
     * Adds a new agent to the workflow
     */
    addAgent(agent: BaseWorkflowAgent): this;
    /**
     * Gets all agents in this workflow
     * @returns Array of agents in this workflow
     */
    getAgents(): BaseWorkflowAgent[];
    /**
     * Create a simple workflow with a single agent and specified tools
     * @param params - Parameters for the single agent workflow
     * @returns A new AgentWorkflow instance
     */
    static fromTools(params: SingleAgentParams): AgentWorkflow;
    private handleInputStep;
    private setupAgent;
    private runAgentStep;
    private parseAgentOutput;
    private executeToolCalls;
    private processToolResults;
    private setupWorkflowSteps;
    private callTool;
    run(userInput: string, params?: {
        chatHistory?: ChatMessage[];
        context?: AgentWorkflowContext;
    }): WorkflowContext<AgentInputData, string, AgentWorkflowContext>;
}

export { AgentInput, type AgentInputData, AgentOutput, AgentSetup, AgentStepEvent, AgentStream, AgentToolCall, AgentToolCallResult, AgentWorkflow, type AgentWorkflowParams, FunctionAgent, type FunctionAgentParams, type SingleAgentParams, ToolCallsEvent, ToolResultsEvent, agent, multiAgent };
