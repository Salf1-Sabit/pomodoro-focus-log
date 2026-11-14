import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Let the palette test read src/style.css as text (?raw); by default Vitest blanks CSS files.
    css: { include: [/style\.css/] },
    include: ["tests/**/*.test.ts"],
  },
});
