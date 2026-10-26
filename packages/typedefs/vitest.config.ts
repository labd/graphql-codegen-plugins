import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	// graphql 17 exposes a separate "development" build; make sure the test
	// files and the (externalized) graphql-tools utils share one instance.
	ssr: {
		resolve: {
			conditions: ["module-sync", "node", "import", "default"],
			externalConditions: ["module-sync", "node"],
		},
	},
	test: {
		coverage: {
			provider: "v8",
			include: ["src/**/*.ts"],
			reportsDirectory: "./test-reports/",
		},
		passWithNoTests: true,
	},

	resolve: {
		alias: {
			"~src": path.join(__dirname, "src"),
		},
	},
});
