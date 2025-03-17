Object.defineProperty(exports, '__esModule', { value: true });

var node_assert = require('node:assert');
var node_crypto = require('node:crypto');
var node_os = require('node:os');
var node_path = require('node:path');
var node_stream = require('node:stream');
var node_url = require('node:url');
var node_fs = require('node:fs');
var promises = require('node:fs/promises');
var node_async_hooks = require('node:async_hooks');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var node_path__default = /*#__PURE__*/_interopDefault(node_path);
var promises__default = /*#__PURE__*/_interopDefault(promises);

class NotSupportCurrentRuntimeClass {
    constructor(runtime){
        throw new Error(`Current environment ${runtime} is not supported`);
    }
    static bind(runtime) {
        return class extends NotSupportCurrentRuntimeClass {
            constructor(...args){
                super(runtime);
            }
        };
    }
}
// This is a workaround for the lack of globalThis in some environments
// It's being used across multiple places inside the `env` package
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const glo = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};

const importIdentifier = "__ $@llamaindex/env$ __";
if (glo[importIdentifier] === true) {
    /**
   * Dear reader of this message. Please take this seriously.
   *
   * If you see this message, make sure that you only import one version of llamaindex. In many cases,
   * your package manager installs two versions of llamaindex that are used by different packages within your project.
   * Another reason for this message is that some parts of your project use the CJS version of llamaindex
   * and others use the ESM version of llamaindex.
   *
   * This often leads to issues that are hard to debug. We often need to perform constructor checks,
   * e.g. `node instanceof TextNode`. If you imported different versions of llamaindex, it is impossible for us to
   * do the constructor checks anymore - which might break the functionality of your application.
   */ console.error("llamaindex was already imported. This breaks constructor checks and will lead to issues!");
}
glo[importIdentifier] = true;

function noop() {}
const emptyLogger = Object.freeze({
    log: noop,
    error: noop,
    warn: noop
});
const consoleLogger = Object.freeze({
    log: console.log.bind(console),
    error: console.error.bind(console),
    warn: console.warn.bind(console)
});

// DO NOT EXPOSE THIS VARIABLE TO PUBLIC, IT IS USED INTERNALLY FOR CLOUDFLARE WORKER
const INTERNAL_ENV = {};
/**
 * Set environment variables before using llamaindex, because some LLM need to access API key before running.
 *
 * You have to set the environment variables in Cloudflare Worker environment,
 * because it doesn't have any global environment variables.
 *
 * @example
 * ```ts
 * export default {
 *   async fetch(
 *     request: Request,
 *     env: Env,
 *     ctx: ExecutionContext,
 *   ): Promise<Response> {
 *     const { setEnvs } = await import("@llamaindex/env");
 *     setEnvs(env);
 *     // ...
 *     return new Response("Hello, World!");
 *   },
 * };
 * ```
 *
 * @param envs Environment variables
 */ function setEnvs(envs) {
    Object.assign(INTERNAL_ENV, envs);
}
function getEnv(name) {
    if (INTERNAL_ENV[name]) {
        return INTERNAL_ENV[name];
    }
    if (typeof process === "undefined" || typeof process.env === "undefined") {
        // @ts-expect-error Deno is not defined
        if (typeof Deno === "undefined") {
            throw new Error("Current environment is not supported");
        } else {
            // @ts-expect-error Deno is not defined
            return Deno.env.get(name);
        }
    }
    return process.env[name];
}
// Node.js 18 doesn't have CustomEvent by default
// Refs: https://github.com/nodejs/node/issues/40678
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class CustomEvent extends Event {
    #detail;
    get detail() {
        return this.#detail;
    }
    constructor(event, options){
        super(event, options);
        this.#detail = options?.detail;
    }
    /**
   * @deprecated This method is not supported
   */ initCustomEvent() {
        throw new Error("initCustomEvent is not supported");
    }
}
const defaultCustomEvent = // eslint-disable-next-line @typescript-eslint/no-explicit-any
globalThis.CustomEvent || CustomEvent;

function createSHA256() {
    const hash = node_crypto.createHash("sha256");
    return {
        update (data) {
            hash.update(data);
        },
        digest () {
            return hash.digest("base64");
        }
    };
}
const process$1 = globalThis.process;

Object.defineProperty(exports, "ok", {
  enumerable: true,
  get: function () { return node_assert.ok; }
});
Object.defineProperty(exports, "randomUUID", {
  enumerable: true,
  get: function () { return node_crypto.randomUUID; }
});
Object.defineProperty(exports, "EOL", {
  enumerable: true,
  get: function () { return node_os.EOL; }
});
Object.defineProperty(exports, "path", {
  enumerable: true,
  get: function () { return node_path__default.default; }
});
Object.defineProperty(exports, "Readable", {
  enumerable: true,
  get: function () { return node_stream.Readable; }
});
Object.defineProperty(exports, "fileURLToPath", {
  enumerable: true,
  get: function () { return node_url.fileURLToPath; }
});
Object.defineProperty(exports, "createWriteStream", {
  enumerable: true,
  get: function () { return node_fs.createWriteStream; }
});
Object.defineProperty(exports, "fs", {
  enumerable: true,
  get: function () { return promises__default.default; }
});
Object.defineProperty(exports, "AsyncLocalStorage", {
  enumerable: true,
  get: function () { return node_async_hooks.AsyncLocalStorage; }
});
exports.CustomEvent = defaultCustomEvent;
exports.NotSupportCurrentRuntimeClass = NotSupportCurrentRuntimeClass;
exports.consoleLogger = consoleLogger;
exports.createSHA256 = createSHA256;
exports.emptyLogger = emptyLogger;
exports.getEnv = getEnv;
exports.process = process$1;
exports.setEnvs = setEnvs;
