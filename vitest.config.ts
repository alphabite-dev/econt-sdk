import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./packages/sdk/tests/setup.ts"],
    testTimeout: 30000,
  },
});
