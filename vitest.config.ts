import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		projects: ["packages/*"],
		slowTestThreshold: 100,
		coverage: {
			provider: "v8",
			reporter: [
				"text",
				["json-summary", { file: "coverage-summary.json" }],
				["json", { file: "coverage.json" }],
			],
			reportsDirectory: "./coverage",
			include: ["packages/**/src/**/*.ts"],
			exclude: ["**/src/**/*.generated.ts", "**/src/**/generated/**"],
			// statements: 50,
			// branches: 50,
			// functions: 30,
			// lines: 50,
		},
		server: {
			deps: {
				fallbackCJS: true,
			},
		},
	},
});
