"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// eslint-disable-next-line import/no-extraneous-dependencies
const vitest_1 = require("vitest");
const constants_js_1 = require("./constants.js");
const GptEncoding_js_1 = require("./GptEncoding.js");
const mapping_js_1 = require("./mapping.js");
const models_js_1 = require("./models.js");
const resolveEncoding_js_1 = require("./resolveEncoding.js");
const specialTokens_js_1 = require("./specialTokens.js");
const sharedResults = {
    space: [220],
    tab: [197],
    'This is some text': [1_212, 318, 617, 2_420],
    indivisible: [521, 452, 12_843],
    'hello 👋 world 🌍': [31_373, 50_169, 233, 995, 12_520, 234, 235],
    decodedHelloWorldTokens: ['hello', ' ', '👋', ' world', ' ', '🌍'],
    'toString constructor hasOwnProperty valueOf': [
        1_462, 10_100, 23_772, 468, 23_858, 21_746, 1_988, 5_189,
    ],
    'hello, I am a text, and I have commas. a,b,c': [
        31_373, 11, 314, 716, 257, 2_420, 11, 290, 314, 423, 725, 292, 13, 257, 11,
        65, 11, 66,
    ],
};
const results = {
    o200k_base: {
        space: [220],
        tab: [197],
        'This is some text': [2_500, 382, 1_236, 2_201],
        indivisible: [521, 349, 181_386],
        'hello 👋 world 🌍': [24_912, 61_138, 233, 2_375, 130_321, 235],
        decodedHelloWorldTokens: ['hello', ' ', '👋', ' world', ' ', '🌍'],
        'toString constructor hasOwnProperty valueOf': [
            935, 916, 9_220, 853, 18_555, 3_895, 1_432, 2_566,
        ],
        'hello, I am a text, and I have commas. a,b,c': [
            24_912, 11, 357, 939, 261, 2_201, 11, 326, 357, 679, 179_663, 13, 261,
            17_568, 22_261,
        ],
    },
    cl100k_base: {
        space: [220],
        tab: [197],
        'This is some text': [2_028, 374, 1_063, 1_495],
        indivisible: [485, 344, 23_936],
        'hello 👋 world 🌍': [15_339, 62_904, 233, 1_917, 11_410, 234, 235],
        decodedHelloWorldTokens: ['hello', ' ', '👋', ' world', ' ', '🌍'],
        'toString constructor hasOwnProperty valueOf': [
            6_712, 4_797, 706, 19_964, 907, 2_173,
        ],
        'hello, I am a text, and I have commas. a,b,c': [
            15_339, 11, 358, 1_097, 264, 1_495, 11, 323, 358, 617, 77_702, 13, 264,
            8_568, 10_317,
        ],
    },
    p50k_base: sharedResults,
    p50k_edit: sharedResults,
    r50k_base: sharedResults,
};
const offsetPrompts = [
    // Basic prompt with "hello world"
    'hello world',
    // Basic prompt with special token end of text token
    `hello world${specialTokens_js_1.EndOfText} green cow`,
    // Chinese text: "我非常渴望与人工智能一起工作"
    '我非常渴望与人工智能一起工作',
    // Contains the interesting tokens b'\xe0\xae\xbf\xe0\xae' and b'\xe0\xaf\x8d\xe0\xae'
    // in which \xe0 is the start of a 3-byte UTF-8 character
    'நடிகர் சூர்யா',
    // Contains the interesting token b'\xa0\xe9\x99\xa4'
    // in which \xe9 is the start of a 3-byte UTF-8 character and \xa0 is a continuation byte
    ' Ġ除',
];
// eslint-disable-next-line @typescript-eslint/no-use-before-define
const testPlans = loadTestPlans();
vitest_1.describe.each(mapping_js_1.encodingNames)('%s', (encodingName) => {
    const encoding = GptEncoding_js_1.GptEncoding.getEncodingApi(encodingName, resolveEncoding_js_1.resolveEncoding);
    const { decode, decodeGenerator, decodeAsyncGenerator, encode, isWithinTokenLimit, } = encoding;
    (0, vitest_1.describe)('encode and decode', () => {
        vitest_1.test.each(offsetPrompts)('offset prompt: %s', (str) => {
            (0, vitest_1.expect)(decode(encode(str, { allowedSpecial: constants_js_1.ALL_SPECIAL_TOKENS }))).toEqual(str);
        });
    });
    (0, vitest_1.describe)('basic functionality', () => {
        const result = results[encodingName];
        (0, vitest_1.test)('empty string', () => {
            const str = '';
            (0, vitest_1.expect)(encode(str)).toEqual([]);
            (0, vitest_1.expect)(decode(encode(str))).toEqual(str);
            (0, vitest_1.expect)(isWithinTokenLimit(str, 0)).toBe(0);
            (0, vitest_1.expect)(isWithinTokenLimit(str, 3)).toBe(0);
        });
        (0, vitest_1.test)('space', () => {
            const str = ' ';
            (0, vitest_1.expect)(encode(str)).toEqual(result.space);
            (0, vitest_1.expect)(decode(encode(str))).toEqual(str);
            (0, vitest_1.expect)(isWithinTokenLimit(str, 3)).toBe(1);
            (0, vitest_1.expect)(isWithinTokenLimit(str, 0)).toBe(false);
        });
        (0, vitest_1.test)('tab', () => {
            const str = '\t';
            (0, vitest_1.expect)(encode(str)).toEqual(result.tab);
            (0, vitest_1.expect)(decode(encode(str))).toEqual(str);
        });
        (0, vitest_1.test)('simple text', () => {
            const str = 'This is some text';
            (0, vitest_1.expect)(encode(str)).toEqual(result[str]);
            (0, vitest_1.expect)(decode(encode(str))).toEqual(str);
            (0, vitest_1.expect)(isWithinTokenLimit(str, 3)).toBe(false);
            (0, vitest_1.expect)(isWithinTokenLimit(str, 5)).toBe(result[str].length);
        });
        (0, vitest_1.test)('multi-token word', () => {
            const str = 'indivisible';
            (0, vitest_1.expect)(encode(str)).toEqual(result.indivisible);
            (0, vitest_1.expect)(decode(encode(str))).toEqual(str);
            (0, vitest_1.expect)(isWithinTokenLimit(str, 3)).toBe(result.indivisible.length);
        });
        (0, vitest_1.test)('emojis', () => {
            const str = 'hello 👋 world 🌍';
            (0, vitest_1.expect)(encode(str)).toEqual(result[str]);
            (0, vitest_1.expect)(decode(encode(str))).toEqual(str);
            (0, vitest_1.expect)(isWithinTokenLimit(str, 4)).toBe(false);
            (0, vitest_1.expect)(isWithinTokenLimit(str, 400)).toBe(result[str].length);
        });
        (0, vitest_1.test)('decode token-by-token via generator', () => {
            const str = 'hello 👋 world 🌍';
            const generator = decodeGenerator(result[str]);
            result.decodedHelloWorldTokens.forEach((token) => {
                (0, vitest_1.expect)(generator.next().value).toBe(token);
            });
        });
        (0, vitest_1.test)('encodes and decodes special tokens', () => {
            const str = `hello ${specialTokens_js_1.EndOfText} world`;
            const encoded = encode(str, {
                allowedSpecial: constants_js_1.ALL_SPECIAL_TOKENS,
            });
            (0, vitest_1.expect)(decode(encoded)).toEqual(str);
        });
        async function* getHelloWorldTokensAsync() {
            const str = 'hello 👋 world 🌍';
            for (const token of result[str]) {
                // eslint-disable-next-line no-await-in-loop
                yield await Promise.resolve(token);
            }
        }
        (0, vitest_1.test)('decode token-by-token via async generator', async () => {
            const generator = decodeAsyncGenerator(getHelloWorldTokensAsync());
            const decoded = [...result.decodedHelloWorldTokens];
            for await (const value of generator) {
                (0, vitest_1.expect)(value).toEqual(decoded.shift());
            }
        });
        (0, vitest_1.test)('properties of Object', () => {
            const str = 'toString constructor hasOwnProperty valueOf';
            (0, vitest_1.expect)(encode(str)).toEqual(result[str]);
            (0, vitest_1.expect)(decode(encode(str))).toEqual(str);
        });
        (0, vitest_1.test)('text with commas', () => {
            const str = 'hello, I am a text, and I have commas. a,b,c';
            (0, vitest_1.expect)(decode(encode(str))).toEqual(str);
            (0, vitest_1.expect)(encode(str)).toStrictEqual(result[str]);
            (0, vitest_1.expect)(isWithinTokenLimit(str, result[str].length - 1)).toBe(false);
            (0, vitest_1.expect)(isWithinTokenLimit(str, 300)).toBe(result[str].length);
        });
    });
    (0, vitest_1.describe)('test plan', () => {
        testPlans[encodingName].forEach(({ sample, encoded }) => {
            (0, vitest_1.test)(`encodes ${sample}`, () => {
                (0, vitest_1.expect)(encode(sample)).toEqual(encoded);
            });
            (0, vitest_1.test)(`decodes ${sample}`, () => {
                (0, vitest_1.expect)(decode(encoded)).toEqual(sample);
            });
        });
    });
});
const chatModelNames = Object.keys(mapping_js_1.chatModelParams);
const exampleMessages = [
    {
        role: 'system',
        content: 'You are a helpful, pattern-following assistant that translates corporate jargon into plain English.',
    },
    {
        role: 'system',
        name: 'example_user',
        content: 'New synergies will help drive top-line growth.',
    },
    {
        role: 'system',
        name: 'example_assistant',
        content: 'Things working well together will increase revenue.',
    },
    {
        role: 'system',
        name: 'example_user',
        content: "Let's circle back when we have more bandwidth to touch base on opportunities for increased leverage.",
    },
    {
        role: 'system',
        name: 'example_assistant',
        content: "Let's talk later when we're less busy about how to do better.",
    },
    {
        role: 'user',
        content: "This late pivot means we don't have time to boil the ocean for the client deliverable.",
    },
];
vitest_1.describe.each(chatModelNames)('%s', (modelName) => {
    const encoding = GptEncoding_js_1.GptEncoding.getEncodingApiForModel(modelName, resolveEncoding_js_1.resolveEncoding);
    const expectedEncodedLength = modelName.startsWith('gpt-3.5-turbo')
        ? 127
        : modelName.startsWith('gpt-4o')
            ? 120
            : 121;
    (0, vitest_1.describe)('chat functionality', () => {
        (0, vitest_1.test)('encodes a chat correctly', () => {
            const encoded = encoding.encodeChat(exampleMessages);
            (0, vitest_1.expect)(encoded).toMatchSnapshot();
            (0, vitest_1.expect)(encoded).toHaveLength(expectedEncodedLength);
            const decoded = encoding.decode(encoded);
            (0, vitest_1.expect)(decoded).toMatchSnapshot();
        });
        (0, vitest_1.test)('isWithinTokenLimit: false', () => {
            const isWithinTokenLimit = encoding.isWithinTokenLimit(exampleMessages, 50);
            (0, vitest_1.expect)(isWithinTokenLimit).toBe(false);
        });
        (0, vitest_1.test)('isWithinTokenLimit: true (number)', () => {
            const isWithinTokenLimit = encoding.isWithinTokenLimit(exampleMessages, 150);
            (0, vitest_1.expect)(isWithinTokenLimit).toBe(expectedEncodedLength);
        });
    });
});
(0, vitest_1.describe)('estimateCost functionality', () => {
    const gpt4oEncoding = GptEncoding_js_1.GptEncoding.getEncodingApiForModel('gpt-4o', resolveEncoding_js_1.resolveEncoding);
    const gpt35Encoding = GptEncoding_js_1.GptEncoding.getEncodingApiForModel('gpt-3.5-turbo', resolveEncoding_js_1.resolveEncoding);
    (0, vitest_1.test)('estimates cost correctly for gpt-4o model', () => {
        const tokenCount = 1_000;
        const cost = gpt4oEncoding.estimateCost(tokenCount);
        // gpt-4o has $2.5 per million tokens for input and $10 per million tokens for output
        (0, vitest_1.expect)(cost.input).toBeCloseTo(0.002_5, 6); // 1000/1M * $2.5
        (0, vitest_1.expect)(cost.output).toBeCloseTo(0.01, 6); // 1000/1M * $10
        (0, vitest_1.expect)(cost.batchInput).toBeCloseTo(0.001_25, 6); // 1000/1M * $1.25
        (0, vitest_1.expect)(cost.batchOutput).toBeCloseTo(0.005, 6); // 1000/1M * $5
    });
    (0, vitest_1.test)('estimates cost correctly for gpt-3.5-turbo model', () => {
        const tokenCount = 1_000;
        const cost = gpt35Encoding.estimateCost(tokenCount);
        // gpt-3.5-turbo has $0.5 per million tokens for input and $1.5 per million tokens for output
        (0, vitest_1.expect)(cost.input).toBeCloseTo(0.000_5, 6); // 1000/1M * $0.5
        (0, vitest_1.expect)(cost.output).toBeCloseTo(0.001_5, 6); // 1000/1M * $1.5
        (0, vitest_1.expect)(cost.batchInput).toBeCloseTo(0.000_25, 6); // 1000/1M * $0.25
        (0, vitest_1.expect)(cost.batchOutput).toBeCloseTo(0.000_75, 6); // 1000/1M * $0.75
    });
    (0, vitest_1.test)('allows overriding model name', () => {
        const tokenCount = 1_000;
        // Use gpt-4o encoding but override with gpt-3.5-turbo model name
        const cost = gpt4oEncoding.estimateCost(tokenCount, 'gpt-3.5-turbo');
        (0, vitest_1.expect)(cost.input).toBeCloseTo(0.000_5, 6); // 1000/1M * $0.5
        (0, vitest_1.expect)(cost.output).toBeCloseTo(0.001_5, 6); // 1000/1M * $1.5
    });
    (0, vitest_1.test)('throws error when model name is not provided', () => {
        const encoding = GptEncoding_js_1.GptEncoding.getEncodingApi('cl100k_base', resolveEncoding_js_1.resolveEncoding);
        const tokenCount = 1_000;
        // No model name was provided during initialization or function call
        (0, vitest_1.expect)(() => encoding.estimateCost(tokenCount)).toThrow('Model name must be provided either during initialization or passed in to the method.');
    });
    (0, vitest_1.test)('throws error for unknown model', () => {
        const tokenCount = 1_000;
        (0, vitest_1.expect)(() => gpt4oEncoding.estimateCost(tokenCount, 'non-existent-model')).toThrow('Unknown model: non-existent-model');
    });
    (0, vitest_1.test)('only includes properties that exist for the model', () => {
        // Find a model that only has input cost but no output cost
        const modelWithInputOnly = Object.entries(models_js_1.models).find(([_, model]) => model.cost?.input !== undefined && model.cost?.output === undefined);
        if (modelWithInputOnly) {
            const [modelName] = modelWithInputOnly;
            const cost = gpt4oEncoding.estimateCost(1_000, modelName);
            (0, vitest_1.expect)(cost.input).toBeDefined();
            (0, vitest_1.expect)(cost.output).toBeUndefined();
        }
        else {
            // Skip test if we can't find an appropriate model
            console.log('Skipping test: no model with input-only cost found');
        }
    });
});
function loadTestPlans() {
    const testPlanPath = path_1.default.join(__dirname, '../data/TestPlans.txt');
    const testPlanData = fs_1.default.readFileSync(testPlanPath, 'utf8');
    const tests = {
        cl100k_base: [],
        p50k_base: [],
        p50k_edit: [],
        r50k_base: [],
        o200k_base: [],
    };
    testPlanData.split('\n\n').forEach((testPlan) => {
        const [encodingNameLine, sampleLine, encodedLine] = testPlan.split('\n');
        if (!encodingNameLine || !sampleLine || !encodedLine)
            return;
        const encodingName = encodingNameLine.split(': ')[1];
        tests[encodingName].push({
            sample: sampleLine.split(': ').slice(1).join(': ') ?? '',
            encoded: JSON.parse(encodedLine.split(': ')[1] ?? '[]'),
        });
    });
    return tests;
}
//# sourceMappingURL=GptEncoding.test.js.map