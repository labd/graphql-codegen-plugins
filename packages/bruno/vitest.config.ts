import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		testTimeout: 5000,
		coverage: {
			provider: "v8",
			all: true,
			include: ["src/**/*.ts"],
		},
		passWithNoTests: true,
		server: {
			deps: {
				fallbackCJS: true,
			},
		},
	},
});
