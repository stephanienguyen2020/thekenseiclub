import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  sourcemap: true,
  clean: true,
  dts: {
    resolve: false, // Don't try to resolve external types
  },
  format: ["esm"], // Ensure you're targeting CommonJS
  external: [
    "dotenv", // Externalize dotenv to prevent bundling
    "fs", // Externalize fs to use Node.js built-in module
    "path", // Externalize other built-ins if necessary
    "@reflink/reflink",
    "@node-llama-cpp",
    "https",
    "http",
    "agentkeepalive",
    "zod",
    "@elizaos/core",
    // Removed @elizaos/core since it's a local dependency
  ],
});
