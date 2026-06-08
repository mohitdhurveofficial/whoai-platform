import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    // Only our unit tests; avoids the Playwright e2e file under disabled/.
    include: ["__tests__/**/*.test.ts"],
  },
});
