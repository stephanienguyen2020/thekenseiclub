Object.defineProperty(exports, '__esModule', { value: true });

var jsTiktoken = require('js-tiktoken');

var Tokenizers = /*#__PURE__*/ function(Tokenizers) {
    Tokenizers["CL100K_BASE"] = "cl100k_base";
    return Tokenizers;
}({});

function tryLoadGptTokenizer() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require("gpt-tokenizer"); // using require for CommonJS compatibility
    } catch (e) {
        return null;
    }
}
const gptTokenizerModule = tryLoadGptTokenizer();
class TokenizerSingleton {
    #defaultTokenizer;
    constructor(){
        // Use gpt-tokenizer if available, otherwise use js-tiktoken
        if (gptTokenizerModule) {
            this.#defaultTokenizer = {
                encode: (text)=>{
                    return new Uint32Array(gptTokenizerModule.encode(text));
                },
                decode: (tokens)=>{
                    return gptTokenizerModule.decode(Array.from(tokens));
                }
            };
        } else {
            // Fall back to js-tiktoken which is always available
            // Note: js-tiktoken it's 60x slower than gpt-tokenizer
            const encoding = jsTiktoken.getEncoding("cl100k_base");
            this.#defaultTokenizer = {
                encode: (text)=>{
                    return new Uint32Array(encoding.encode(text));
                },
                decode: (tokens)=>{
                    const numberArray = Array.from(tokens);
                    const text = encoding.decode(numberArray);
                    const uint8Array = new TextEncoder().encode(text);
                    return new TextDecoder().decode(uint8Array);
                }
            };
        }
    }
    tokenizer(encoding) {
        if (encoding && encoding !== Tokenizers.CL100K_BASE) {
            throw new Error(`Tokenizer encoding ${encoding} not yet supported`);
        }
        return this.#defaultTokenizer;
    }
}
const tokenizers = new TokenizerSingleton();

exports.Tokenizers = Tokenizers;
exports.tokenizers = tokenizers;
