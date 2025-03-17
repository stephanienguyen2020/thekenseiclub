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

type StepParameters<In extends AnyWorkflowEventConstructor[], Out extends AnyWorkflowEventConstructor[]> = {
    inputs: In;
    outputs: Out;
};
declare class Workflow<ContextData, Start, Stop> {
    #private;
    constructor(params?: {
        verbose?: boolean;
        timeout?: number | null;
        wait?: Wait;
    });
    addStep<const In extends [
        AnyWorkflowEventConstructor | StartEventConstructor,
        ...(AnyWorkflowEventConstructor | StopEventConstructor)[]
    ], const Out extends (AnyWorkflowEventConstructor | StopEventConstructor)[]>(parameters: StepParameters<In, Out>, stepFn: (context: HandlerContext<ContextData>, ...events: {
        [K in keyof In]: InstanceType<In[K]>;
    }) => Promise<Out extends [] ? void : {
        [K in keyof Out]: InstanceType<Out[K]>;
    }[number]>): this;
    hasStep(stepFn: StepHandler): boolean;
    removeStep(stepFn: StepHandler): this;
    run(event: StartEvent<Start> | Start): unknown extends ContextData ? WorkflowContext<Start, Stop, ContextData> : WorkflowContext<Start, Stop, ContextData | undefined>;
    run<Data extends ContextData>(event: StartEvent<Start> | Start, data: Data): WorkflowContext<Start, Stop, Data>;
    recover(data: ArrayBuffer): WorkflowContext<Start, Stop, ContextData>;
}

export { type HandlerContext, StartEvent, type StepHandler, type StepParameters, StopEvent, Workflow, WorkflowContext, WorkflowEvent };
