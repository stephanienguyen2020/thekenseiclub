"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line import/no-extraneous-dependencies
const vitest_1 = require("vitest");
const GptEncoding_js_1 = require("./GptEncoding.js");
const resolveEncoding_js_1 = require("./resolveEncoding.js");
const sampleText = 'This is a test message.';
const sampleChat = [
    {
        role: 'system',
        content: 'You are a helpful assistant.',
    },
    {
        role: 'user',
        content: 'Hello, how are you?',
    },
    {
        role: 'assistant',
        content: 'I am doing well, thank you for asking.',
    },
];
(0, vitest_1.describe)('countTokens', () => {
    const encoding = GptEncoding_js_1.GptEncoding.getEncodingApiForModel('gpt-3.5-turbo', resolveEncoding_js_1.resolveEncoding);
    (0, vitest_1.describe)('text input', () => {
        (0, vitest_1.it)('counts tokens in empty string', () => {
            (0, vitest_1.expect)(encoding.countTokens('')).toBe(0);
        });
        (0, vitest_1.it)('counts tokens in simple text', () => {
            (0, vitest_1.expect)(encoding.countTokens(sampleText)).toBe(encoding.encode(sampleText).length);
        });
        (0, vitest_1.it)('counts tokens in text with special characters', () => {
            const textWithSpecial = 'Hello 👋 world! 🌍';
            (0, vitest_1.expect)(encoding.countTokens(textWithSpecial)).toBe(encoding.encode(textWithSpecial).length);
        });
    });
    (0, vitest_1.describe)('chat input', () => {
        (0, vitest_1.it)('counts tokens in empty chat', () => {
            (0, vitest_1.expect)(encoding.countTokens([])).toBe(3); // Due to assistant prompt tokens
        });
        (0, vitest_1.it)('counts tokens in sample chat', () => {
            (0, vitest_1.expect)(encoding.countTokens(sampleChat)).toBe(encoding.encodeChat(sampleChat).length);
        });
        (0, vitest_1.it)('matches token counts from encode methods', () => {
            const tokens = encoding.encodeChat(sampleChat);
            const count = encoding.countTokens(sampleChat);
            (0, vitest_1.expect)(count).toBe(tokens.length);
        });
        (0, vitest_1.it)('counts tokens in single message chat', () => {
            const singleMessage = [
                {
                    role: 'user',
                    content: 'Hello world',
                },
            ];
            (0, vitest_1.expect)(encoding.countTokens(singleMessage)).toBe(encoding.encodeChat(singleMessage).length);
        });
    });
});
//# sourceMappingURL=extraApis.test.js.map